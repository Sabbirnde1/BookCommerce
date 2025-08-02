-- Fix storage policies for product images upload
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;

-- Create a proper policy for admin uploads to products bucket
CREATE POLICY "Admins can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'products' AND is_admin(auth.uid()));

-- Fix avatar upload policy to also include proper check
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);