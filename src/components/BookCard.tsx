import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart } from "lucide-react";

interface BookCardProps {
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  condition: "new" | "old";
  rating: number;
  image: string;
  isPopular?: boolean;
}

export function BookCard({ 
  title, 
  author, 
  price, 
  originalPrice, 
  condition, 
  rating, 
  image, 
  isPopular 
}: BookCardProps) {
  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow-book transition-all duration-300 transform hover:-translate-y-1">
      {isPopular && (
        <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground">
          Popular
        </Badge>
      )}
      
      <CardHeader className="p-0">
        <div className="aspect-[3/4] overflow-hidden bg-muted rounded-t-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <Badge variant={condition === "new" ? "default" : "secondary"} className="text-xs">
            {condition === "new" ? "New" : "Pre-owned"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <CardTitle className="text-sm font-medium line-clamp-2 leading-tight">
          {title}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground">{author}</p>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({rating})</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">${price}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
          )}
        </div>
        <Button size="sm" variant="default">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}