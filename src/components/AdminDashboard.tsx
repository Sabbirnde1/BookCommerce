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
import { AlertTriangle, Package, CheckCircle, XCircle, Star, Plus, Edit, Trash2 } from "lucide-react";
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

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
      fetchBestAuthors();
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
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
    </div>
  );
}

export default AdminDashboard;