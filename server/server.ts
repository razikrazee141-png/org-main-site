import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies (e.g. Nginx, Cloudflare, Vercel)
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '20kb' }));
app.use(cors());

// Rate limiting: 10 inquiries per 15 minutes per IP
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many inquiries submitted from this connection. Please try again after 15 minutes.',
  },
});

// Persistent Data Storage setup
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'inquiries.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
}

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

function loadInquiries(): Inquiry[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Inquiry[];
  } catch (err) {
    console.error('Failed to read inquiries file:', err);
    return [];
  }
}

function saveInquiry(inquiry: Inquiry): void {
  const inquiries = loadInquiries();
  inquiries.unshift(inquiry); // newest first
  fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
}

// Optional Email Notification Forwarder
async function sendNotificationEmail(inquiry: Inquiry): Promise<boolean> {
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

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Health check endpoint
app.get('/api/contact/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'NextGen Inquiry Gateway',
    timestamp: new Date().toISOString(),
    inquiriesLogged: loadInquiries().length,
  });
});

// Primary Contact submission endpoint
app.post('/api/contact', inquiryLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message, bot_check } = req.body;

    // 1. Honeypot check: If bot filled the hidden honeypot field, silently acknowledge
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
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

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

    // 5. Persist inquiry to secure storage
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
app.get('/api/admin/inquiries', (req: Request, res: Response): void => {
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
app.patch('/api/admin/inquiries/:id', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const { status } = req.body;
  const inquiries = loadInquiries();
  const target = inquiries.find((i) => i.id === req.params.id);

  if (!target) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  if (status && ['new', 'reviewed', 'responded'].includes(status)) {
    target.status = status;
    fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  }

  res.json({ success: true, inquiry: target });
});

// Admin delete inquiry
app.delete('/api/admin/inquiries/:id', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const adminKey = process.env.ADMIN_KEY || 'nextgen-admin-secret-2026';

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  let inquiries = loadInquiries();
  const exists = inquiries.some((i) => i.id === req.params.id);
  if (!exists) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
    return;
  }

  inquiries = inquiries.filter((i) => i.id !== req.params.id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');

  res.json({ success: true, message: 'Inquiry deleted' });
});

// Serve frontend static build files in production
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // Fallback for SPA routing in Express 5
  app.use((req: Request, res: Response, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    } else {
      next();
    }
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`NextGen Official Backend Service Running`);
  console.log(`Port: ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/contact/health`);
  console.log(`Data File: ${DATA_FILE}`);
  console.log(`===============================================`);
});

export default app;
