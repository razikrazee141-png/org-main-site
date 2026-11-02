import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface InquiryRecord {
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

const STORAGE_KEY_URL = 'nextgen_supabase_url';
const STORAGE_KEY_ANON = 'nextgen_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let lastUrl: string | null = null;
let lastKey: string | null = null;

/**
 * Retrieve active Supabase credentials from Vite environment or localStorage override
 */
export function getSupabaseConfig(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'localStorage' | 'none';
} {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    const localUrl = (localStorage.getItem(STORAGE_KEY_URL) || '').trim();
    const localKey = (localStorage.getItem(STORAGE_KEY_ANON) || '').trim();
    if (localUrl && localKey) {
      return {
        url: localUrl,
        anonKey: localKey,
        isConfigured: true,
        source: 'localStorage',
      };
    }
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
}

export function isSupabaseConfigured(): boolean {
  const { isConfigured, url, anonKey } = getSupabaseConfig();
  return isConfigured && url.startsWith('http') && anonKey.length > 10;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  }
  cachedClient = null;
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
  cachedClient = null;
}

/**
 * Obtain or initialize Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Normalizes Supabase database row (snake_case or camelCase) to InquiryRecord
 */
export function normalizeInquiry(row: any): InquiryRecord {
  return {
    id: String(row.id || `NG-${Date.now()}`),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    name: String(row.name || ''),
    email: String(row.email || ''),
    subject: String(row.subject || ''),
    message: String(row.message || ''),
    ip: String(row.ip || 'web'),
    userAgent: row.user_agent || row.userAgent || undefined,
    status: row.status === 'reviewed' || row.status === 'responded' ? row.status : 'new',
    emailNotificationSent: Boolean(row.email_notification_sent ?? row.emailNotificationSent ?? false),
  };
}

/**
 * Test connectivity and verify if the 'inquiries' table is created
 */
export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string; tableReady: boolean }> {
  try {
    const url = customUrl || getSupabaseConfig().url;
    const key = customKey || getSupabaseConfig().anonKey;

    if (!url || !key) {
      return {
        success: false,
        message: 'Supabase URL and Anon Key are required.',
        tableReady: false,
      };
    }

    const client = createClient(url, key, {
      auth: { persistSession: false },
    });

    // Test query on 'inquiries' table
    const { data, error } = await client
      .from('inquiries')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "public.inquiries" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase, but the "inquiries" table has not been created yet. Please execute the SQL schema in your Supabase SQL editor.',
          tableReady: false,
        };
      }
      return {
        success: false,
        message: error.message || 'Supabase query error',
        tableReady: false,
      };
    }

    return {
      success: true,
      message: 'Supabase connection established and "inquiries" table verified.',
      tableReady: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect to Supabase.',
      tableReady: false,
    };
  }
}

/**
 * Insert inquiry into Supabase
 */
export async function submitInquiryToSupabase(data: {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip?: string;
  userAgent?: string;
}): Promise<InquiryRecord> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const id =
    data.id ||
    `NG-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

  const row = {
    id,
    created_at: new Date().toISOString(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim(),
    message: data.message.trim(),
    ip: data.ip || 'web',
    user_agent: data.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'web'),
    status: 'new',
    email_notification_sent: false,
  };

  const { data: inserted, error } = await client
    .from('inquiries')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(error.message || 'Failed to save inquiry to Supabase.');
  }

  return normalizeInquiry(inserted || row);
}

/**
 * Fetch all inquiries from Supabase
 */
export async function fetchInquiriesFromSupabase(): Promise<InquiryRecord[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    throw new Error(error.message || 'Failed to fetch inquiries from Supabase.');
  }

  return (data || []).map(normalizeInquiry);
}

/**
 * Update inquiry status in Supabase
 */
export async function updateInquiryStatusInSupabase(
  id: string,
  status: 'new' | 'reviewed' | 'responded'
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client
    .from('inquiries')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Supabase status update error:', error);
    return false;
  }
  return true;
}

/**
 * Delete inquiry from Supabase
 */
export async function deleteInquiryFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client
    .from('inquiries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    return false;
  }
  return true;
}

/**
 * Subscribe to realtime changes on 'inquiries' table
 */
export function subscribeToInquiries(onChange: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) {
    return () => {};
  }

  try {
    const channel = client
      .channel('nextgen-inquiries-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime subscription error:', err);
    return () => {};
  }
}

export const SUPABASE_SETUP_SQL = `-- 1. Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT DEFAULT 'web',
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded')),
  email_notification_sent BOOLEAN DEFAULT FALSE
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);

-- 3. Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Policies (allow public insert from site, allow read/update/delete for admin)
CREATE POLICY "Allow public insert to inquiries"
  ON public.inquiries FOR INSERT TO public, anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow select on inquiries"
  ON public.inquiries FOR SELECT TO public, anon, authenticated USING (true);

CREATE POLICY "Allow update on inquiries"
  ON public.inquiries FOR UPDATE TO public, anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete on inquiries"
  ON public.inquiries FOR DELETE TO public, anon, authenticated USING (true);

-- 5. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
`;
