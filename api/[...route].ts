import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

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

// In-memory shared state for the serverless container
let memoryInquiries: Inquiry[] = [];

// Seed initial inquiries from repository if available
try {
  const seedPath = path.resolve(process.cwd(), 'data/inquiries.json');
  if (fs.existsSync(seedPath)) {
    const raw = fs.readFileSync(seedPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryInquiries = parsed;
    }
  }
} catch {
  // ignore
}

async function loadInquiries(): Promise<Inquiry[]> {
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryInquiries = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[KV Storage] Error reading:', err);
    }
  }

  // 2. Try /tmp file
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
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {
    // fallback
  }
}

async function sendNotificationEmail(inquiry: Inquiry): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFICATION_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFICATION_EMAIL) {
    return false;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"NextGen Portal" <${SMTP_USER}>`,
      to: NOTIFICATION_EMAIL,
      replyTo: `"${inquiry.name}" <${inquiry.email}>`,
      subject: `[NextGen Inquiry] ${inquiry.subject}`,
      text: `New official query received on NextGen corporate website.\n\nFrom: ${inquiry.name} (${inquiry.email})\nSubject: ${inquiry.subject}\nReceived: ${inquiry.createdAt}\nInquiry ID: ${inquiry.id}\n\nMessage:\n${inquiry.message}\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #125EA2; margin-top: 0;">NextGen Official Inquiry</h2>
          <p><strong>From:</strong> ${inquiry.name} (<a href="mailto:${inquiry.email}">${inquiry.email}</a>)</p>
          <p><strong>Subject:</strong> ${inquiry.subject}</p>
          <p><strong>Date:</strong> ${inquiry.createdAt}</p>
          <p><strong>Inquiry ID:</strong> <code>${inquiry.id}</code></p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <h4 style="color: #334155;">Message Content:</h4>
          <p style="white-space: pre-wrap; background: #f8fafc; padding: 15px; border-radius: 8px; color: #1e293b;">${inquiry.message}</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Email error:', err);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const rawUrl = req.url || '';
  const urlPath = rawUrl.split('?')[0];

  // =========================================================================
  // ROUTE 1: Contact Submission & Health Check (/api/contact)
  // =========================================================================
  if (urlPath === '/api/contact' || urlPath.endsWith('/contact') || urlPath.includes('/contact/')) {
    if (req.method === 'GET') {
      const list = await loadInquiries();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'healthy',
        service: 'NextGen Unified Inquiry Gateway',
        inquiriesLogged: list.length,
      }));
      return;
    }

    if (req.method === 'POST') {
      try {
        let body = req.body;
        if (typeof body === 'string') {
          try { body = JSON.parse(body); } catch { body = {}; }
        }
        if (!body && typeof req.on === 'function') {
          body = await new Promise((resolve) => {
            let raw = '';
            req.on('data', (c: any) => { raw += c; });
            req.on('end', () => {
              try { resolve(JSON.parse(raw)); } catch { resolve({}); }
            });
            req.on('error', () => resolve({}));
          });
        }

        const { name, email, subject, message, bot_check } = body || {};

        if (bot_check && String(bot_check).trim().length > 0) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, message: 'Your inquiry has been received.' }));
          return;
        }

        const errors: Record<string, string> = {};
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
          errors.name = 'Full name is required (minimum 2 characters).';
        } else if (name.trim().length > 100) {
          errors.name = 'Full name must not exceed 100 characters.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
          errors.email = 'A valid email address is required (e.g. name@domain.com).';
        }

        if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
          errors.subject = 'Please specify an inquiry subject.';
        } else if (subject.trim().length > 150) {
          errors.subject = 'Subject must not exceed 150 characters.';
        }

        if (!message || typeof message !== 'string' || message.trim().length < 15) {
          errors.message = 'Please provide a detailed message (minimum 15 characters).';
        } else if (message.trim().length > 5000) {
          errors.message = 'Message must not exceed 5000 characters.';
        }

        if (Object.keys(errors).length > 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Validation failed', details: errors }));
          return;
        }

        const inquiryId = `NG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const ip = (req.headers && (req.headers['x-forwarded-for'] as string))?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        const userAgent = (req.headers && (req.headers['user-agent'] as string)) || 'unknown';

        const newInquiry: Inquiry = {
          id: inquiryId,
          createdAt: new Date().toISOString(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          ip,
          userAgent,
          status: 'new',
          emailNotificationSent: false,
        };

        const emailSent = await sendNotificationEmail(newInquiry);
        newInquiry.emailNotificationSent = emailSent;

        const currentList = await loadInquiries();
        currentList.unshift(newInquiry);
        await persistInquiries(currentList);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          message: 'Thank you for contacting NextGen. Your correspondence has been logged for official review.',
          inquiryId,
          timestamp: newInquiry.createdAt,
        }));
        return;
      } catch (error: any) {
        console.error('Error processing inquiry:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          error: 'An internal error occurred while logging your message. Please try again shortly.',
        }));
        return;
      }
    }
  }

  // =========================================================================
  // ROUTE 2: Admin Inquiries (/api/admin/inquiries)
  // =========================================================================
  if (urlPath.includes('/admin/inquiries')) {
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

    // Extract ID if path has /inquiries/<id> or ?id=<id>
    const pathParts = urlPath.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const id = lastPart !== 'inquiries' ? lastPart : (req.query?.id as string);

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
      if (!id) {
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, inquiry: target }));
      return;
    }

    if (req.method === 'DELETE') {
      if (!id) {
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

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, message: 'Inquiry deleted' }));
      return;
    }

    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ success: false, error: 'API route not found' }));
}
