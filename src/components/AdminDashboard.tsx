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
import { ProductManagement } from "./ProductManagement";
import { AdvancedAnalytics } from "./analytics/AdvancedAnalytics";
import { OrderManagement } from "./admin/OrderManagement";
import { CustomerSupport } from "./admin/CustomerSupport";
import { UserManagement } from "./admin/UserManagement";
import { Checkbox } from "./ui/checkbox";

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

interface HeroImage {
  id?: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  alt_text?: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string;
  image_path?: string;
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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  // Best Authors state
  const [bestAuthors, setBestAuthors] = useState<any[]>([]);
  const [showBestAuthorDialog, setShowBestAuthorDialog] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorDisplayOrder, setAuthorDisplayOrder] = useState("0");
  const [authorIsActive, setAuthorIsActive] = useState(true);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);

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

  // Hero image management state
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [showHeroImageDialog, setShowHeroImageDialog] = useState(false);
  const [editingHeroImage, setEditingHeroImage] = useState<HeroImage | null>(null);
  const [selectedHeroImageFile, setSelectedHeroImageFile] = useState<File | null>(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaLink, setHeroCtaLink] = useState("");
  const [heroAltText, setHeroAltText] = useState("");
  const [heroSortOrder, setHeroSortOrder] = useState("");
  const [heroIsActive, setHeroIsActive] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchDashboardStats();
      // Note: Some functions may not exist yet, need to be implemented
      // fetchBookRequests();
      fetchPromoCodes();
      fetchBestAuthors();
      // fetchProductImages();
      // fetchHeroImages();
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
    setEditingProduct(null);
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

  const openEditDialog = (product: Product) => {
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
    setShowProductDialog(true);
  };

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingProduct) return;

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

      const { data, error } = await supabase.functions.invoke('admin-dashboard/update-product', {
        body: { 
          id: editingProduct.id,
          ...productData 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success! ✅",
          description: "Product updated successfully",
        });
        
        resetProductForm();
        setShowProductDialog(false);
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

  const deleteProduct = async (productId: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/delete-product', {
        body: { id: productId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success! 🗑️",
          description: "Product deleted successfully",
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

  // Best Authors Management Functions
  const fetchBestAuthors = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('best_authors')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBestAuthors(data || []);
    } catch (error) {
      console.error('Error fetching best authors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch best authors",
        variant: "destructive"
      });
    }
  };

  const createBestAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!authorName.trim()) {
      toast({
        title: "Author name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const authorData = {
        author_name: authorName.trim(),
        display_order: parseInt(authorDisplayOrder) || 0,
        is_active: authorIsActive,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('best_authors')
        .insert([authorData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Best author added successfully"
      });

      setAuthorName("");
      setAuthorDisplayOrder("0");
      setAuthorIsActive(true);
      setShowBestAuthorDialog(false);
      fetchBestAuthors();
    } catch (error) {
      console.error('Error creating best author:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add best author",
        variant: "destructive"
      });
    }
  };

  const updateBestAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingAuthor) return;

    try {
      const { error } = await supabase
        .from('best_authors')
        .update({
          author_name: authorName.trim(),
          display_order: parseInt(authorDisplayOrder) || 0,
          is_active: authorIsActive
        })
        .eq('id', editingAuthor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Best author updated successfully"
      });

      resetBestAuthorForm();
      setShowBestAuthorDialog(false);
      fetchBestAuthors();
    } catch (error) {
      console.error('Error updating best author:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update best author",
        variant: "destructive"
      });
    }
  };

  const deleteBestAuthor = async (id: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('best_authors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Best author deleted successfully"
      });

      fetchBestAuthors();
    } catch (error) {
      console.error('Error deleting best author:', error);
      toast({
        title: "Error",
        description: "Failed to delete best author",
        variant: "destructive"
      });
    }
  };

  const toggleBestAuthorStatus = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('best_authors')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Best author ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      fetchBestAuthors();
    } catch (error) {
      console.error('Error updating best author status:', error);
      toast({
        title: "Error",
        description: "Failed to update best author status",
        variant: "destructive"
      });
    }
  };

  const openEditBestAuthorDialog = (author: any) => {
    setEditingAuthor(author);
    setAuthorName(author.author_name);
    setAuthorDisplayOrder(author.display_order.toString());
    setAuthorIsActive(author.is_active);
    setShowBestAuthorDialog(true);
  };

  const resetBestAuthorForm = () => {
    setEditingAuthor(null);
    setAuthorName("");
    setAuthorDisplayOrder("0");
    setAuthorIsActive(true);

  const fetchBookRequests = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
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
        product_id: imageProductId && imageProductId !== "unassigned" ? imageProductId : null,
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

  // Hero Image Management Functions
  const fetchHeroImages = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setHeroImages(data || []);
    } catch (error) {
      console.error('Error fetching hero images:', error);
      toast({
        title: "Error",
        description: "Failed to fetch hero images",
        variant: "destructive"
      });
    }
  };

  const uploadHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !selectedHeroImageFile) return;

    setLoading(true);

    try {
      // Upload image to storage
      const fileExt = selectedHeroImageFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `heroes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, selectedHeroImageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // Save image record
      const heroImageData = {
        title: heroTitle,
        subtitle: heroSubtitle || null,
        cta_text: heroCtaText || null,
        cta_link: heroCtaLink || null,
        alt_text: heroAltText || null,
        sort_order: parseInt(heroSortOrder) || 0,
        is_active: heroIsActive,
        image_path: filePath,
        image_url: urlData.publicUrl,
        created_by: user?.id
      };

      if (editingHeroImage) {
        // Update existing hero image
        const { error: dbError } = await supabase
          .from('hero_images')
          .update(heroImageData)
          .eq('id', editingHeroImage.id);

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: "Hero image updated successfully"
        });
      } else {
        // Create new hero image
        const { error: dbError } = await supabase
          .from('hero_images')
          .insert([heroImageData]);

        if (dbError) throw dbError;

        toast({
          title: "Success",
          description: "Hero image uploaded successfully"
        });
      }

      resetHeroImageForm();
      setShowHeroImageDialog(false);
      fetchHeroImages();
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast({
        title: "Error",
        description: "Failed to upload hero image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteHeroImage = async (id: string, imagePath: string) => {
    if (!isAdmin) return;

    if (!confirm('Are you sure you want to delete this hero image?')) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('products')
        .remove([imagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Hero image deleted successfully"
      });

      fetchHeroImages();
    } catch (error) {
      console.error('Error deleting hero image:', error);
      toast({
        title: "Error",
        description: "Failed to delete hero image",
        variant: "destructive"
      });
    }
  };

  const toggleHeroImageStatus = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('hero_images')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Hero image ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      fetchHeroImages();
    } catch (error) {
      console.error('Error updating hero image status:', error);
      toast({
        title: "Error",
        description: "Failed to update hero image status",
        variant: "destructive"
      });
    }
  };

  const openEditHeroImageDialog = (heroImage: HeroImage) => {
    setEditingHeroImage(heroImage);
    setHeroTitle(heroImage.title);
    setHeroSubtitle(heroImage.subtitle || "");
    setHeroCtaText(heroImage.cta_text || "");
    setHeroCtaLink(heroImage.cta_link || "");
    setHeroAltText(heroImage.alt_text || "");
    setHeroSortOrder(heroImage.sort_order.toString());
    setHeroIsActive(heroImage.is_active);
    setShowHeroImageDialog(true);
  };

  const resetHeroImageForm = () => {
    setEditingHeroImage(null);
    setSelectedHeroImageFile(null);
    setHeroTitle("");
    setHeroSubtitle("");
    setHeroCtaText("");
    setHeroCtaLink("");
    setHeroAltText("");
    setHeroSortOrder("");
    setHeroIsActive(true);
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
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="hero-images">Hero</TabsTrigger>
          <TabsTrigger value="book-requests">Requests</TabsTrigger>
          <TabsTrigger value="promo-codes">Promos</TabsTrigger>
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
          <div className="space-y-6">
            <Tabs defaultValue="all-products" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all-products">All Products</TabsTrigger>
                <TabsTrigger value="best-authors">Best Authors</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
              </TabsList>

              {/* All Products Tab */}
              <TabsContent value="all-products" className="space-y-4">
                <ProductManagement />
              </TabsContent>

              {/* Best Authors Tab */}
              <TabsContent value="best-authors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Best Authors Management
                        </CardTitle>
                        <CardDescription>
                          Manage which authors are featured as "best authors" on your homepage.
                        </CardDescription>
                      </div>
                      <Button onClick={() => {
                        resetBestAuthorForm();
                        setShowBestAuthorDialog(true);
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Best Author
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Author Name</TableHead>
                            <TableHead>Display Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Books Count</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bestAuthors.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No best authors found
                              </TableCell>
                            </TableRow>
                          ) : (
                            bestAuthors.map((author) => (
                              <TableRow key={author.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span className="font-medium">{author.author_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    Order: {author.display_order}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={author.is_active ? 'default' : 'secondary'}
                                  >
                                    {author.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground">
                                    {/* TODO: Show actual book count for this author */}
                                    Loading...
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(author.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditBestAuthorDialog(author)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleBestAuthorStatus(author.id, author.is_active)}
                                    >
                                      {author.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => deleteBestAuthor(author.id)}
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Categories Tab - Placeholder */}
              <TabsContent value="categories">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Management</CardTitle>
                    <CardDescription>Manage product categories (Coming Soon)</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>

              {/* Bulk Actions Tab - Placeholder */}
              <TabsContent value="bulk-actions">
                <Card>
                  <CardHeader>
                    <CardTitle>Bulk Actions</CardTitle>
                    <CardDescription>Perform bulk operations on products (Coming Soon)</CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
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

        {/* Hero Images Management Tab */}
        <TabsContent value="hero-images">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Hero Images Management
                  </CardTitle>
                  <CardDescription>
                    Manage hero slider images for the homepage
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetHeroImageForm();
                  setShowHeroImageDialog(true);
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Hero Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroImages.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No hero images found
                    </div>
                  ) : (
                    heroImages.map((heroImage) => (
                      <Card key={heroImage.id} className="overflow-hidden">
                        <div className="aspect-video relative">
                          <img 
                            src={heroImage.image_url} 
                            alt={heroImage.alt_text || 'Hero image'}
                            className="w-full h-full object-cover"
                          />
                          {!heroImage.is_active && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="secondary">Inactive</Badge>
                            </div>
                          )}
                          <Badge className="absolute top-2 left-2" variant="outline">
                            Order: {heroImage.sort_order}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium truncate">
                              {heroImage.title}
                            </div>
                            {heroImage.subtitle && (
                              <div className="text-xs text-muted-foreground">
                                {heroImage.subtitle}
                              </div>
                            )}
                            {heroImage.cta_text && (
                              <div className="text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {heroImage.cta_text}
                                </Badge>
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(heroImage.image_url, '_blank')}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditHeroImageDialog(heroImage)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleHeroImageStatus(heroImage.id!, heroImage.is_active)}
                                >
                                  {heroImage.is_active ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteHeroImage(heroImage.id!, heroImage.image_path!)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
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

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <CustomerSupport />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the product information' : 'Create a new book listing for your inventory'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={editingProduct ? updateProduct : createProduct} className="space-y-6">
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
                {loading ? (editingProduct ? "Updating..." : "Creating...") : (editingProduct ? "Update Product" : "Create Product")}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                resetProductForm();
                setShowProductDialog(false);
              }}>
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
                  <SelectItem value="unassigned">No product</SelectItem>
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

      {/* Hero Image Dialog */}
      <Dialog open={showHeroImageDialog} onOpenChange={setShowHeroImageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingHeroImage ? 'Edit Hero Image' : 'Add Hero Image'}</DialogTitle>
            <DialogDescription>
              {editingHeroImage ? 'Update the hero image details' : 'Upload a new hero image for the homepage slider'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={uploadHeroImage} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Title *</Label>
                <Input
                  id="hero-title"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Enter hero image title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Input
                  id="hero-subtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Enter subtitle (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero-cta-text">CTA Text</Label>
                <Input
                  id="hero-cta-text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  placeholder="e.g., Shop Now"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-cta-link">CTA Link</Label>
                <Input
                  id="hero-cta-link"
                  value={heroCtaLink}
                  onChange={(e) => setHeroCtaLink(e.target.value)}
                  placeholder="e.g., /books"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hero-sort-order">Sort Order</Label>
                <Input
                  id="hero-sort-order"
                  type="number"
                  value={heroSortOrder}
                  onChange={(e) => setHeroSortOrder(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hero-alt-text">Alt Text</Label>
                <Input
                  id="hero-alt-text"
                  value={heroAltText}
                  onChange={(e) => setHeroAltText(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-image">Image *</Label>
              <Input
                id="hero-image"
                type="file"
                onChange={(e) => setSelectedHeroImageFile(e.target.files?.[0] || null)}
                accept="image/*"
                required={!editingHeroImage}
              />
              <p className="text-sm text-muted-foreground">
                Recommended size: 1920x480px (16:4 aspect ratio)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hero-active"
                checked={heroIsActive}
                onCheckedChange={setHeroIsActive}
              />
              <Label htmlFor="hero-active">Active</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowHeroImageDialog(false);
                  resetHeroImageForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || (!editingHeroImage && !selectedHeroImageFile)}>
                {loading ? "Processing..." : editingHeroImage ? "Update" : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Best Author Dialog */}
      <Dialog open={showBestAuthorDialog} onOpenChange={setShowBestAuthorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? 'Edit Best Author' : 'Add Best Author'}
            </DialogTitle>
            <DialogDescription>
              {editingAuthor ? 'Update the best author details' : 'Add a new author to the best authors list'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingAuthor ? updateBestAuthor : createBestAuthor} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="author-name">Author Name *</Label>
              <Input
                id="author-name"
                type="text"
                placeholder="Enter author name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-order">Display Order</Label>
              <Input
                id="display-order"
                type="number"
                placeholder="0"
                value={authorDisplayOrder}
                onChange={(e) => setAuthorDisplayOrder(e.target.value)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the list
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="author-active"
                  checked={authorIsActive}
                  onCheckedChange={(checked) => setAuthorIsActive(checked === true)}
                />
                <Label htmlFor="author-active">Active</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Only active authors will be displayed on the website
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowBestAuthorDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (editingAuthor ? "Update" : "Add")} Author
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default AdminDashboard;
