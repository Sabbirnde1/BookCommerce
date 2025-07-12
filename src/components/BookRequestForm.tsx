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
    <Card className="w-full max-w-md mx-auto shadow-page">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl">Request a Book</CardTitle>
        <CardDescription>
          Can't find what you're looking for? Let us help you find it!
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Book Title *</Label>
            <Input
              id="title"
              placeholder="Enter book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="condition">Condition Preference *</Label>
            <Select value={condition} onValueChange={setCondition} required>
              <SelectTrigger>
                <SelectValue placeholder="Select condition preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Books Only</SelectItem>
                <SelectItem value="old">Pre-owned Books Only</SelectItem>
                <SelectItem value="both">Both New & Pre-owned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Input
              id="budget"
              placeholder="e.g., ৳500-1500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Contact Information (Required) *</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Please provide at least one contact method so we can reach you when we find your book.
            </p>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-3 w-3 text-accent" />
                  WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="e.g., +880 1234567890"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  type="tel"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <Send className="h-3 w-3 text-accent" />
                  Telegram Number/Username
                </Label>
                <Input
                  id="telegram"
                  placeholder="e.g., @username or +880 1234567890"
                  value={telegramNumber}
                  onChange={(e) => setTelegramNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-primary" />
                  Mobile Phone
                </Label>
                <Input
                  id="mobile"
                  placeholder="e.g., +880 1234567890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  type="tel"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any specific edition, publisher, or other requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full" variant="hero" disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}