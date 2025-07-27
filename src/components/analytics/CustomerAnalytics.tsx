import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, TrendingUp, TrendingDown, Heart, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CustomerAnalyticsProps {
  dateRange: { from: Date; to: Date };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function CustomerAnalytics({ dateRange }: CustomerAnalyticsProps) {
  const [customerData, setCustomerData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [acquisitionData, setAcquisitionData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [segmentData, setSegmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [dateRange]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Fetch customer orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      // Process customer lifetime value
      const customerLTV = processCustomerLTV(orders || []);
      setTopCustomers(customerLTV);

      // Process acquisition data
      const acquisition = processAcquisitionData(orders || []);
      setAcquisitionData(acquisition);

      // Process retention data
      const retention = processRetentionData(orders || []);
      setRetentionData(retention);

      // Process customer segments
      const segments = processCustomerSegments(orders || []);
      setSegmentData(segments);

    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processCustomerLTV = (orders: any[]) => {
    const customerData: { [key: string]: any } = {};
    
    orders.forEach(order => {
      const customerId = order.user_id;
      if (!customerData[customerId]) {
        customerData[customerId] = {
          id: customerId,
          totalOrders: 0,
          totalSpent: 0,
          firstOrder: order.created_at,
          lastOrder: order.created_at
        };
      }
      customerData[customerId].totalOrders += 1;
      customerData[customerId].totalSpent += parseFloat(order.total_amount);
      if (new Date(order.created_at) > new Date(customerData[customerId].lastOrder)) {
        customerData[customerId].lastOrder = order.created_at;
      }
    });

    return Object.values(customerData)
      .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
  };

  const processAcquisitionData = (orders: any[]) => {
    const monthlyAcquisition: { [key: string]: number } = {};
    const existingCustomers = new Set();
    
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('en', { year: 'numeric', month: 'short' });
      const customerId = order.user_id;
      
      if (!existingCustomers.has(customerId)) {
        monthlyAcquisition[month] = (monthlyAcquisition[month] || 0) + 1;
        existingCustomers.add(customerId);
      }
    });

    return Object.entries(monthlyAcquisition).map(([month, newCustomers]) => ({
      month,
      newCustomers,
      acquisitionCost: 150 + Math.random() * 100 // Sample acquisition cost
    }));
  };

  const processRetentionData = (orders: any[]) => {
    // Sample retention data - would need more complex logic for real calculation
    return [
      { period: 'Month 1', rate: 85 },
      { period: 'Month 2', rate: 72 },
      { period: 'Month 3', rate: 65 },
      { period: 'Month 4', rate: 58 },
      { period: 'Month 5', rate: 52 },
      { period: 'Month 6', rate: 48 }
    ];
  };

  const processCustomerSegments = (orders: any[]) => {
    // Sample customer segments
    return [
      { name: 'High Value', count: 120, percentage: 15, avgSpending: 2500 },
      { name: 'Regular', count: 450, percentage: 55, avgSpending: 800 },
      { name: 'Occasional', count: 180, percentage: 22, avgSpending: 300 },
      { name: 'New', count: 65, percentage: 8, avgSpending: 150 }
    ];
  };

  const chartConfig = {
    customers: {
      label: "Customers",
      color: "hsl(var(--chart-1))",
    },
    retention: {
      label: "Retention Rate",
      color: "hsl(var(--chart-2))",
    },
  };

  if (loading) {
    return <div>Loading customer analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +180 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Customer LTV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳1,250</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +15.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acquisition Cost</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳185</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              -8.4% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +3.2% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={acquisitionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="newCustomers" fill="var(--color-customers)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="rate" stroke="var(--color-retention)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers by LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.slice(0, 5).map((customer: any, index) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>৳{customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={customer.totalSpent > 1000 ? "default" : "secondary"}>
                        {customer.totalSpent > 1000 ? "VIP" : "Regular"}
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
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {segmentData.map((segment: any, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{segment.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {segment.count} customers ({segment.percentage}%)
                  </span>
                </div>
                <Progress value={segment.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Avg. spending: ৳{segment.avgSpending}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}