-- ==============================================================================
-- NextGen Corporate Website - Supabase Inquiries Database Schema
-- Run this in your Supabase Project's SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create the inquiries table
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

-- 2. Create indexes for quick search and sorting
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries (email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 4. Security Policies:
-- Allow website visitors to insert inquiries
CREATE POLICY "Allow public insert to inquiries"
  ON public.inquiries
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow reading inquiries (admin portal)
CREATE POLICY "Allow select on inquiries"
  ON public.inquiries
  FOR SELECT
  TO public, anon, authenticated
  USING (true);

-- Allow updating inquiries (status change in admin portal)
CREATE POLICY "Allow update on inquiries"
  ON public.inquiries
  FOR UPDATE
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow deleting inquiries (admin portal)
CREATE POLICY "Allow delete on inquiries"
  ON public.inquiries
  FOR DELETE
  TO public, anon, authenticated
  USING (true);

-- 5. Enable Supabase Realtime broadcast for instant admin notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
