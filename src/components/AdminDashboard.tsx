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

  // Product form state
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("new");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("active");

  // Promo codes state
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [promoStatus, setPromoStatus] = useState("active");

  // Book requests state
  const [bookRequests, setBookRequests] = useState<any[]>([]);
  const [showBookRequestDialog, setShowBookRequestDialog] = useState(false);
  const [selectedBookRequest, setSelectedBookRequest] = useState<any>(null);

  // Image management state
  const [productImages, setProductImages] = useState<any[]>([]);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageProductId, setImageProductId] = useState("");
  const [imageAltText, setImageAltText] = useState("");
  const [imageIsPrimary, setImageIsPrimary] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchDashboardStats();
      fetchBookRequests();
      fetchPromoCodes();
      fetchProductImages();
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

  const fetchPromoCodes = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch promo codes",
        variant: "destructive"
      });
    }
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);

    try {
      const productData = {
        title,
        author,
        isbn: isbn || undefined,
        description: description || undefined,
        category,
        condition,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : undefined,
        stock_quantity: parseInt(stockQuantity),
        featured,
        status
      };

      const { data, error } = await supabase.functions.invoke('admin-dashboard/create-product', {
        body: productData
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success! 📦",
          description: data.message,
        });
        
        resetProductForm();
        setShowProductDialog(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setTitle("");
    setAuthor("");
    setIsbn("");
    setDescription("");
    setCategory("");
    setCondition("new");
    setPrice("");
    setOriginalPrice("");
    setStockQuantity("");
    setFeatured(false);
    setStatus("active");
  };

  const createPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);

    try {
      const promoData = {
        code: promoCode.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        valid_from: validFrom || new Date().toISOString(),
        valid_until: validUntil || null,
        status: promoStatus,
        created_by: user?.id
      };

      const { data, error } = await supabase
        .from('promo_codes')
        .insert([promoData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code created successfully"
      });

      // Reset form
      setPromoCode("");
      setDiscountValue("");
      setUsageLimit("");
      setValidFrom("");
      setValidUntil("");
      setShowPromoDialog(false);
      
      fetchPromoCodes();
    } catch (error) {
      console.error('Error creating promo code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePromoCode = async (id: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code deleted successfully"
      });

      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive"
      });
    }
  };

  const togglePromoCodeStatus = async (id: string, currentStatus: string) => {
    if (!isAdmin) return;

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Promo code ${newStatus === 'active' ? 'activated' : 'deactivated'}`
      });

      fetchPromoCodes();
    } catch (error) {
      console.error('Error updating promo code status:', error);
      toast({
        title: "Error",
        description: "Failed to update promo code status",
        variant: "destructive"
      });
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

  // Image Management Functions
  const fetchProductImages = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('product_images')
        .select(`
          *,
          products!inner(title, author)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error('Error fetching product images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product images",
        variant: "destructive"
      });
    }
  };

  const uploadProductImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedImageFile) return;

    setLoading(true);

    try {
      // Upload image to storage
      const fileExt = selectedImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, selectedImageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // Save image record
      const imageData = {
        product_id: imageProductId || null,
        image_path: filePath,
        image_url: urlData.publicUrl,
        alt_text: imageAltText,
        is_primary: imageIsPrimary
      };

      const { error: dbError } = await supabase
        .from('product_images')
        .insert([imageData]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });

      resetImageForm();
      setShowImageDialog(false);
      fetchProductImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProductImage = async (id: string, imagePath: string) => {
    if (!isAdmin) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('products')
        .remove([imagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image deleted successfully"
      });

      fetchProductImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  const resetImageForm = () => {
    setSelectedImageFile(null);
    setImageProductId("");
    setImageAltText("");
    setImageIsPrimary(false);
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="images">Image Management</TabsTrigger>
          <TabsTrigger value="book-requests">Book Requests</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Management
                  </CardTitle>
                  <CardDescription>
                    View and manage your product inventory
                  </CardDescription>
                </div>
                <Button onClick={() => setShowProductDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
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

        {/* Image Management Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Image Management
                  </CardTitle>
                  <CardDescription>
                    Manage product images and upload new ones
                  </CardDescription>
                </div>
                <Button onClick={() => setShowImageDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {productImages.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No images found
                    </div>
                  ) : (
                    productImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img 
                            src={image.image_url} 
                            alt={image.alt_text || 'Product image'}
                            className="w-full h-full object-cover"
                          />
                          {image.is_primary && (
                            <Badge className="absolute top-2 left-2" variant="default">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium truncate">
                              {image.products?.title || 'No product assigned'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {image.alt_text || 'No alt text'}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(image.image_url, '_blank')}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteProductImage(image.id, image.image_path)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
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

        {/* Promo Codes Tab */}
        <TabsContent value="promo-codes">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Promo Code Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage promotional discount codes for your customers.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowPromoDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Promo Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {promoCodes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No promo codes found
                          </TableCell>
                        </TableRow>
                      ) : (
                        promoCodes.map((promo) => (
                          <TableRow key={promo.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                  {promo.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(promo.code);
                                    toast({ title: "Copied to clipboard" });
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {promo.discount_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {promo.discount_type === 'percentage' 
                                ? `${promo.discount_value}%` 
                                : `৳${promo.discount_value}`
                              }
                            </TableCell>
                            <TableCell>
                              {promo.used_count}/{promo.usage_limit || '∞'}
                            </TableCell>
                            <TableCell>
                              {promo.valid_until 
                                ? new Date(promo.valid_until).toLocaleDateString()
                                : 'No expiry'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={promo.status === 'active' ? 'default' : 'secondary'}
                              >
                                {promo.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => togglePromoCodeStatus(promo.id, promo.status)}
                                >
                                  {promo.status === 'active' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deletePromoCode(promo.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new book listing for your inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createProduct} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Book title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  placeholder="Author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN (Optional)</Label>
                <Input
                  id="isbn"
                  placeholder="978-0123456789"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="biography">Biography</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Book description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="original-price">Original Price (৳)</Label>
                <Input
                  id="original-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock-quantity">Stock Quantity *</Label>
                <Input
                  id="stock-quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
              <Label htmlFor="featured">Featured Product</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>
              Create a new promotional discount code for your customers
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createPromoCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Code *</Label>
              <Input
                id="promo-code"
                placeholder="SAVE20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type *</Label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (৳)'} *
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                  placeholder={discountType === 'percentage' ? '20' : '100'}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-limit">Usage Limit (Optional)</Label>
              <Input
                id="usage-limit"
                type="number"
                min="1"
                placeholder="100"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="datetime-local"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid-until">Valid Until (Optional)</Label>
                <Input
                  id="valid-until"
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo-status">Status</Label>
              <Select value={promoStatus} onValueChange={setPromoStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Promo Code"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPromoDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* Image Upload Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Product Image</DialogTitle>
            <DialogDescription>
              Upload a new image for your products
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={uploadProductImage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-file">Image File</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-product">Product (Optional)</Label>
              <Select value={imageProductId} onValueChange={setImageProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={imageAltText}
                onChange={(e) => setImageAltText(e.target.value)}
                placeholder="Describe the image"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="image-primary"
                checked={imageIsPrimary}
                onCheckedChange={setImageIsPrimary}
              />
              <Label htmlFor="image-primary">Set as primary image</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  resetImageForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedImageFile}>
                {loading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;