import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, User, Mail, Phone, FileText, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookRequest {
  id: string;
  title: string;
  author: string;
  condition_preference: string;
  budget: number | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Initialize form with existing profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  // Fetch book requests
  useEffect(() => {
    if (user) {
      fetchBookRequests();
    }
  }, [user]);

  const fetchBookRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('book_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookRequests(data || []);
    } catch (error) {
      console.error('Error fetching book requests:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates = {
      display_name: displayName.trim() || null,
      phone: phone.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { error } = await updateProfile(updates);
    setLoading(false);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profile Updated! ✨",
        description: "Your profile has been successfully updated.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'found':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'not_found':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'found':
        return <CheckCircle className="w-4 h-4" />;
      case 'not_found':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">
                Manage your account information and preferences
              </p>
            </div>

            {/* Account Info Card */}
            <Card className="shadow-page">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your basic account details and verification status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                    </div>
                  </div>
                  <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                    {user?.email_confirmed_at ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Account Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user?.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Card */}
            <Card className="shadow-page">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and how others see you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid gap-6">
                    {/* Display Name */}
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        placeholder="How should we call you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        This is how your name will appear to others
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., +880 1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        We'll use this for order updates and delivery
                      </p>
                    </div>

                    {/* Avatar URL */}
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Profile Picture URL</Label>
                      <Input
                        id="avatar"
                        type="url"
                        placeholder="https://example.com/your-photo.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Link to your profile picture (optional)
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us a bit about yourself and your reading interests..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        Share your reading preferences, favorite genres, or anything about yourself
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" asChild>
                      <Link to="/">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={loading} variant="hero">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Book Requests Section */}
            <Card className="shadow-page">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  My Book Requests
                </CardTitle>
                <CardDescription>
                  Track the status of your book requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No book requests yet
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/request">Submit Your First Request</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-lg">{request.title}</h4>
                            <p className="text-muted-foreground">by {request.author}</p>
                          </div>
                          <Badge 
                            className={`flex items-center gap-1 ${getStatusColor(request.status)}`}
                            variant="outline"
                          >
                            {getStatusIcon(request.status)}
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Condition:</span>
                            <span className="font-medium">{request.condition_preference}</span>
                          </div>
                          {request.budget && (
                            <div className="flex justify-between">
                              <span>Budget:</span>
                              <span className="font-medium">৳{request.budget}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Requested:</span>
                            <span className="font-medium">
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        {request.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Notes:</span> {request.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="shadow-page border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  These actions are permanent and cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need to delete your account? Contact our support team for assistance.
                </p>
                <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;