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
    
    console.log("Form submitted, user:", user);
    
    // if (!user) {
    //   console.log("No user found, showing auth required toast");
    //   toast({
    //     title: "Authentication Required",
    //     description: "Please log in to submit a book request.",
    //     variant: "destructive"
    //   });
    //   return;
    // }
    
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
    console.log("Starting request submission...");

    try {
      const requestData = {
        user_id: user.id,
        title,
        author,
        condition_preference: condition,
        budget: budget ? parseFloat(budget.replace(/[^\d.]/g, '')) : null,
        notes,
        whatsapp: whatsappNumber,
        telegram: telegramNumber,
        mobile: mobileNumber,
      };
      
      console.log("Request data:", requestData);
      
      const { error } = await supabase
        .from('book_requests')
        .insert(requestData);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

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
      
      // Trigger a refresh of recent requests by broadcasting to other components
      window.dispatchEvent(new CustomEvent('bookRequestSubmitted'));
    } catch (error) {
      console.error('Error submitting book request:', error);
      toast({
        title: "Submission Failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      console.log("Request submission finished");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl border-0 bg-gradient-to-br from-background to-secondary/10 backdrop-blur">
      <CardHeader className="text-center space-y-3 pb-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
            <div className="relative p-3 rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div>
          <CardTitle className="text-xl">Request a Book</CardTitle>
          <CardDescription className="text-sm">
            Let us help you find it!
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Book Title *</Label>
            <Input
              id="title"
              placeholder="Enter book title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author" className="text-sm font-medium">Author *</Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="h-10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-sm font-medium">Condition *</Label>
            <Select value={condition} onValueChange={setCondition} required>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Only</SelectItem>
                <SelectItem value="old">Pre-owned Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium">Budget (Optional)</Label>
            <Input
              id="budget"
              placeholder="e.g., ৳500-1500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-secondary/20 to-accent/10 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Label className="text-sm font-medium">Contact Info *</Label>
                <p className="text-xs text-muted-foreground">
                  At least one method required
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="flex items-center gap-2 text-xs font-medium">
                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="+880 1234567890"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  type="tel"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="telegram" className="flex items-center gap-2 text-xs font-medium">
                  <Send className="h-3.5 w-3.5 text-blue-600" />
                  Telegram
                </Label>
                <Input
                  id="telegram"
                  placeholder="@username or phone"
                  value={telegramNumber}
                  onChange={(e) => setTelegramNumber(e.target.value)}
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="flex items-center gap-2 text-xs font-medium">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Mobile
                </Label>
                <Input
                  id="mobile"
                  placeholder="+880 1234567890"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  type="tel"
                  className="h-9"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Specific edition, publisher, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="min-h-[80px]"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-10 text-sm font-semibold" 
            variant="hero" 
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}