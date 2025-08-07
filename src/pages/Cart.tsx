import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/cartStore";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Tag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
const Cart = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCartStore();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some books to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    // Pass applied promo to payment page
    navigate("/payment", { state: { appliedPromo } });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }

    setIsApplyingPromo(true);
    
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('status', 'active');

      if (error || !data || data.length === 0) {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again.",
          variant: "destructive"
        });
        return;
      }

      const promo = data[0];

      // Check if promo code is still valid
      const now = new Date();
      if (promo.valid_until && new Date(promo.valid_until) < now) {
        toast({
          title: "Promo code expired",
          description: "This promo code has expired.",
          variant: "destructive"
        });
        return;
      }

      // Check usage limit
      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        toast({
          title: "Promo code limit reached",
          description: "This promo code has reached its usage limit.",
          variant: "destructive"
        });
        return;
      }

      setAppliedPromo(promo);
      toast({
        title: "Promo code applied!",
        description: `You saved ${promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `৳${promo.discount_value}`}`,
      });
    } catch (error) {
      console.error('Error applying promo code:', error);
      toast({
        title: "Error applying promo code",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
    toast({
      title: "Promo code removed",
    });
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    const subtotal = getTotalPrice();
    if (appliedPromo.discount_type === 'percentage') {
      return subtotal * (appliedPromo.discount_value / 100);
    } else {
      return Math.min(appliedPromo.discount_value, subtotal);
    }
  };

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const deliveryCharge = subtotal > 1000 ? 0 : 60;
    const discount = calculateDiscount();
    return subtotal + deliveryCharge - discount;
  };
  if (items.length === 0) {
    return <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start building your library by adding some books to your cart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero">
                <Link to="/new-books">Browse New Books</Link>
              </Button>
              <Button asChild variant="accent">
                <Link to="/old-books">Browse Pre-owned Books</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => <Card key={item.book.id} className="shadow-page">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Book Image */}
                    <div className="w-20 h-28 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                      <img src={item.book.image} alt={item.book.title} className="w-full h-full object-cover" />
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                            {item.book.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.book.author}</p>
                          <Badge variant={item.book.condition === "new" ? "default" : "secondary"} className="text-xs mt-1">
                            {item.book.condition === "new" ? "New" : "Pre-owned"}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeItem(item.book.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.book.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input type="number" value={item.quantity} onChange={e => {
                        const qty = parseInt(e.target.value) || 1;
                        updateQuantity(item.book.id, Math.max(1, Math.min(qty, item.book.inStock)));
                      }} className="w-16 h-8 text-center" min="1" max={item.book.inStock} />
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.book.id, item.quantity + 1)} disabled={item.quantity >= item.book.inStock}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">৳{(item.book.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">৳{item.book.price} each</div>
                        </div>
                      </div>

                      {item.quantity >= item.book.inStock && <p className="text-xs text-amber-600 mt-1">
                          Maximum quantity available: {item.book.inStock}
                        </p>}
                    </div>
                  </div>
                </CardContent>
              </Card>)}

            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/books">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-book sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>৳{getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>৳{(getTotalPrice() > 1000 ? 0 : 60).toFixed(2)}</span>
                </div>
                

                {/* Promo Code Section */}
                <div className="space-y-3 pt-2">
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="h-9"
                      />
                      <Button 
                        onClick={applyPromoCode}
                        disabled={isApplyingPromo}
                        size="sm"
                        variant="outline"
                      >
                        <Tag className="h-4 w-4 mr-1" />
                        {isApplyingPromo ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {appliedPromo.code}
                        </span>
                      </div>
                      <Button 
                        onClick={removePromoCode}
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-800"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}%` : `৳${appliedPromo.discount_value}`})</span>
                    <span>-৳{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <hr />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>৳{getFinalTotal().toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" variant="hero" onClick={handleCheckout}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>

                <div className="text-xs text-muted-foreground text-center">Secure checkout powered by BC</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Cart;