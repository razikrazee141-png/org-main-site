import fs from 'fs';
import path from 'path';

export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  userAgent?: string;
  status: 'new' | 'reviewed' | 'responded';
  emailNotificationSent: boolean;
}

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? path.join('/tmp', 'nextgen_data') : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'inquiries.json');

let memoryInquiries: Inquiry[] = [];

async function loadInquiries(): Promise<Inquiry[]> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/nextgen_inquiries`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const data = await res.json();
      if (data?.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (Array.isArray(parsed)) {
          memoryInquiries = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[KV Storage] Error reading:', err);
    }
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        memoryInquiries = list;
        return list;
      }
    }
  } catch (err) {
    console.warn('[Storage] Fallback to memory:', err);
  }

  return memoryInquiries;
}

async function persistInquiries(list: Inquiry[]): Promise<void> {
  memoryInquiries = list;
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/nextgen_inquiries`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(list)),
      });
    } catch (err) {
      console.warn('[KV Storage] Error writing:', err);
    }
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] File write skipped:', err);
  }
}

async function updateInquiryStatus(id: string, status: 'new' | 'reviewed' | 'responded'): Promise<Inquiry | null> {
  const list = await loadInquiries();
  const target = list.find((i) => i.id === id);
  if (!target) return null;
  target.status = status;
  await persistInquiries(list);
  return target;
}

async function deleteInquiry(id: string): Promise<boolean> {
  let list = await loadInquiries();
  const exists = list.some((i) => i.id === id);
  if (!exists) return false;
  list = list.filter((i) => i.id !== id);
  await persistInquiries(list);
  return true;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const authHeader = req.headers?.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'Unauthorized: Valid Admin Authorization Bearer token required.',
    }));
    return;
  }

  const id = (req.query?.id as string) || (req.url?.split('/').pop()?.split('?')[0]);
  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Inquiry ID is required' }));
    return;
  }

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { status } = body || {};

    if (!status || !['new', 'reviewed', 'responded'].includes(status)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Invalid status value' }));
      return;
    }

    const updated = await updateInquiryStatus(id, status);
    if (!updated) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Inquiry not found' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, inquiry: updated }));
    return;
  }

  if (req.method === 'DELETE') {
    const ok = await deleteInquiry(id);
    if (!ok) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Inquiry not found' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Inquiry deleted' }));
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
}
