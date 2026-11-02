import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
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

// Supabase client instance for backend
let backendSupabase: SupabaseClient | null = null;

function getBackendSupabase(): SupabaseClient | null {
  if (backendSupabase) return backendSupabase;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http')) {
    try {
      backendSupabase = createClient(url, key, {
        auth: { persistSession: false },
      });
      return backendSupabase;
    } catch (err) {
      console.warn('[Storage] Backend Supabase init error:', err);
    }
  }
  return null;
}

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

export async function loadInquiriesAsync(): Promise<Inquiry[]> {
  const sb = getBackendSupabase();
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
          phone: row.phone ? String(row.phone) : undefined,
          subject: String(row.subject || ''),
          message: String(row.message || ''),
          ip: String(row.ip || 'web'),
          userAgent: row.user_agent || row.userAgent || undefined,
          status: row.status === 'reviewed' || row.status === 'responded' ? row.status : 'new',
          emailNotificationSent: Boolean(row.email_notification_sent ?? row.emailNotificationSent ?? false),
        }));

        memoryInquiries = mapped;
        try {
          ensureDataFile();
          fs.writeFileSync(DATA_FILE, JSON.stringify(mapped, null, 2), 'utf-8');
        } catch {}
        return mapped;
      }
    } catch (err) {
      console.warn('[Storage] Supabase async load error:', err);
    }
  }

  return loadInquiries();
}

export function saveInquiry(inquiry: Inquiry): void {
  const list = loadInquiries();
  // Filter out any existing item with same id
  const filtered = list.filter((item) => item.id !== inquiry.id);
  filtered.unshift(inquiry);
  memoryInquiries = filtered;

  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage] File write skipped, preserved in memory:', err);
  }

  // Asynchronously sync to Supabase
  const sb = getBackendSupabase();
  if (sb) {
    void (async () => {
      try {
        const { error } = await sb.from('inquiries').upsert({
          id: inquiry.id,
          created_at: inquiry.createdAt,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone || null,
          subject: inquiry.subject,
          message: inquiry.message,
          ip: inquiry.ip,
          user_agent: inquiry.userAgent,
          status: inquiry.status,
          email_notification_sent: inquiry.emailNotificationSent,
        });

        if (error) {
          if (
            error.message?.toLowerCase().includes('phone') ||
            error.details?.toLowerCase().includes('phone') ||
            error.code === 'PGRST204' ||
            error.code === '42703'
          ) {
            console.warn('[Storage] Retrying Supabase sync without phone column...');
            const fallbackMessage = inquiry.phone
              ? `[Phone: ${inquiry.phone}]\n\n${inquiry.message}`
              : inquiry.message;
            await sb.from('inquiries').upsert({
              id: inquiry.id,
              created_at: inquiry.createdAt,
              name: inquiry.name,
              email: inquiry.email,
              subject: inquiry.subject,
              message: fallbackMessage,
              ip: inquiry.ip,
              user_agent: inquiry.userAgent,
              status: inquiry.status,
              email_notification_sent: inquiry.emailNotificationSent,
            });
          } else {
            console.warn('[Storage] Supabase upsert error:', error.message);
          }
        }
      } catch (err) {
        console.warn('[Storage] Supabase save error:', err);
      }
    })();
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

  const sb = getBackendSupabase();
  if (sb) {
    void (async () => {
      try {
        const { error } = await sb.from('inquiries').update({ status }).eq('id', id);
        if (error) {
          console.warn('[Storage] Supabase update status error:', error.message);
        }
      } catch (err) {
        console.warn('[Storage] Supabase update error:', err);
      }
    })();
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

  const sb = getBackendSupabase();
  if (sb) {
    void (async () => {
      try {
        const { error } = await sb.from('inquiries').delete().eq('id', id);
        if (error) {
          console.warn('[Storage] Supabase delete error:', error.message);
        }
      } catch (err) {
        console.warn('[Storage] Supabase delete error:', err);
      }
    })();
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
      text: `From: ${inquiry.name} (${inquiry.email})\nPhone: ${inquiry.phone || 'Not provided'}\nSubject: ${inquiry.subject}\n\nMessage:\n${inquiry.message}\n`,
    });
    return true;
  } catch (err) {
    console.error('Email error:', err);
    return false;
  }
}
