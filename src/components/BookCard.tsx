import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@/lib/bookData";

export function BookCard(book: Book) {
  const { addItem, getItemQuantity } = useCartStore();
  const { toast } = useToast();
  const cartQuantity = getItemQuantity(book.id);

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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
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
          <span className="text-lg font-bold text-primary">${book.price}</span>
          {book.originalPrice && book.originalPrice > book.price && (
            <span className="text-sm text-muted-foreground line-through">${book.originalPrice}</span>
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