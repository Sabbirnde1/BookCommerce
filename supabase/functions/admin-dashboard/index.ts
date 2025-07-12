import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductData {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  category: string;
  condition: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  publisher?: string;
  publication_year?: number;
  language?: string;
  pages?: number;
  weight?: number;
  dimensions?: string;
  featured?: boolean;
  status?: string;
  tags?: string[];
}

interface PriceUpdateData {
  product_id: string;
  new_price: number;
  reason?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .from('admin_roles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Admin dashboard action: ${action}, User: ${user.id}`)

    switch (action) {
      case 'get-products':
        return await getProducts(req, supabaseClient)
      
      case 'create-product':
        return await createProduct(req, supabaseClient, user)
      
      case 'update-product':
        return await updateProduct(req, supabaseClient, user)
      
      case 'delete-product':
        return await deleteProduct(req, supabaseClient)
      
      case 'update-price':
        return await updateProductPrice(req, supabaseClient, user)
      
      case 'get-price-history':
        return await getPriceHistory(req, supabaseClient)
      
      case 'upload-image':
        return await uploadProductImage(req, supabaseClient, user)
      
      case 'delete-image':
        return await deleteProductImage(req, supabaseClient)
      
      case 'update-image-order':
        return await updateImageOrder(req, supabaseClient)
      
      case 'get-dashboard-stats':
        return await getDashboardStats(req, supabaseClient)
      
      case 'make-admin':
        return await makeUserAdmin(req, supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function getProducts(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const category = url.searchParams.get('category')
  const status = url.searchParams.get('status')
  const search = url.searchParams.get('search')

  let query = supabaseClient
    .from('products')
    .select(`
      *,
      product_images(*)
    `)
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Get total count for pagination
  const { count } = await supabaseClient
    .from('products')
    .select('*', { count: 'exact', head: true })

  return new Response(
    JSON.stringify({ 
      success: true, 
      products: data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createProduct(req: Request, supabaseClient: any, user: any) {
  const productData: ProductData = await req.json()

  if (!productData.title || !productData.author || !productData.price) {
    return new Response(
      JSON.stringify({ error: 'Title, author, and price are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('products')
    .insert({
      ...productData,
      created_by: user.id,
      updated_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create product' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  console.log(`Product created: ${data.title}`)

  return new Response(
    JSON.stringify({ 
      success: true, 
      product: data,
      message: 'Product created successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateProduct(req: Request, supabaseClient: any, user: any) {
  const { product_id, ...updates } = await req.json()

  if (!product_id) {
    return new Response(
      JSON.stringify({ error: 'Product ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('products')
    .update({
      ...updates,
      updated_by: user.id
    })
    .eq('id', product_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update product' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      product: data,
      message: 'Product updated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteProduct(req: Request, supabaseClient: any) {
  const { product_id } = await req.json()

  if (!product_id) {
    return new Response(
      JSON.stringify({ error: 'Product ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { error } = await supabaseClient
    .from('products')
    .delete()
    .eq('id', product_id)

  if (error) {
    console.error('Error deleting product:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete product' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Product deleted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateProductPrice(req: Request, supabaseClient: any, user: any) {
  const { product_id, new_price, reason }: PriceUpdateData = await req.json()

  if (!product_id || !new_price) {
    return new Response(
      JSON.stringify({ error: 'Product ID and new price are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Get current product
  const { data: product, error: productError } = await supabaseClient
    .from('products')
    .select('price')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    return new Response(
      JSON.stringify({ error: 'Product not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Record price history
  await supabaseClient
    .from('product_price_history')
    .insert({
      product_id,
      old_price: product.price,
      new_price,
      changed_by: user.id,
      reason: reason || 'Price updated by admin'
    })

  // Update product price
  const { data, error } = await supabaseClient
    .from('products')
    .update({ 
      price: new_price,
      updated_by: user.id
    })
    .eq('id', product_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product price:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update product price' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      product: data,
      message: 'Product price updated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getPriceHistory(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const product_id = url.searchParams.get('product_id')

  if (!product_id) {
    return new Response(
      JSON.stringify({ error: 'Product ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('product_price_history')
    .select(`
      *,
      changed_by_profile:profiles(display_name)
    `)
    .eq('product_id', product_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching price history:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch price history' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true, history: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function uploadProductImage(req: Request, supabaseClient: any, user: any) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const product_id = formData.get('product_id') as string
  const alt_text = formData.get('alt_text') as string
  const is_primary = formData.get('is_primary') === 'true'

  if (!file || !product_id) {
    return new Response(
      JSON.stringify({ error: 'File and product ID are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${product_id}/${Date.now()}.${fileExt}`

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from('products')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    return new Response(
      JSON.stringify({ error: 'Failed to upload image' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from('products')
    .getPublicUrl(fileName)

  // Save image record
  const { data, error } = await supabaseClient
    .from('product_images')
    .insert({
      product_id,
      image_url: publicUrl,
      image_path: fileName,
      alt_text: alt_text || '',
      is_primary
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving image record:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to save image record' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      image: data,
      message: 'Image uploaded successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteProductImage(req: Request, supabaseClient: any) {
  const { image_id } = await req.json()

  if (!image_id) {
    return new Response(
      JSON.stringify({ error: 'Image ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Get image record first
  const { data: image, error: imageError } = await supabaseClient
    .from('product_images')
    .select('image_path')
    .eq('id', image_id)
    .single()

  if (imageError || !image) {
    return new Response(
      JSON.stringify({ error: 'Image not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Delete from storage
  await supabaseClient.storage
    .from('products')
    .remove([image.image_path])

  // Delete record
  const { error } = await supabaseClient
    .from('product_images')
    .delete()
    .eq('id', image_id)

  if (error) {
    console.error('Error deleting image record:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete image' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Image deleted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateImageOrder(req: Request, supabaseClient: any) {
  const { images } = await req.json()

  if (!images || !Array.isArray(images)) {
    return new Response(
      JSON.stringify({ error: 'Images array is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Update sort order for each image
  const updatePromises = images.map((img: any, index: number) =>
    supabaseClient
      .from('product_images')
      .update({ sort_order: index })
      .eq('id', img.id)
  )

  await Promise.all(updatePromises)

  return new Response(
    JSON.stringify({ 
      success: true,
      message: 'Image order updated successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getDashboardStats(req: Request, supabaseClient: any) {
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: outOfStock },
    { data: recentOrders }
  ] = await Promise.all([
    supabaseClient.from('products').select('*', { count: 'exact', head: true }),
    supabaseClient.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseClient.from('products').select('*', { count: 'exact', head: true }).eq('stock_quantity', 0),
    supabaseClient.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  return new Response(
    JSON.stringify({ 
      success: true, 
      stats: {
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        outOfStock: outOfStock || 0,
        recentOrders: recentOrders || []
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function makeUserAdmin(req: Request, supabaseClient: any) {
  const { user_id, role = 'admin' } = await req.json()

  if (!user_id) {
    return new Response(
      JSON.stringify({ error: 'User ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('admin_roles')
    .upsert({
      user_id,
      role,
      permissions: ['products', 'orders', 'users']
    })
    .select()
    .single()

  if (error) {
    console.error('Error making user admin:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to assign admin role' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      admin: data,
      message: 'Admin role assigned successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}