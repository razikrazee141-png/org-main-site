import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http')) {
    try {
      cachedClient = createClient(url, key, {
        auth: { persistSession: false },
      });
      return cachedClient;
    } catch (err) {
      console.warn('[Supabase Serverless] Init error:', err);
    }
  }
  return null;
}
