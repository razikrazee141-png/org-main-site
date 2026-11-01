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

let memoryInquiries: Inquiry[] = [];

function ensureDataFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Storage] Notice:', err);
  }
}

function loadInquiries(): Inquiry[] {
  try {
    ensureDataFile();
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

function saveInquiry(inquiry: Inquiry): void {
  const list = loadInquiries();
  list.unshift(inquiry);
  memoryInquiries = list;
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] File write skipped, preserved in memory:', err);
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
      text: `From: ${inquiry.name} (${inquiry.email})\nSubject: ${inquiry.subject}\n\nMessage:\n${inquiry.message}\n`,
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
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'healthy', service: 'NextGen Inquiry Gateway' }));
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
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
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

    saveInquiry(newInquiry);

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
