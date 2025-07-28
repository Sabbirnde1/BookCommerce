import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  User, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Send,
  Eye
} from "lucide-react";

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customer_name?: string;
  customer_email: string;
  customer_phone?: string;
  resolution?: string;
  assigned_to?: string;
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
  responded_by?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export function CustomerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showInquiryDialog, setShowInquiryDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    setLoading(true);
    try {
      // Fetch support tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Fetch customer inquiries
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('customer_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (inquiriesError) throw inquiriesError;

      setTickets(ticketsData || []);
      setInquiries(inquiriesData || []);
    } catch (error: any) {
      toast.error("Failed to fetch support data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      
      toast.success("Ticket status updated successfully");
      fetchSupportData();
    } catch (error: any) {
      toast.error("Failed to update ticket status: " + error.message);
    }
  };

  const respondToInquiry = async (inquiryId: string) => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const { error } = await supabase
        .from('customer_inquiries')
        .update({
          response: response,
          status: 'responded',
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inquiryId);

      if (error) throw error;
      
      toast.success("Response sent successfully");
      setResponse("");
      setShowInquiryDialog(false);
      fetchSupportData();
    } catch (error: any) {
      toast.error("Failed to send response: " + error.message);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved': 
      case 'responded': return 'default';
      case 'in_progress': return 'secondary';
      case 'open': 
      case 'pending': return 'outline';
      case 'closed': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };

  const inquiryStats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Support</h2>
          <p className="text-muted-foreground">
            Manage customer tickets and inquiries
          </p>
        </div>
        <Button onClick={fetchSupportData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Support Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketStats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiryStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiryStats.responded}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="inquiries">Customer Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.customer_name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{ticket.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog open={showTicketDialog && selectedTicket?.id === ticket.id} 
                                onOpenChange={(open) => {
                                  setShowTicketDialog(open);
                                  if (open) setSelectedTicket(ticket);
                                }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Ticket Details - {ticket.ticket_number}</DialogTitle>
                              <DialogDescription>
                                Manage support ticket
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer</Label>
                                  <p className="text-sm">{ticket.customer_email}</p>
                                  {ticket.customer_phone && (
                                    <p className="text-sm text-muted-foreground">{ticket.customer_phone}</p>
                                  )}
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label>Subject</Label>
                                <p className="text-sm font-medium mt-1">{ticket.subject}</p>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm mt-1">{ticket.description}</p>
                              </div>
                              {ticket.resolution && (
                                <div>
                                  <Label>Resolution</Label>
                                  <p className="text-sm mt-1">{ticket.resolution}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inquiry.name}</p>
                          <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{inquiry.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inquiry.inquiry_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                          {inquiry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog open={showInquiryDialog && selectedInquiry?.id === inquiry.id} 
                                onOpenChange={(open) => {
                                  setShowInquiryDialog(open);
                                  if (open) setSelectedInquiry(inquiry);
                                }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Customer Inquiry</DialogTitle>
                              <DialogDescription>
                                Respond to customer inquiry
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer</Label>
                                  <p className="text-sm">{inquiry.name}</p>
                                  <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                                  {inquiry.phone && (
                                    <p className="text-sm text-muted-foreground">{inquiry.phone}</p>
                                  )}
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                                    {inquiry.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <Label>Subject</Label>
                                <p className="text-sm font-medium mt-1">{inquiry.subject}</p>
                              </div>
                              <div>
                                <Label>Message</Label>
                                <p className="text-sm mt-1">{inquiry.message}</p>
                              </div>
                              {inquiry.response ? (
                                <div>
                                  <Label>Response</Label>
                                  <p className="text-sm mt-1">{inquiry.response}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Responded on {inquiry.responded_at ? new Date(inquiry.responded_at).toLocaleString() : 'N/A'}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <Label>Response</Label>
                                  <Textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Enter your response..."
                                    className="mt-1"
                                  />
                                  <Button 
                                    onClick={() => respondToInquiry(inquiry.id)}
                                    className="mt-2"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Response
                                  </Button>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}