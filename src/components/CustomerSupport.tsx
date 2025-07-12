import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  HeadphonesIcon, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Ticket,
  Send,
  Phone,
  Mail
} from "lucide-react";

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customer_email?: string;
  customer_phone?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  inquiry_type: string;
  status: string;
  response?: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

export function CustomerSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("create-ticket");

  // Ticket form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("general");

  useEffect(() => {
    if (user) {
      fetchUserTickets();
      fetchUserInquiries();
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  const fetchUserTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-handling/get-tickets');
      
      if (error) throw error;
      
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchUserInquiries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('customer-handling/get-inquiries');
      
      if (error) throw error;
      
      if (data.success) {
        setInquiries(data.inquiries || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  const createSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a support ticket.",
        variant: "destructive"
      });
      return;
    }

    if (!subject || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the subject and description.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-handling/create-ticket', {
        body: {
          subject,
          description,
          category: category || 'general',
          priority,
          customer_email: customerEmail,
          customer_phone: customerPhone
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Ticket Created! 🎫",
          description: data.message,
        });
        
        // Reset form
        setSubject("");
        setDescription("");
        setCategory("");
        setPriority("medium");
        setCustomerPhone("");
        
        // Refresh tickets
        fetchUserTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInquiry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inquiryName || !inquiryEmail || !inquirySubject || !inquiryMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('customer-handling/create-inquiry', {
        body: {
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          subject: inquirySubject,
          message: inquiryMessage,
          inquiry_type: inquiryType
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Inquiry Submitted! 📝",
          description: data.message,
        });
        
        // Reset form
        setInquiryName("");
        setInquiryEmail("");
        setInquiryPhone("");
        setInquirySubject("");
        setInquiryMessage("");
        setInquiryType("general");
        
        // Refresh inquiries if user is logged in
        if (user) {
          fetchUserInquiries();
        }
      }
    } catch (error) {
      console.error('Error creating inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "closed":
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <HeadphonesIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
        <p className="text-muted-foreground text-lg">
          We're here to help! Create a support ticket or send us an inquiry.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create-ticket">Create Ticket</TabsTrigger>
          <TabsTrigger value="create-inquiry">Send Inquiry</TabsTrigger>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="my-inquiries">My Inquiries</TabsTrigger>
        </TabsList>

        {/* Create Support Ticket */}
        <TabsContent value="create-ticket">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Create Support Ticket
              </CardTitle>
              <CardDescription>
                Create a detailed support ticket for technical issues or account problems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createSupportTicket} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Support</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="account">Account Problem</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="order">Order Issue</SelectItem>
                        <SelectItem value="book_request">Book Request</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="your@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone (Optional)</Label>
                    <Input
                      id="customer-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Ticket className="h-4 w-4 mr-2" />
                  {loading ? "Creating Ticket..." : "Create Support Ticket"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Inquiry */}
        <TabsContent value="create-inquiry">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send Inquiry
              </CardTitle>
              <CardDescription>
                Send us a general inquiry or question. No account required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createInquiry} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-name">Name *</Label>
                    <Input
                      id="inquiry-name"
                      placeholder="Your full name"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-email">Email *</Label>
                    <Input
                      id="inquiry-email"
                      type="email"
                      placeholder="your@email.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-phone">Phone (Optional)</Label>
                    <Input
                      id="inquiry-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type">Inquiry Type</Label>
                    <Select value={inquiryType} onValueChange={setInquiryType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Question</SelectItem>
                        <SelectItem value="book_availability">Book Availability</SelectItem>
                        <SelectItem value="pricing">Pricing Question</SelectItem>
                        <SelectItem value="shipping">Shipping Information</SelectItem>
                        <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry-subject">Subject *</Label>
                  <Input
                    id="inquiry-subject"
                    placeholder="What is your inquiry about?"
                    value={inquirySubject}
                    onChange={(e) => setInquirySubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiry-message">Message *</Label>
                  <Textarea
                    id="inquiry-message"
                    placeholder="Please describe your inquiry or question..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Sending..." : "Send Inquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="my-tickets">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">My Support Tickets</h3>
                <Button onClick={fetchUserTickets} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              {tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                            <CardDescription>
                              Ticket #{ticket.ticket_number} • {ticket.category}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(ticket.status)}`} variant="outline">
                            {getStatusIcon(ticket.status)}
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">{ticket.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>Priority: {ticket.priority}</div>
                          <div>Created: {new Date(ticket.created_at).toLocaleDateString()}</div>
                          <div>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</div>
                          {ticket.resolved_at && (
                            <div>Resolved: {new Date(ticket.resolved_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                    <p className="text-muted-foreground">
                      You haven't created any support tickets yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground">
                  Please log in to view your support tickets.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Inquiries */}
        <TabsContent value="my-inquiries">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">My Inquiries</h3>
                <Button onClick={fetchUserInquiries} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>
              
              {inquiries.length > 0 ? (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <Card key={inquiry.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{inquiry.subject}</CardTitle>
                            <CardDescription>
                              {inquiry.inquiry_type} • {inquiry.email}
                            </CardDescription>
                          </div>
                          <Badge className={`${getStatusColor(inquiry.status)}`} variant="outline">
                            {getStatusIcon(inquiry.status)}
                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">{inquiry.message}</p>
                        {inquiry.response && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Response:</p>
                            <p className="text-sm">{inquiry.response}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground mt-3">
                          <div>Created: {new Date(inquiry.created_at).toLocaleDateString()}</div>
                          <div>Updated: {new Date(inquiry.updated_at).toLocaleDateString()}</div>
                          {inquiry.responded_at && (
                            <div>Responded: {new Date(inquiry.responded_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Inquiries</h3>
                    <p className="text-muted-foreground">
                      You haven't submitted any inquiries yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground">
                  Please log in to view your inquiries.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Contact Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Need Immediate Help?</CardTitle>
          <CardDescription>
            Contact us directly through these channels for urgent matters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Phone Support</p>
                <p className="text-sm text-muted-foreground">+880 1234567890</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-muted-foreground">support@nijercart.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}