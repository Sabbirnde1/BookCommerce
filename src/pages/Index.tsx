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
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [bestSellingBooks, setBestSellingBooks] = useState<any[]>([]);
  const [bestAuthorsBooks, setBestAuthorsBooks] = useState<any[]>([]);
  const [trendingBooks, setTrendingBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBooksLoading, setAllBooksLoading] = useState(true);
  const [bestSellingLoading, setBestSellingLoading] = useState(true);
  const [bestAuthorsLoading, setBestAuthorsLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

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

    const fetchAllBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary)
          `)
          .eq('status', 'active')
          .limit(12)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAllBooks(data || []);
      } catch (error) {
        console.error('Error fetching all books:', error);
      } finally {
        setAllBooksLoading(false);
      }
    };

    const fetchBestSellingBooks = async () => {
      try {
        // Using featured books as proxy for best selling
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary)
          `)
          .eq('status', 'active')
          .eq('featured', true)
          .limit(8)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBestSellingBooks(data || []);
      } catch (error) {
        console.error('Error fetching best selling books:', error);
      } finally {
        setBestSellingLoading(false);
      }
    };

    const fetchBestAuthorsBooks = async () => {
      try {
        // Get books from popular authors (authors with multiple books)
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, alt_text, is_primary)
          `)
          .eq('status', 'active')
          .in('author', ['J.K. Rowling', 'Stephen King', 'Dan Brown', 'Agatha Christie', 'George R.R. Martin'])
          .limit(8)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBestAuthorsBooks(data || []);
      } catch (error) {
        console.error('Error fetching best authors books:', error);
      } finally {
        setBestAuthorsLoading(false);
      }
    };

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

    fetchFeaturedBooks();
    fetchAllBooks();
    fetchBestSellingBooks();
    fetchBestAuthorsBooks();
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

      {/* Featured Books */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="max-w-screen-2xl mx-auto px-6 relative">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Featured Books
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our carefully curated selection of bestsellers, new releases, and hidden gems
            </p>
            <div className="flex justify-center mt-8">
              <Button size="lg" className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all" asChild>
                <Link to="/books">
                  <Search className="mr-2 h-5 w-5" />
                  Browse All Books
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
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

      {/* All Books Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-background via-secondary/5 to-background">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            {/* <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20 text-sm font-medium">
              📚 Complete Collection
            </Badge> */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              All Books
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Browse our entire collection of books from various genres, authors, and categories
            </p>
          </div>
          
          {allBooksLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
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
          ) : allBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6">
                {allBooks.map((book) => (
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
              
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="group bg-background hover:bg-secondary/10 border-2 hover:border-secondary/30 shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link to="/books">
                    <BookOpen className="mr-2 h-5 w-5" />
                    View All Books
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Books Available</h3>
              <p className="text-muted-foreground mb-4">Check back soon for our latest collection!</p>
              <Button variant="outline" asChild>
                <Link to="/book-request">Request a Book</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Best Selling Books */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-accent/5 via-transparent to-primary/5">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            {/* <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 text-sm font-medium">
              🏆 Most Popular
            </Badge> */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Best Selling Books
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The books everyone's talking about. Our top-selling titles that readers can't put down
            </p>
          </div>
          
          {bestSellingLoading ? (
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
          ) : bestSellingBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {bestSellingBooks.map((book) => (
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
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Best Sellers Yet</h3>
              <p className="text-muted-foreground mb-4">Check back soon for our top-selling books!</p>
            </div>
          )}
        </div>
      </section>

      /* {/* Best Authors Books */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-secondary/10 via-background to-secondary/5">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            /* {/* <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20 text-sm font-medium">
              ✍️ Renowned Writers
            </Badge> */} */
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Best Authors
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Books from the most celebrated and beloved authors whose works have captured millions of hearts
            </p>
          </div>
          
          {bestAuthorsLoading ? (
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
          ) : bestAuthorsBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {bestAuthorsBooks.map((book) => (
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
              <h3 className="text-lg font-semibold mb-2">No Author Books Available</h3>
              <p className="text-muted-foreground mb-4">Check back soon for books from renowned authors!</p>
            </div>
          )}
        </div>
      </section> */

      {/* Trending Books */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            {/* <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm font-medium">
              🔥 Hot Right Now
            </Badge> */}
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
