-- SQL Script to create system_notes table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.system_notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Ensure sort_order column exists if the table was already created
ALTER TABLE public.system_notes ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Enable RLS (Row Level Security) if you have it enabled for other tables
ALTER TABLE public.system_notes ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write
DROP POLICY IF EXISTS "Allow public read access" ON public.system_notes;
DROP POLICY IF EXISTS "Allow public write access" ON public.system_notes;
CREATE POLICY "Allow public read access" ON public.system_notes FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.system_notes FOR ALL USING (true) WITH CHECK (true);

-- Seed initial notes
INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-001',
    'Cuenta Datalive de Eventos',
    'Usuario: Principal.eventos' || chr(10) || 'Contraseña: Eventos2024',
    'Credenciales',
    true,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-002',
    'Acceso a PC Servidor con RUST',
    'ID: 293443241' || chr(10) || 'Clave: aehm49' || chr(10) || 'Clave2: MiGusto2026' || chr(10) || 'URL: http://192.168.0.240:5173/fabrica/sistemas/',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-003',
    'Locales que son de CABA',
    'Mataderos' || chr(10) || 'Floresta' || chr(10) || 'Belgrano' || chr(10) || 'Devoto' || chr(10) || 'Villa Urquiza' || chr(10) || 'Barrancas de Belgrano' || chr(10) || 'Villa Crespo' || chr(10) || 'Palermo' || chr(10) || 'Paternal' || chr(10) || 'Puerto Madero' || chr(10) || 'Balvanera' || chr(10) || 'Cañitas' || chr(10) || 'Caballito',
    'General',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-004',
    'Perfiles de DVRs Vicente Lopez y Villa Crespo',
    'Usuario: tvoficina' || chr(10) || 'Pass: Vi3W-0F1-MG' || chr(10) || chr(10) || 'Cámaras:' || chr(10) || 'Villa Crespo SN: 7F04937PAZ3DFC1' || chr(10) || 'Vicente Lopez SN: 5J0164APAZ9AE3E',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-005',
    'Wifi de Mantenimiento en PLANTA',
    'ID: MG MTM' || chr(10) || 'Contraseña: Wl-MIGUST0PLANTA' || chr(10) || 'Nota: La letra ''O'' es un cero ''0''',
    'IPs/Redes',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-006',
    'Accesos de Anydesk importantes',
    'Clave general: MiGusto123' || chr(10) || chr(10) || 'Fichero oficina: 1755577210' || chr(10) || 'Fichero planta: 1022780578' || chr(10) || 'Seguridad fabrica: 1191524608' || chr(10) || 'Fichero One Palmas: 1143629516' || chr(10) || 'Fichero Vicente Lopez: 1337474284' || chr(10) || 'Totem 1 Vicente Lopez: 1045691842' || chr(10) || 'Totem 2 Vicente Lopez: 1525788896' || chr(10) || 'Totem 1 Caballito: 1208355914' || chr(10) || 'Totem 2 Caballito: 1753322035',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-007',
    'Ferozo Panel Admin',
    'Acceso: https://ferozo.host/login' || chr(10) || 'Usuario: c2151492' || chr(10) || 'Clave: FePvG@gbCgje3qX',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-008',
    'Cuenta MULTICLOUD multiled',
    'Usuario: laralorenzo@migusto.com.ar' || chr(10) || 'Pass: MiGusto2026*',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-009',
    'Cuenta para TVBOX de eventos',
    'US: tvboxeventos.migusto@gmail.com' || chr(10) || 'PW: migusto2026',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-010',
    'Accesos Data Kitchen en Suc. Mas Cercana',
    'usuario: piloto@migusto' || chr(10) || 'contraseña: Piloto.2022' || chr(10) || 'Link: datalive.com.ar/kitchen',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-011',
    'Acceso a Mailchimp',
    'Link: https://us2.admin.mailchimp.com/' || chr(10) || 'Correo: marketing@migusto.com.ar' || chr(10) || 'Contraseña: MiGusto2025.Mkt',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-012',
    'Acceso Admin al NAS',
    'Acceso Admin al NAS, para crear nuevos usuarios, carpetas o dar accesos:' || chr(10) || 'URL: http://192.168.0.243' || chr(10) || 'Usuario: sistemas' || chr(10) || 'Contraseña: MiGusto2024',
    'Credenciales',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_notes (id, title, content, category, is_pinned, created_at, updated_at)
VALUES (
    'note-013',
    'Link de TePido Sucursal mas cercana',
    'Link de TePido Sucursal mas cercana: https://www.tepido.com.ar/pedir?a=Mi-Gusto-Sucursal-mas-cercana&qr=X',
    'General',
    false,
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;

