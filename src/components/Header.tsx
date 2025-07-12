import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, ShoppingCart, BookOpen, User, Menu, LogOut, Settings, Heart, FileText, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const {
    getTotalItems
  } = useCartStore();
  const {
    items: wishlistItems
  } = useWishlistStore();
  const {
    user,
    profile,
    signOut,
    loading
  } = useAuth();
  const {
    toast
  } = useToast();
  const cartItems = getTotalItems();
  const wishlistCount = wishlistItems.length;
  useEffect(() => {
    checkAdminStatus();
  }, [user]);
  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.from('admin_roles').select('id').eq('user_id', user.id).single();
      if (data && !error) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleSignOut = async () => {
    const {
      error
    } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      navigate("/");
    }
  };
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200 flex-shrink-0">
            <div className="relative">
              <img src="/lovable-uploads/848411c9-0b2c-45e9-a022-488d67f663e4.png" alt="Nijercart Logo" className="h-8 sm:h-10 md:h-12 w-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-200" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 rounded-lg"></div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm sm:text-base md:text-lg font-bold bg-gradient-brand bg-clip-text text-transparent drop-shadow-brand hover:scale-105 transition-all duration-300">
                Nijer Cart
              </div>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search books, authors..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-full" />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Desktop Categories */}
            <div className="hidden xl:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/new-books">New Books</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/old-books">Old Books</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/request">Request</Link>
              </Button>
            </div>

            {/* Mobile Search Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 sm:h-10 sm:w-10" onClick={() => document.getElementById('mobile-search')?.focus()}>
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Link to="/wishlist">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {wishlistCount > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </Badge>}
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {cartItems > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs font-medium">
                    {cartItems > 9 ? '9+' : cartItems}
                  </Badge>}
              </Link>
            </Button>

            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  {user && <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-primary rounded-full" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border border-border z-50">
                {user ? <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.display_name || "Book Lover"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/request" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Request Books</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Order History</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </> : <>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/auth" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Sign In / Sign Up</span>
                      </Link>
                    </DropdownMenuItem>
                  </>}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden h-9 w-9 sm:h-10 sm:w-10">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Search in Mobile Menu */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search books, authors..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      className="pl-10 w-full" 
                    />
                  </form>
                  
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/books">
                        <BookOpen className="mr-2 h-4 w-4" />
                        All Books
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/new-books">
                        <BookOpen className="mr-2 h-4 w-4" />
                        New Books
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/old-books">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Pre-owned Books
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link to="/request">
                        <FileText className="mr-2 h-4 w-4" />
                        Request a Book
                      </Link>
                    </Button>
                  </div>
                  
                  {/* User Actions */}
                  {user ? (
                    <div className="space-y-2 pt-4 border-t">
                      <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/profile">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/orders">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Order History
                        </Link>
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/support">
                          <FileText className="mr-2 h-4 w-4" />
                          Support
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileMenuOpen(false)}>
                          <Link to="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive" 
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t">
                      <Button variant="hero" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link to="/auth">
                          <User className="mr-2 h-4 w-4" />
                          Sign In / Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Enhanced Mobile Search */}
        <div className="lg:hidden py-3 border-t border-border/50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="mobile-search"
              type="search" 
              placeholder="Search books, authors, genres..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 w-full h-10 text-base bg-muted/30 border-border/50 focus:bg-background focus:border-primary/50 transition-colors"
            />
          </form>
        </div>
      </div>
    </header>;
}