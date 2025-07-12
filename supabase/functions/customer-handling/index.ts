import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TicketRequest {
  subject: string;
  description: string;
  category?: string;
  priority?: string;
  customer_email?: string;
  customer_phone?: string;
}

interface InquiryRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiry_type?: string;
}

interface CommunicationRequest {
  ticket_id?: string;
  inquiry_id?: string;
  message: string;
  communication_type?: string;
  is_internal?: boolean;
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

    console.log(`Customer handling action: ${action}, User: ${user?.id || 'anonymous'}`)

    switch (action) {
      case 'create-ticket':
        return await createSupportTicket(req, supabaseClient, user)
      
      case 'update-ticket':
        return await updateSupportTicket(req, supabaseClient, user)
      
      case 'get-tickets':
        return await getUserTickets(req, supabaseClient, user)
      
      case 'create-inquiry':
        return await createInquiry(req, supabaseClient, user)
      
      case 'get-inquiries':
        return await getUserInquiries(req, supabaseClient, user)
      
      case 'add-communication':
        return await addCommunication(req, supabaseClient, user)
      
      case 'get-communications':
        return await getCommunications(req, supabaseClient, user)
      
      case 'close-ticket':
        return await closeTicket(req, supabaseClient, user)
      
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
    console.error('Customer handling error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function createSupportTicket(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const ticketData: TicketRequest = await req.json()

  if (!ticketData.subject || !ticketData.description) {
    return new Response(
      JSON.stringify({ error: 'Subject and description are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('support_tickets')
    .insert({
      user_id: user.id,
      subject: ticketData.subject,
      description: ticketData.description,
      category: ticketData.category || 'general',
      priority: ticketData.priority || 'medium',
      customer_email: ticketData.customer_email || user.email,
      customer_phone: ticketData.customer_phone
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating support ticket:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create support ticket' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  console.log(`Support ticket created: ${data.ticket_number}`)

  return new Response(
    JSON.stringify({ 
      success: true, 
      ticket: data,
      message: `Support ticket ${data.ticket_number} created successfully`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateSupportTicket(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { ticket_id, ...updates } = await req.json()

  if (!ticket_id) {
    return new Response(
      JSON.stringify({ error: 'Ticket ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('support_tickets')
    .update(updates)
    .eq('id', ticket_id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating support ticket:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update support ticket' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true, ticket: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUserTickets(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user tickets:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch tickets' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true, tickets: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function createInquiry(req: Request, supabaseClient: any, user: any) {
  const inquiryData: InquiryRequest = await req.json()

  if (!inquiryData.name || !inquiryData.email || !inquiryData.subject || !inquiryData.message) {
    return new Response(
      JSON.stringify({ error: 'Name, email, subject, and message are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('customer_inquiries')
    .insert({
      user_id: user?.id || null,
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone,
      subject: inquiryData.subject,
      message: inquiryData.message,
      inquiry_type: inquiryData.inquiry_type || 'general'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating inquiry:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create inquiry' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  console.log(`Customer inquiry created: ${data.id}`)

  return new Response(
    JSON.stringify({ 
      success: true, 
      inquiry: data,
      message: 'Your inquiry has been submitted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getUserInquiries(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('customer_inquiries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user inquiries:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch inquiries' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true, inquiries: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function addCommunication(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const commData: CommunicationRequest = await req.json()

  if (!commData.message || (!commData.ticket_id && !commData.inquiry_id)) {
    return new Response(
      JSON.stringify({ error: 'Message and either ticket_id or inquiry_id are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('customer_communications')
    .insert({
      ticket_id: commData.ticket_id || null,
      inquiry_id: commData.inquiry_id || null,
      user_id: user.id,
      message: commData.message,
      communication_type: commData.communication_type || 'note',
      is_internal: commData.is_internal || false
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding communication:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to add communication' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true, communication: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getCommunications(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const url = new URL(req.url)
  const ticket_id = url.searchParams.get('ticket_id')
  const inquiry_id = url.searchParams.get('inquiry_id')

  if (!ticket_id && !inquiry_id) {
    return new Response(
      JSON.stringify({ error: 'Either ticket_id or inquiry_id is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  let query = supabaseClient
    .from('customer_communications')
    .select('*')
    .order('created_at', { ascending: true })

  if (ticket_id) {
    query = query.eq('ticket_id', ticket_id)
  } else if (inquiry_id) {
    query = query.eq('inquiry_id', inquiry_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching communications:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch communications' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ success: true, communications: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function closeTicket(req: Request, supabaseClient: any, user: any) {
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { ticket_id, resolution } = await req.json()

  if (!ticket_id) {
    return new Response(
      JSON.stringify({ error: 'Ticket ID is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const { data, error } = await supabaseClient
    .from('support_tickets')
    .update({
      status: 'closed',
      resolution: resolution || 'Ticket closed by customer',
      resolved_at: new Date().toISOString()
    })
    .eq('id', ticket_id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error closing ticket:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to close ticket' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      ticket: data,
      message: `Ticket ${data.ticket_number} has been closed`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}