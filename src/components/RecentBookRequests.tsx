import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle, Search, AlertCircle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type BookRequest = Tables<"book_requests">;

export function RecentBookRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("book_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching recent requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "searching":
        return "bg-blue-100 text-blue-800 border-blue-200";
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
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "searching":
        return <Search className="h-4 w-4" />;
      case "found":
        return <CheckCircle className="h-4 w-4" />;
      case "unavailable":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "searching":
        return "Searching";
      case "found":
        return "Found";
      case "unavailable":
        return "Unavailable";
      default:
        return "Pending";
    }
  };

  if (!user) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-8">Your Recent Requests</h2>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-secondary/20 to-accent/10">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-lg"></div>
              <div className="relative bg-background p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Sign in to view requests</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Sign in to your account to view and track your book requests.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-8">Your Recent Requests</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-lg border-0 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Your Recent Requests</h2>
      
      {requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request) => (
            <Card key={request.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-r from-background to-secondary/10">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                    <CardDescription className="text-base">by {request.author}</CardDescription>
                  </div>
                  <Badge className={`flex items-center gap-2 px-3 py-1 ${getStatusColor(request.status)}`} variant="outline">
                    {getStatusIcon(request.status)}
                    {getStatusText(request.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                  <div className="space-y-2">
                    <p><span className="font-medium text-foreground">Condition:</span> {request.condition_preference}</p>
                    {request.budget && <p><span className="font-medium text-foreground">Budget:</span> ৳{request.budget}</p>}
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium text-foreground">Submitted:</span> {new Date(request.created_at).toLocaleDateString()}</p>
                    {request.notes && <p><span className="font-medium text-foreground">Notes:</span> {request.notes}</p>}
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
  );
}