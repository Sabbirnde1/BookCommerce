-- Create hero_images table for managing responsive hero backgrounds
CREATE TABLE public.hero_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_type TEXT NOT NULL CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT 'Hero background image',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(device_type, display_order)
);

-- Enable Row Level Security
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Hero images are viewable by everyone" 
ON public.hero_images 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage hero images" 
ON public.hero_images 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_images_updated_at
BEFORE UPDATE ON public.hero_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default hero images
INSERT INTO public.hero_images (device_type, image_url, alt_text, display_order) VALUES
('desktop', '/src/assets/hero-desktop.jpg', 'Desktop hero background', 1),
('tablet', '/src/assets/hero-tablet.jpg', 'Tablet hero background', 1),
('mobile', '/src/assets/hero-mobile.jpg', 'Mobile hero background', 1);