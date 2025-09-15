-- Add availability and warranty fields to quotation_products table
ALTER TABLE public.quotation_products 
ADD COLUMN availability text,
ADD COLUMN warranty text;

-- Create a products catalog table for reusable products
CREATE TABLE public.products_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_number text,
  description text NOT NULL,
  image_url text,
  unit_price numeric NOT NULL DEFAULT 0,
  availability text,
  warranty text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on products_catalog
ALTER TABLE public.products_catalog ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products_catalog
CREATE POLICY "Users can view their own products"
ON public.products_catalog
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products"
ON public.products_catalog
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
ON public.products_catalog
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
ON public.products_catalog
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on products_catalog
CREATE TRIGGER update_products_catalog_updated_at
BEFORE UPDATE ON public.products_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();