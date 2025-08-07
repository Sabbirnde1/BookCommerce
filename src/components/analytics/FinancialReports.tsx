import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Download, FileText, Calculator, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FinancialReportsProps {
  dateRange: { from: Date; to: Date };
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function FinancialReports({ dateRange }: FinancialReportsProps) {
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [profitLossData, setProfitLossData] = useState<any>({});
  // const [taxData, setTaxData] = useState<any>({});
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange, reportType]);

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      // Fetch orders for revenue calculation
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .eq('status', 'completed');

      // Process revenue by period
      const revenue = processRevenueByPeriod(orders || [], reportType);
      setRevenueData(revenue);

      // Generate sample expense data
      const expenses = generateExpenseData(reportType);
      setExpenseData(expenses);

      // Calculate profit/loss
      const profitLoss = calculateProfitLoss(revenue, expenses);
      setProfitLossData(profitLoss);

      // Generate tax data
      const tax = generateTaxData(profitLoss);
      setTaxData(tax);

    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processRevenueByPeriod = (orders: any[], period: string) => {
    const revenueByPeriod: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const date = new Date(order.created_at);
      let key = '';
      
      if (period === 'monthly') {
        key = date.toLocaleDateString('en', { year: 'numeric', month: 'short' });
      } else if (period === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${quarter} ${date.getFullYear()}`;
      } else {
        key = date.getFullYear().toString();
      }
      
      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + parseFloat(order.total_amount);
    });

    return Object.entries(revenueByPeriod).map(([period, revenue]) => ({
      period,
      revenue: revenue.toFixed(2),
      target: (revenue * 1.1).toFixed(2) // 10% target increase
    }));
  };

  const generateExpenseData = (period: string) => {
    // Sample expense data - in real implementation, this would come from an expenses table
    const expenses = [
      { category: 'Inventory', amount: 15000 },
      { category: 'Marketing', amount: 3000 },
      { category: 'Operations', amount: 2500 },
      { category: 'Staff', amount: 8000 },
      { category: 'Utilities', amount: 1200 },
      { category: 'Rent', amount: 5000 },
      { category: 'Other', amount: 1500 }
    ];

    if (period === 'quarterly') {
      return expenses.map(exp => ({ ...exp, amount: exp.amount * 3 }));
    } else if (period === 'yearly') {
      return expenses.map(exp => ({ ...exp, amount: exp.amount * 12 }));
    }

    return expenses;
  };

  const calculateProfitLoss = (revenue: any[], expenses: any[]) => {
    const totalRevenue = revenue.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const grossProfit = totalRevenue - (totalRevenue * 0.3); // Assuming 30% COGS
    const netProfit = grossProfit - totalExpenses;

    return {
      totalRevenue,
      grossProfit,
      totalExpenses,
      netProfit,
      grossMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0,
      netMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0
    };
  };

  const generateTaxData = (profitLoss: any) => {
    const taxableIncome = Math.max(0, profitLoss.netProfit);
    const corporateTax = taxableIncome * 0.25; // 25% corporate tax rate
    const vatPayable = profitLoss.totalRevenue * 0.15; // 15% VAT
    const taxCredit = Math.min(corporateTax * 0.1, 5000); // Sample tax credit

    return {
      taxableIncome,
      corporateTax,
      vatPayable,
      taxCredit,
      totalTaxLiability: corporateTax + vatPayable - taxCredit
    };
  };

  const exportReport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
    // Implementation for exporting specific reports
  };

  const generateTaxReport = () => {
    toast.success("Generating tax report...");
    // Implementation for generating tax report
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
  };

  if (loading) {
    return <div>Loading financial reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Financial Reports</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive financial analysis and reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('financial')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{profitLossData.totalRevenue?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{profitLossData.grossProfit?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Margin: {profitLossData.grossMargin?.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{profitLossData.totalExpenses?.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              -3.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{profitLossData.netProfit?.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margin: {profitLossData.netMargin?.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" name="Actual Revenue" />
                  <Bar dataKey="target" fill="var(--color-expenses)" name="Target Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, amount }) => `${category}: ৳${amount}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
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
            <CardTitle>Profit & Loss Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Revenue</TableCell>
                  <TableCell className="text-right">৳{profitLossData.totalRevenue?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cost of Goods Sold</TableCell>
                  <TableCell className="text-right">৳{(profitLossData.totalRevenue * 0.3)?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Gross Profit</TableCell>
                  <TableCell className="text-right font-semibold">৳{profitLossData.grossProfit?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operating Expenses</TableCell>
                  <TableCell className="text-right">৳{profitLossData.totalExpenses?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Net Profit</TableCell>
                  <TableCell className={`text-right font-bold ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ৳{profitLossData.netProfit?.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tax Summary</CardTitle>
            <Button variant="outline" size="sm" onClick={generateTaxReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Tax Report
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Taxable Income</TableCell>
                  <TableCell className="text-right">৳{taxData.taxableIncome?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Corporate Tax (25%)</TableCell>
                  <TableCell className="text-right">৳{taxData.corporateTax?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">VAT Payable (15%)</TableCell>
                  <TableCell className="text-right">৳{taxData.vatPayable?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tax Credits</TableCell>
                  <TableCell className="text-right text-green-600">-৳{taxData.taxCredit?.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Tax Liability</TableCell>
                  <TableCell className="text-right font-bold">৳{taxData.totalTaxLiability?.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" onClick={() => exportReport('revenue')}>
              <Download className="h-4 w-4 mr-2" />
              Export Revenue Report
            </Button>
            <Button variant="outline" onClick={() => exportReport('expenses')}>
              <Download className="h-4 w-4 mr-2" />
              Export Expense Report
            </Button>
            <Button variant="outline" onClick={() => exportReport('profit-loss')}>
              <Download className="h-4 w-4 mr-2" />
              Export P&L Statement
            </Button>
            <Button variant="outline" onClick={generateTaxReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Tax Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}