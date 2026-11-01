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

export function loadInquiries(): Inquiry[] {
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

export function saveInquiry(inquiry: Inquiry): void {
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

export function updateInquiryStatus(id: string, status: 'new' | 'reviewed' | 'responded'): Inquiry | null {
  const list = loadInquiries();
  const target = list.find((i) => i.id === id);
  if (!target) return null;
  target.status = status;
  memoryInquiries = list;
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] Status update saved in memory:', err);
  }
  return target;
}

export function deleteInquiry(id: string): boolean {
  let list = loadInquiries();
  const exists = list.some((i) => i.id === id);
  if (!exists) return false;
  list = list.filter((i) => i.id !== id);
  memoryInquiries = list;
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] Deletion applied in memory:', err);
  }
  return true;
}

export async function sendNotificationEmail(inquiry: Inquiry): Promise<boolean> {
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
