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
import HeroSlider from "@/components/HeroSlider";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingBooks = async () => {
      try {
        // Get recently added books as trending
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary)
          `)
          .eq('status', 'active')
          .limit(8)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTrendingBooks(data || []);
      } catch (error) {
        console.error('Error fetching trending books:', error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* Quick Navigation Bar */}
      <section className="py-6 md:py-8 bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5 border-b border-border/30">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <Link 
              to="/books?category=fiction" 
              className="group relative bg-background/80 backdrop-blur-sm hover:bg-primary/10 rounded-xl px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-border/50 hover:border-primary/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors">Fiction</span>
              </div>
            </Link>
            
            <Link 
              to="/books?category=non-fiction" 
              className="group relative bg-background/80 backdrop-blur-sm hover:bg-accent/10 rounded-xl px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-border/50 hover:border-accent/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full group-hover:scale-125 transition-transform"></div>
                <span className="text-sm md:text-base font-medium text-foreground group-hover:text-accent transition-colors">Non-Fiction</span>
              </div>
            </Link>
            
            <Link 
              to="/books?category=academic" 
              className="group relative bg-background/80 backdrop-blur-sm hover:bg-secondary/10 rounded-xl px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-border/50 hover:border-secondary/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform"></div>
                <span className="text-sm md:text-base font-medium text-foreground group-hover:text-secondary transition-colors">Academic</span>
              </div>
            </Link>
            
            <Link 
              to="/books?category=children" 
              className="group relative bg-background/80 backdrop-blur-sm hover:bg-primary/10 rounded-xl px-4 py-3 md:px-6 md:py-4 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md border border-border/50 hover:border-primary/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-125 transition-transform"></div>
                <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors whitespace-nowrap">Children's</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Books */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Trending Books
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The hottest titles making waves in the literary world. Don't miss out on what's trending
            </p>
          </div>
          
          {trendingLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted rounded-lg aspect-[3/4] mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {trendingBooks.map((book) => (
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
              <ArrowRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Trending Books Yet</h3>
              <p className="text-muted-foreground mb-4">Check back soon for the latest trending titles!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/20 via-background to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-6 relative">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Book Lovers Choose Us</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Experience the difference with our premium book shopping features</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Vast Collection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Over 50,000+ books spanning every genre imaginable. From bestsellers to rare finds, we have something for every reader.
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-10 w-10 text-accent-foreground" />
                </div>
                <div className="absolute -inset-4 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Lightning Fast Service</h3>
              <p className="text-muted-foreground leading-relaxed">
                24-hour book requests, same-day processing, and express delivery options. Your next great read is just hours away.
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Star className="h-10 w-10 text-secondary-foreground" />
                </div>
                <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">Unbeatable Value</h3>
              <p className="text-muted-foreground leading-relaxed">
                Best prices guaranteed with exclusive deals, bulk discounts, and reward points. Quality books at affordable prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Book Request Section */}
      <section className="py-12 md:py-16 bg-gradient-hero">
        <div className="max-w-screen-2xl mx-auto px-6">
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

      {/* Shop by Collection */}
      <section className="py-16 md:py-20 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shop by Collection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Whether you prefer the newest releases or love discovering pre-owned treasures</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 lg:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-primary-foreground">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    Latest Arrivals
                  </Badge>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">New Books Collection</h3>
                <p className="text-primary-foreground/90 mb-8 text-lg leading-relaxed">
                  Discover the latest bestsellers, fresh releases, and trending titles. Stay ahead with the newest additions to our extensive collection.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                    <span className="text-primary-foreground/90">Latest releases from top publishers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                    <span className="text-primary-foreground/90">Bestsellers and award winners</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                    <span className="text-primary-foreground/90">Pre-order upcoming titles</span>
                  </div>
                </div>
                <Button size="lg" variant="secondary" className="w-full lg:w-auto group-hover:scale-105 transition-transform" asChild>
                  <Link to="/new-books">
                    Explore New Books
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 p-8 lg:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-accent-foreground">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent-foreground/20 rounded-2xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <Badge className="bg-accent-foreground/20 text-accent-foreground border-accent-foreground/30">
                    Great Value
                  </Badge>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">Pre-owned Treasures</h3>
                <p className="text-accent-foreground/90 mb-8 text-lg leading-relaxed">
                  Uncover literary gems at unbeatable prices. Every pre-owned book has a story and offers incredible value for book lovers.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                    <span className="text-accent-foreground/90">Carefully inspected quality books</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                    <span className="text-accent-foreground/90">Up to 70% off original prices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent-foreground rounded-full"></div>
                    <span className="text-accent-foreground/90">Rare and out-of-print finds</span>
                  </div>
                </div>
                <Button size="lg" variant="secondary" className="w-full lg:w-auto group-hover:scale-105 transition-transform" asChild>
                  <Link to="/old-books">
                    Browse Pre-owned
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;