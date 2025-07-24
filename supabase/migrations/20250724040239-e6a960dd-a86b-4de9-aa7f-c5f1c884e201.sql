-- Update RLS policy to allow guest users to create book requests
DROP POLICY IF EXISTS "Users can create their own book requests" ON public.book_requests;

CREATE POLICY "Users and guests can create book requests" 
ON public.book_requests 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR (is_guest = true AND user_id IS NULL)
);