-- Insert sample orders for demonstration (you can delete this later)
-- Note: Replace 'USER_ID_HERE' with an actual user ID from auth.users if needed

-- Sample order 1
DO $$
DECLARE
  sample_order_id uuid := gen_random_uuid();
BEGIN
  -- Only insert if there are users in the auth.users table
  IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    INSERT INTO public.orders (
      id,
      user_id,
      total_amount,
      status,
      payment_method,
      notes
    )
    SELECT 
      sample_order_id,
      (SELECT id FROM auth.users LIMIT 1),
      1500.00,
      'completed',
      'Cash on Delivery',
      'Please call when you arrive'
    WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

    -- Insert order items for sample order 1
    INSERT INTO public.order_items (
      order_id,
      book_id,
      book_title,
      book_author,
      book_image,
      price,
      quantity
    )
    VALUES 
      (sample_order_id, '1', 'The Great Gatsby', 'F. Scott Fitzgerald', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', 650.00, 1),
      (sample_order_id, '2', 'Atomic Habits', 'James Clear', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop', 850.00, 1);
  END IF;
END $$;