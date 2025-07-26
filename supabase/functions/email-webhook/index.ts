import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    delivered_at?: string;
    opened_at?: string;
    clicked_at?: string;
    bounced_at?: string;
    complained_at?: string;
    click_data?: Array<{
      url: string;
      timestamp: string;
    }>;
    bounce_data?: {
      type: string;
      reason: string;
    };
  };
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

    const webhookEvent: ResendWebhookEvent = await req.json();
    
    console.log("Received webhook event:", webhookEvent.type, webhookEvent.data.email_id);

    // Find the email send record by resend_id
    const { data: emailSend, error: findError } = await supabaseClient
      .from("email_sends")
      .select("*")
      .eq("resend_id", webhookEvent.data.email_id)
      .single();

    if (findError || !emailSend) {
      console.log("Email send record not found for resend_id:", webhookEvent.data.email_id);
      return new Response(JSON.stringify({ message: "Email send record not found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const updateData: Record<string, any> = {};

    switch (webhookEvent.type) {
      case "email.delivered":
        updateData.status = "delivered";
        updateData.delivered_at = webhookEvent.data.delivered_at;
        break;

      case "email.opened":
        updateData.status = "opened";
        updateData.opened_at = webhookEvent.data.opened_at;
        updateData.open_count = (emailSend.open_count || 0) + 1;
        break;

      case "email.clicked":
        updateData.status = "clicked";
        updateData.clicked_at = webhookEvent.data.clicked_at;
        updateData.click_count = (emailSend.click_count || 0) + 1;
        
        // Store click data
        const existingClickData = emailSend.click_data || [];
        const newClickData = webhookEvent.data.click_data || [];
        updateData.click_data = [...existingClickData, ...newClickData];
        break;

      case "email.bounced":
        updateData.status = "bounced";
        updateData.bounced_at = webhookEvent.data.bounced_at;
        updateData.bounce_reason = webhookEvent.data.bounce_data?.reason || "Unknown";
        
        // Mark subscriber as bounced if hard bounce
        if (webhookEvent.data.bounce_data?.type === "hard") {
          await supabaseClient
            .from("email_subscribers")
            .update({ status: "bounced" })
            .eq("email", webhookEvent.data.to[0]);
        }
        break;

      case "email.complained":
        updateData.status = "complained";
        
        // Mark subscriber as complained/unsubscribed
        await supabaseClient
          .from("email_subscribers")
          .update({ 
            status: "complained",
            unsubscribed_at: new Date().toISOString()
          })
          .eq("email", webhookEvent.data.to[0]);
        break;

      default:
        console.log("Unhandled webhook event type:", webhookEvent.type);
        return new Response(JSON.stringify({ message: "Event type not handled" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

    // Update the email send record
    const { error: updateError } = await supabaseClient
      .from("email_sends")
      .update(updateData)
      .eq("id", emailSend.id);

    if (updateError) {
      console.error("Error updating email send:", updateError);
      throw updateError;
    }

    // Update campaign statistics
    if (emailSend.campaign_id) {
      await updateCampaignStats(supabaseClient, emailSend.campaign_id, webhookEvent.type);
    }

    console.log("Webhook processed successfully for email:", webhookEvent.data.email_id);

    return new Response(JSON.stringify({ message: "Webhook processed successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error("Error in email-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function updateCampaignStats(supabaseClient: any, campaignId: string, eventType: string) {
  const updateField: Record<string, string> = {
    "email.delivered": "sent_count",
    "email.opened": "open_count",
    "email.clicked": "click_count",
    "email.bounced": "bounce_count",
    "email.complained": "unsubscribe_count"
  };

  const field = updateField[eventType];
  if (!field) return;

  // Get current stats
  const { data: campaign } = await supabaseClient
    .from("email_campaigns")
    .select(field)
    .eq("id", campaignId)
    .single();

  if (campaign) {
    const currentValue = campaign[field] || 0;
    await supabaseClient
      .from("email_campaigns")
      .update({ [field]: currentValue + 1 })
      .eq("id", campaignId);
  }
}

serve(handler);