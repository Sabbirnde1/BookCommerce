-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can manage promo codes" ON public.promo_codes;

-- Create separate policies for reading and managing promo codes
-- Allow anyone to read active promo codes
CREATE POLICY "Anyone can view active promo codes" 
ON public.promo_codes 
FOR SELECT 
USING (status = 'active');

-- Only admins can manage (insert, update, delete) promo codes
CREATE POLICY "Only admins can manage promo codes" 
ON public.promo_codes 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));