import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: string;
  alert_type: string;
  farm_type?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AlertsManagerProps {
  showCreateButton?: boolean;
}

const AlertsManager = ({ showCreateButton = false }: AlertsManagerProps) => {
  const { role } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'medium',
    alert_type: 'biosecurity',
    farm_type: '',
    location: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAlert) {
        // Update existing alert
        const { error } = await supabase
          .from('alerts')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlert.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Alert updated successfully"
        });
      } else {
        // Create new alert
        const { error } = await supabase
          .from('alerts')
          .insert([{
            ...formData,
            is_active: true
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Alert created successfully"
        });
      }

      setFormData({
        title: '',
        message: '',
        severity: 'medium',
        alert_type: 'biosecurity',
        farm_type: '',
        location: ''
      });
      setCreateDialogOpen(false);
      setEditingAlert(null);
      fetchAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingAlert ? 'update' : 'create'} alert`,
        variant: "destructive"
      });
    }
  };

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      
      fetchAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert status",
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });
      
      fetchAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'secondary' as const,
      medium: 'default' as const,
      high: 'destructive' as const,
      critical: 'destructive' as const
    };
    return variants[severity as keyof typeof variants] || 'secondary';
  };

  const startEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      alert_type: alert.alert_type,
      farm_type: alert.farm_type || '',
      location: alert.location || ''
    });
    setCreateDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      {showCreateButton && role === 'admin' && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingAlert ? 'Edit Alert' : 'Create New Alert'}</DialogTitle>
                <DialogDescription>
                  {editingAlert ? 'Update the alert information' : 'Create a new alert for the platform'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Alert title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                
                <Textarea
                  placeholder="Alert message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
                
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={formData.alert_type} onValueChange={(value) => setFormData({ ...formData, alert_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="biosecurity">Biosecurity</SelectItem>
                    <SelectItem value="disease">Disease Outbreak</SelectItem>
                    <SelectItem value="weather">Weather Warning</SelectItem>
                    <SelectItem value="regulatory">Regulatory Update</SelectItem>
                    <SelectItem value="maintenance">System Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Farm type (optional)"
                  value={formData.farm_type}
                  onChange={(e) => setFormData({ ...formData, farm_type: e.target.value })}
                />
                
                <Input
                  placeholder="Location (optional)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setCreateDialogOpen(false);
                    setEditingAlert(null);
                    setFormData({
                      title: '',
                      message: '',
                      severity: 'medium',
                      alert_type: 'biosecurity',
                      farm_type: '',
                      location: ''
                    });
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No alerts found</p>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={`${!alert.is_active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <Badge variant={getSeverityBadge(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant={alert.is_active ? 'default' : 'outline'}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{alert.alert_type}</span>
                      {alert.farm_type && <span>Farm: {alert.farm_type}</span>}
                      {alert.location && <span>Location: {alert.location}</span>}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {role === 'admin' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(alert)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={alert.is_active ? 'outline' : 'default'}
                        onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteAlert(alert.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{alert.message}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsManager;