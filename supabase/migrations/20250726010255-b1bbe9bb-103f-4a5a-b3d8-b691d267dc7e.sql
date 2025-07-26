-- Create email marketing tables

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL DEFAULT 'marketing', -- marketing, transactional, automated
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables for personalization
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' -- active, inactive, archived
);

-- Email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  html_content TEXT,
  text_content TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'newsletter', -- newsletter, promotional, announcement, automation
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, cancelled
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  unsubscribe_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sender_email TEXT NOT NULL DEFAULT 'noreply@nijercart.com',
  sender_name TEXT NOT NULL DEFAULT 'Nijercart',
  tags JSONB DEFAULT '[]'::jsonb,
  segment_criteria JSONB DEFAULT '{}'::jsonb -- Criteria for customer segmentation
);

-- Email subscribers/contacts table
CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed', -- subscribed, unsubscribed, bounced, complained
  source TEXT DEFAULT 'manual', -- manual, website, import, api
  tags JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id), -- Link to registered users
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email sends (tracking individual emails sent)
CREATE TABLE public.email_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id),
  subscriber_id UUID REFERENCES public.email_subscribers(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, complained
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  click_data JSONB DEFAULT '[]'::jsonb, -- Track which links were clicked
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  resend_id TEXT, -- Resend message ID for tracking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Automated email sequences
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- signup, purchase, abandon_cart, birthday, etc.
  trigger_criteria JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, paused
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual steps in email sequences
CREATE TABLE public.email_sequence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES public.email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  delay_amount INTEGER NOT NULL DEFAULT 0, -- Delay in minutes
  delay_unit TEXT NOT NULL DEFAULT 'minutes', -- minutes, hours, days
  conditions JSONB DEFAULT '{}'::jsonb, -- Conditions to send this step
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track sequence enrollments and progress
CREATE TABLE public.email_sequence_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES public.email_sequences(id),
  subscriber_id UUID REFERENCES public.email_subscribers(id),
  current_step INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled, paused
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email analytics summary
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id),
  date DATE NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  unique_opens INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can access email marketing features
CREATE POLICY "Only admins can manage email templates" ON public.email_templates
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage email subscribers" ON public.email_subscribers
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can view email sends" ON public.email_sends
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage email sequences" ON public.email_sequences
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage sequence steps" ON public.email_sequence_steps
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage sequence enrollments" ON public.email_sequence_enrollments
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can view email analytics" ON public.email_analytics
  FOR ALL USING (is_admin(auth.uid()));

-- Triggers for updated_at timestamps
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_subscribers_updated_at
  BEFORE UPDATE ON public.email_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON public.email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_sequence_enrollments_updated_at
  BEFORE UPDATE ON public.email_sequence_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at);
CREATE INDEX idx_email_subscribers_email ON public.email_subscribers(email);
CREATE INDEX idx_email_subscribers_status ON public.email_subscribers(status);
CREATE INDEX idx_email_sends_campaign_id ON public.email_sends(campaign_id);
CREATE INDEX idx_email_sends_subscriber_id ON public.email_sends(subscriber_id);
CREATE INDEX idx_email_sends_status ON public.email_sends(status);
CREATE INDEX idx_email_sequence_enrollments_next_send_at ON public.email_sequence_enrollments(next_send_at);

-- Insert some default email templates
INSERT INTO public.email_templates (name, subject, html_content, text_content, template_type, variables) VALUES
('Welcome Email', 'Welcome to Nijercart!', 
'<h1>Welcome {{first_name}}!</h1><p>Thank you for joining Nijercart. We''re excited to help you discover amazing books!</p><p>Browse our collection at <a href="{{site_url}}">nijercart.com</a></p>',
'Welcome {{first_name}}! Thank you for joining Nijercart. Browse our collection at {{site_url}}',
'automated', 
'["first_name", "site_url"]'),

('Order Confirmation', 'Your Order #{{order_number}} is Confirmed',
'<h1>Order Confirmed!</h1><p>Hi {{customer_name}},</p><p>Your order #{{order_number}} for {{total_amount}} BDT has been confirmed.</p><p>Order Details:</p>{{order_items}}<p>Thank you for shopping with Nijercart!</p>',
'Order Confirmed! Hi {{customer_name}}, Your order #{{order_number}} for {{total_amount}} BDT has been confirmed.',
'transactional',
'["customer_name", "order_number", "total_amount", "order_items"]'),

('Monthly Newsletter', 'Nijercart Monthly - New Books & Offers',
'<h1>This Month at Nijercart</h1><p>Hi {{first_name}},</p><p>Check out our latest arrivals and special offers!</p>{{featured_books}}<p>Happy Reading!</p>',
'This Month at Nijercart. Hi {{first_name}}, Check out our latest arrivals and special offers!',
'marketing',
'["first_name", "featured_books"]');