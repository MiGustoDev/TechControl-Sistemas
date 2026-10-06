-- SQL Script to create/update product_prices table in Supabase.
-- Run this in your Supabase SQL Editor (https://supabase.com) for your project.

CREATE TABLE IF NOT EXISTS public.product_prices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0.00,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If table already exists, ensure is_premium column and remove legacy check constraint
ALTER TABLE public.product_prices ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.product_prices DROP CONSTRAINT IF EXISTS product_prices_category_check;

-- Enable RLS
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Create policies so anyone can read/write
DROP POLICY IF EXISTS "Allow public read access" ON public.product_prices;
DROP POLICY IF EXISTS "Allow public write access" ON public.product_prices;
CREATE POLICY "Allow public read access" ON public.product_prices FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.product_prices FOR ALL USING (true) WITH CHECK (true);

