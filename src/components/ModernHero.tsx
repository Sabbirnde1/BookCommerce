import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import heroDesktop from "@/assets/hero-desktop.jpg";
import heroTablet from "@/assets/hero-tablet.jpg";
import heroMobile from "@/assets/hero-mobile.jpg";

const ModernHero = () => {
  return (
    <section className="relative h-screen min-h-[600px] max-h-[800px] overflow-hidden">
      {/* Responsive Background Images */}
      <div className="absolute inset-0">
        {/* Desktop Image */}
        <img
          src={heroDesktop}
          alt="Modern bookstore hero"
          className="hidden lg:block w-full h-full object-cover object-center"
        />
        {/* Tablet Image */}
        <img
          src={heroTablet}
          alt="Modern bookstore hero"
          className="hidden md:block lg:hidden w-full h-full object-cover object-center"
        />
        {/* Mobile Image */}
        <img
          src={heroMobile}
          alt="Modern bookstore hero"
          className="block md:hidden w-full h-full object-cover object-center"
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Book Collection</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Discover Your Next
              <span className="block text-primary">Great Read</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in leading-relaxed">
              Explore thousands of books from classic literature to modern bestsellers. 
              Find your perfect book and enjoy fast, reliable delivery.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Button size="lg" className="group shadow-lg" asChild>
                <Link to="/books">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="backdrop-blur-sm bg-background/50 border-border/50" asChild>
                <Link to="/request">
                  Request a Book
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in">
              <div className="text-center sm:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Books Available</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">5k+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground">Fast Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse"></div>
    </section>
  );
};

export default ModernHero;