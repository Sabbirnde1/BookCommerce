-- Make the current user an admin (for testing purposes)
-- This should be run only once to create the first admin user
-- Replace 'YOUR_USER_ID' with an actual user ID from auth.users table

-- First, let's check if there are any users in the system
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user from auth.users (if any exists)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- If a user exists and no admin exists, make them admin
    IF first_user_id IS NOT NULL THEN
        -- Check if admin_roles table is empty
        IF NOT EXISTS (SELECT 1 FROM public.admin_roles LIMIT 1) THEN
            INSERT INTO public.admin_roles (user_id, role, permissions)
            VALUES (first_user_id, 'admin', '["products", "orders", "users", "support"]'::jsonb);
            
            RAISE NOTICE 'Made user % an admin', first_user_id;
        END IF;
    END IF;
END $$;