import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Package, 
  DollarSign, 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Eye,
  BarChart3,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Star,
  Calendar,
  Activity,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Copy,
  ExternalLink,
  Tag,
  Percent,
  BookText,
  MessageSquare,
  Phone
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  category: string;
  condition: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  images?: any[];
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  product_images?: any[];
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  recentOrders: any[];
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Book requests state
  const [bookRequests, setBookRequests] = useState<any[]>([]);
  const [showBookRequestDialog, setShowBookRequestDialog] = useState(false);
  const [selectedBookRequest, setSelectedBookRequest] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchDashboardStats();
      fetchBookRequests();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.log('User is not an admin');
    }
  };

  const fetchProducts = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/get-products');
      
      if (error) throw error;
      
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    }
  };

  const fetchDashboardStats = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/get-dashboard-stats');
      
      if (error) throw error;
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchBookRequests = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select(`
          *,
          profiles:user_id (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookRequests(data || []);
    } catch (error) {
      console.error('Error fetching book requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch book requests",
        variant: "destructive"
      });
    }
  };

  const updateBookRequestStatus = async (id: string, status: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('book_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book request status updated"
      });

      fetchBookRequests();
    } catch (error) {
      console.error('Error updating book request status:', error);
      toast({
        title: "Error",
        description: "Failed to update book request status",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
            <p className="text-muted-foreground">
              You don't have admin privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex items-center space-x-3">
            <img 
              src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
              alt="Nijercart Logo" 
              className="h-10 w-auto drop-shadow-md"
            />
            <div className="text-xl font-bold text-foreground">Nijercart</div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your books, inventory, and business operations</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentOrders.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="book-requests">Book Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">System running smoothly</span>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Last data sync</span>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Book Requests</span>
                    <span className="font-medium">{bookRequests.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Products</span>
                    <span className="font-medium">{products.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Management
              </CardTitle>
              <CardDescription>
                View and manage your product inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No products found
                          </TableCell>
                        </TableRow>
                      ) : (
                        products.slice(0, 10).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.title}</TableCell>
                            <TableCell>{product.author}</TableCell>
                            <TableCell>৳{product.price}</TableCell>
                            <TableCell>{product.stock_quantity}</TableCell>
                            <TableCell>
                              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Book Requests Tab */}
        <TabsContent value="book-requests">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookText className="h-5 w-5" />
                    Book Requests Management
                  </CardTitle>
                  <CardDescription>
                    View and manage customer book requests. Update status and communicate with customers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Book Details</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No book requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {request.profiles?.display_name || 'Anonymous'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{request.title}</div>
                                <div className="text-sm text-muted-foreground">by {request.author}</div>
                                {request.notes && (
                                  <div className="text-xs text-muted-foreground max-w-xs truncate">
                                    {request.notes}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {request.condition_preference}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {request.budget ? `৳${request.budget}` : 'Not specified'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-xs">
                                {request.mobile && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {request.mobile}
                                  </div>
                                )}
                                {request.whatsapp && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    WhatsApp: {request.whatsapp}
                                  </div>
                                )}
                                {request.telegram && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Telegram: {request.telegram}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  request.status === 'pending' ? 'secondary' :
                                  request.status === 'processing' ? 'default' :
                                  request.status === 'fulfilled' ? 'default' :
                                  request.status === 'cancelled' ? 'destructive' :
                                  'outline'
                                }
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(request.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={request.status}
                                  onValueChange={(value) => updateBookRequestStatus(request.id, value)}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBookRequest(request);
                                    setShowBookRequestDialog(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Reports
              </CardTitle>
              <CardDescription>
                View performance metrics and business insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Book Request Details Dialog */}
      <Dialog open={showBookRequestDialog} onOpenChange={setShowBookRequestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Request Details</DialogTitle>
            <DialogDescription>
              View detailed information about this book request
            </DialogDescription>
          </DialogHeader>

          {selectedBookRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer</Label>
                  <div className="text-sm">
                    {selectedBookRequest.profiles?.display_name || 'Anonymous'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={selectedBookRequest.status}
                    onValueChange={(value) => {
                      updateBookRequestStatus(selectedBookRequest.id, value);
                      setSelectedBookRequest({ ...selectedBookRequest, status: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Book Information</Label>
                  <div className="p-4 bg-muted rounded-md space-y-2">
                    <div><strong>Title:</strong> {selectedBookRequest.title}</div>
                    <div><strong>Author:</strong> {selectedBookRequest.author}</div>
                    <div><strong>Condition Preference:</strong> {selectedBookRequest.condition_preference}</div>
                    {selectedBookRequest.budget && (
                      <div><strong>Budget:</strong> ৳{selectedBookRequest.budget}</div>
                    )}
                  </div>
                </div>

                {selectedBookRequest.notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Additional Notes</Label>
                    <div className="p-4 bg-muted rounded-md">
                      {selectedBookRequest.notes}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contact Information</Label>
                  <div className="p-4 bg-muted rounded-md space-y-2">
                    {selectedBookRequest.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Mobile: {selectedBookRequest.mobile}</span>
                      </div>
                    )}
                    {selectedBookRequest.whatsapp && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp: {selectedBookRequest.whatsapp}</span>
                      </div>
                    )}
                    {selectedBookRequest.telegram && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Telegram: {selectedBookRequest.telegram}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Request Date</Label>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedBookRequest.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setShowBookRequestDialog(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;