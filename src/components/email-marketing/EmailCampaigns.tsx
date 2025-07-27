import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Send, 
  Calendar, 
  Users, 
  TrendingUp,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  campaign_type: string;
  status: string;
  recipient_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  scheduled_at: string;
  sent_at: string;
  sender_name: string;
  sender_email: string;
}

interface EmailCampaignsProps {
  onStatsUpdate: () => void;
}

export function EmailCampaigns({ onStatsUpdate }: EmailCampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    campaign_type: "newsletter",
    template_id: "",
    html_content: "",
    sender_name: "Nijercart",
    sender_email: "noreply@nijercart.com",
  });

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, name, subject, html_content")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      if (!formData.name || !formData.subject) {
        toast.error("Name and subject are required");
        return;
      }

      const { error } = await supabase
        .from("email_campaigns")
        .insert({
          name: formData.name,
          subject: formData.subject,
          campaign_type: formData.campaign_type,
          template_id: formData.template_id || null,
          html_content: formData.html_content,
          sender_name: formData.sender_name,
          sender_email: formData.sender_email,
          status: "draft",
        });

      if (error) throw error;

      toast.success("Campaign created successfully");
      setShowCreateDialog(false);
      setFormData({
        name: "",
        subject: "",
        campaign_type: "newsletter",
        template_id: "",
        html_content: "",
        sender_name: "Nijercart",
        sender_email: "noreply@nijercart.com",
      });
      fetchCampaigns();
      onStatsUpdate();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      setSending(campaignId);
      
      const { data, error } = await supabase.functions.invoke('send-email-campaign', {
        body: { campaignId }
      });

      if (error) throw error;

      toast.success(`Campaign sent successfully! ${data.sent_count} emails sent.`);
      fetchCampaigns();
      onStatsUpdate();
    } catch (error) {
      console.error("Error sending campaign:", error);
      toast.error("Failed to send campaign");
    } finally {
      setSending(null);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject,
        html_content: template.html_content,
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, text: "Draft" },
      scheduled: { variant: "outline" as const, text: "Scheduled" },
      sending: { variant: "default" as const, text: "Sending" },
      sent: { variant: "default" as const, text: "Sent" },
      paused: { variant: "secondary" as const, text: "Paused" },
      cancelled: { variant: "destructive" as const, text: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOpenRate = (campaign: Campaign) => {
    if (!campaign.sent_count) return "—";
    return `${((campaign.open_count / campaign.sent_count) * 100).toFixed(1)}%`;
  };

  const getClickRate = (campaign: Campaign) => {
    if (!campaign.sent_count) return "—";
    return `${((campaign.click_count / campaign.sent_count) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Email Campaigns</h3>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Campaigns</h3>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Email Campaign</DialogTitle>
              <DialogDescription>
                Create a new email campaign to send to your subscribers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Monthly Newsletter - January 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={formData.campaign_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, campaign_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="template">Email Template (Optional)</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Your monthly book recommendations"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sender_name">Sender Name</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sender_email">Sender Email</Label>
                  <Input
                    id="sender_email"
                    value={formData.sender_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, sender_email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Email Content (HTML)</Label>
                <Textarea
                  id="content"
                  value={formData.html_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                  placeholder="<h1>Welcome to our newsletter!</h1><p>This month's featured books...</p>"
                  rows={8}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign}>
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first email campaign to start engaging with your customers.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription>{campaign.subject}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    {campaign.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handleSendCampaign(campaign.id)}
                        disabled={sending === campaign.id}
                      >
                        {sending === campaign.id ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-3 w-3" />
                            Send Now
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Recipients</p>
                    <p className="font-semibold flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      {campaign.recipient_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sent</p>
                    <p className="font-semibold flex items-center">
                      <Send className="mr-1 h-3 w-3" />
                      {campaign.sent_count || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Open Rate</p>
                    <p className="font-semibold flex items-center">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {getOpenRate(campaign)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Click Rate</p>
                    <p className="font-semibold">
                      {getClickRate(campaign)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <p>Created: {formatDate(campaign.created_at)}</p>
                  {campaign.sent_at && <p>Sent: {formatDate(campaign.sent_at)}</p>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}