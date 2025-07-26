import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, Mail, MousePointer, Users, Zap } from "lucide-react";

interface CampaignAnalytics {
  id: string;
  name: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  bounce_count: number;
  unsubscribe_count: number;
  sent_at: string;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

interface OverallStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  avg_open_rate: number;
  avg_click_rate: number;
  avg_bounce_rate: number;
}

export function EmailAnalytics() {
  const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Fetch campaign analytics
      const { data: campaigns, error: campaignsError } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("status", "sent")
        .gte("sent_at", startDate.toISOString())
        .lte("sent_at", endDate.toISOString())
        .order("sent_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Calculate rates for each campaign
      const analyticsData: CampaignAnalytics[] = (campaigns || []).map(campaign => {
        const sent = campaign.sent_count || 0;
        const opened = campaign.open_count || 0;
        const clicked = campaign.click_count || 0;
        const bounced = campaign.bounce_count || 0;

        return {
          id: campaign.id,
          name: campaign.name,
          sent_count: sent,
          open_count: opened,
          click_count: clicked,
          bounce_count: bounced,
          unsubscribe_count: campaign.unsubscribe_count || 0,
          sent_at: campaign.sent_at,
          open_rate: sent > 0 ? (opened / sent) * 100 : 0,
          click_rate: sent > 0 ? (clicked / sent) * 100 : 0,
          bounce_rate: sent > 0 ? (bounced / sent) * 100 : 0,
        };
      });

      setCampaignAnalytics(analyticsData);

      // Calculate overall stats
      const totalSent = analyticsData.reduce((sum, campaign) => sum + campaign.sent_count, 0);
      const totalOpened = analyticsData.reduce((sum, campaign) => sum + campaign.open_count, 0);
      const totalClicked = analyticsData.reduce((sum, campaign) => sum + campaign.click_count, 0);
      const totalBounced = analyticsData.reduce((sum, campaign) => sum + campaign.bounce_count, 0);
      const totalUnsubscribed = analyticsData.reduce((sum, campaign) => sum + campaign.unsubscribe_count, 0);

      const overallStatsData: OverallStats = {
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_bounced: totalBounced,
        total_unsubscribed: totalUnsubscribed,
        avg_open_rate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        avg_click_rate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        avg_bounce_rate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
      };

      setOverallStats(overallStatsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRateColor = (rate: number, type: "open" | "click" | "bounce") => {
    if (type === "bounce") {
      return rate > 5 ? "text-destructive" : rate > 2 ? "text-yellow-600" : "text-green-600";
    }
    
    if (type === "open") {
      return rate > 25 ? "text-green-600" : rate > 15 ? "text-yellow-600" : "text-destructive";
    }
    
    if (type === "click") {
      return rate > 5 ? "text-green-600" : rate > 2 ? "text-yellow-600" : "text-destructive";
    }
    
    return "";
  };

  const getTrendIcon = (rate: number, type: "open" | "click" | "bounce") => {
    const isGood = type === "bounce" ? rate < 2 : (type === "open" ? rate > 25 : rate > 5);
    return isGood ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Analytics</h3>
        <div className="flex space-x-2">
          {[
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "90", label: "90 days" },
          ].map(({ value, label }) => (
            <Button
              key={value}
              variant={timeRange === value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.total_sent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last {timeRange} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
              <div className="flex items-center space-x-1">
                {getTrendIcon(overallStats.avg_open_rate, "open")}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRateColor(overallStats.avg_open_rate, "open")}`}>
                {overallStats.avg_open_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {overallStats.total_opened.toLocaleString()} opens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
              <div className="flex items-center space-x-1">
                {getTrendIcon(overallStats.avg_click_rate, "click")}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRateColor(overallStats.avg_click_rate, "click")}`}>
                {overallStats.avg_click_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {overallStats.total_clicked.toLocaleString()} clicks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Bounce Rate</CardTitle>
              <div className="flex items-center space-x-1">
                {getTrendIcon(overallStats.avg_bounce_rate, "bounce")}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRateColor(overallStats.avg_bounce_rate, "bounce")}`}>
                {overallStats.avg_bounce_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {overallStats.total_bounced.toLocaleString()} bounces
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>
            Performance metrics for campaigns sent in the last {timeRange} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignAnalytics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground">
                No campaigns were sent in the selected time period.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaignAnalytics.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Sent on {formatDate(campaign.sent_at)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {campaign.sent_count.toLocaleString()} recipients
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-semibold">{campaign.sent_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opened</p>
                      <p className="font-semibold">{campaign.open_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicked</p>
                      <p className="font-semibold">{campaign.click_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Open Rate</p>
                      <p className={`font-semibold ${getRateColor(campaign.open_rate, "open")}`}>
                        {campaign.open_rate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Click Rate</p>
                      <p className={`font-semibold ${getRateColor(campaign.click_rate, "click")}`}>
                        {campaign.click_rate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bounce Rate</p>
                      <p className={`font-semibold ${getRateColor(campaign.bounce_rate, "bounce")}`}>
                        {campaign.bounce_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div>
                <p className="font-medium">Good open rates are typically 20-25%+</p>
                <p className="text-muted-foreground">Focus on compelling subject lines and sender reputation</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <p className="font-medium">Good click rates are typically 2-5%+</p>
                <p className="text-muted-foreground">Use clear CTAs and relevant, engaging content</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              <div>
                <p className="font-medium">Keep bounce rates under 2%</p>
                <p className="text-muted-foreground">Regularly clean your email list and use double opt-in</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
              <div>
                <p className="font-medium">Test and optimize</p>
                <p className="text-muted-foreground">A/B test subject lines, send times, and content for better performance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}