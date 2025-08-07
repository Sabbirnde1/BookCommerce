import { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Save, User, Mail, Phone, FileText, BookOpen, Clock, CheckCircle, XCircle, Upload, Camera } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const [bookRequests, setBookRequests] = useState<BookRequest[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      
      toast({
        title: "Image Uploaded! 📸",
        description: "Your profile picture has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    uploadAvatar(file);
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
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Page Header with Avatar */}
            <div className="text-center space-y-6 mb-8">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary/10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {displayName || user?.email?.split('@')[0] || 'Reader'}
                </h1>
                <p className="text-muted-foreground">
                  Manage your profile and track your reading journey
                </p>
              </div>
            </div>

            
                {/* Profile Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Edit Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="display-name">Display Name</Label>
                          <Input
                            id="display-name"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+880 1234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatar">Profile Picture</Label>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="avatar-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full"
                            >
                              {uploading ? (
                                <>
                                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Camera className="h-4 w-4 mr-2" />
                                  Choose Photo
                                </>
                              )}
                            </Button>
                          </div>
                          {avatarUrl && (
                            <div className="flex-shrink-0">
                              <img
                                src={avatarUrl}
                                alt="Avatar preview"
                                className="w-12 h-12 rounded-full object-cover border-2 border-border"
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload an image file (JPG, PNG, etc.) up to 5MB
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">About Me</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your reading interests..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" asChild>
                          <Link to="/">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
           <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Information - Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{bookRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Book Requests</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold">
                      {bookRequests.filter(r => r.status === 'found').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Found Books</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                    <p className="text-2xl font-bold">
                      {bookRequests.filter(r => r.status === 'pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </Card>
                </div>

                {/* Book Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        My Book Requests
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/request">New Request</Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No book requests yet</p>
                        <Button variant="outline" asChild>
                          <Link to="/request">Submit Your First Request</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookRequests.slice(0, 5).map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{request.title}</h4>
                              <p className="text-sm text-muted-foreground">by {request.author}</p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                className={`flex items-center gap-1 ${getStatusColor(request.status)}`}
                                variant="outline"
                              >
                                {getStatusIcon(request.status)}
                                {request.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {bookRequests.length > 5 && (
                          <p className="text-center text-sm text-muted-foreground pt-2">
                            And {bookRequests.length - 5} more requests...
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Account Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email_confirmed_at ? "Verified" : "Unverified"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Member since</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user?.created_at || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/request">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Request a Book
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/orders">
                        <FileText className="h-4 w-4 mr-2" />
                        View Orders
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/support">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;