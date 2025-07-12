import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  showAuthCard?: boolean;
}

export function ProtectedRoute({ children, showAuthCard = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuthCard) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Authentication Required</CardTitle>
                <CardDescription>
                  Please sign in to access this page
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild variant="hero" className="w-full">
                <Link to="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Sign In / Sign Up
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/">
                  Back to Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}