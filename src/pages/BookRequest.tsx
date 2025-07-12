import { useState } from "react";
import { Header } from "@/components/Header";
import { BookRequestForm } from "@/components/BookRequestForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle, Search, ArrowLeft } from "lucide-react";
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
      
      {/* Page Header */}
      <section className="py-12 bg-gradient-hero border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Book Request</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Can't find the book you're looking for? Let us help you locate it! 
            Our team will search through our network of suppliers and partners.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Submit Your Request</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form with book details, condition preference, and budget.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">We Search for You</h3>
              <p className="text-sm text-muted-foreground">
                Our team searches through our network of suppliers and partners.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Notified</h3>
              <p className="text-sm text-muted-foreground">
                We'll contact you within 24 hours with availability and pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Request Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Submit a Book Request</h2>
              <BookRequestForm />
            </div>

            {/* Previous Requests / Status */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Recent Requests</h2>
              
              {submittedRequests.length > 0 ? (
                <div className="space-y-4">
                  {submittedRequests.map((request) => (
                    <Card key={request.id} className="shadow-page">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <CardDescription>by {request.author}</CardDescription>
                          </div>
                          <Badge 
                            className={`flex items-center gap-1 ${getStatusColor(request.status)}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status === "searching" ? "Searching" : 
                             request.status === "found" ? "Found" : "Unavailable"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Condition:</strong> {request.condition === "both" ? "New or Pre-owned" : request.condition}</p>
                          <p><strong>Budget:</strong> {request.budget}</p>
                          <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleDateString()}</p>
                          {request.notes && (
                            <p><strong>Notes:</strong> {request.notes}</p>
                          )}
                        </div>
                        
                        {request.status === "found" && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800">
                              Great news! We found your book. Check your email for details.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-page">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No requests yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Submit your first book request using the form on the left.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does it take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We typically respond within 24 hours with availability and pricing information.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a fee for requests?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Book requests are completely free! You only pay if you decide to purchase the book.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if you can't find it?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We'll let you know if we can't locate the book and suggest similar alternatives when possible.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I request rare books?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely! We specialize in finding hard-to-find and out-of-print books.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookRequest;