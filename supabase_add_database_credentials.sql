-- SQL Script to create database_credentials table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.database_credentials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    engine TEXT NOT NULL,
    host TEXT NOT NULL,
    port TEXT,
    database_name TEXT,
    username TEXT,
    password TEXT,
    notes TEXT,
    project_1 TEXT,
    project_2 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure project columns exist if table was already created
ALTER TABLE public.database_credentials ADD COLUMN IF NOT EXISTS project_1 TEXT;
ALTER TABLE public.database_credentials ADD COLUMN IF NOT EXISTS project_2 TEXT;

-- Enable RLS (Row Level Security)
ALTER TABLE public.database_credentials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Allow public read access on database_credentials" ON public.database_credentials;
DROP POLICY IF EXISTS "Allow public insert access on database_credentials" ON public.database_credentials;
DROP POLICY IF EXISTS "Allow public update access on database_credentials" ON public.database_credentials;
DROP POLICY IF EXISTS "Allow public delete access on database_credentials" ON public.database_credentials;

-- Create policies for public access (similar to other tables in this template)
CREATE POLICY "Allow public read access on database_credentials" ON public.database_credentials FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on database_credentials" ON public.database_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on database_credentials" ON public.database_credentials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on database_credentials" ON public.database_credentials FOR DELETE USING (true);
