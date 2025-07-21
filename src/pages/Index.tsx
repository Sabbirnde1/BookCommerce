import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { BookRequestForm } from "@/components/BookRequestForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/books-hero.jpg";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary)
          `)
          .eq('featured', true)
          .eq('status', 'active')
          .limit(4)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFeaturedBooks(data || []);
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Book Categories Section */}
      <section className="py-4 md:py-6 bg-secondary/30 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
            <Link 
              to="/books?category=fiction" 
              className="relative text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105 group px-2 py-1"
            >
              <span className="relative z-10">Fiction</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
            <Link 
              to="/books?category=non-fiction" 
              className="relative text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105 group px-2 py-1"
            >
              <span className="relative z-10">Non-Fiction</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
            <Link 
              to="/books?category=academic" 
              className="relative text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105 group px-2 py-1"
            >
              <span className="relative z-10">Academic</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
            <Link 
              to="/books?category=children" 
              className="relative text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-foreground/80 hover:text-primary transition-all duration-300 hover:scale-105 group px-2 py-1"
            >
              <span className="relative z-10 whitespace-nowrap">Children's</span>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
            
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Books collection" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          {/* Floating Logo */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative animate-fade-in flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <img 
                src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
                alt="Nijercart Logo" 
                className="h-16 md:h-20 w-auto drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-brand bg-clip-text text-transparent drop-shadow-brand hover:scale-105 transition-all duration-300">
                Nijer Cart
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent rounded-lg animate-pulse"></div>
            </div>
          </div>
          
          <Badge className="mb-4 md:mb-6 bg-primary/10 text-primary border-primary/20 animate-fade-in">
            ✨ Your Book Haven
          </Badge>
          
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-foreground animate-fade-in">
            <span className="block sm:inline">Old Books</span> <span className="block sm:inline">&amp; New Books</span>
            <span className="block text-primary">All in One Place</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in px-4">
            Discover amazing deals on pre-owned classics and latest bestsellers. 
            Can't find what you're looking for? Simply request any book and we'll find it for you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-sm sm:max-w-md mx-auto px-4">
            <Button size="lg" variant="hero" className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 w-full sm:w-auto h-12 sm:h-auto" asChild>
              <Link to="/books">
                <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Browse Books
              </Link>
            </Button>
            <Button size="lg" variant="accent" className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 w-full sm:w-auto h-12 sm:h-auto" asChild>
              <Link to="/request">
                <BookOpen className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Request a Book
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Featured Books</h2>
              <p className="text-sm md:text-base text-muted-foreground">Discover our handpicked selection</p>
            </div>
            <Button variant="ghost" className="group self-center sm:self-auto" asChild>
              <Link to="/books">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-lg aspect-[3/4] mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {featuredBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  price={book.price}
                  originalPrice={book.original_price}
                  condition={book.condition as "new" | "old"}
                  rating={4}
                  image={book.product_images?.[0]?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"}
                  description={book.description}
                  genre={book.category}
                  isbn={book.isbn || ""}
                  publisher={book.publisher || ""}
                  publishedYear={book.publication_year || 2024}
                  pages={book.pages || 200}
                  inStock={book.stock_quantity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Featured Books Yet</h3>
              <p className="text-muted-foreground mb-4">Check back soon for our handpicked selection!</p>
              <Button variant="outline" asChild>
                <Link to="/books">Browse All Books</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Unique Selling Points */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="text-center shadow-page">
              <CardContent className="pt-6 px-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Vast Collection</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Thousands of new and pre-owned books across all genres and categories.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-page">
              <CardContent className="pt-6 px-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Easy Book Requests</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Can't find a book? Request it and we'll locate it for you within 24 hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-page sm:col-span-2 md:col-span-1">
              <CardContent className="pt-6 px-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Star className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Competitive prices on both new releases and carefully curated pre-owned books.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Book Request Section */}
      <section className="py-12 md:py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                Our Unique Feature
              </Badge>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-foreground">
                Can't Find Your Book?
                <span className="block text-primary">We'll Find It For You!</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                Our book request service is what sets us apart. Simply tell us what you're looking for, 
                and our team will search through our network of suppliers and partners to locate 
                exactly what you need - whether it's a rare first edition or the latest bestseller.
              </p>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-sm md:text-base text-foreground">24-hour response time</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-sm md:text-base text-foreground">Access to rare and hard-to-find books</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <span className="text-sm md:text-base text-foreground">Competitive pricing guaranteed</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 lg:mt-0">
              <BookRequestForm />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Shop by Category</h2>
          
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <Card className="group relative overflow-hidden bg-gradient-primary text-primary-foreground shadow-book hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 md:p-8 text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">New Books</h3>
                <p className="text-primary-foreground/80 mb-4 md:mb-6 text-sm md:text-base">
                  Latest releases, bestsellers, and fresh arrivals straight from publishers.
                </p>
                <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/new-books">
                    Browse New Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-accent text-accent-foreground shadow-book hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 md:p-8 text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Pre-owned Books</h3>
                <p className="text-accent-foreground/80 mb-4 md:mb-6 text-sm md:text-base">
                  Carefully curated pre-owned books at amazing prices. Every book tells a story.
                </p>
                <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/old-books">
                    Browse Old Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
