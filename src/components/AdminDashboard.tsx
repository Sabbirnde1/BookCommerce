import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Package, CheckCircle, XCircle, Star, Plus, Edit, Trash2, Tag, Calendar, Percent } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductManagement } from "./ProductManagement";
import { AdvancedAnalytics } from "./analytics/AdvancedAnalytics";
import { OrderManagement } from "./admin/OrderManagement";
import { CustomerSupport } from "./admin/CustomerSupport";
import { UserManagement } from "./admin/UserManagement";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Best Authors state
  const [bestAuthors, setBestAuthors] = useState<any[]>([]);
  const [showBestAuthorDialog, setShowBestAuthorDialog] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorDisplayOrder, setAuthorDisplayOrder] = useState("0");
  const [authorIsActive, setAuthorIsActive] = useState(true);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);

  // Promo Codes state
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscountType, setPromoDiscountType] = useState("percentage");
  const [promoDiscountValue, setPromoDiscountValue] = useState("");
  const [promoUsageLimit, setPromoUsageLimit] = useState("");
  const [promoValidUntil, setPromoValidUntil] = useState("");
  const [promoStatus, setPromoStatus] = useState("active");
  const [editingPromo, setEditingPromo] = useState<any>(null);

  // Hero Images state
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [showHeroDialog, setShowHeroDialog] = useState(false);
  const [heroDeviceType, setHeroDeviceType] = useState("desktop");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroAltText, setHeroAltText] = useState("");
  const [heroDisplayOrder, setHeroDisplayOrder] = useState("1");
  const [heroIsActive, setHeroIsActive] = useState(true);
  const [editingHero, setEditingHero] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
      fetchBestAuthors();
      fetchPromoCodes();
      fetchHeroImages();
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

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      const stats = {
        totalProducts: products?.length || 0,
        activeProducts: products?.filter(p => p.status === 'active').length || 0,
        outOfStock: products?.filter(p => p.stock_quantity === 0).length || 0,
        recentOrders: []
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

      resetBestAuthorForm();
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
  };

  // Promo Codes Management Functions
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

    if (!promoCode.trim() || !promoDiscountValue.trim()) {
      toast({
        title: "All required fields must be filled",
        variant: "destructive"
      });
      return;
    }

    try {
      const promoData = {
        code: promoCode.toUpperCase().trim(),
        discount_type: promoDiscountType,
        discount_value: parseFloat(promoDiscountValue),
        usage_limit: promoUsageLimit ? parseInt(promoUsageLimit) : null,
        valid_until: promoValidUntil ? new Date(promoValidUntil).toISOString() : null,
        status: promoStatus,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('promo_codes')
        .insert([promoData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code created successfully"
      });

      resetPromoForm();
      setShowPromoDialog(false);
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error creating promo code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create promo code",
        variant: "destructive"
      });
    }
  };

  const updatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingPromo) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({
          code: promoCode.toUpperCase().trim(),
          discount_type: promoDiscountType,
          discount_value: parseFloat(promoDiscountValue),
          usage_limit: promoUsageLimit ? parseInt(promoUsageLimit) : null,
          valid_until: promoValidUntil ? new Date(promoValidUntil).toISOString() : null,
          status: promoStatus
        })
        .eq('id', editingPromo.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Promo code updated successfully"
      });

      resetPromoForm();
      setShowPromoDialog(false);
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error updating promo code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update promo code",
        variant: "destructive"
      });
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

  const openEditPromoDialog = (promo: any) => {
    setEditingPromo(promo);
    setPromoCode(promo.code);
    setPromoDiscountType(promo.discount_type);
    setPromoDiscountValue(promo.discount_value.toString());
    setPromoUsageLimit(promo.usage_limit ? promo.usage_limit.toString() : "");
    setPromoValidUntil(promo.valid_until ? new Date(promo.valid_until).toISOString().split('T')[0] : "");
    setPromoStatus(promo.status);
    setShowPromoDialog(true);
  };

  const resetPromoForm = () => {
    setEditingPromo(null);
    setPromoCode("");
    setPromoDiscountType("percentage");
    setPromoDiscountValue("");
    setPromoUsageLimit("");
    setPromoValidUntil("");
    setPromoStatus("active");
  };

  // Hero Images Management Functions
  const fetchHeroImages = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('device_type', { ascending: true })
        .order('display_order', { ascending: true });

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

  const createHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!heroImageUrl.trim() || !heroDeviceType) {
      toast({
        title: "All required fields must be filled",
        variant: "destructive"
      });
      return;
    }

    try {
      const heroData = {
        device_type: heroDeviceType,
        image_url: heroImageUrl.trim(),
        alt_text: heroAltText.trim() || 'Hero background image',
        display_order: parseInt(heroDisplayOrder) || 1,
        is_active: heroIsActive,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('hero_images')
        .insert([heroData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero image added successfully"
      });

      resetHeroForm();
      setShowHeroDialog(false);
      fetchHeroImages();
    } catch (error: any) {
      console.error('Error creating hero image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add hero image",
        variant: "destructive"
      });
    }
  };

  const updateHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingHero) return;

    try {
      const { error } = await supabase
        .from('hero_images')
        .update({
          device_type: heroDeviceType,
          image_url: heroImageUrl.trim(),
          alt_text: heroAltText.trim() || 'Hero background image',
          display_order: parseInt(heroDisplayOrder) || 1,
          is_active: heroIsActive
        })
        .eq('id', editingHero.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero image updated successfully"
      });

      resetHeroForm();
      setShowHeroDialog(false);
      fetchHeroImages();
    } catch (error: any) {
      console.error('Error updating hero image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update hero image",
        variant: "destructive"
      });
    }
  };

  const deleteHeroImage = async (id: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

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

  const openEditHeroDialog = (hero: any) => {
    setEditingHero(hero);
    setHeroDeviceType(hero.device_type);
    setHeroImageUrl(hero.image_url);
    setHeroAltText(hero.alt_text || '');
    setHeroDisplayOrder(hero.display_order.toString());
    setHeroIsActive(hero.is_active);
    setShowHeroDialog(true);
  };

  const resetHeroForm = () => {
    setEditingHero(null);
    setHeroDeviceType("desktop");
    setHeroImageUrl("");
    setHeroAltText("");
    setHeroDisplayOrder("1");
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
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
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
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="promo">Promo Codes</TabsTrigger>
          <TabsTrigger value="hero">Hero Images</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>Quick overview of your business</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Welcome to your admin dashboard. Use the tabs above to manage different aspects of your business.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="space-y-6">
            <Tabs defaultValue="all-products" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all-products">All Products</TabsTrigger>
                <TabsTrigger value="best-authors">Best Authors</TabsTrigger>
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
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bestAuthors.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
            </Tabs>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promo">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Promo Codes Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage discount codes for your customers.
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetPromoForm();
                  setShowPromoDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              <Tag className="h-4 w-4 text-blue-500" />
                              <span className="font-mono font-medium">{promo.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {promo.discount_type === 'percentage' ? (
                                <><Percent className="h-3 w-3 mr-1" />Percentage</>
                              ) : (
                                <>₹ Fixed</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `৳${promo.discount_value}`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{promo.used_count}/{promo.usage_limit || '∞'}</div>
                              {promo.usage_limit && (
                                <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                  <div 
                                    className="bg-blue-600 h-1 rounded-full" 
                                    style={{ width: `${Math.min((promo.used_count / promo.usage_limit) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {promo.valid_until ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm">
                                  {new Date(promo.valid_until).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No expiry</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={promo.status === 'active' ? 'default' : 'secondary'}
                            >
                              {promo.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditPromoDialog(promo)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePromoCodeStatus(promo.id, promo.status)}
                              >
                                {promo.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Images Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Hero Images Management
                  </CardTitle>
                  <CardDescription>
                    Manage hero background images for different devices (Desktop, Tablet, Mobile).
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetHeroForm();
                  setShowHeroDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hero Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Image URL</TableHead>
                      <TableHead>Alt Text</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heroImages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No hero images found
                        </TableCell>
                      </TableRow>
                    ) : (
                      heroImages.map((hero) => (
                        <TableRow key={hero.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {hero.device_type.charAt(0).toUpperCase() + hero.device_type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate font-mono text-sm">
                              {hero.image_url}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {hero.alt_text}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {hero.display_order}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={hero.is_active ? 'default' : 'secondary'}
                            >
                              {hero.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditHeroDialog(hero)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleHeroImageStatus(hero.id, hero.is_active)}
                              >
                                {hero.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteHeroImage(hero.id)}
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

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>

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

      {/* Promo Code Dialog */}
      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Edit Promo Code' : 'Add Promo Code'}
            </DialogTitle>
            <DialogDescription>
              {editingPromo ? 'Update the promo code details' : 'Create a new discount code for customers'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingPromo ? updatePromoCode : createPromoCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Promo Code *</Label>
              <Input
                id="promo-code"
                type="text"
                placeholder="e.g., SAVE20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type *</Label>
                <Select value={promoDiscountType} onValueChange={setPromoDiscountType}>
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
                  Value * {promoDiscountType === 'percentage' ? '(%)' : '(৳)'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  placeholder={promoDiscountType === 'percentage' ? '20' : '100'}
                  value={promoDiscountValue}
                  onChange={(e) => setPromoDiscountValue(e.target.value)}
                  min="0"
                  max={promoDiscountType === 'percentage' ? '100' : undefined}
                  step={promoDiscountType === 'percentage' ? '1' : '0.01'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage-limit">Usage Limit</Label>
                <Input
                  id="usage-limit"
                  type="number"
                  placeholder="Unlimited"
                  value={promoUsageLimit}
                  onChange={(e) => setPromoUsageLimit(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid-until">Expires On</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={promoValidUntil}
                  onChange={(e) => setPromoValidUntil(e.target.value)}
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

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPromoDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (editingPromo ? "Update" : "Create")} Promo Code
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hero Image Dialog */}
      <Dialog open={showHeroDialog} onOpenChange={setShowHeroDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingHero ? 'Edit Hero Image' : 'Add Hero Image'}
            </DialogTitle>
            <DialogDescription>
              {editingHero ? 'Update the hero image details' : 'Add a new hero background image for a specific device'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingHero ? updateHeroImage : createHeroImage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device-type">Device Type *</Label>
              <Select value={heroDeviceType} onValueChange={setHeroDeviceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL *</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg or /src/assets/hero.jpg"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                type="text"
                placeholder="Hero background image"
                value={heroAltText}
                onChange={(e) => setHeroAltText(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-order">Display Order</Label>
              <Input
                id="display-order"
                type="number"
                placeholder="1"
                value={heroDisplayOrder}
                onChange={(e) => setHeroDisplayOrder(e.target.value)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers take priority for the same device type
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hero-active"
                  checked={heroIsActive}
                  onCheckedChange={(checked) => setHeroIsActive(checked === true)}
                />
                <Label htmlFor="hero-active">Active</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Only active images will be displayed on the website
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowHeroDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : (editingHero ? "Update" : "Add")} Hero Image
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;