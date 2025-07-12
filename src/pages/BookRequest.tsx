import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookRequestForm } from "@/components/BookRequestForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle, Search, ArrowLeft, Users, Zap, Shield, Star, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const BookRequest = () => {
  const [submittedRequests] = useState([
    {
      id: "1",
      title: "The Art of Computer Programming",
      author: "Donald Knuth",
      condition: "both",
      budget: "৳2500-5000",
      status: "searching",
      submittedAt: "2024-01-15",
      notes: "Looking for volumes 1-3, any edition is fine"
    },
    {
      id: "2", 
      title: "Clean Code",
      author: "Robert Martin",
      condition: "new",
      budget: "৳1500-2500",
      status: "found",
      submittedAt: "2024-01-10",
      notes: ""
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "searching":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "found":
        return "bg-green-100 text-green-800 border-green-200";
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "searching":
        return <Search className="h-4 w-4" />;
      case "found":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Button variant="ghost" size="icon" asChild className="absolute left-4 top-4">
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
                <div className="relative bg-primary/10 p-4 rounded-full">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
              Find Any Book
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Can't find what you're looking for? Our expert team will track down any book 
              through our extensive network of suppliers and publishers.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>24-hour response</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>100% free service</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Expert book hunters</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Books Found</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24h</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Happy Readers</div>
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
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
                    1
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
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Expert Search</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our team searches through hundreds of suppliers, publishers, and rare book dealers worldwide.
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="text-center p-8 rounded-2xl bg-background shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
                    3
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

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid xl:grid-cols-5 gap-12">
            {/* Request Form */}
            <div className="xl:col-span-2">
              <div className="sticky top-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-4">Submit Your Request</h2>
                  <p className="text-muted-foreground text-lg">
                    Fill out the form below and we'll start hunting for your book immediately.
                  </p>
                </div>
                <BookRequestForm />
              </div>
            </div>

            {/* Recent Requests & Testimonials */}
            <div className="xl:col-span-3 space-y-12">
              {/* Recent Requests */}
              <div>
                <h2 className="text-3xl font-bold mb-8">Your Recent Requests</h2>
                
                {submittedRequests.length > 0 ? (
                  <div className="space-y-6">
                    {submittedRequests.map((request) => (
                      <Card key={request.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-r from-background to-secondary/10">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                              <CardDescription className="text-base">by {request.author}</CardDescription>
                            </div>
                            <Badge 
                              className={`flex items-center gap-2 px-3 py-1 ${getStatusColor(request.status)}`}
                              variant="outline"
                            >
                              {getStatusIcon(request.status)}
                              {request.status === "searching" ? "Searching" : 
                               request.status === "found" ? "Found" : "Unavailable"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                            <div className="space-y-2">
                              <p><span className="font-medium text-foreground">Condition:</span> {request.condition === "both" ? "New or Pre-owned" : request.condition}</p>
                              <p><span className="font-medium text-foreground">Budget:</span> {request.budget}</p>
                            </div>
                            <div className="space-y-2">
                              <p><span className="font-medium text-foreground">Submitted:</span> {new Date(request.submittedAt).toLocaleDateString()}</p>
                              {request.notes && (
                                <p><span className="font-medium text-foreground">Notes:</span> {request.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          {request.status === "found" && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-green-800 mb-1">Book Found!</p>
                                  <p className="text-sm text-green-700">
                                    Great news! We found your book. Check your email for details and purchase options.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-secondary/20 to-accent/10">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg"></div>
                        <div className="relative bg-background p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">No requests yet</h3>
                      <p className="text-muted-foreground text-lg max-w-md mx-auto">
                        Submit your first book request and let our expert team help you find exactly what you're looking for.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

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
                  We typically respond within 24 hours with availability and pricing information. For rare books, it might take up to 48 hours.
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
                  Absolutely! We specialize in finding hard-to-find, out-of-print, and collectible books from around the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BookRequest;