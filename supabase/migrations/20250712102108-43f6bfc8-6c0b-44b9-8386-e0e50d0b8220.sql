-- Create orders table to track book purchases
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  total_amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BDT',
  status text NOT NULL DEFAULT 'pending',
  shipping_address jsonb,
  payment_method text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order_items table for individual books in each order
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id text NOT NULL,
  book_title text NOT NULL,
  book_author text NOT NULL,
  book_image text,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "Users can view items from their orders" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert items to their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer := 1;
BEGIN
  LOOP
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
    
    -- Check if this number already exists
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = new_number) THEN
      RETURN new_number;
    END IF;
    
    counter := counter + 1;
    
    -- Safety check to avoid infinite loop
    IF counter > 9999 THEN
      new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || EXTRACT(EPOCH FROM NOW())::text;
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_number();

-- Add trigger for updating timestamps
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();