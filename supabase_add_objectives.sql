-- SQL Script to create objectives table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.objectives (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    horizon TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    start_date TEXT,
    end_date TEXT,
    progress INT DEFAULT 0,
    assigned_to JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was created previously without them
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.objectives ADD COLUMN IF NOT EXISTS horizon TEXT;

-- Enable RLS
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write
DROP POLICY IF EXISTS "Allow public read access" ON public.objectives;
DROP POLICY IF EXISTS "Allow public write access" ON public.objectives;
CREATE POLICY "Allow public read access" ON public.objectives FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.objectives FOR ALL USING (true) WITH CHECK (true);

-- Seed initial objectives
INSERT INTO public.objectives (id, title, description, status, priority, start_date, end_date, progress, assigned_to, tasks, notes, created_at, updated_at)
VALUES (
    'obj-001',
    'Migración completa a Supabase',
    'Migrar todas las tablas locales y configuraciones de mock data del sistema hacia la base de datos de producción de Supabase.',
    'in-progress',
    'critical',
    '2026-08-01',
    '2026-08-15',
    66,
    '["Facundo Carrizo", "Ramiro Lacci"]'::jsonb,
    '[
        {"id": "t-1", "title": "Crear tablas e índices en base de datos", "completed": true},
        {"id": "t-2", "title": "Integrar lógica de sincronización en AppContext", "completed": true},
        {"id": "t-3", "title": "Verificación y pruebas de consistencia de datos", "completed": false}
    ]'::jsonb,
    'Es prioritario para asegurar la consistencia multiusuario.',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.objectives (id, title, description, category, horizon, status, priority, start_date, end_date, progress, assigned_to, tasks, notes, created_at, updated_at)
VALUES (
    'obj-pickeos-bandejas',
    'Continuar proyecto de APP DE PICKEOS de bandejas',
    '',
    'other',
    'Q3 2026',
    'pending',
    'medium',
    '2026-09-01',
    '2026-12-30',
    0,
    '["Facundo Carrizo", "Ramiro Lacci"]'::jsonb,
    '[
        {"id": "t-pickeos-1", "title": "Evaluar instacia actual de la app por parte de Datalive", "completed": false},
        {"id": "t-pickeos-2", "title": "Intentar replicarla nosotros y evaluar tiempo de desarrollo menor al de data", "completed": false}
    ]'::jsonb,
    '',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.objectives (id, title, description, category, horizon, status, priority, start_date, end_date, progress, assigned_to, tasks, notes, created_at, updated_at)
VALUES (
    'obj-rp-sistemas',
    'Investigacion y reconocimiento de RP sistemas',
    'Aprender a fondo el funcionamiento completo de RP sistemas para poder dar catedra de uso dentro de fabrica para colaboradores y encargados',
    'infrastructure',
    'Q3 2026',
    'in-progress',
    'medium',
    '2026-09-01',
    '2026-12-30',
    0,
    '["Facundo Carrizo", "Ramiro Lacci"]'::jsonb,
    '[
        {"id": "t-rp-1", "title": "Ver videos tutoriales", "completed": false},
        {"id": "t-rp-2", "title": "Probar con usuario Piloto", "completed": false},
        {"id": "t-rp-3", "title": "Hacer pruebas de funciones especificas", "completed": false},
        {"id": "t-rp-4", "title": "Probar cada modulo", "completed": false}
    ]'::jsonb,
    '',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

