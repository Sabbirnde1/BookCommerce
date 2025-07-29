import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Eye, 
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShoppingCart
} from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  profile?: {
    display_name?: string;
    phone?: string;
    avatar_url?: string;
  };
  admin_role?: {
    role: string;
    permissions: string[];
  };
  order_count?: number;
  total_spent?: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get admin roles
      const { data: adminRoles, error: adminError } = await supabase
        .from('admin_roles')
        .select('*');

      if (adminError) throw adminError;

      // Get order statistics for each user
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select('user_id, total_amount')
        .eq('status', 'completed');

      if (orderError) throw orderError;

      // Process user data
      const userStats = orderStats?.reduce((acc: any, order: any) => {
        if (!acc[order.user_id]) {
          acc[order.user_id] = { count: 0, total: 0 };
        }
        acc[order.user_id].count++;
        acc[order.user_id].total += parseFloat(order.total_amount);
        return acc;
      }, {}) || {};

      // Create admin roles lookup
      const adminRolesMap = adminRoles?.reduce((acc: any, role: any) => {
        acc[role.user_id] = role;
        return acc;
      }, {}) || {};

      // Format user data
      const formattedUsers = profiles?.map((profile: any) => ({
        id: profile.user_id,
        email: profile.user_id, // We'd need to get this from auth.users but can't directly access it
        created_at: profile.created_at,
        profile: {
          display_name: profile.display_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
        },
        admin_role: adminRolesMap[profile.user_id] ? {
          role: adminRolesMap[profile.user_id].role,
          permissions: adminRolesMap[profile.user_id].permissions
        } : undefined,
        order_count: userStats[profile.user_id]?.count || 0,
        total_spent: userStats[profile.user_id]?.total || 0,
      })) || [];

      setUsers(formattedUsers);
    } catch (error: any) {
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, isAdmin: boolean) => {
    try {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('admin_roles')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        toast.success("Admin role removed successfully");
      } else {
        // Add admin role
        const { error } = await supabase
          .from('admin_roles')
          .insert({
            user_id: userId,
            role: 'admin',
            permissions: ['read', 'write', 'delete']
          });

        if (error) throw error;
        toast.success("Admin role granted successfully");
      }
      
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to update admin role: " + error.message);
    }
  };

  const filteredUsers = users.filter(user => 
    user.profile?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.phone?.includes(searchTerm)
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.admin_role).length,
    activeUsers: users.filter(u => u.order_count > 0).length,
    newUsers: users.filter(u => {
      const created = new Date(u.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return created > thirtyDaysAgo;
    }).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and admin roles
          </p>
        </div>
        <Button onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.profile?.avatar_url ? (
                        <img 
                          src={user.profile.avatar_url} 
                          alt={user.profile.display_name || 'User'} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.profile?.display_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {user.profile?.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {user.profile.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.admin_role ? "default" : "secondary"}>
                        {user.admin_role ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'User'
                        )}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdminRole(user.id, !!user.admin_role)}
                      >
                        {user.admin_role ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      {user.order_count}
                    </div>
                  </TableCell>
                  <TableCell>৳{user.total_spent.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog open={showUserDialog && selectedUser?.id === user.id} 
                            onOpenChange={(open) => {
                              setShowUserDialog(open);
                              if (open) setSelectedUser(user);
                            }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>User Details</DialogTitle>
                          <DialogDescription>
                            View user information and activity
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Display Name</Label>
                              <p className="text-sm font-medium">{user.profile?.display_name || 'Not set'}</p>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm">{user.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Phone</Label>
                              <p className="text-sm">{user.profile?.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <Label>Role</Label>
                              <Badge variant={user.admin_role ? "default" : "secondary"}>
                                {user.admin_role ? 'Admin' : 'User'}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Total Orders</Label>
                              <p className="text-sm font-medium">{user.order_count}</p>
                            </div>
                            <div>
                              <Label>Total Spent</Label>
                              <p className="text-sm font-medium">৳{user.total_spent.toFixed(2)}</p>
                            </div>
                          </div>
                          <div>
                            <Label>Joined</Label>
                            <p className="text-sm">{new Date(user.created_at).toLocaleString()}</p>
                          </div>
                          {user.admin_role && (
                            <div>
                              <Label>Admin Permissions</Label>
                              <div className="flex gap-1 mt-1">
                                {user.admin_role.permissions.map((permission) => (
                                  <Badge key={permission} variant="outline" className="text-xs">
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
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
    </div>
  );
}