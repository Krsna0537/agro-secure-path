import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Building2, 
  AlertTriangle, 
  BookOpen, 
  BarChart3, 
  Settings,
  Shield,
  TrendingUp,
  Activity,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Breadcrumbs from '@/components/Breadcrumbs';

interface AdminStats {
  totalUsers: number;
  totalFarms: number;
  activeAlerts: number;
  completedTraining: number;
}

interface User {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, role, loading } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalFarms: 0,
    activeAlerts: 0,
    completedTraining: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, role, created_at')
        .order('created_at', { ascending: false });
      
      // Fetch farms
      const { data: farmsData } = await supabase
        .from('farms')
        .select('id');
      
      // Fetch active alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('id')
        .eq('is_active', true);
      
      // Fetch completed training
      const { data: trainingData } = await supabase
        .from('user_training_progress')
        .select('id')
        .eq('status', 'completed');

      setUsers(usersData || []);
      setStats({
        totalUsers: usersData?.length || 0,
        totalFarms: farmsData?.length || 0,
        activeAlerts: alertsData?.length || 0,
        completedTraining: trainingData?.length || 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully"
      });
      
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' }, 
            { label: 'Admin Panel' }
          ]} className="mb-2" />
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, monitor system activity, and oversee platform operations.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Farms</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalFarms}</p>
                </div>
                <Building2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Training Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completedTraining}</p>
                </div>
                <BookOpen className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-foreground">{user.full_name || 'Unknown User'}</h3>
                          <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'member' : 'admin')}
                            >
                              {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                            </Button>
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`/admin/user/${user.id}`}>
                                <Eye className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system performance and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-success" />
                      <span>Database Status</span>
                    </div>
                    <Badge variant="default" className="bg-success">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>API Performance</span>
                    </div>
                    <Badge variant="default">Good</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Usage statistics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">User Growth</h3>
                    <p className="text-2xl font-bold text-success">+12%</p>
                    <p className="text-sm text-muted-foreground">This month</p>
                  </div>
                  
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-accent mx-auto mb-2" />
                    <h3 className="font-semibold">Farm Registrations</h3>
                    <p className="text-2xl font-bold text-primary">+8%</p>
                    <p className="text-sm text-muted-foreground">This month</p>
                  </div>
                  
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-warning mx-auto mb-2" />
                    <h3 className="font-semibold">Training Completion</h3>
                    <p className="text-2xl font-bold text-accent">89%</p>
                    <p className="text-sm text-muted-foreground">Average rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Maintenance Mode</h3>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode for system updates</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Manage system-wide email notifications</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Security Settings</h3>
                      <p className="text-sm text-muted-foreground">Configure authentication and security policies</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;