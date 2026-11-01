import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Detect Vercel / serverless runtime
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Persistent Data Storage setup
const SEED_FILE = path.resolve(process.cwd(), 'data/inquiries.json');
const DATA_DIR = isVercel ? path.join('/tmp', 'nextgen_data') : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'inquiries.json');

// In-memory fallback cache
let memoryCache: Inquiry[] | null = null;

function initDataStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      if (isVercel && fs.existsSync(SEED_FILE)) {
        try {
          const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
          fs.writeFileSync(DATA_FILE, seedContent, 'utf-8');
        } catch {
          fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
        }
      } else {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.warn('[NextGen Storage] Read-only or fallback to memory datastore:', err);
  }
}

initDataStore();

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

export function loadInquiries(): Inquiry[] {
  try {
    initDataStore();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Inquiry[];
      memoryCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn('[NextGen Storage] Error reading data file, using memory cache:', err);
  }
  return memoryCache || [];
}

export function saveInquiry(inquiry: Inquiry): void {
  const inquiries = loadInquiries();
  inquiries.unshift(inquiry); // newest first
  memoryCache = inquiries;
  try {
    initDataStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[NextGen Storage] Error persisting to disk, kept in memory cache:', err);
  }
}

export function updateInquiryStatus(id: string, status: 'new' | 'reviewed' | 'responded'): Inquiry | null {
  const inquiries = loadInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (!target) return null;

  target.status = status;
  memoryCache = inquiries;
  try {
    initDataStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[NextGen Storage] Error writing status update:', err);
  }
  return target;
}

export function deleteInquiry(id: string): boolean {
  let inquiries = loadInquiries();
  const exists = inquiries.some((i) => i.id === id);
  if (!exists) return false;

  inquiries = inquiries.filter((i) => i.id !== id);
  memoryCache = inquiries;
  try {
    initDataStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[NextGen Storage] Error writing deletion:', err);
  }
  return true;
}

// Optional Email Notification Forwarder
export async function sendNotificationEmail(inquiry: Inquiry): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFICATION_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFICATION_EMAIL) {
    return false; // Email forwarding not configured
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NextGen Portal" <${SMTP_USER}>`,
      to: NOTIFICATION_EMAIL,
      replyTo: `"${inquiry.name}" <${inquiry.email}>`,
      subject: `[NextGen Official Inquiry] ${inquiry.subject}`,
      text: `New official query received on the NextGen corporate website.\n\nFrom: ${inquiry.name} (${inquiry.email})\nSubject: ${inquiry.subject}\nReceived: ${inquiry.createdAt}\nInquiry ID: ${inquiry.id}\n\nMessage:\n${inquiry.message}\n`,
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
  } catch (emailError) {
    console.error('Email dispatch error:', emailError);
    return false;
  }
}

// Rate limiting: 25 inquiries per 15 minutes per IP
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many inquiries submitted from this connection. Please try again after 15 minutes.',
  },
});

// Router definition that handles routes both with and without /api prefix
const router = Router();

// Health check endpoint
router.get('/contact/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'NextGen Inquiry Gateway',
    timestamp: new Date().toISOString(),
    isServerless: isVercel,
    inquiriesLogged: loadInquiries().length,
  });
});

// Primary Contact submission endpoint
router.post('/contact', inquiryLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message, bot_check } = req.body;

    // 1. Honeypot check
    if (bot_check && String(bot_check).trim().length > 0) {
      res.status(200).json({
        success: true,
        message: 'Your inquiry has been received.',
      });
      return;
    }

    // 2. Input validation
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
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    // 3. Construct unique inquiry record
    const inquiryId = `NG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

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

    // 4. Send email notification if configured
    const emailSent = await sendNotificationEmail(newInquiry);
    newInquiry.emailNotificationSent = emailSent;

    // 5. Persist inquiry
    saveInquiry(newInquiry);

    console.log(`[NextGen Inquiries] Logged inquiry ${inquiryId} from ${newInquiry.name} <${newInquiry.email}> (Email notification: ${emailSent ? 'Delivered' : 'Datastore only'})`);

    res.status(200).json({
      success: true,
      message: 'Thank you for contacting NextGen. Your correspondence has been logged for official review.',
      inquiryId,
      timestamp: newInquiry.createdAt,
    });
  } catch (error) {
    console.error('Server error processing inquiry:', error);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while logging your message. Please try again shortly.',
    });
  }
});

// Admin Review endpoint (Protected by ADMIN_KEY)
router.get('/admin/inquiries', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid Admin Authorization Bearer token required.',
    });
    return;
  }

  const inquiries = loadInquiries();
  res.json({
    success: true,
    count: inquiries.length,
    inquiries,
  });
});

// Admin update status
router.patch('/admin/inquiries/:id', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { status } = req.body;
  if (!status || !['new', 'reviewed', 'responded'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status' });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const target = updateInquiryStatus(id, status);
  if (!target) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  res.json({ success: true, inquiry: target });
});

// Admin delete inquiry
router.delete('/admin/inquiries/:id', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const success = deleteInquiry(id);
  if (!success) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  res.json({ success: true, message: 'Inquiry deleted' });
});

export const apiApp = express();

// Middleware
apiApp.use(express.json({ limit: '20kb' }));
apiApp.use(cors());

// Mount router on BOTH '/api' and '/'
// This guarantees that whether Vercel passes '/api/admin/inquiries' or '/admin/inquiries', it matches!
apiApp.use('/api', router);
apiApp.use(router);
