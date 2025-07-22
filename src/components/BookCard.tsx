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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden bg-card hover:shadow-book transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col cursor-pointer">
          {book.isPopular && (
            <Badge className="absolute top-1 right-1 md:top-2 md:right-2 z-10 bg-accent text-accent-foreground text-xs">
              Popular
            </Badge>
          )}
          
          <CardHeader className="p-0 flex-shrink-0">
            <div className="aspect-[3/4] overflow-hidden bg-muted rounded-t-lg">
              <img 
                src={book.image} 
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-3 md:p-4 space-y-2 flex-grow">
            <div className="flex items-start justify-between">
              <Badge variant={book.condition === "new" ? "default" : "secondary"} className="text-xs">
                {book.condition === "new" ? "New" : "Pre-owned"}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-7 w-7 md:h-8 md:w-8 transition-colors ${
                  isWishlisted ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleWishlistToggle();
                }}
              >
                <Heart className={`h-3 w-3 md:h-4 md:w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <CardTitle className="text-sm md:text-base font-medium line-clamp-2 leading-tight">
              {book.title}
            </CardTitle>
            
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{book.author}</p>
            
            {book.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {book.description}
              </p>
            )}
            
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
          
          <CardFooter className="p-3 md:p-4 pt-0 flex flex-col gap-2 md:flex-row md:items-center md:justify-between mt-auto">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-base md:text-lg font-bold text-primary">৳{book.price}</span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="text-xs md:text-sm text-muted-foreground line-through">৳{book.originalPrice}</span>
              )}
            </div>
            <Button 
              size="sm" 
              variant="default" 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={cartQuantity >= book.inStock}
              className="text-xs md:text-sm px-2 md:px-3 w-full md:w-auto"
            >
              {cartQuantity >= book.inStock ? "Out of Stock" : 
               cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
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