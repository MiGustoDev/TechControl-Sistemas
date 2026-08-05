-- SQL Script to create objectives table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.objectives (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
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

INSERT INTO public.objectives (id, title, description, status, priority, start_date, end_date, progress, assigned_to, tasks, notes, created_at, updated_at)
VALUES (
    'obj-002',
    'Renovación de Equipos Logística',
    'Adquisición e instalación de 4 nuevas notebooks y 2 impresoras en el sector de Logística.',
    'pending',
    'high',
    '2026-08-10',
    '2026-08-30',
    0,
    '["Ramiro Lacci"]'::jsonb,
    '[
        {"id": "t-1", "title": "Aprobación de presupuesto", "completed": false},
        {"id": "t-2", "title": "Configuración de sistema operativo y software base", "completed": false},
        {"id": "t-3", "title": "Instalación física y pruebas en sucursal", "completed": false}
    ]'::jsonb,
    'Pendiente de confirmación de Compras.',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;
