-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Create admin roles table
CREATE TABLE public.admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table for complete product management
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  condition TEXT NOT NULL DEFAULT 'new',
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  publisher TEXT,
  publication_year INTEGER,
  language TEXT DEFAULT 'English',
  pages INTEGER,
  weight NUMERIC,
  dimensions TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Create product price history table
CREATE TABLE public.product_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  changed_by UUID,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE admin_roles.user_id = is_admin.user_id
  )
$$;

-- Create policies for admin roles
CREATE POLICY "Only admins can view admin roles" 
ON public.admin_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create policies for products (public read, admin write)
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (status = 'active' OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage products" 
ON public.products 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create policies for product price history
CREATE POLICY "Only admins can view price history" 
ON public.product_price_history 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create policies for product images
CREATE POLICY "Anyone can view product images" 
ON public.product_images 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage product images" 
ON public.product_images 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create storage policies for product images
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products');

CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'products' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'products' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'products' AND public.is_admin(auth.uid()));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_admin_roles_updated_at
BEFORE UPDATE ON public.admin_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample products
INSERT INTO public.products (title, author, description, category, condition, price, original_price, stock_quantity) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 'A classic American novel about the Jazz Age', 'fiction', 'new', 1200, 1500, 10),
('To Kill a Mockingbird', 'Harper Lee', 'A gripping tale of racial injustice and childhood innocence', 'fiction', 'new', 1100, 1300, 8),
('1984', 'George Orwell', 'A dystopian social science fiction novel', 'fiction', 'new', 1000, 1200, 15),
('Programming Pearls', 'Jon Bentley', 'Classic computer science book', 'technology', 'old', 800, 1000, 5),
('Clean Code', 'Robert C. Martin', 'A handbook of agile software craftsmanship', 'technology', 'new', 2500, 3000, 12);