import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Users, Search, Filter, Download } from "lucide-react";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  source: string;
  tags: any;
  subscribed_at: string;
  created_at: string;
}

interface EmailSubscribersProps {
  onStatsUpdate: () => void;
}

export function EmailSubscribers({ onStatsUpdate }: EmailSubscribersProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    tags: "",
  });

  const [importData, setImportData] = useState("");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("email_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSubscribers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  const handleAddSubscriber = async () => {
    try {
      if (!formData.email) {
        toast.error("Email is required");
        return;
      }

      const subscriberData = {
        email: formData.email.toLowerCase().trim(),
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        phone: formData.phone.trim() || null,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
        source: "manual",
        status: "subscribed",
      };

      const { error } = await supabase
        .from("email_subscribers")
        .insert(subscriberData);

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          toast.error("This email address is already subscribed");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Subscriber added successfully");
      setShowAddDialog(false);
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        tags: "",
      });
      fetchSubscribers();
      onStatsUpdate();
    } catch (error) {
      console.error("Error adding subscriber:", error);
      toast.error("Failed to add subscriber");
    }
  };

  const handleImportSubscribers = async () => {
    try {
      if (!importData.trim()) {
        toast.error("Import data is required");
        return;
      }

      // Parse CSV data
      const lines = importData.trim().split("\n");
      const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
      
      if (!headers.includes("email")) {
        toast.error("CSV must include an 'email' column");
        return;
      }

      const subscribers = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim().replace(/^"(.*)"$/, '$1'));
        const subscriber: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            if (header === "tags") {
              subscriber[header] = values[index].split(";").map((tag: string) => tag.trim()).filter(Boolean);
            } else {
              subscriber[header] = values[index];
            }
          }
        });
        
        return subscriber;
      }).filter(sub => sub.email);

      if (subscribers.length === 0) {
        toast.error("No valid subscribers found in import data");
        return;
      }

      // Call import function
      const { data, error } = await supabase.functions.invoke('import-subscribers', {
        body: { subscribers, source: "csv_import" }
      });

      if (error) throw error;

      toast.success(
        `Import completed! ${data.imported_count} imported, ${data.duplicate_count} duplicates, ${data.invalid_count} invalid`
      );
      setShowImportDialog(false);
      setImportData("");
      fetchSubscribers();
      onStatsUpdate();
    } catch (error) {
      console.error("Error importing subscribers:", error);
      toast.error("Failed to import subscribers");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      subscribed: { variant: "default" as const, text: "Subscribed" },
      unsubscribed: { variant: "secondary" as const, text: "Unsubscribed" },
      bounced: { variant: "destructive" as const, text: "Bounced" },
      complained: { variant: "destructive" as const, text: "Complained" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.subscribed;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading subscribers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Subscribers</h3>
        <div className="flex space-x-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Subscribers</DialogTitle>
                <DialogDescription>
                  Import subscribers from CSV data. Include columns: email, first_name, last_name, phone, tags (semicolon-separated)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-data">CSV Data</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="email,first_name,last_name,phone,tags&#10;john@example.com,John,Doe,123-456-7890,customer;newsletter&#10;jane@example.com,Jane,Smith,,newsletter"
                    rows={10}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportSubscribers}>
                    Import Subscribers
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subscriber
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subscriber</DialogTitle>
                <DialogDescription>
                  Add a new subscriber to your email list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-234-567-8900"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="customer, newsletter, vip"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSubscriber}>
                    Add Subscriber
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="all">All Statuses</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
          <option value="complained">Complained</option>
        </select>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>
                    {subscriber.first_name || subscriber.last_name
                      ? `${subscriber.first_name || ""} ${subscriber.last_name || ""}`.trim()
                      : "—"}
                  </TableCell>
                  <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                  <TableCell className="capitalize">{subscriber.source}</TableCell>
                  <TableCell>
                    {subscriber.tags && subscriber.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {subscriber.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(subscriber.subscribed_at || subscriber.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {subscribers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscribers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Start building your email list by adding subscribers."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="flex justify-center space-x-2">
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subscriber
                </Button>
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Subscribers
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}