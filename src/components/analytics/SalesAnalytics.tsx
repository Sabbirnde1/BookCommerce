import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Package, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SalesAnalyticsProps {
  dateRange: { from: Date; to: Date };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function SalesAnalytics({ dateRange }: SalesAnalyticsProps) {
  const [revenueData, setRevenueData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [profitMargins, setProfitMargins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Fetch revenue trends
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'completed');

      // Process revenue data by day
      const dailyRevenue = processRevenueByDay(orders || []);
      setRevenueData(dailyRevenue);

      // Fetch best-selling products
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(status, created_at)
        `)
        .gte('orders.created_at', dateRange.from.toISOString())
        .lte('orders.created_at', dateRange.to.toISOString())
        .eq('orders.status', 'completed');

      const bestSelling = processBestSellers(orderItems || []);
      setBestSellers(bestSelling);

      // Fetch category performance
      const categoryPerformance = processCategoryData(orderItems || []);
      setCategoryData(categoryPerformance);

      // Calculate profit margins
      const margins = calculateProfitMargins(orderItems || []);
      setProfitMargins(margins);

    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRevenueByDay = (orders: any[]) => {
    const dailyRevenue: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      dailyRevenue[date] = (dailyRevenue[date] || 0) + parseFloat(order.total_amount);
    });

    return Object.entries(dailyRevenue).map(([date, revenue]) => ({
      date,
      revenue: revenue.toFixed(2)
    }));
  };

  const processBestSellers = (orderItems: any[]) => {
    const productSales: { [key: string]: any } = {};
    
    orderItems.forEach(item => {
      const key = item.book_id;
      if (!productSales[key]) {
        productSales[key] = {
          id: key,
          title: item.book_title,
          author: item.book_author,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      productSales[key].totalQuantity += item.quantity;
      productSales[key].totalRevenue += parseFloat(item.price) * item.quantity;
    });

    return Object.values(productSales)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
  };

  const processCategoryData = (orderItems: any[]) => {
    // This would need category information from products table
    // For now, return sample data
    return [
      { name: 'Fiction', value: 30, revenue: 15000 },
      { name: 'Non-Fiction', value: 25, revenue: 12000 },
      { name: 'Academic', value: 20, revenue: 18000 },
      { name: 'Children', value: 15, revenue: 8000 },
      { name: 'Others', value: 10, revenue: 5000 }
    ];
  };

  const calculateProfitMargins = (orderItems: any[]) => {
    // This would need cost price information
    // For now, return sample data
    return [
      { product: 'Best Seller 1', revenue: 5000, cost: 3000, margin: 40 },
      { product: 'Best Seller 2', revenue: 4500, cost: 2700, margin: 40 },
      { product: 'Best Seller 3', revenue: 4000, cost: 2800, margin: 30 },
      { product: 'Best Seller 4', revenue: 3500, cost: 2450, margin: 30 },
      { product: 'Best Seller 5', revenue: 3000, cost: 2100, margin: 30 }
    ];
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) {
    return <div>Loading sales analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +20.1% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳367</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35.2%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              -2.1% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Quantity Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellers.slice(0, 5).map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.author}</TableCell>
                    <TableCell>{product.totalQuantity}</TableCell>
                    <TableCell>৳{product.totalRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Margins by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitMargins.map((item: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>৳{item.revenue}</TableCell>
                    <TableCell>৳{item.cost}</TableCell>
                    <TableCell>
                      <Badge variant={item.margin > 35 ? "default" : "secondary"}>
                        {item.margin}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}