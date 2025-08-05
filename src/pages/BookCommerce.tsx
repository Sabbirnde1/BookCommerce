import { useState, useMemo, useEffect } from "react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Heart, Star, ShoppingCart, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Product interface that matches our database
interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  original_price?: number;
  condition: string;
  category: string;
  description?: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  pages?: number;
  stock_quantity: number;
  status: string;
  featured?: boolean;
  product_images?: Array<{ image_url: string; alt_text?: string; is_primary?: boolean }>;
}

const BookCommerce = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("featured");
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemQuantity } = useCartStore();
  const { toast } = useToast();

  // Available categories from database
  const categories = [
    "All Genres",
    "general",
    "fiction",
    "non-fiction", 
    "science",
    "technology",
    "business",
    "history",
    "biography",
    "self-help",
    "romance",
    "mystery",
    "fantasy"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url, alt_text, is_primary)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.author.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply condition filter based on active tab
    if (activeTab === "new") {
      filtered = filtered.filter(product => product.condition === "new");
    } else if (activeTab === "old") {
      filtered = filtered.filter(product => product.condition === "used");
    }
    
    // Apply category filter
    if (selectedGenre !== "All Genres") {
      filtered = filtered.filter(product => product.category === selectedGenre);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "title":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        filtered = [...filtered].sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "featured":
      default:
        filtered = [...filtered].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }
    
    return filtered;
  }, [products, searchQuery, selectedGenre, sortBy, activeTab]);

  const handleAddToCart = (product: Product) => {
    const cartQuantity = getItemQuantity(product.id);
    
    if (cartQuantity >= product.stock_quantity) {
      toast({
        title: "Out of stock",
        description: "This book is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    // Convert product to the cart format
    const cartItem = {
      id: product.id,
      title: product.title,
      author: product.author,
      price: product.price,
      originalPrice: product.original_price,
      condition: product.condition as "new" | "old",
      rating: 4, // Default rating since we don't have ratings in products table yet
      image: product.product_images?.[0]?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
      description: product.description || "",
      genre: product.category,
      isbn: product.isbn || "",
      publisher: product.publisher || "",
      publishedYear: product.publication_year || 2024,
      pages: product.pages || 0,
      isPopular: product.featured,
      inStock: product.stock_quantity
    };

    addItem(cartItem);
    toast({
      title: "Added to cart!",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const cartQuantity = getItemQuantity(product.id);
    const primaryImage = product.product_images?.find(img => img.is_primary)?.image_url || 
                        product.product_images?.[0]?.image_url || 
                        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop";
    
    return (
      <Card className="group relative overflow-hidden bg-card hover:shadow-book transition-all duration-300 transform hover:-translate-y-1">
        {product.featured && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground font-medium">
            Featured
          </Badge>
        )}
        
        <CardHeader className="p-0">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img 
              src={primaryImage} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <Badge 
              variant={product.condition === "new" ? "default" : "secondary"} 
              className="text-xs font-medium"
            >
              {product.condition === "new" ? "New" : "Used"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
            {product.title}
          </CardTitle>
          
          <p className="text-sm text-muted-foreground font-medium">{product.author}</p>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">(4.0)</span>
          </div>
          
          {/* Enhanced Product Information */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Category:</strong> {product.category}</p>
            {product.publisher && <p><strong>Publisher:</strong> {product.publisher}</p>}
            {product.publication_year && product.pages && (
              <p><strong>Year:</strong> {product.publication_year} • <strong>Pages:</strong> {product.pages}</p>
            )}
            <p className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <strong>Stock:</strong> {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">৳{product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">৳{product.original_price}</span>
            )}
          </div>
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => handleAddToCart(product)}
            disabled={cartQuantity >= product.stock_quantity}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartQuantity >= product.stock_quantity ? "Out of Stock" : 
             cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-20">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Your Next Great Read</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Browse our extensive collection of new and pre-owned books
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-background text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Filters and Tabs */}
      <section className="py-8 border-b">
        <div className="max-w-screen-2xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="all">All Books</TabsTrigger>
              <TabsTrigger value="new">New Books</TabsTrigger>
              <TabsTrigger value="old">Pre-owned</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="author">Author A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} products
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-screen-2xl mx-auto px-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-4">No books found</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We couldn't find any books matching your criteria. But don't worry! 
                  Our team can help you find exactly what you're looking for.
                </p>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters, or:</p>
                  <Button size="lg" variant="hero" asChild className="w-full">
                    <Link to="/request">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Request a Book
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BookCommerce;