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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Search,
  Filter,
  RefreshCw
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
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface QuickEditState {
  productId: string | null;
  field: string | null;
  value: string;
}

export function ProductManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [quickEdit, setQuickEdit] = useState<QuickEditState>({ productId: null, field: null, value: "" });

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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const fetchProducts = async () => {
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

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
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

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
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
          description: "Product created successfully",
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

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

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
          product_id: editingProduct.id,
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
        await fetchProducts(); // Ensure refresh happens
        setEditingProduct(null);
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
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-dashboard/delete-product', {
        body: { product_id: productId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success! 🗑️",
          description: "Product deleted successfully",
        });
        
        await fetchProducts(); // Ensure refresh happens
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

  const startQuickEdit = (productId: string, field: string, currentValue: any) => {
    setQuickEdit({
      productId,
      field,
      value: currentValue?.toString() || ""
    });
  };

  const cancelQuickEdit = () => {
    setQuickEdit({ productId: null, field: null, value: "" });
  };

  const saveQuickEdit = async () => {
    if (!quickEdit.productId || !quickEdit.field) return;

    try {
      let updateData: any = {};
      
      switch (quickEdit.field) {
        case 'price':
          updateData.price = parseFloat(quickEdit.value);
          break;
        case 'stock_quantity':
          updateData.stock_quantity = parseInt(quickEdit.value);
          break;
        case 'status':
          updateData.status = quickEdit.value;
          break;
        default:
          updateData[quickEdit.field] = quickEdit.value;
      }

      const { data, error } = await supabase.functions.invoke('admin-dashboard/update-product', {
        body: { 
          product_id: quickEdit.productId,
          ...updateData
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success! ✅",
          description: `${quickEdit.field} updated successfully`,
        });
        
        await fetchProducts(); // Ensure refresh happens
        cancelQuickEdit();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const QuickEditCell = ({ product, field, value, type = "text" }: { 
    product: Product; 
    field: string; 
    value: any; 
    type?: string;
  }) => {
    const isEditing = quickEdit.productId === product.id && quickEdit.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          {field === 'status' ? (
            <Select value={quickEdit.value} onValueChange={(value) => setQuickEdit(prev => ({ ...prev, value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={type}
              value={quickEdit.value}
              onChange={(e) => setQuickEdit(prev => ({ ...prev, value: e.target.value }))}
              className="w-24"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveQuickEdit();
                if (e.key === 'Escape') cancelQuickEdit();
              }}
              autoFocus
            />
          )}
          <Button size="sm" variant="outline" onClick={saveQuickEdit}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={cancelQuickEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div 
        className="cursor-pointer hover:bg-muted/50 p-1 rounded"
        onClick={() => startQuickEdit(product.id, field, value)}
      >
        {field === 'price' && value ? `৳${value}` : 
         field === 'status' ? (
           <Badge variant={value === 'active' ? 'default' : 'secondary'}>
             {value}
           </Badge>
         ) : value}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Management
            </CardTitle>
            <CardDescription>
              Manage your product inventory. Click on any cell to edit quickly.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowProductDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <QuickEditCell product={product} field="title" value={product.title} />
                      </TableCell>
                      <TableCell>
                        <QuickEditCell product={product} field="author" value={product.author} />
                      </TableCell>
                      <TableCell>
                        <QuickEditCell product={product} field="price" value={product.price} type="number" />
                      </TableCell>
                      <TableCell>
                        <QuickEditCell product={product} field="stock_quantity" value={product.stock_quantity} type="number" />
                      </TableCell>
                      <TableCell>
                        <QuickEditCell product={product} field="status" value={product.status} />
                      </TableCell>
                      <TableCell>
                        <QuickEditCell product={product} field="category" value={product.category} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
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

          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </CardContent>

      {/* Product Form Dialog */}
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
    </Card>
  );
}