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
  ExternalLink
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Product form state
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

  // Price update form
  const [newPrice, setNewPrice] = useState("");
  const [priceReason, setPriceReason] = useState("");

  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // View mode
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  // Edit product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchDashboardStats();
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

  const updateProductPrice = async () => {
    if (!selectedProduct || !newPrice) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/update-price', {
        body: {
          product_id: selectedProduct.id,
          new_price: parseFloat(newPrice),
          reason: priceReason
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Price Updated! 💰",
          description: data.message,
        });
        
        setNewPrice("");
        setPriceReason("");
        setShowPriceDialog(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast({
        title: "Error",
        description: "Failed to update price",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProductImage = async (productId: string) => {
    if (!selectedFile || !isAdmin) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('product_id', productId);
      formData.append('alt_text', '');
      formData.append('is_primary', 'false');

      const { data, error } = await supabase.functions.invoke('admin-dashboard/upload-image', {
        body: formData
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Image Uploaded! 📸",
          description: data.message,
        });
        
        setSelectedFile(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!isAdmin) return;

    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/delete-product', {
        body: { product_id: productId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Product Deleted",
          description: data.message,
        });
        
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
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

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setAuthor(product.author);
    setIsbn(product.isbn || "");
    setDescription(product.description || "");
    setCategory(product.category);
    setCondition(product.condition);
    setPrice(product.price.toString());
    setOriginalPrice(product.original_price?.toString() || "");
    setStockQuantity(product.stock_quantity.toString());
    setFeatured(product.featured);
    setStatus(product.status);
    setShowEditDialog(true);
  };

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingProduct) return;

    setLoading(true);

    try {
      const productData = {
        product_id: editingProduct.id,
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

      const { data, error } = await supabase.functions.invoke('admin-dashboard/update-product', {
        body: productData
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Product Updated! ✅",
          description: data.message,
        });
        
        resetProductForm();
        setShowEditDialog(false);
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const duplicateProduct = async (product: Product) => {
    if (!isAdmin) return;

    setLoading(true);

    try {
      const productData = {
        title: `${product.title} (Copy)`,
        author: product.author,
        isbn: product.isbn,
        description: product.description,
        category: product.category,
        condition: product.condition,
        price: product.price,
        original_price: product.original_price,
        stock_quantity: 0,
        featured: false,
        status: "draft"
      };

      const { data, error } = await supabase.functions.invoke('admin-dashboard/create-product', {
        body: productData
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Product Duplicated! 📋",
          description: "Product copied successfully",
        });
        
        fetchProducts();
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    if (!isAdmin) return;

    const newStatus = product.status === 'active' ? 'inactive' : 'active';

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/update-product', {
        body: {
          product_id: product.id,
          status: newStatus
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Status Updated! 🔄",
          description: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        });
        
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      const matchesStatus = filterStatus === "all" || product.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Product];
      const bValue = b[sortBy as keyof Product];
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600' };
    if (quantity <= 5) return { status: 'Low Stock', color: 'text-yellow-600' };
    return { status: 'In Stock', color: 'text-green-600' };
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
              You don't have permission to access this dashboard. Contact an administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Manage products, pricing, and inventory</p>
      </div>

      {/* Dashboard Stats */}
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
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
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
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">by {product.author}</p>
                        </div>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts & Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.filter(p => p.stock_quantity <= 5).slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.stock_quantity === 0 ? 'Out of stock' : `Only ${product.stock_quantity} left`}
                        </p>
                      </div>
                    </div>
                  ))}
                  {products.filter(p => p.stock_quantity <= 5).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>All products have healthy stock levels</p>
                    </div>
                  )}
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
                  <CardDescription>Add, edit, and manage your product catalog</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}
                    >
                      {viewMode === "cards" ? <Eye className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                      {viewMode === "cards" ? "Table View" : "Card View"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchProducts}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border border-border z-50">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>
                        Create a new product in your catalog
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={createProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="author">Author *</Label>
                          <Input
                            id="author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="isbn">ISBN</Label>
                          <Input
                            id="isbn"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger className="bg-background border border-border z-10">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border z-50">
                              <SelectItem value="fiction">Fiction</SelectItem>
                              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="history">History</SelectItem>
                              <SelectItem value="biography">Biography</SelectItem>
                              <SelectItem value="children">Children</SelectItem>
                              <SelectItem value="textbook">Textbook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="condition">Condition *</Label>
                          <Select value={condition} onValueChange={setCondition} required>
                            <SelectTrigger className="bg-background border border-border z-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border z-50">
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="old">Old</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (৳) *</Label>
                          <Input
                            id="price"
                            type="number"
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
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock Quantity *</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-background border border-border z-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border z-50">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="rounded"
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
              </div>
            </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="fiction">Fiction</SelectItem>
                      <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="biography">Biography</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="stock_quantity">Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Display */}
              {viewMode === "cards" ? (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity);
                    return (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{product.title}</h3>
                            <Badge className={getStatusColor(product.status)}>
                              {product.status}
                            </Badge>
                            {product.featured && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">by {product.author}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium text-green-600">৳{product.price}</span>
                            <span className={stockStatus.color}>
                              {stockStatus.status} ({product.stock_quantity})
                            </span>
                            <span className="capitalize">{product.category}</span>
                            <span className="capitalize">{product.condition}</span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Switch
                            checked={product.status === 'active'}
                            onCheckedChange={() => toggleProductStatus(product)}
                            disabled={loading}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setNewPrice(product.price.toString());
                              setShowPriceDialog(true);
                            }}
                            title="Update Price"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => editProduct(product)}
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateProduct(product)}
                            title="Duplicate Product"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteProduct(product.id)}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const stockStatus = getStockStatus(product.stock_quantity);
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{product.title}</p>
                                  {product.featured && (
                                    <Star className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">by {product.author}</p>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{product.category}</TableCell>
                            <TableCell className="font-medium text-green-600">৳{product.price}</TableCell>
                            <TableCell>
                              <span className={stockStatus.color}>
                                {product.stock_quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(product.status)}>
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => editProduct(product)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setNewPrice(product.price.toString());
                                    setShowPriceDialog(true);
                                  }}
                                >
                                  <DollarSign className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteProduct(product.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterCategory !== "all" || filterStatus !== "all" 
                      ? "Try adjusting your search criteria" 
                      : "Start by adding your first product"}
                  </p>
                  {!searchTerm && filterCategory === "all" && filterStatus === "all" && (
                    <Button onClick={() => setShowProductDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Price</p>
                      <p className="text-2xl font-bold">
                        ৳{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                      <p className="text-2xl font-bold">
                        ৳{Math.round(products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0))}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Category Distribution</p>
                    {Object.entries(
                      products.reduce((acc, product) => {
                        acc[product.category] = (acc[product.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(count / products.length) * 100} className="w-20" />
                          <span className="text-sm text-muted-foreground">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Inventory Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">Well Stocked</p>
                      <p className="text-xl font-bold text-green-800">
                        {products.filter(p => p.stock_quantity > 5).length}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700">Low Stock</p>
                      <p className="text-xl font-bold text-yellow-800">
                        {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length}
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">Out of Stock</p>
                      <p className="text-xl font-bold text-red-800">
                        {products.filter(p => p.stock_quantity === 0).length}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium mb-3">Featured Products</p>
                    <div className="space-y-2">
                      {products.filter(p => p.featured).slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm font-medium">{product.title}</span>
                          <span className="text-sm text-green-600">৳{product.price}</span>
                        </div>
                      ))}
                      {products.filter(p => p.featured).length === 0 && (
                        <p className="text-sm text-muted-foreground">No featured products</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Management
              </CardTitle>
              <CardDescription>Update product prices and view price history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Highest Price</p>
                        <p className="text-2xl font-bold">
                          ৳{products.length > 0 ? Math.max(...products.map(p => p.price)) : 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Lowest Price</p>
                        <p className="text-2xl font-bold">
                          ৳{products.length > 0 ? Math.min(...products.map(p => p.price)) : 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Average Price</p>
                        <p className="text-2xl font-bold">
                          ৳{products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Original Price</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => {
                        const margin = product.original_price 
                          ? ((product.price - product.original_price) / product.original_price * 100).toFixed(1)
                          : 'N/A';
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{product.title}</p>
                                <p className="text-sm text-muted-foreground">by {product.author}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-green-600">৳{product.price}</TableCell>
                            <TableCell>
                              {product.original_price ? `৳${product.original_price}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <span className={margin !== 'N/A' && parseFloat(margin) > 0 ? 'text-green-600' : 'text-red-600'}>
                                {margin !== 'N/A' ? `${margin}%` : 'N/A'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setNewPrice(product.price.toString());
                                  setShowPriceDialog(true);
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Management
              </CardTitle>
              <CardDescription>Upload and manage product images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Product Images</h3>
                    <p className="text-muted-foreground mb-4">
                      Select images to upload for your products
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" size="lg">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Image
                      </Button>
                    </Label>
                    {selectedFile && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex gap-2 mt-3 justify-center">
                          <Select onValueChange={(productId) => uploadProductImage(productId)}>
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select product to upload to" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedFile(null)}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Images Gallery */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Product Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.filter(p => p.product_images && p.product_images.length > 0).map((product) => (
                      <Card key={product.id}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{product.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {product.product_images?.slice(0, 3).map((image: any, index: number) => (
                              <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                                <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">Image {index + 1}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {image.is_primary ? 'Primary' : 'Secondary'}
                                  </p>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            {(product.product_images?.length || 0) > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{(product.product_images?.length || 0) - 3} more images
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {products.filter(p => p.product_images && p.product_images.length > 0).length === 0 && (
                    <div className="text-center py-8">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Images Yet</h3>
                      <p className="text-muted-foreground">
                        Upload images to see them here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background border border-border z-50">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={updateProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-author">Author *</Label>
                <Input
                  id="edit-author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-isbn">ISBN</Label>
                <Input
                  id="edit-isbn"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="bg-background border border-border z-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="biography">Biography</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="textbook">Textbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-condition">Condition *</Label>
                <Select value={condition} onValueChange={setCondition} required>
                  <SelectTrigger className="bg-background border border-border z-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="old">Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (৳) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-original-price">Original Price (৳)</Label>
                <Input
                  id="edit-original-price"
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-background border border-border z-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border z-50">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
              <Label htmlFor="edit-featured">Featured Product</Label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Product"}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setShowEditDialog(false);
                setEditingProduct(null);
                resetProductForm();
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Price Update Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent className="bg-background border border-border z-50">
          <DialogHeader>
            <DialogTitle>Update Product Price</DialogTitle>
            <DialogDescription>
              Update the price for "{selectedProduct?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Price</Label>
              <div className="text-lg font-semibold">৳{selectedProduct?.price}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-price">New Price (৳) *</Label>
              <Input
                id="new-price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price-reason">Reason (Optional)</Label>
              <Textarea
                id="price-reason"
                value={priceReason}
                onChange={(e) => setPriceReason(e.target.value)}
                placeholder="Reason for price change..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={updateProductPrice} disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Price"}
              </Button>
              <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}