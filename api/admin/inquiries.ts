import fs from 'fs';
import path from 'path';
import os from 'os';
import { getSupabaseServer } from './_supabase';

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

const DATA_FILE = path.join(os.tmpdir(), 'nextgen_inquiries.json');
const SEED_FILE = path.resolve(process.cwd(), 'data/inquiries.json');

let memoryInquiries: Inquiry[] = [];

// Seed memory from repository inquiries.json on startup
try {
  if (fs.existsSync(SEED_FILE)) {
    const raw = fs.readFileSync(SEED_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryInquiries = parsed;
    }
  }
} catch {
  // ignore
}

async function loadInquiries(): Promise<Inquiry[]> {
  const sb = getSupabaseServer();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped: Inquiry[] = data.map((row: any) => ({
          id: String(row.id),
          createdAt: row.created_at || row.createdAt || new Date().toISOString(),
          name: String(row.name || ''),
          email: String(row.email || ''),
          subject: String(row.subject || ''),
          message: String(row.message || ''),
          ip: String(row.ip || 'web'),
          userAgent: row.user_agent || row.userAgent || undefined,
          status: row.status === 'reviewed' || row.status === 'responded' ? row.status : 'new',
          emailNotificationSent: Boolean(row.email_notification_sent ?? row.emailNotificationSent ?? false),
        }));
        memoryInquiries = mapped;
        return mapped;
      }
    } catch (err) {
      console.warn('[Supabase Storage] Error reading:', err);
    }
  }

  // 1. Try Vercel KV if available
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

  // 2. Read from /tmp shared file
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        memoryInquiries = list;
        return list;
      }
    }
  } catch {
    // fallback
  }

  return memoryInquiries;
}

async function persistInquiries(list: Inquiry[]): Promise<void> {
  memoryInquiries = list;

  // Persist to Vercel KV if configured
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

  // Persist to /tmp file
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] File write error:', err);
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
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

  if (req.method === 'GET') {
    const inquiries = await loadInquiries();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      count: inquiries.length,
      inquiries,
    }));
    return;
  }

  if (req.method === 'PATCH') {
    if (!id || id === 'inquiries') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Inquiry ID is required' }));
      return;
    }

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

    const list = await loadInquiries();
    const target = list.find((i) => i.id === id);
    if (!target) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Inquiry not found' }));
      return;
    }

    target.status = status;
    await persistInquiries(list);

    const sb = getSupabaseServer();
    if (sb) {
      try {
        await sb.from('inquiries').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase Serverless] Error updating:', err);
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, inquiry: target }));
    return;
  }

  if (req.method === 'DELETE') {
    if (!id || id === 'inquiries') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Inquiry ID is required' }));
      return;
    }

    const list = await loadInquiries();
    const exists = list.some((i) => i.id === id);
    if (!exists) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Inquiry not found' }));
      return;
    }

    const filtered = list.filter((i) => i.id !== id);
    await persistInquiries(filtered);

    const sb = getSupabaseServer();
    if (sb) {
      try {
        await sb.from('inquiries').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase Serverless] Error deleting:', err);
      }
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
