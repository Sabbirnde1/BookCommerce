import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { BookRequestForm } from "@/components/BookRequestForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Clock, Star, ArrowRight } from "lucide-react";
import { mockBooks } from "@/lib/bookData";
import heroImage from "@/assets/books-hero.jpg";

const Index = () => {
  // Use actual book data from the mock database
  const featuredBooks = mockBooks.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            ✨ Your Book Haven
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Old Books &amp; New Books
            <span className="block text-primary">All in One Place</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover amazing deals on pre-owned classics and latest bestsellers. 
            Can't find what you're looking for? Simply request any book and we'll find it for you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="hero" className="text-lg px-8">
              <Search className="mr-2 h-5 w-5" />
              Browse Books
            </Button>
            <Button size="lg" variant="accent" className="text-lg px-8">
              <BookOpen className="mr-2 h-5 w-5" />
              Request a Book
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
                <Button variant="secondary" size="lg">
                  Browse New Books
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="group relative overflow-hidden bg-gradient-accent text-accent-foreground shadow-book hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Pre-owned Books</h3>
                <p className="text-accent-foreground/80 mb-6">
                  Carefully curated pre-owned books at amazing prices. Every book tells a story.
                </p>
                <Button variant="secondary" size="lg">
                  Browse Old Books
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="font-bold text-lg">Nijer Cart</span>
              </div>
              <p className="text-primary-foreground/80">
                Your trusted destination for both new and pre-owned books.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">New Books</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Old Books</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Request a Book</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Fiction</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Non-Fiction</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Science</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Biography</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>support@nijercart.com</li>
                <li>1-800-BOOKS-01</li>
                <li>Mon-Fri: 9AM-6PM</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
            <p>&copy; 2024 Nijer Cart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
