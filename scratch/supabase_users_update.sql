-- =========================================================================
-- EJECUTAR ESTO EN TU SUPABASE → SQL EDITOR (PROYECTO pjozijojpherwomrktxq)
-- =========================================================================

-- 1. Agregar las columnas 'role' y 'avatar_url' que faltan en la tabla 'users'
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Forzar la recarga del caché de esquemas en Supabase
NOTIFY pgrst, 'reload schema';
