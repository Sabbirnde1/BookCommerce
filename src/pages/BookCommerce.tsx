import { useState, useMemo } from "react";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Heart, Star, ShoppingCart } from "lucide-react";
import { Header } from "@/components/Header";
import { mockBooks, genres, searchBooks, filterBooksByCondition, filterBooksByGenre, sortBooks, Book } from "@/lib/bookData";
import { useCartStore } from "@/lib/cartStore";
import { useToast } from "@/hooks/use-toast";

const BookCommerce = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("featured");
  const [activeTab, setActiveTab] = useState("all");
  const { addItem, getItemQuantity } = useCartStore();
  const { toast } = useToast();

  const filteredBooks = useMemo(() => {
    let books = mockBooks;
    
    // Apply search
    books = searchBooks(books, searchQuery);
    
    // Apply condition filter based on active tab
    if (activeTab === "new") {
      books = filterBooksByCondition(books, "new");
    } else if (activeTab === "old") {
      books = filterBooksByCondition(books, "old");
    }
    
    // Apply genre filter
    books = filterBooksByGenre(books, selectedGenre);
    
    // Apply sorting
    books = sortBooks(books, sortBy);
    
    return books;
  }, [searchQuery, selectedGenre, sortBy, activeTab]);

  const handleAddToCart = (book: Book) => {
    const cartQuantity = getItemQuantity(book.id);
    
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

  const BookCommercCard = ({ book }: { book: Book }) => {
    const cartQuantity = getItemQuantity(book.id);
    
    return (
      <Card className="group relative overflow-hidden bg-card hover:shadow-book transition-all duration-300 transform hover:-translate-y-1">
        {book.isPopular && (
          <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground font-medium">
            Popular
          </Badge>
        )}
        
        <CardHeader className="p-0">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <img 
              src={book.image} 
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <Badge 
              variant={book.condition === "new" ? "default" : "secondary"} 
              className="text-xs font-medium"
            >
              {book.condition === "new" ? "New" : "Pre-owned"}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
            {book.title}
          </CardTitle>
          
          <p className="text-sm text-muted-foreground font-medium">{book.author}</p>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
              />
            ))}
            <span className="text-sm text-muted-foreground ml-1">({book.rating})</span>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">৳{book.price}</span>
            {book.originalPrice && book.originalPrice > book.price && (
              <span className="text-sm text-muted-foreground line-through">৳{book.originalPrice}</span>
            )}
          </div>
          <Button 
            size="sm" 
            variant="default" 
            onClick={() => handleAddToCart(book)}
            disabled={cartQuantity >= book.inStock}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartQuantity >= book.inStock ? "Out of Stock" : 
             cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
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
        <div className="container mx-auto px-4">
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
                  <SelectValue placeholder="Select Genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
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
              Showing {filteredBooks.length} books
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredBooks.map(book => (
                <BookCommercCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-muted-foreground text-lg mb-4">No books found</div>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BookCommerce;