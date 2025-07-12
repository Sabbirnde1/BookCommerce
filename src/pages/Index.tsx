import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCard } from "@/components/BookCard";
import { BookRequestForm } from "@/components/BookRequestForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Clock, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { mockBooks } from "@/lib/bookData";
import heroImage from "@/assets/books-hero.jpg";

const Index = () => {
  // Use actual book data from the mock database
  const featuredBooks = mockBooks.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Book Categories Section */}
      <section className="py-4 bg-secondary/20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            <Link 
              to="/books?category=fiction" 
              className="text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Fiction
            </Link>
            
            <Link 
              to="/books?category=non-fiction" 
              className="text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Non-Fiction
            </Link>
            
            <Link 
              to="/books?category=academic" 
              className="text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Academic
            </Link>
            
            <Link 
              to="/books?category=children" 
              className="text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Children's Books
            </Link>
            
            <Link 
              to="/books?category=history" 
              className="text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              History
            </Link>
            
            <Link 
              to="/books?category=science" 
              className="text-sm md:text-base font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Science & Tech
            </Link>
          </div>
        </div>
      </section>
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Books collection" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          {/* Floating Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative animate-fade-in flex items-center space-x-4">
              <img 
                src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
                alt="Nijercart Logo" 
                className="h-20 w-auto drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
              <div className="text-3xl font-bold text-foreground">Nijercart</div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent rounded-lg animate-pulse"></div>
            </div>
          </div>
          
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 animate-fade-in">
            ✨ Your Book Haven
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground animate-fade-in">
            Old Books &amp; New Books
            <span className="block text-primary">All in One Place</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Discover amazing deals on pre-owned classics and latest bestsellers. 
            Can't find what you're looking for? Simply request any book and we'll find it for you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="hero" className="text-lg px-8" asChild>
              <Link to="/books">
                <Search className="mr-2 h-5 w-5" />
                Browse Books
              </Link>
            </Button>
            <Button size="lg" variant="accent" className="text-lg px-8" asChild>
              <Link to="/request">
                <BookOpen className="mr-2 h-5 w-5" />
                Request a Book
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Unique Selling Points */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-page">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Vast Collection</h3>
                <p className="text-muted-foreground">
                  Thousands of new and pre-owned books across all genres and categories.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-page">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Book Requests</h3>
                <p className="text-muted-foreground">
                  Can't find a book? Request it and we'll locate it for you within 24 hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-page">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-muted-foreground">
                  Competitive prices on both new releases and carefully curated pre-owned books.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Books</h2>
              <p className="text-muted-foreground">Discover our handpicked selection</p>
            </div>
            <Button variant="ghost" className="group">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </div>
      </section>

      {/* Book Request Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                Our Unique Feature
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
                Can't Find Your Book?
                <span className="block text-primary">We'll Find It For You!</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our book request service is what sets us apart. Simply tell us what you're looking for, 
                and our team will search through our network of suppliers and partners to locate 
                exactly what you need - whether it's a rare first edition or the latest bestseller.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">24-hour response time</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Access to rare and hard-to-find books</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-foreground">Competitive pricing guaranteed</span>
                </div>
              </div>
            </div>
            
            <div>
              <BookRequestForm />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="group relative overflow-hidden bg-gradient-primary text-primary-foreground shadow-book hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">New Books</h3>
                <p className="text-primary-foreground/80 mb-6">
                  Latest releases, bestsellers, and fresh arrivals straight from publishers.
                </p>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/new-books">
                    Browse New Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-accent text-accent-foreground shadow-book hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Pre-owned Books</h3>
                <p className="text-accent-foreground/80 mb-6">
                  Carefully curated pre-owned books at amazing prices. Every book tells a story.
                </p>
                <Button variant="secondary" size="lg" asChild>
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
