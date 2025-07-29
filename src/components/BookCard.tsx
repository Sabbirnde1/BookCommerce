import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Heart, BookOpen } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@/lib/bookData";

export function BookCard(book: Book) {
  const { addItem, getItemQuantity } = useCartStore();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();
  const cartQuantity = getItemQuantity(book.id);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(book.id));
  }, [book.id, isInWishlist]);

  const handleAddToCart = () => {
    if (cartQuantity >= book.inStock) {
      toast({
        title: "Out of stock",
        description: "This book is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    addItem(book);
    toast({
      title: "Added to cart! 📚",
      description: `${book.title} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to add books to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    if (isWishlisted) {
      const success = await removeFromWishlist(user.id, book.id);
      if (success) {
        setIsWishlisted(false);
        toast({
          title: "Removed from wishlist",
          description: `${book.title} has been removed from your wishlist.`,
        });
      }
    } else {
      const success = await addToWishlist(user.id, book);
      if (success) {
        setIsWishlisted(true);
        toast({
          title: "Added to wishlist! ",
          description: `${book.title} has been saved to your wishlist.`,
        });
      } else {
        toast({
          title: "Already in wishlist",
          description: `${book.title} is already in your wishlist.`,
        });
      }
    }
  };

  const hasDiscount = book.originalPrice && book.originalPrice > book.price;
  const discountPercent = hasDiscount ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="product-card h-full flex flex-col cursor-pointer group relative">
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {book.isPopular && (
              <Badge className="sale-badge text-[10px] px-1.5 py-0.5">
                Popular
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="discount-badge text-[10px] px-1.5 py-0.5">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          
          {/* Wishlist Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all ${
              isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleWishlistToggle();
            }}
          >
            <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
          
          <CardHeader className="p-0 flex-shrink-0">
            <div className="aspect-[3/4] overflow-hidden bg-muted rounded-t-lg relative">
              <img 
                src={book.image} 
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {cartQuantity >= book.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-3 space-y-2 flex-grow">
            <div className="flex items-center justify-between">
              <Badge 
                variant={book.condition === "new" ? "default" : "secondary"} 
                className="text-[10px] px-2 py-0.5"
              >
                {book.condition === "new" ? "New" : "Pre-owned"}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-rating-star text-rating-star" />
                <span className="text-xs font-medium">{book.rating}</span>
              </div>
            </div>
            
            <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {book.title}
            </CardTitle>
            
            <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
            
            {book.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {book.description}
              </p>
            )}
          </CardContent>
          
          <CardFooter className="p-3 pt-0 flex flex-col gap-2 mt-auto">
            <div className="flex items-center gap-2 w-full">
              <span className="price-text text-lg font-bold">৳{book.price}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">৳{book.originalPrice}</span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant={cartQuantity > 0 ? "accent" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={cartQuantity >= book.inStock}
              className="w-full text-xs font-medium"
            >
              {cartQuantity >= book.inStock ? "Out of Stock" : 
               cartQuantity > 0 ? `Added (${cartQuantity})` : "Add to Cart"}
            </Button>
          </CardFooter>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {book.title}
          </DialogTitle>
          <DialogDescription>
            by {book.author}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-muted rounded-lg">
              <img 
                src={book.image} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={book.condition === "new" ? "default" : "secondary"}>
                {book.condition === "new" ? "New" : "Pre-owned"}
              </Badge>
              {book.isPopular && (
                <Badge className="bg-accent text-accent-foreground">
                  Popular
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">({book.rating})</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {book.description || "No description available."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Genre:</span>
                <p className="text-muted-foreground">{book.genre}</p>
              </div>
              <div>
                <span className="font-medium">Pages:</span>
                <p className="text-muted-foreground">{book.pages}</p>
              </div>
              <div>
                <span className="font-medium">Publisher:</span>
                <p className="text-muted-foreground">{book.publisher}</p>
              </div>
              <div>
                <span className="font-medium">Year:</span>
                <p className="text-muted-foreground">{book.publishedYear}</p>
              </div>
              {book.isbn && (
                <div className="col-span-2">
                  <span className="font-medium">ISBN:</span>
                  <p className="text-muted-foreground">{book.isbn}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">৳{book.price}</span>
                {book.originalPrice && book.originalPrice > book.price && (
                  <span className="text-sm text-muted-foreground line-through">৳{book.originalPrice}</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={cartQuantity >= book.inStock}
                  className="flex-1"
                >
                  {cartQuantity >= book.inStock ? "Out of Stock" : 
                   cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle();
                  }}
                  className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}