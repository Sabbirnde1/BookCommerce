import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookRequestForm } from "@/components/BookRequestForm";
import { RecentBookRequests } from "@/components/RecentBookRequests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Shield, Star, MessageCircle, Sparkles, Clock } from "lucide-react";
import { Link } from "react-router-dom";
const BookRequest = () => {
  // Component for handling book requests
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>

     

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Centered Request Form */}
          <div className="max-w-lg mx-auto mb-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Submit Your Request</h2>
              <p className="text-muted-foreground text-lg">
                Fill out the form and we'll start hunting for your book.
              </p>
            </div>
            <BookRequestForm />
          </div>

          {/* Recent Requests & Testimonials - Full Width Below */}
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Recent Requests */}
            <RecentBookRequests />

            {/* Success Stories */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Success Stories</h3>
              <div className="grid gap-6">
                <Card className="border-0 shadow-md bg-gradient-to-r from-background to-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Star className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-3 italic">
                          "They found a rare first edition of 'One Hundred Years of Solitude' that I'd been searching for years. Amazing service!"
                        </p>
                        <p className="font-medium">— Rashida K.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-gradient-to-r from-background to-secondary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                          <Star className="h-6 w-6 text-secondary" />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-3 italic">
                          "Needed textbooks for my engineering course. They found all 5 books within 2 days at great prices!"
                        </p>
                        <p className="font-medium">— Mahbub R.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our simple 3-step process connects you with hard-to-find books
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="text-center p-8 rounded-2xl bg-background shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Submit Request</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Tell us about the book you're looking for with details like title, author, and preferred condition.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="text-center p-8 rounded-2xl bg-background shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Expert Search</h3>
                <p className="text-muted-foreground leading-relaxed">Our team searches through hundreds of suppliers, publishers, and rare book dealers Bangladesh.</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="text-center p-8 rounded-2xl bg-background shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Get Notified</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive detailed information about availability, condition, and pricing within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/20 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our book finding service
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-background/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  How long does it take?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We typically respond within 48 hours with availability and pricing information. For rare books, it might take up to 48 hours.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-background/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-secondary" />
                  </div>
                  Is there a fee for requests?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Book requests are completely free! You only pay if you decide to purchase the book we find for you.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-background/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-accent" />
                  </div>
                  What if you can't find it?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We'll let you know if we can't locate the book and suggest similar alternatives or notify you if it becomes available later.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-background/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary" />
                  </div>
                  Can I request rare books?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Absolutely! We specialize in finding hard-to-find, out-of-print, and collectible books from around Bangladesh.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default BookRequest;