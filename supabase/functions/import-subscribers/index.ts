import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImportRequest {
  subscribers: Array<{
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    tags?: string[];
    custom_fields?: Record<string, any>;
  }>;
  source?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { subscribers, source = "import" }: ImportRequest = await req.json();

    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      throw new Error("No subscribers provided");
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validSubscribers = subscribers.filter(sub => 
      sub.email && emailRegex.test(sub.email)
    );

    if (validSubscribers.length === 0) {
      throw new Error("No valid email addresses found");
    }

    // Prepare data for insertion
    const subscribersData = validSubscribers.map(sub => ({
      email: sub.email.toLowerCase().trim(),
      first_name: sub.first_name?.trim() || null,
      last_name: sub.last_name?.trim() || null,
      phone: sub.phone?.trim() || null,
      tags: sub.tags || [],
      custom_fields: sub.custom_fields || {},
      source,
      status: "subscribed",
      subscribed_at: new Date().toISOString()
    }));

    // Insert subscribers (upsert to handle duplicates)
    const { data: insertedSubscribers, error: insertError } = await supabaseClient
      .from("email_subscribers")
      .upsert(subscribersData, {
        onConflict: "email",
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      throw new Error(`Failed to import subscribers: ${insertError.message}`);
    }

    // Count results
    const importedCount = insertedSubscribers?.length || 0;
    const skippedCount = subscribers.length - validSubscribers.length;
    const duplicateCount = validSubscribers.length - importedCount;

    console.log(`Import completed: ${importedCount} imported, ${duplicateCount} duplicates, ${skippedCount} invalid`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscribers imported successfully",
        imported_count: importedCount,
        duplicate_count: duplicateCount,
        invalid_count: skippedCount,
        total_processed: subscribers.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in import-subscribers function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);