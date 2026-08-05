-- SQL Script to create office_tickets table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.office_tickets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('soporte', 'redes', 'mantenimiento', 'servidores', 'desarrollo', 'otro')),
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD format
    duration_minutes INT NOT NULL DEFAULT 15,   
    custom_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure custom_category column exists if table was already created
ALTER TABLE public.office_tickets ADD COLUMN IF NOT EXISTS custom_category TEXT;

-- Enable RLS (Row Level Security)
ALTER TABLE public.office_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write
DROP POLICY IF EXISTS "Allow public read access" ON public.office_tickets;
DROP POLICY IF EXISTS "Allow public write access" ON public.office_tickets;
CREATE POLICY "Allow public read access" ON public.office_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.office_tickets FOR ALL USING (true) WITH CHECK (true);
