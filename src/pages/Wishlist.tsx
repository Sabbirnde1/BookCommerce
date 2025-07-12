import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistStore } from "@/lib/wishlistStore";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/hooks/use-toast";

const Wishlist = () => {
  const { user } = useAuth();
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWishlist(user.id);
    }
  }, [user, fetchWishlist]);

  const handleAddToCart = (item: any) => {
    const book = {
      id: item.book_id,
      title: item.book_title,
      author: item.book_author,
      image: item.book_image,
      price: item.book_price,
      condition: item.book_condition,
      inStock: 10, // Default stock
      rating: 0,
      description: "",
      genre: "",
      isbn: "",
      publishedYear: new Date().getFullYear(),
      pages: 0,
      publisher: ""
    };

    addItem(book);
    toast({
      title: "Added to cart! 🛒",
      description: `${book.title} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = async (bookId: string, bookTitle: string) => {
    if (!user) return;
    
    const success = await removeFromWishlist(user.id, bookId);
    if (success) {
      toast({
        title: "Removed from wishlist",
        description: `${bookTitle} has been removed from your wishlist.`,
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Please log in to view your wishlist</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to save books for later and access your personal wishlist.
            </p>
            <Button asChild variant="hero">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your wishlist...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Books you've saved for later
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            {items.length} {items.length === 1 ? 'book' : 'books'}
          </Badge>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <Heart className="h-24 w-24 text-muted-foreground/30 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your reading wishlist by clicking the heart icon on books you'd like to save for later.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero">
                <Link to="/new-books">Browse New Books</Link>
              </Button>
              <Button asChild variant="accent">
                <Link to="/old-books">Browse Pre-owned Books</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group shadow-book border-0 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  {/* Book Image */}
                  <div className="aspect-[3/4] mb-4 relative overflow-hidden rounded-lg bg-muted">
                    <img 
                      src={item.book_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'} 
                      alt={item.book_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge 
                      variant={item.book_condition === "new" ? "default" : "secondary"} 
                      className="absolute top-2 left-2"
                    >
                      {item.book_condition === "new" ? "New" : "Pre-owned"}
                    </Badge>
                    
                    {/* Remove from Wishlist Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 border border-white/40 hover:bg-white/90"
                      onClick={() => handleRemoveFromWishlist(item.book_id, item.book_title)}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>

                  {/* Book Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {item.book_title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.book_author}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">৳{item.book_price}</span>
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist;