-- Create table for managing best authors
CREATE TABLE public.best_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(author_name)
);

-- Enable RLS
ALTER TABLE public.best_authors ENABLE ROW LEVEL SECURITY;

-- Create policies for best_authors
CREATE POLICY "Anyone can view active best authors" 
ON public.best_authors 
FOR SELECT 
USING ((is_active = true) OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage best authors" 
ON public.best_authors 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_best_authors_updated_at
BEFORE UPDATE ON public.best_authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();