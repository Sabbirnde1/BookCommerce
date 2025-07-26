import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Plus,
  Calendar,
  Target,
  BarChart3,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { EmailCampaigns } from "./email-marketing/EmailCampaigns";
import { EmailTemplates } from "./email-marketing/EmailTemplates";
import { EmailSubscribers } from "./email-marketing/EmailSubscribers";
import { EmailAnalytics } from "./email-marketing/EmailAnalytics";
import { EmailSequences } from "./email-marketing/EmailSequences";

interface EmailStats {
  total_campaigns: number;
  total_subscribers: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  avg_open_rate: number;
  avg_click_rate: number;
}

export function EmailMarketing() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch campaigns count
      const { count: campaignsCount } = await supabase
        .from("email_campaigns")
        .select("*", { count: "exact", head: true });

      // Fetch subscribers count
      const { count: subscribersCount } = await supabase
        .from("email_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "subscribed");

      // Fetch campaign stats
      const { data: campaigns } = await supabase
        .from("email_campaigns")
        .select("sent_count, open_count, click_count")
        .eq("status", "sent");

      let totalSent = 0;
      let totalOpened = 0;
      let totalClicked = 0;

      campaigns?.forEach((campaign) => {
        totalSent += campaign.sent_count || 0;
        totalOpened += campaign.open_count || 0;
        totalClicked += campaign.click_count || 0;
      });

      const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

      setStats({
        total_campaigns: campaignsCount || 0,
        total_subscribers: subscribersCount || 0,
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        avg_open_rate: avgOpenRate,
        avg_click_rate: avgClickRate,
      });
    } catch (error) {
      console.error("Error fetching email stats:", error);
      toast.error("Failed to load email marketing stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Email Marketing</h2>
            <p className="text-muted-foreground">Manage campaigns, subscribers, and analytics</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Email Marketing</h2>
          <p className="text-muted-foreground">Manage campaigns, subscribers, and analytics</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_campaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_subscribers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_opened} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_open_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.avg_click_rate.toFixed(1)}% click rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sequences
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <EmailCampaigns onStatsUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="subscribers">
          <EmailSubscribers onStatsUpdate={fetchStats} />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="sequences">
          <EmailSequences />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}