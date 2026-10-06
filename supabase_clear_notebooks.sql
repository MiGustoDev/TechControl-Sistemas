-- Script para vaciar la tabla y agregar las nuevas columnas opcionales en Supabase
-- Ejecutar en el SQL Editor de Supabase si deseas sincronizar las licencias y datos técnicos en la base de datos remota

DELETE FROM public.notebooks;

ALTER TABLE public.notebooks 
ADD COLUMN IF NOT EXISTS product_key_oem text,
ADD COLUMN IF NOT EXISTS product_key_installed text,
ADD COLUMN IF NOT EXISTS activation_status text,
ADD COLUMN IF NOT EXISTS license_channel text,
ADD COLUMN IF NOT EXISTS product_id text,
ADD COLUMN IF NOT EXISTS uuid text,
ADD COLUMN IF NOT EXISTS bios_version text,
ADD COLUMN IF NOT EXISTS win11_evaluation text,
ADD COLUMN IF NOT EXISTS tpm_info text,
ADD COLUMN IF NOT EXISTS current_user_local text,
ADD COLUMN IF NOT EXISTS cores_threads text,
ADD COLUMN IF NOT EXISTS ram_modules text,
ADD COLUMN IF NOT EXISTS ram_usable text;
