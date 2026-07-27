-- SQL Script to create tables in Supabase for turn overrides and holiday assignments.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

-- 1. Create holiday_assignments table
CREATE TABLE IF NOT EXISTS public.holiday_assignments (
    date TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security) if you have it enabled for other tables
ALTER TABLE public.holiday_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write (adjust according to your auth setup)
DROP POLICY IF EXISTS "Allow public read access" ON public.holiday_assignments;
DROP POLICY IF EXISTS "Allow public write access" ON public.holiday_assignments;
CREATE POLICY "Allow public read access" ON public.holiday_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.holiday_assignments FOR ALL USING (true) WITH CHECK (true);


-- 2. Create turn_overrides table
CREATE TABLE IF NOT EXISTS public.turn_overrides (
    date TEXT PRIMARY KEY,
    assigned_user TEXT NOT NULL CHECK (assigned_user IN ('facundo', 'ramiro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.turn_overrides ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow public read access" ON public.turn_overrides;
DROP POLICY IF EXISTS "Allow public write access" ON public.turn_overrides;
CREATE POLICY "Allow public read access" ON public.turn_overrides FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.turn_overrides FOR ALL USING (true) WITH CHECK (true);

-- 3. Create special_events table
CREATE TABLE IF NOT EXISTS public.special_events (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure tasks column exists (in case the table already existed without it)
ALTER TABLE public.special_events ADD COLUMN IF NOT EXISTS tasks JSONB DEFAULT '[]'::jsonb;

-- Enable RLS
ALTER TABLE public.special_events ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow public read access" ON public.special_events;
DROP POLICY IF EXISTS "Allow public write access" ON public.special_events;
CREATE POLICY "Allow public read access" ON public.special_events FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.special_events FOR ALL USING (true) WITH CHECK (true);

