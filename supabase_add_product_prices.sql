-- SQL Script to create product_prices table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.product_prices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('empanadas', 'pizzas', 'pizzas_indi', 'promos', 'packs')),
    price NUMERIC NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write (adjust according to your auth setup)
DROP POLICY IF EXISTS "Allow public read access" ON public.product_prices;
DROP POLICY IF EXISTS "Allow public write access" ON public.product_prices;
CREATE POLICY "Allow public read access" ON public.product_prices FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.product_prices FOR ALL USING (true) WITH CHECK (true);

-- Insert some initial mock data for ease of use
INSERT INTO public.product_prices (id, name, category, price)
VALUES
  ('m1', 'Empanada de Carne Suave', 'empanadas', 1200.00),
  ('m2', 'Empanada de Jamón y Queso', 'empanadas', 1200.00),
  ('m3', 'Empanada de Humita', 'empanadas', 1200.00),
  ('m4', 'Pizza Muzzarella', 'pizzas', 7500.00),
  ('m5', 'Pizza Especial (J&Q)', 'pizzas', 9200.00),
  ('m6', 'Pizza Fugazzeta', 'pizzas', 8500.00),
  ('m7', 'Pizza INDIV. Muzzarella', 'pizzas_indi', 2800.00),
  ('m8', 'Pizza INDIV. Napolitana', 'pizzas_indi', 3200.00),
  ('m9', 'Promo 12 Empanadas + Bebida', 'promos', 13500.00),
  ('m10', 'Promo 2 Pizzas Muzzarella', 'promos', 14000.00),
  ('m11', 'Pack Familiar (Pizza + 6 Empanadas)', 'packs', 13000.00),
  ('m12', 'Mega Pack Amigos (2 Pizzas + 12 Empanadas)', 'packs', 25000.00)
ON CONFLICT (id) DO NOTHING;
