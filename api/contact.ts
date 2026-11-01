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

const DATA_FILE = path.join('/tmp', 'nextgen_inquiries.json');
const SEED_FILE = path.resolve(process.cwd(), 'data/inquiries.json');

let memoryInquiries: Inquiry[] = [];

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

async function saveInquiry(inquiry: Inquiry): Promise<void> {
  const list = await loadInquiries();
  list.unshift(inquiry);
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
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] File write error:', err);
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    const list = await loadInquiries();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'healthy', service: 'NextGen Inquiry Gateway', count: list.length }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
    return;
  }

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

    await saveInquiry(newInquiry);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      message: 'Thank you for contacting NextGen. Your correspondence has been logged for official review.',
      inquiryId,
      timestamp: newInquiry.createdAt,
    }));
  } catch (error: any) {
    console.error('Error processing inquiry:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'An internal error occurred while logging your message. Please try again shortly.',
    }));
  }
}
