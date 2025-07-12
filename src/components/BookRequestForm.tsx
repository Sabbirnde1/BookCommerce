import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function BookRequestForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !author || !condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields (title, author, and condition preference).",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the request to your backend
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
          
          <Button type="submit" className="w-full" variant="hero">
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}