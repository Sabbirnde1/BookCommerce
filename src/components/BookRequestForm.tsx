import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Send, Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function BookRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [telegramNumber, setTelegramNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a book request.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title || !author || !condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields (title, author, and condition preference).",
        variant: "destructive"
      });
      return;
    }

    if (!whatsappNumber && !telegramNumber && !mobileNumber) {
      toast({
        title: "Contact Information Required",
        description: "Please provide at least one contact method (WhatsApp, Telegram, or Mobile Phone).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('book_requests')
        .insert({
          user_id: user.id,
          title,
          author,
          condition_preference: condition,
          budget: budget ? parseFloat(budget.replace(/[^\d.]/g, '')) : null,
          notes,
          whatsapp: whatsappNumber,
          telegram: telegramNumber,
          mobile: mobileNumber,
        });

      if (error) throw error;

      toast({
        title: "Request Submitted! 📚",
        description: "We'll search for your book and get back to you within 24 hours.",
      });

      // Reset form
      setTitle("");
      setAuthor("");
      setCondition("");
      setBudget("");
      setNotes("");
      setWhatsappNumber("");
      setTelegramNumber("");
      setMobileNumber("");
    } catch (error) {
      console.error('Error submitting book request:', error);
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-xl border-0 bg-gradient-to-br from-background to-secondary/10 backdrop-blur">
      <CardHeader className="text-center space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
            <div className="relative p-4 rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl">Request a Book</CardTitle>
          <CardDescription className="text-base">
            Can't find what you're looking for? Let us help you find it!
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">Book Title *</Label>
            <Input
              id="title"
              placeholder="Enter the book title you're looking for"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author" className="text-base font-medium">Author *</Label>
            <Input
              id="author"
              placeholder="Enter the author's name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-base font-medium">Condition Preference *</Label>
            <Select value={condition} onValueChange={setCondition} required>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Books Only</SelectItem>
                <SelectItem value="old">Pre-owned Books Only</SelectItem>
                <SelectItem value="both">Both New & Pre-owned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-base font-medium">Budget Range (Optional)</Label>
            <Input
              id="budget"
              placeholder="e.g., ৳500-1500 or your maximum budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-secondary/20 to-accent/10 rounded-xl border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base font-medium">Contact Information *</Label>
                <p className="text-sm text-muted-foreground">
                  We'll use this to notify you when we find your book
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-sm font-medium">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="+880 1234567890"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  type="tel"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-2 text-sm font-medium">
                  <Send className="h-4 w-4 text-blue-600" />
                  Telegram
                </Label>
                <Input
                  id="telegram"
                  placeholder="@username or phone number"
                  value={telegramNumber}
                  onChange={(e) => setTelegramNumber(e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-primary" />
                  Mobile Phone
                </Label>
                <Input
                  id="mobile"
                  placeholder="+880 1234567890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  type="tel"
                  className="h-11"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Specific edition, publisher, ISBN, or any other requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold" 
            variant="hero" 
            disabled={isSubmitting}
          >
            <Send className="h-5 w-5 mr-2" />
            {isSubmitting ? "Submitting Request..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}