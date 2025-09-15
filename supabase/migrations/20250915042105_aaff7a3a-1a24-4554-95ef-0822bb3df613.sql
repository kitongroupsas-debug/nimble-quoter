-- Drop the existing tables and create a unified products table
DROP TABLE IF EXISTS public.quotation_products;
DROP TABLE IF EXISTS public.products_catalog;

-- Create unified products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quotation_id UUID NULL, -- NULL for catalog products, filled for quotation-specific products
  item_number TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER DEFAULT 1, -- Only used when part of a quotation
  subtotal NUMERIC DEFAULT 0, -- Only used when part of a quotation
  iva_percentage NUMERIC NOT NULL DEFAULT 19, -- Default 19% IVA
  iva_amount NUMERIC DEFAULT 0, -- Only used when part of a quotation
  total NUMERIC DEFAULT 0, -- Only used when part of a quotation
  availability TEXT,
  warranty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for unified products table
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add foreign key constraint for quotation_id
ALTER TABLE public.products 
ADD CONSTRAINT products_quotation_id_fkey 
FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();