-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  nit TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  document TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quotation_number TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  customer_id UUID REFERENCES public.customers(id),
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  observations TEXT,
  format TEXT DEFAULT 'format1',
  subtotal DECIMAL(10,2) DEFAULT 0,
  total_iva DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table for quotation items
CREATE TABLE public.quotation_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_number TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  iva_percentage DECIMAL(5,2) NOT NULL DEFAULT 19,
  iva_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view their own companies" 
ON public.companies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies" 
ON public.companies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for customers
CREATE POLICY "Users can view their own customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" 
ON public.customers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for quotations
CREATE POLICY "Users can view their own quotations" 
ON public.quotations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotations" 
ON public.quotations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations" 
ON public.quotations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotations" 
ON public.quotations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for quotation products
CREATE POLICY "Users can view quotation products" 
ON public.quotation_products 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.quotations 
  WHERE quotations.id = quotation_products.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Users can create quotation products" 
ON public.quotation_products 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.quotations 
  WHERE quotations.id = quotation_products.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Users can update quotation products" 
ON public.quotation_products 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.quotations 
  WHERE quotations.id = quotation_products.quotation_id 
  AND quotations.user_id = auth.uid()
));

CREATE POLICY "Users can delete quotation products" 
ON public.quotation_products 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.quotations 
  WHERE quotations.id = quotation_products.quotation_id 
  AND quotations.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotation_products_updated_at
BEFORE UPDATE ON public.quotation_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('quotation-images', 'quotation-images', true);

-- Create storage policies
CREATE POLICY "Anyone can view quotation images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'quotation-images');

CREATE POLICY "Authenticated users can upload quotation images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'quotation-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own quotation images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'quotation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own quotation images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'quotation-images' AND auth.uid()::text = (storage.foldername(name))[1]);