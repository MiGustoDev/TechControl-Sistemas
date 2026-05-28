-- Ejecutar en Supabase → SQL Editor (proyecto pjozijojpherwomrktxq)

-- Tabla (por si no existe)
CREATE TABLE IF NOT EXISTS guardias (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  branches_affected TEXT,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Opción A: sin RLS (más simple para app interna)
ALTER TABLE guardias DISABLE ROW LEVEL SECURITY;

-- Opción B (alternativa): si preferís mantener RLS habilitado, comentá la línea de arriba
-- y descomentá esto:
-- ALTER TABLE guardias ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "guardias_select" ON guardias;
-- DROP POLICY IF EXISTS "guardias_insert" ON guardias;
-- DROP POLICY IF EXISTS "guardias_update" ON guardias;
-- DROP POLICY IF EXISTS "guardias_delete" ON guardias;
-- CREATE POLICY "guardias_select" ON guardias FOR SELECT TO anon, authenticated USING (true);
-- CREATE POLICY "guardias_insert" ON guardias FOR INSERT TO anon, authenticated WITH CHECK (true);
-- CREATE POLICY "guardias_update" ON guardias FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "guardias_delete" ON guardias FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
