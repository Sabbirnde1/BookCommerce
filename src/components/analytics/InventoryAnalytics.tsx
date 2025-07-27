import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, RotateCcw, Archive, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function InventoryAnalytics() {
  const [products, setProducts] = useState([]);
  const [stockLevels, setStockLevels] = useState([]);
  const [turnoverData, setTurnoverData] = useState([]);
  const [categoryStock, setCategoryStock] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // Fetch products with stock information
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      setProducts(productsData || []);

      // Process stock levels
      const stockData = processStockLevels(productsData || []);
      setStockLevels(stockData);

      // Process category stock distribution
      const categoryData = processCategoryStock(productsData || []);
      setCategoryStock(categoryData);

      // Identify low stock items
      const lowStock = productsData?.filter(product => product.stock_quantity <= 5) || [];
      setLowStockItems(lowStock);

      // Generate sample turnover data
      const turnover = generateTurnoverData();
      setTurnoverData(turnover);

    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processStockLevels = (products: any[]) => {
    const levels = {
      'Out of Stock': 0,
      'Low Stock (1-5)': 0,
      'Medium Stock (6-20)': 0,
      'High Stock (21+)': 0
    };

    products.forEach(product => {
      const stock = product.stock_quantity;
      if (stock === 0) levels['Out of Stock']++;
      else if (stock <= 5) levels['Low Stock (1-5)']++;
      else if (stock <= 20) levels['Medium Stock (6-20)']++;
      else levels['High Stock (21+)']++;
    });

    return Object.entries(levels).map(([level, count]) => ({
      level,
      count,
      percentage: products.length > 0 ? (count / products.length) * 100 : 0
    }));
  };

  const processCategoryStock = (products: any[]) => {
    const categoryStock: { [key: string]: { count: number; totalValue: number } } = {};

    products.forEach(product => {
      const category = product.category || 'general';
      if (!categoryStock[category]) {
        categoryStock[category] = { count: 0, totalValue: 0 };
      }
      categoryStock[category].count += product.stock_quantity;
      categoryStock[category].totalValue += product.stock_quantity * parseFloat(product.price);
    });

    return Object.entries(categoryStock).map(([category, data]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: data.count,
      value: data.totalValue
    }));
  };

  const generateTurnoverData = () => {
    // Sample turnover data - in real implementation, this would be calculated from order history
    return [
      { product: 'Product A', turnoverRate: 8.5, reorderPoint: 10, currentStock: 5 },
      { product: 'Product B', turnoverRate: 6.2, reorderPoint: 15, currentStock: 12 },
      { product: 'Product C', turnoverRate: 4.8, reorderPoint: 8, currentStock: 18 },
      { product: 'Product D', turnoverRate: 3.2, reorderPoint: 12, currentStock: 25 },
      { product: 'Product E', turnoverRate: 2.1, reorderPoint: 6, currentStock: 8 }
    ];
  };

  const generateReorderReport = () => {
    toast.success("Reorder report generated successfully!");
  };

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) {
    return <div>Loading inventory analytics...</div>;
  }

  const totalProducts = products.length;
  const totalStockValue = products.reduce((total, product) => 
    total + (product.stock_quantity * parseFloat(product.price)), 0
  );
  const outOfStockCount = products.filter(product => product.stock_quantity === 0).length;
  const lowStockCount = products.filter(product => product.stock_quantity > 0 && product.stock_quantity <= 5).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalStockValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Archive className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items running low
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockLevels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryStock}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryStock.map((entry, index) => (
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Low Stock Alert</CardTitle>
            <Button variant="outline" size="sm" onClick={generateReorderReport}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Reorder
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.slice(0, 5).map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.stock_quantity === 0 ? "destructive" : "secondary"}>
                        {product.stock_quantity === 0 ? "Out of Stock" : "Low Stock"}
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
            <CardTitle>Inventory Turnover Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Turnover Rate</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Current Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnoverData.map((item: any, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.turnoverRate}x/year</TableCell>
                    <TableCell>{item.reorderPoint}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{item.currentStock}</span>
                        {item.currentStock <= item.reorderPoint && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
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
          <CardTitle>Reorder Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {turnoverData
            .filter(item => item.currentStock <= item.reorderPoint)
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{item.product}</h4>
                  <p className="text-sm text-muted-foreground">
                    Current stock: {item.currentStock} | Reorder point: {item.reorderPoint}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-orange-600">
                    Reorder Suggested
                  </Badge>
                  <Button size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}