-- Add admin policy for book_requests table to allow admins to view all book requests
CREATE POLICY "Admins can view all book requests" 
ON public.book_requests 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Add admin policy for book_requests table to allow admins to update all book requests
CREATE POLICY "Admins can update all book requests" 
ON public.book_requests 
FOR UPDATE 
USING (is_admin(auth.uid()));