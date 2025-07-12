import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Filter, Heart, Star, ShoppingCart, BookOpen, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { mockBooks, genres, searchBooks, filterBooksByCondition, filterBooksByGenre, sortBooks, Book } from "@/lib/bookData";
import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("featured");
  const [activeTab, setActiveTab] = useState("all");
  const { addItem, getItemQuantity } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuth();
  const { toast } = useToast();

  // Update search query and category when URL params change
  useEffect(() => {
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    setSearchQuery(query);
    
    // Map category to genre for filtering
    if (category) {
      const categoryToGenreMap: { [key: string]: string } = {
        fiction: "Classic Literature",
        "non-fiction": "History", 
        academic: "Philosophy",
        children: "Romance", // Placeholder since we don't have children's books in mock data
        history: "History",
        science: "Science Fiction"
      };
      setSelectedGenre(categoryToGenreMap[category] || "All Genres");
    }
  }, [searchParams]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

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

  const handleAddToWishlist = async (book: Book) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your wishlist.",
        variant: "destructive"
      });
      return;
    }

    if (isInWishlist(book.id)) {
      const success = await removeFromWishlist(user.id, book.id);
      if (success) {
        toast({
          title: "Removed from wishlist",
          description: `${book.title} has been removed from your wishlist.`,
        });
      }
    } else {
      const success = await addToWishlist(user.id, book);
      if (success) {
        toast({
          title: "Added to wishlist! ❤️",
          description: `${book.title} has been added to your wishlist.`,
        });
      }
    }
  };

  const BookCard = ({ book }: { book: Book }) => {
    const cartQuantity = getItemQuantity(book.id);
    const inWishlist = isInWishlist(book.id);
    
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
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${inWishlist ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={() => handleAddToWishlist(book)}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
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
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Publisher:</strong> {book.publisher}</p>
            <p><strong>Year:</strong> {book.publishedYear}</p>
            <p><strong>Pages:</strong> {book.pages}</p>
            <p><strong>In Stock:</strong> {book.inStock}</p>
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
      <section className="bg-gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Search Books"}
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Find your next great read from our extensive collection
            </p>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, author, genre, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-14 text-lg bg-background text-foreground rounded-lg"
              />
              <Button 
                type="submit"
                variant="hero"
                className="absolute right-2 top-2 h-10"
              >
                Search
              </Button>
            </form>
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
              {searchQuery && (
                <>Showing {filteredBooks.length} results for "{searchQuery}"</>
              )}
              {!searchQuery && (
                <>Showing {filteredBooks.length} books</>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <NoResultsMessage />
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Search;