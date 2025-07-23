import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Filter, Heart, Star, ShoppingCart, BookOpen, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  original_price?: number;
  condition: string;
  description: string;
  category: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  pages?: number;
  featured?: boolean;
  stock_quantity: number;
  product_images: { image_url: string; alt_text?: string; is_primary?: boolean }[];
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("featured");
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemQuantity } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary)
          `)
          .eq('status', 'active');

        if (error) throw error;
        setProducts(data as Product[] || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load books. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update search query and category when URL params change
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    setSearchQuery(query);
    
    // Map category to genre for filtering
    if (category) {
      setSelectedGenre(category);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    let filtered = [...products];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.author.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    // Apply condition filter based on active tab
    if (activeTab === "new") {
      filtered = filtered.filter(product => product.condition === "new");
    } else if (activeTab === "old") {
      filtered = filtered.filter(product => product.condition === "old");
    }
    
    // Apply category filter
    if (selectedGenre !== "All Genres") {
      filtered = filtered.filter(product => product.category === selectedGenre);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        filtered.sort((a, b) => a.author.localeCompare(b.author));
        break;
      default:
        // Keep original order for "featured"
        break;
    }
    
    return filtered;
  }, [products, searchQuery, selectedGenre, sortBy, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

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

    // Convert product to book format for cart
    const bookForCart = {
      id: product.id,
      title: product.title,
      author: product.author,
      price: product.price,
      originalPrice: product.original_price,
      condition: product.condition as "new" | "old",
      rating: 5,
      image: product.product_images[0]?.image_url || "/placeholder.svg",
      description: product.description,
      genre: product.category,
      isbn: product.isbn || "",
      publisher: product.publisher || "",
      publishedYear: product.publication_year || 0,
      pages: product.pages || 0,
      isPopular: product.featured,
      inStock: product.stock_quantity
    };

    addItem(bookForCart);
    toast({
      title: "Added to cart! 📚",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    if (isInWishlist(product.id)) {
      const success = await removeFromWishlist(user.id, product.id);
      if (success) {
        toast({
          title: "Removed from wishlist",
          description: `${product.title} has been removed from your wishlist.`,
        });
      }
    } else {
      // Convert product to book format for wishlist
      const bookForWishlist = {
        id: product.id,
        title: product.title,
        author: product.author,
        price: product.price,
        originalPrice: product.original_price,
        condition: product.condition as "new" | "old",
        rating: 5,
        image: product.product_images[0]?.image_url || "/placeholder.svg",
        description: product.description,
        genre: product.category,
        isbn: product.isbn || "",
        publisher: product.publisher || "",
        publishedYear: product.publication_year || 0,
        pages: product.pages || 0,
        isPopular: product.featured,
        inStock: product.stock_quantity
      };
      
      const success = await addToWishlist(user.id, bookForWishlist);
      if (success) {
        toast({
          title: "Added to wishlist! ❤️",
          description: `${product.title} has been added to your wishlist.`,
        });
      }
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const cartQuantity = getItemQuantity(product.id);
    const inWishlist = isInWishlist(product.id);
    const primaryImage = product.product_images.find(img => img.is_primary) || product.product_images[0];
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className="group relative overflow-hidden bg-card hover:shadow-book transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            {product.featured && (
              <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground font-medium">
                Featured
              </Badge>
            )}
            
            <CardHeader className="p-0">
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img 
                  src={primaryImage?.image_url || "/placeholder.svg"} 
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
                  {product.condition === "new" ? "New" : "Pre-owned"}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${inWishlist ? 'text-red-500' : 'hover:text-red-500'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWishlist(product);
                  }}
                >
                  <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
                {product.title}
              </CardTitle>
              
              <p className="text-sm text-muted-foreground font-medium">{product.author}</p>
              
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}
              
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Category: {product.category}</span>
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                disabled={cartQuantity >= product.stock_quantity}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartQuantity >= product.stock_quantity ? "Out of Stock" : 
                 cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
              </Button>
            </CardFooter>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {product.title}
            </DialogTitle>
            <DialogDescription>
              by {product.author}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden bg-muted rounded-lg">
                <img 
                  src={primaryImage?.image_url || "/placeholder.svg"} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={product.condition === "new" ? "default" : "secondary"}>
                  {product.condition === "new" ? "New" : "Pre-owned"}
                </Badge>
                {product.featured && (
                  <Badge className="bg-accent text-accent-foreground">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
                {product.pages && (
                  <div>
                    <span className="font-medium">Pages:</span>
                    <p className="text-muted-foreground">{product.pages}</p>
                  </div>
                )}
                {product.publisher && (
                  <div>
                    <span className="font-medium">Publisher:</span>
                    <p className="text-muted-foreground">{product.publisher}</p>
                  </div>
                )}
                {product.publication_year && (
                  <div>
                    <span className="font-medium">Year:</span>
                    <p className="text-muted-foreground">{product.publication_year}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">In Stock:</span>
                  <p className="text-muted-foreground">{product.stock_quantity}</p>
                </div>
                {product.isbn && (
                  <div>
                    <span className="font-medium">ISBN:</span>
                    <p className="text-muted-foreground">{product.isbn}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">৳{product.price}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-sm text-muted-foreground line-through">৳{product.original_price}</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={cartQuantity >= product.stock_quantity}
                    className="flex-1 gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartQuantity >= product.stock_quantity ? "Out of Stock" : 
                     cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                    className={inWishlist ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const NoResultsMessage = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-4">
          {searchQuery ? `No books found for "${searchQuery}"` : "No books found"}
        </h3>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We couldn't find any books matching your search criteria. But don't worry! 
          Our team can help you find exactly what you're looking for.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters, or:</p>
          <Button size="lg" variant="hero" asChild className="w-full">
            <Link to="/request">
              <BookOpen className="mr-2 h-5 w-5" />
              Request This Book
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full">
            <Link to="/books">
              Browse All Books
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Search Books"}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-6 md:mb-8">
              Find your next great read from our extensive collection
            </p>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <SearchIcon className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, author, genre, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 md:pl-12 pr-20 md:pr-24 h-12 md:h-14 text-base md:text-lg bg-background text-foreground rounded-lg"
              />
              <Button 
                type="submit"
                variant="hero"
                className="absolute right-2 top-2 h-8 md:h-10 text-sm md:text-base"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Filters and Tabs */}
      <section className="py-6 md:py-8 border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 md:mb-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="all" className="text-sm md:text-base">All Books</TabsTrigger>
              <TabsTrigger value="new" className="text-sm md:text-base">New Books</TabsTrigger>
              <TabsTrigger value="old" className="text-sm md:text-base">Pre-owned</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50 max-h-60 overflow-y-auto">
                  <SelectItem value="All Genres">All Categories</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                  <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="biography">Biography</SelectItem>
                  <SelectItem value="self-help">Self Help</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-50">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="author">Author A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
              {searchQuery && (
                <>Showing {filteredProducts.length} results for "{searchQuery}"</>
              )}
              {!searchQuery && (
                <>Showing {filteredProducts.length} books</>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="all" className="mt-6 md:mt-8">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <NoResultsMessage />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-6 md:mt-8">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <NoResultsMessage />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="old" className="mt-6 md:mt-8">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <NoResultsMessage />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Search;
