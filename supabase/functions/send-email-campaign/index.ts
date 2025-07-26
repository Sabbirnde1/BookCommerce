import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
}

interface Subscriber {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  custom_fields?: Record<string, any>;
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

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    const { campaignId }: SendCampaignRequest = await req.json();

    if (!campaignId) {
      throw new Error("Campaign ID is required");
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("email_campaigns")
      .select(`
        *,
        email_templates (
          html_content,
          text_content,
          variables
        )
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      throw new Error("Campaign cannot be sent in current status");
    }

    // Get subscribers based on segment criteria
    let subscribersQuery = supabaseClient
      .from("email_subscribers")
      .select("*")
      .eq("status", "subscribed");

    // Apply segmentation if specified
    if (campaign.segment_criteria && Object.keys(campaign.segment_criteria).length > 0) {
      const criteria = campaign.segment_criteria as Record<string, any>;
      
      if (criteria.tags) {
        subscribersQuery = subscribersQuery.contains("tags", criteria.tags);
      }
      
      if (criteria.source) {
        subscribersQuery = subscribersQuery.eq("source", criteria.source);
      }
    }

    const { data: subscribers, error: subscribersError } = await subscribersQuery;

    if (subscribersError) {
      throw new Error("Failed to fetch subscribers");
    }

    if (!subscribers || subscribers.length === 0) {
      throw new Error("No subscribers found for this campaign");
    }

    // Update campaign status to sending
    await supabaseClient
      .from("email_campaigns")
      .update({
        status: "sending",
        recipient_count: subscribers.length,
        sent_at: new Date().toISOString()
      })
      .eq("id", campaignId);

    // Process email template variables
    const processTemplate = (content: string, subscriber: Subscriber) => {
      let processedContent = content;
      
      // Replace common variables
      processedContent = processedContent.replace(/\{\{first_name\}\}/g, subscriber.first_name || "");
      processedContent = processedContent.replace(/\{\{last_name\}\}/g, subscriber.last_name || "");
      processedContent = processedContent.replace(/\{\{email\}\}/g, subscriber.email);
      processedContent = processedContent.replace(/\{\{site_url\}\}/g, "https://nijercart.com");
      
      // Replace custom fields
      if (subscriber.custom_fields) {
        Object.entries(subscriber.custom_fields).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          processedContent = processedContent.replace(regex, String(value));
        });
      }
      
      return processedContent;
    };

    let sentCount = 0;
    let failedCount = 0;

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const htmlContent = campaign.html_content || campaign.email_templates?.html_content || "";
          const textContent = campaign.text_content || campaign.email_templates?.text_content || "";
          
          const processedHtml = processTemplate(htmlContent, subscriber);
          const processedText = processTemplate(textContent, subscriber);
          
          const emailResponse = await resend.emails.send({
            from: `${campaign.sender_name} <${campaign.sender_email}>`,
            to: [subscriber.email],
            subject: campaign.subject,
            html: processedHtml,
            text: processedText,
          });

          // Track the send
          await supabaseClient.from("email_sends").insert({
            campaign_id: campaignId,
            subscriber_id: subscriber.id,
            email: subscriber.email,
            status: "sent",
            resend_id: emailResponse.data?.id,
            sent_at: new Date().toISOString()
          });

          sentCount++;
          console.log(`Email sent to ${subscriber.email}`);
          
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          failedCount++;
          
          // Track the failed send
          await supabaseClient.from("email_sends").insert({
            campaign_id: campaignId,
            subscriber_id: subscriber.id,
            email: subscriber.email,
            status: "failed",
            bounce_reason: error.message,
            sent_at: new Date().toISOString()
          });
        }
      });

      await Promise.all(emailPromises);
      
      // Add delay between batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign final status
    await supabaseClient
      .from("email_campaigns")
      .update({
        status: "sent",
        sent_count: sentCount,
        bounce_count: failedCount
      })
      .eq("id", campaignId);

    console.log(`Campaign ${campaignId} completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Campaign sent successfully`,
        sent_count: sentCount,
        failed_count: failedCount,
        total_recipients: subscribers.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in send-email-campaign function:", error);
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