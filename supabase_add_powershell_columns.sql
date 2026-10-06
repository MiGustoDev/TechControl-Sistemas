-- Script SQL para agregar columnas de licenciamiento y PowerShell a la tabla `notebooks` en Supabase

ALTER TABLE public.notebooks
  ADD COLUMN IF NOT EXISTS product_key_oem TEXT,
  ADD COLUMN IF NOT EXISTS product_key_installed TEXT,
  ADD COLUMN IF NOT EXISTS activation_status TEXT,
  ADD COLUMN IF NOT EXISTS license_channel TEXT,
  ADD COLUMN IF NOT EXISTS product_id TEXT,
  ADD COLUMN IF NOT EXISTS uuid TEXT,
  ADD COLUMN IF NOT EXISTS bios_version TEXT,
  ADD COLUMN IF NOT EXISTS win11_evaluation TEXT,
  ADD COLUMN IF NOT EXISTS tpm_info TEXT,
  ADD COLUMN IF NOT EXISTS current_user_local TEXT,
  ADD COLUMN IF NOT EXISTS cores_threads TEXT,
  ADD COLUMN IF NOT EXISTS ram_modules TEXT,
  ADD COLUMN IF NOT EXISTS ram_usable TEXT;
