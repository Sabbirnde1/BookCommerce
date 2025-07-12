import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cartStore";
import { ArrowLeft, CreditCard, Smartphone, Building2, Banknote, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const { getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const paymentMethods = [
    {
      id: "bkash",
      name: "bKash",
      icon: Smartphone,
      description: "Pay with bKash mobile banking",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200"
    },
    {
      id: "rocket",
      name: "Rocket",
      icon: Phone,
      description: "Pay with Rocket mobile banking",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      id: "nagad",
      name: "Nagad",
      icon: Smartphone,
      description: "Pay with Nagad mobile banking",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: Banknote,
      description: "Pay when you receive your order",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: Building2,
      description: "Direct bank transfer",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Pay with your credit or debit card",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    }
  ];

  const handleSubmit = () => {
    if (!selectedMethod) {
      toast({
        title: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    if ((selectedMethod === "bkash" || selectedMethod === "rocket" || selectedMethod === "nagad") && !phoneNumber) {
      toast({
        title: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    if (selectedMethod === "cod" && !address) {
      toast({
        title: "Please enter your delivery address",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Processing payment...",
      description: "Please wait while we process your order.",
    });

    // Simulate payment processing
    setTimeout(() => {
      clearCart();
      toast({
        title: "Order placed successfully! 📚",
        description: "Thank you for your purchase. You'll receive a confirmation shortly.",
      });
      navigate("/orders");
    }, 2000);
  };

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No items to checkout</h2>
            <Button asChild variant="hero">
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cart">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">
              Choose your preferred payment method
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="shadow-page">
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div key={method.id} className="relative">
                          <RadioGroupItem 
                            value={method.id} 
                            id={method.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={method.id}
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md peer-checked:border-primary peer-checked:bg-primary/5 ${method.borderColor} ${method.bgColor}`}
                          >
                            <div className={`p-2 rounded-full ${method.bgColor}`}>
                              <Icon className={`h-5 w-5 ${method.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{method.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {method.description}
                              </div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Additional fields based on selected method */}
                {(selectedMethod === "bkash" || selectedMethod === "rocket" || selectedMethod === "nagad") && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="01xxxxxxxxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "cod" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete delivery address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === "bank" && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Bank Details</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Bank:</strong> Dutch Bangla Bank Limited</p>
                      <p><strong>Account Name:</strong> BookStore Bangladesh</p>
                      <p><strong>Account Number:</strong> 123-456-789012</p>
                      <p><strong>Routing Number:</strong> 090267229</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Please use your order number as reference when making the transfer.
                    </p>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to our secure payment gateway to complete your card payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>৳{(getTotalPrice() * 0.08).toFixed(2)}</span>
                </div>
                
                <hr />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>৳{(getTotalPrice() * 1.08).toFixed(2)}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={!selectedMethod}
                >
                  Place Order
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Secure payment processing
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Payment;