import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Eye, MousePointer, ShoppingCart, DollarSign, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MarketingAnalyticsProps {
  dateRange: { from: Date; to: Date };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function MarketingAnalytics({ dateRange }: MarketingAnalyticsProps) {
  const [campaignData, setCampaignData] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);
  const [channelPerformance, setChannelPerformance] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketingData();
  }, [dateRange]);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      // Fetch email campaign data
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      setEmailCampaigns(campaigns || []);

      // Process campaign performance
      const campaignPerformance = processCampaignData(campaigns || []);
      setCampaignData(campaignPerformance);

      // Generate sample ROI data
      const roi = generateROIData();
      setRoiData(roi);

      // Generate conversion funnel data
      const funnel = generateConversionFunnel();
      setConversionFunnel(funnel);

      // Generate channel performance data
      const channels = generateChannelPerformance();
      setChannelPerformance(channels);

    } catch (error) {
      console.error('Error fetching marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCampaignData = (campaigns: any[]) => {
    return campaigns.map(campaign => ({
      name: campaign.name,
      sent: campaign.sent_count || 0,
      opened: campaign.open_count || 0,
      clicked: campaign.click_count || 0,
      conversions: Math.floor((campaign.click_count || 0) * 0.15), // Sample conversion rate
      roi: ((Math.floor((campaign.click_count || 0) * 0.15) * 500) / 1000) * 100 // Sample ROI calculation
    }));
  };

  const generateROIData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      emailMarketing: 150 + Math.random() * 100,
      socialMedia: 120 + Math.random() * 80,
      paidAds: 200 + Math.random() * 150,
      organic: 80 + Math.random() * 50
    }));
  };

  const generateConversionFunnel = () => {
    return [
      { stage: 'Visitors', value: 10000, percentage: 100 },
      { stage: 'Product Views', value: 6500, percentage: 65 },
      { stage: 'Add to Cart', value: 2600, percentage: 26 },
      { stage: 'Checkout Started', value: 1300, percentage: 13 },
      { stage: 'Purchase', value: 650, percentage: 6.5 }
    ];
  };

  const generateChannelPerformance = () => {
    return [
      { channel: 'Email Marketing', visitors: 2400, conversions: 180, cost: 1200, roi: 250 },
      { channel: 'Social Media', visitors: 3200, conversions: 220, cost: 1800, roi: 190 },
      { channel: 'Paid Ads', visitors: 1800, conversions: 160, cost: 2200, roi: 145 },
      { channel: 'Organic Search', visitors: 5600, conversions: 420, cost: 800, roi: 680 },
      { channel: 'Direct Traffic', visitors: 2800, conversions: 240, cost: 0, roi: 0 }
    ];
  };

  const chartConfig = {
    visitors: {
      label: "Visitors",
      color: "hsl(var(--chart-1))",
    },
    conversions: {
      label: "Conversions",
      color: "hsl(var(--chart-2))",
    },
    roi: {
      label: "ROI %",
      color: "hsl(var(--chart-3))",
    },
  };

  if (loading) {
    return <div>Loading marketing analytics...</div>;
  }

  const totalCampaigns = emailCampaigns.length;
  const totalSent = emailCampaigns.reduce((sum, campaign) => sum + (campaign.sent_count || 0), 0);
  const totalOpened = emailCampaigns.reduce((sum, campaign) => sum + (campaign.open_count || 0), 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Active marketing campaigns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.2%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">285%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ROI by Marketing Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="emailMarketing" fill={COLORS[0]} name="Email Marketing" />
                  <Bar dataKey="socialMedia" fill={COLORS[1]} name="Social Media" />
                  <Bar dataKey="paidAds" fill={COLORS[2]} name="Paid Ads" />
                  <Bar dataKey="organic" fill={COLORS[3]} name="Organic" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.value.toLocaleString()} ({stage.percentage}%)
                    </span>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                  {index < conversionFunnel.length - 1 && (
                    <p className="text-xs text-muted-foreground">
                      Drop-off: {((conversionFunnel[index].value - conversionFunnel[index + 1].value) / conversionFunnel[index].value * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Visitors</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelPerformance.map((channel: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{channel.channel}</TableCell>
                    <TableCell>{channel.visitors.toLocaleString()}</TableCell>
                    <TableCell>{channel.conversions}</TableCell>
                    <TableCell>
                      <Badge variant={channel.roi > 200 ? "default" : "secondary"}>
                        {channel.roi}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Clicked</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignData.slice(0, 5).map((campaign: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.sent}</TableCell>
                    <TableCell>{campaign.opened}</TableCell>
                    <TableCell>{campaign.clicked}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.roi > 150 ? "default" : "secondary"}>
                        {campaign.roi.toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200">Top Performing Channel</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Organic Search is driving the highest ROI at 680%. Consider increasing SEO investment.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-800 dark:text-orange-200">Conversion Bottleneck</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                60% drop-off from product views to cart. Optimize product pages and add trust signals.
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Email Marketing</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Open rates are above industry average. Test A/B subject lines to improve further.
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-800 dark:text-purple-200">Paid Advertising</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Paid ads ROI is lower than other channels. Review targeting and ad creative.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}