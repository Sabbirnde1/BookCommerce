import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Calendar, CreditCard, Truck, Eye, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_image: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4" />;
      case 'pending':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your orders...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Order History</h1>
              <p className="text-muted-foreground">
                Track and view all your book purchases
              </p>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't placed any orders yet. Start browsing our amazing book collection!
                  </p>
                  <Button asChild variant="hero">
                    <Link to="/books">Browse Books</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id} className="shadow-page">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order {order.order_number}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.created_at)}
                            </span>
                            {order.payment_method && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                {order.payment_method}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={getStatusColor(order.status)}
                            className="flex items-center gap-1"
                          >
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                              ৳{order.total_amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.order_items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.order_items.map((item, index) => (
                            <div key={item.id}>
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                  {item.book_image ? (
                                    <img 
                                      src={item.book_image} 
                                      alt={item.book_title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground line-clamp-1">
                                    {item.book_title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    by {item.book_author}
                                  </p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-sm">
                                      Qty: {item.quantity}
                                    </span>
                                    <span className="text-sm font-medium">
                                      ৳{item.price} each
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="font-medium">
                                    ৳{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              
                              {index < order.order_items.length - 1 && (
                                <Separator className="mt-3" />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                          <div className="bg-muted/30 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Notes:</strong> {order.notes}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {order.status.toLowerCase() === 'completed' && (
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Orders;