import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockBooks, filterBooksByCondition, filterBooksByGenre, sortBooks, genres } from "@/lib/bookData";
import { BookOpen, Search, Filter, Sparkles } from "lucide-react";

const OldBooks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [sortBy, setSortBy] = useState("title");

  // Filter for old books only
  const oldBooks = filterBooksByCondition(mockBooks, "old");

  const filteredBooks = useMemo(() => {
    let books = oldBooks;

    // Apply search filter
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(lowercaseQuery) ||
        book.author.toLowerCase().includes(lowercaseQuery) ||
        book.genre.toLowerCase().includes(lowercaseQuery)
      );
    }

    // Apply genre filter
    books = filterBooksByGenre(books, selectedGenre);

    // Apply sorting
    books = sortBooks(books, sortBy);

    return books;
  }, [oldBooks, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="py-12 bg-gradient-accent border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-accent-foreground" />
            <h1 className="text-4xl font-bold text-accent-foreground">Pre-owned Books</h1>
          </div>
          <p className="text-xl text-accent-foreground/80 max-w-2xl">
            Carefully curated pre-owned books at amazing prices. Every book tells a story, 
            and now they're ready for their next chapter with you.
          </p>
          <Badge className="mt-4 bg-accent-foreground/10 text-accent-foreground border-accent-foreground/20">
            {filteredBooks.length} books available
          </Badge>
        </div>
      </section>

      {/* Why Choose Pre-owned */}
      <section className="py-8 bg-secondary/30 border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Great Condition</h3>
              <p className="text-sm text-muted-foreground">All books are carefully inspected for quality</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Amazing Prices</h3>
              <p className="text-sm text-muted-foreground">Save up to 50% compared to new books</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Rare Finds</h3>
              <p className="text-sm text-muted-foreground">Discover out-of-print and rare editions</p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search pre-owned books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="author">Author A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre("All Genres");
                  setSortBy("title");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Looking for something specific?</h3>
            <p className="text-primary-foreground/80 mb-4">
              Use our book request service and we'll help you find any book!
            </p>
            <Button variant="secondary">Request a Book</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OldBooks;