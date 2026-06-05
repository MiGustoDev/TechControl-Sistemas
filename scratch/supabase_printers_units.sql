-- Opcional: si toner_level / image_unit_level tenían CHECK (0-100) de la época de porcentajes,
-- quitá la restricción para permitir cantidades en unidades (0, 1, 2, 10, etc.).
--
-- Revisá en Supabase → Table Editor → printers → Constraints
-- o ejecutá en SQL Editor:

-- Ejemplo (ajustá el nombre del constraint según tu tabla):
-- ALTER TABLE public.printers DROP CONSTRAINT IF EXISTS printers_toner_level_check;
-- ALTER TABLE public.printers DROP CONSTRAINT IF EXISTS printers_image_unit_level_check;

-- Las columnas toner_level e image_unit_level siguen usándose; ahora guardan UNIDADES, no %.
