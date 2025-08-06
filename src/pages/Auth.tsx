import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Eye, EyeOff, ArrowLeft, Shield, User, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, displayName);
    setLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive"
        });
        setActiveTab("login");
        setLoginEmail(signupEmail);
      } else {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      // Reset form
      setSignupEmail("");
      setSignupPassword("");
      setDisplayName("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Auth Section */}
      <section className="py-16 bg-gradient-hero min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            {/* Hero Content */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative animate-fade-in flex items-center space-x-4">
                  <img 
                    src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" 
                    alt="Nijercart Logo" 
                    className="h-16 w-auto drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                  />
                  <div className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent drop-shadow-brand">
                    Nijer Cart
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-lg animate-pulse"></div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Welcome to Your Literary Journey
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of book lovers. Sign in to access your wishlist, orders, and personalized recommendations.
              </p>
              
              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Save Favorites</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Track Orders</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Secure Account</span>
                </div>
              </div>
            </div>

            {/* Auth Card */}
            <Card className="shadow-book border-border/50 bg-background/95 backdrop-blur">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Account Access</CardTitle>
                <CardDescription className="text-base">
                  Sign in to your account or create a new one to get started
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="text-sm font-medium">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="text-sm font-medium">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="h-11 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-11 w-10"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-base font-medium" 
                        variant="hero"
                        disabled={loading}
                      >
                        {loading ? "Signing in..." : "Sign In to Your Account"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  {/* Signup Tab */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="display-name" className="text-sm font-medium">Display Name <span className="text-muted-foreground">(Optional)</span></Label>
                        <Input
                          id="display-name"
                          type="text"
                          placeholder="How should we call you?"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Password <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min. 6 characters)"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="h-11 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-11 w-10"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password <span className="text-destructive">*</span></Label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-11 text-base font-medium" 
                        variant="hero"
                        disabled={loading}
                      >
                        {loading ? "Creating Account..." : "Create Your Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
                
                {/* Additional Links */}
                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <Link 
                    to="/" 
                    className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Store</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Auth;