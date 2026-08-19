-- SQL Script to create special_tasks table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.special_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'promotion' | 'event' | 'special-day' | 'campaign' | 'other'
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    start_date TEXT,
    end_date TEXT,
    progress INT DEFAULT 0,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    banner_url TEXT,
    created_by TEXT,
    updated_by TEXT,
    price NUMERIC,
    rendicion NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist if table was previously created
ALTER TABLE public.special_tasks ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.special_tasks ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.special_tasks ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE public.special_tasks ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE public.special_tasks ADD COLUMN IF NOT EXISTS rendicion NUMERIC;

-- Enable RLS
ALTER TABLE public.special_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write
DROP POLICY IF EXISTS "Allow public read access" ON public.special_tasks;
DROP POLICY IF EXISTS "Allow public write access" ON public.special_tasks;
CREATE POLICY "Allow public read access" ON public.special_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.special_tasks FOR ALL USING (true) WITH CHECK (true);

-- Seed initial special tasks
INSERT INTO public.special_tasks (id, title, description, category, status, priority, start_date, end_date, progress, assigned_to, tasks, notes, created_at, updated_at)
VALUES (
    'st-001',
    'Campaña Día del Niño 2026',
    'Preparar servidores y accesos para la promoción especial en sucursales por el Día del Niño.',
    'campaign',
    'pending',
    'high',
    '2026-08-10',
    '2026-08-17',
    0,
    '["Facundo Carrizo"]'::jsonb,
    '[
        {"id": "st-t-1", "title": "Revisar ancho de banda de sucursales críticas", "completed": false},
        {"id": "st-t-2", "title": "Coordinar soporte de guardia extra", "completed": false}
    ]'::jsonb,
    'Prioridad alta debido al volumen esperado de transacciones.',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;
