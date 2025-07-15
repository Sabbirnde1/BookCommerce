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
  Percent
} from "lucide-react"; // Fixed: RefreshCw instead of Refresh

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

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showPriceHistoryDialog, setShowPriceHistoryDialog] = useState(false);
  const [showBulkPriceDialog, setShowBulkPriceDialog] = useState(false);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
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
  
  // Bulk price update
  const [bulkPriceType, setBulkPriceType] = useState<"percentage" | "fixed">("percentage");
  const [bulkPriceValue, setBulkPriceValue] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkUpdateReason, setBulkUpdateReason] = useState("");

  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageProduct, setSelectedImageProduct] = useState<Product | null>(null);

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

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchDashboardStats();
      fetchPromoCodes();
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

  const fetchPriceHistory = async (productId: string) => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/get-price-history', {
        body: { product_id: productId }
      });

      if (error) throw error;

      if (data.success) {
        setPriceHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch price history",
        variant: "destructive"
      });
    }
  };

  const bulkUpdatePrices = async () => {
    if (!selectedProductIds.length || !bulkPriceValue) {
      toast({
        title: "Error",
        description: "Please select products and enter a price value",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const updates = selectedProductIds.map(productId => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;

        let newPrice: number;
        if (bulkPriceType === "percentage") {
          const percentage = parseFloat(bulkPriceValue);
          newPrice = product.price * (1 + percentage / 100);
        } else {
          newPrice = parseFloat(bulkPriceValue);
        }

        return {
          product_id: productId,
          new_price: Math.round(newPrice * 100) / 100, // Round to 2 decimal places
          reason: bulkUpdateReason || `Bulk ${bulkPriceType} update: ${bulkPriceValue}${bulkPriceType === 'percentage' ? '%' : '৳'}`
        };
      }).filter(Boolean);

      const results = await Promise.all(
        updates.map(update => 
          supabase.functions.invoke('admin-dashboard/update-price', { body: update })
        )
      );

      const successful = results.filter(r => r.data?.success).length;
      const failed = results.length - successful;

      toast({
        title: `Bulk Price Update Complete! 💰`,
        description: `${successful} products updated successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      });

      setBulkPriceValue("");
      setBulkUpdateReason("");
      setSelectedProductIds([]);
      setShowBulkPriceDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: "Error",
        description: "Failed to update prices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadProductImage = async (productId: string, files?: File[]) => {
    const filesToUpload = files || (selectedFile ? [selectedFile] : []);
    if (!filesToUpload.length || !isAdmin) return;

    setUploadingImage(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('product_id', productId);
        formData.append('alt_text', '');
        formData.append('is_primary', 'false');

        return supabase.functions.invoke('admin-dashboard/upload-image', {
          body: formData
        });
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.data?.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast({
          title: `Images Uploaded! 📸`,
          description: `${successful} image${successful > 1 ? 's' : ''} uploaded successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        });
        
        setSelectedFile(null);
        setSelectedFiles([]);
        setImagePreview(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteProductImage = async (imageId: string, productId: string) => {
    if (!isAdmin) return;

    const confirmed = confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/delete-image', {
        body: { image_id: imageId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Image Deleted! 🗑️",
          description: data.message,
        });
        
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  const setImageAsPrimary = async (imageId: string, productId: string) => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/update-image-order', {
        body: { 
          product_id: productId,
          image_id: imageId,
          is_primary: true
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Primary Image Set! ⭐",
          description: "Image set as primary successfully",
        });
        
        fetchProducts();
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast({
        title: "Error",
        description: "Failed to set primary image",
        variant: "destructive"
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setSelectedFiles(files);
      
      if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      
      if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const uploadProductImage_old = async (productId: string) => {
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
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex items-center space-x-3">
            <img 
              src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
              alt="Nijercart Logo" 
              className="h-10 w-auto drop-shadow-md"
            />
            <div className="text-xl font-bold text-foreground">Nijercart</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage products, pricing, and inventory</p>
            </div>
          </div>
        </div>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
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

                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowBulkPriceDialog(true)}
                      disabled={selectedProductIds.length === 0}
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Bulk Update ({selectedProductIds.length})
                    </Button>
                    {selectedProductIds.length > 0 && (
                      <Button
                        onClick={() => setSelectedProductIds([])}
                        variant="ghost"
                        size="sm"
                      >
                        Clear Selection
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.length === products.length && products.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(products.map(p => p.id));
                              } else {
                                setSelectedProductIds([]);
                              }
                            }}
                            className="rounded"
                          />
                        </TableHead>
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
                              <input
                                type="checkbox"
                                checked={selectedProductIds.includes(product.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds([...selectedProductIds, product.id]);
                                  } else {
                                    setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                  }
                                }}
                                className="rounded"
                              />
                            </TableCell>
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
                              <div className="flex gap-1">
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
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    fetchPriceHistory(product.id);
                                    setShowPriceHistoryDialog(true);
                                  }}
                                  title="View Price History"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </div>
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
              <CardDescription>Upload and manage product images with drag & drop support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Enhanced Upload Area */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto max-w-48 max-h-32 object-cover rounded-lg border"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Total size: {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Upload Product Images</h3>
                        <p className="text-muted-foreground mb-4">
                          Drag & drop images here or click to select multiple files
                        </p>
                      </>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <div className="flex gap-3 justify-center">
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button variant="outline" size="lg" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Images
                          </span>
                        </Button>
                      </Label>
                      {selectedFiles.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedFiles([]);
                            setImagePreview(null);
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Select onValueChange={(productId) => uploadProductImage(productId, selectedFiles)}>
                          <SelectTrigger className="w-64 mx-auto">
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
                        <p className="text-xs text-muted-foreground">
                          Select a product to upload {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Images</p>
                        <p className="text-2xl font-bold">
                          {products.reduce((total, p) => total + (p.product_images?.length || 0), 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Products with Images</p>
                        <p className="text-2xl font-bold">
                          {products.filter(p => p.product_images && p.product_images.length > 0).length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">No Images</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {products.filter(p => !p.product_images || p.product_images.length === 0).length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Avg Images/Product</p>
                        <p className="text-2xl font-bold">
                          {products.length > 0 
                            ? (products.reduce((total, p) => total + (p.product_images?.length || 0), 0) / products.length).toFixed(1)
                            : '0'
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Product Images Gallery */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Product Images Gallery</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchProducts}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-sm line-clamp-2">{product.title}</CardTitle>
                              <p className="text-xs text-muted-foreground">by {product.author}</p>
                            </div>
                            <Badge variant={product.product_images?.length ? "default" : "secondary"}>
                              {product.product_images?.length || 0} images
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {product.product_images && product.product_images.length > 0 ? (
                            <div className="space-y-2">
                              {product.product_images.slice(0, 3).map((image: any, index: number) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded group hover:bg-muted/70 transition-colors">
                                  <div className="relative w-12 h-12 bg-muted rounded border overflow-hidden">
                                    {image.image_url ? (
                                      <img 
                                        src={image.image_url} 
                                        alt={image.alt_text || `Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    {image.is_primary && (
                                      <div className="absolute top-0 right-0 bg-yellow-500 text-white p-0.5 rounded-bl">
                                        <Star className="h-2 w-2" />
                                      </div>
                                    )}
                                  </div>
                                   <div className="flex-1 min-w-0">
                                     <p className="text-xs font-medium truncate">
                                       {image.alt_text || `Image ${index + 1}`}
                                     </p>
                                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                       <span>{image.is_primary ? 'Primary' : 'Secondary'}</span>
                                       {image.file_size && (
                                         <>
                                           <span>•</span>
                                           <span>{formatFileSize(image.file_size)}</span>
                                         </>
                                       )}
                                     </div>
                                   </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!image.is_primary && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => setImageAsPrimary(image.id, product.id)}
                                        title="Set as Primary"
                                      >
                                        <Star className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => {
                                        setSelectedImageProduct(product);
                                        setShowImageDialog(true);
                                      }}
                                      title="View All Images"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => deleteProductImage(image.id, product.id)}
                                      title="Delete Image"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              {(product.product_images?.length || 0) > 3 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedImageProduct(product);
                                    setShowImageDialog(true);
                                  }}
                                >
                                  View All {product.product_images?.length} Images
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground mb-3">No images uploaded</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <Upload className="h-3 w-3 mr-2" />
                                Add Images
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {products.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                      <p className="text-muted-foreground">
                        Create products first to manage their images
                      </p>
                    </div>
                  )}
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
                    Create and manage discount codes for your store
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
                {/* Promo Codes List */}
                {promoCodes.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {promoCodes.map((promo) => (
                        <Card key={promo.id} className="border border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                    {promo.code}
                                  </code>
                                  <Badge variant={promo.status === 'active' ? 'default' : 'secondary'}>
                                    {promo.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    {promo.discount_type === 'percentage' ? (
                                      <Percent className="h-3 w-3" />
                                    ) : (
                                      <span>৳</span>
                                    )}
                                    <span>
                                      {promo.discount_type === 'percentage' 
                                        ? `${promo.discount_value}% off` 
                                        : `৳${promo.discount_value} off`
                                      }
                                    </span>
                                  </div>
                                  {promo.usage_limit && (
                                    <span>Limit: {promo.usage_limit}</span>
                                  )}
                                  <span>Used: {promo.used_count}</span>
                                  {promo.valid_until && (
                                    <span>
                                      Expires: {new Date(promo.valid_until).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={promo.status === 'active' ? 'outline' : 'default'}
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
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Tag className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No promo codes yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first promo code to offer discounts to customers
                    </p>
                    <Button onClick={() => setShowPromoDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Promo Code
                    </Button>
                  </div>
                )}
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

      {/* Price History Dialog */}
      <Dialog open={showPriceHistoryDialog} onOpenChange={setShowPriceHistoryDialog}>
        <DialogContent className="bg-background border border-border z-50 max-w-4xl">
          <DialogHeader>
            <DialogTitle>Price History - {selectedProduct?.title}</DialogTitle>
            <DialogDescription>
              Track all price changes for this product
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Old Price</TableHead>
                    <TableHead>New Price</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Changed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceHistory.map((entry, index) => {
                    const change = entry.new_price - entry.old_price;
                    const changePercent = ((change / entry.old_price) * 100).toFixed(1);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>৳{entry.old_price}</TableCell>
                        <TableCell>৳{entry.new_price}</TableCell>
                        <TableCell>
                          <span className={change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'}>
                            {change > 0 ? '+' : ''}৳{change.toFixed(2)} ({changePercent}%)
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.reason || 'No reason provided'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Admin
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {priceHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No price history available for this product
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Price Update Dialog */}
      <Dialog open={showBulkPriceDialog} onOpenChange={setShowBulkPriceDialog}>
        <DialogContent className="bg-background border border-border z-50">
          <DialogHeader>
            <DialogTitle>Bulk Price Update</DialogTitle>
            <DialogDescription>
              Update prices for {selectedProductIds.length} selected products
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Update Type</Label>
              <Select value={bulkPriceType} onValueChange={(value: "percentage" | "fixed") => setBulkPriceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Change</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-price-value">
                {bulkPriceType === "percentage" ? "Percentage Change (%)" : "New Price (৳)"}
              </Label>
              <Input
                id="bulk-price-value"
                type="number"
                value={bulkPriceValue}
                onChange={(e) => setBulkPriceValue(e.target.value)}
                placeholder={bulkPriceType === "percentage" ? "e.g., 10 for +10% or -5 for -5%" : "e.g., 500"}
                required
              />
              {bulkPriceType === "percentage" && (
                <p className="text-sm text-muted-foreground">
                  Positive values increase prices, negative values decrease them
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bulk-reason">Reason (Optional)</Label>
              <Textarea
                id="bulk-reason"
                value={bulkUpdateReason}
                onChange={(e) => setBulkUpdateReason(e.target.value)}
                placeholder="Reason for bulk price update..."
                rows={3}
              />
            </div>

            {/* Preview */}
            {bulkPriceValue && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">Preview Changes:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedProductIds.slice(0, 5).map(productId => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    
                    let newPrice: number;
                    if (bulkPriceType === "percentage") {
                      const percentage = parseFloat(bulkPriceValue);
                      newPrice = product.price * (1 + percentage / 100);
                    } else {
                      newPrice = parseFloat(bulkPriceValue);
                    }
                    
                    return (
                      <div key={productId} className="text-sm flex justify-between">
                        <span className="truncate">{product.title}</span>
                        <span>৳{product.price} → ৳{Math.round(newPrice * 100) / 100}</span>
                      </div>
                    );
                  })}
                  {selectedProductIds.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      ... and {selectedProductIds.length - 5} more products
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button onClick={bulkUpdatePrices} disabled={loading || !bulkPriceValue} className="flex-1">
                {loading ? "Updating..." : `Update ${selectedProductIds.length} Products`}
              </Button>
              <Button variant="outline" onClick={() => setShowBulkPriceDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="bg-background border border-border z-50 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Gallery - {selectedImageProduct?.title}</DialogTitle>
            <DialogDescription>
              Manage all images for this product
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedImageProduct?.product_images && selectedImageProduct.product_images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedImageProduct.product_images.map((image: any, index: number) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg border overflow-hidden bg-muted">
                      {image.image_url ? (
                        <img 
                          src={image.image_url} 
                          alt={image.alt_text || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Primary badge */}
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Primary
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          {!image.is_primary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setImageAsPrimary(image.id, selectedImageProduct.id)}
                              title="Set as Primary"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(image.image_url, '_blank')}
                            title="View Full Size"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProductImage(image.id, selectedImageProduct.id)}
                            title="Delete Image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                     <div className="mt-2">
                       <p className="text-sm font-medium truncate">
                         {image.alt_text || `Image ${index + 1}`}
                       </p>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <span>Sort order: {image.sort_order || index + 1}</span>
                         {image.file_size && (
                           <>
                             <span>•</span>
                             <span>{formatFileSize(image.file_size)}</span>
                           </>
                         )}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Images</h3>
                <p className="text-muted-foreground mb-4">
                  This product doesn't have any images yet
                </p>
                <Button onClick={() => setShowImageDialog(false)}>
                  Upload Images
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent className="bg-background border border-border z-50 max-w-md">
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>
              Create a new discount code for your customers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createPromoCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Promo Code *</Label>
              <Input
                id="promo-code"
                type="text"
                placeholder="SAVE20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type *</Label>
                <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-value">
                  Discount Value * {discountType === 'percentage' ? '(%)' : '(৳)'}
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

      {/* Support Footer Section */}
      <div className="mt-12 pt-8 border-t border-border">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Support & Help
            </CardTitle>
            <CardDescription>
              Need assistance with the admin dashboard? Find resources and get help here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Documentation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Documentation</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Learn how to manage products, pricing, and inventory effectively.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Docs
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Quick Actions</h4>
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={fetchProducts}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setShowProductDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Contact Support */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Need Help?</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contact our support team for technical assistance or feature requests.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* System Status */}
            <Separator className="my-6" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                System Status: All services operational
              </div>
              <div className="text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}