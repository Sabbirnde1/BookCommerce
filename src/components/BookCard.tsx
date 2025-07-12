import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
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
          title: "Added to wishlist! ❤️",
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

  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow-book transition-all duration-300 transform hover:-translate-y-1">
      {book.isPopular && (
        <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground">
          Popular
        </Badge>
      )}
      
      <CardHeader className="p-0">
        <div className="aspect-[3/4] overflow-hidden bg-muted rounded-t-lg">
          <img 
            src={book.image} 
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <Badge variant={book.condition === "new" ? "default" : "secondary"} className="text-xs">
            {book.condition === "new" ? "New" : "Pre-owned"}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 transition-colors ${
              isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
          {book.title}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground">{book.author}</p>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({book.rating})</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">৳{book.price}</span>
          {book.originalPrice && book.originalPrice > book.price && (
            <span className="text-sm text-muted-foreground line-through">৳{book.originalPrice}</span>
          )}
        </div>
        <Button 
          size="sm" 
          variant="default" 
          onClick={handleAddToCart}
          disabled={cartQuantity >= book.inStock}
        >
          {cartQuantity >= book.inStock ? "Out of Stock" : 
           cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}