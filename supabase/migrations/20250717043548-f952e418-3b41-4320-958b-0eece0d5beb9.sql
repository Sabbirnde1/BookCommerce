-- Add foreign key relationship for book_requests to reference profiles
ALTER TABLE public.book_requests 
ADD CONSTRAINT book_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);