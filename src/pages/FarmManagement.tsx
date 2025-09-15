import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Plus, MapPin, Users, Calendar, Edit, Trash2 } from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  farm_type: string;
  location: string;
  size_hectares: number;
  animal_count: number;
  registration_number: string;
  created_at: string;
}

const FarmManagement = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [farms, setFarms] = useState<Farm[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    farm_type: '',
    location: '',
    size_hectares: '',
    animal_count: '',
    registration_number: ''
  });

  useEffect(() => {
    if (user) {
      fetchFarms();
    }
  }, [user]);

  const fetchFarms = async () => {
    try {
      setDataLoading(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { data: farmsData } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', profile?.id)
        .order('created_at', { ascending: false });

      setFarms(farmsData || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const farmData = {
        owner_id: profile?.id,
        name: formData.name,
        farm_type: formData.farm_type,
        location: formData.location,
        size_hectares: formData.size_hectares ? parseFloat(formData.size_hectares) : null,
        animal_count: formData.animal_count ? parseInt(formData.animal_count) : 0,
        registration_number: formData.registration_number || null
      };

      let error;
      if (editingFarm) {
        ({ error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingFarm.id));
      } else {
        ({ error } = await supabase
          .from('farms')
          .insert(farmData));
      }

      if (error) throw error;

      toast({
        title: editingFarm ? "Farm Updated!" : "Farm Added!",
        description: `${formData.name} has been ${editingFarm ? 'updated' : 'added'} successfully.`,
      });

      resetForm();
      await fetchFarms();
    } catch (error) {
      console.error('Error saving farm:', error);
      toast({
        title: "Error saving farm",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (farmId: string) => {
    if (!confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;

      toast({
        title: "Farm Deleted",
        description: "Farm has been removed successfully.",
      });

      await fetchFarms();
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast({
        title: "Error deleting farm",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      farm_type: '',
      location: '',
      size_hectares: '',
      animal_count: '',
      registration_number: ''
    });
    setEditingFarm(null);
    setShowAddDialog(false);
  };

  const startEdit = (farm: Farm) => {
    setFormData({
      name: farm.name,
      farm_type: farm.farm_type,
      location: farm.location,
      size_hectares: farm.size_hectares?.toString() || '',
      animal_count: farm.animal_count?.toString() || '',
      registration_number: farm.registration_number || ''
    });
    setEditingFarm(farm);
    setShowAddDialog(true);
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading your farms...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold">Farm Management</h1>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Farm
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingFarm ? 'Edit Farm' : 'Add New Farm'}</DialogTitle>
                  <DialogDescription>
                    {editingFarm ? 'Update your farm details below.' : 'Enter the details for your new farm.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm-name">Farm Name</Label>
                    <Input
                      id="farm-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter farm name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farm-type">Farm Type</Label>
                    <Select value={formData.farm_type} onValueChange={(value) => setFormData({ ...formData, farm_type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pig">Pig Farm</SelectItem>
                        <SelectItem value="poultry">Poultry Farm</SelectItem>
                        <SelectItem value="mixed">Mixed (Pig & Poultry)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter farm location"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size (hectares)</Label>
                      <Input
                        id="size"
                        type="number"
                        step="0.1"
                        value={formData.size_hectares}
                        onChange={(e) => setFormData({ ...formData, size_hectares: e.target.value })}
                        placeholder="0.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="animal-count">Animal Count</Label>
                      <Input
                        id="animal-count"
                        type="number"
                        value={formData.animal_count}
                        onChange={(e) => setFormData({ ...formData, animal_count: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration">Registration Number (Optional)</Label>
                    <Input
                      id="registration"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      placeholder="Farm registration number"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingFarm ? 'Update Farm' : 'Add Farm'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-muted-foreground">
            Manage your farm properties and monitor their biosecurity status.
          </p>
        </div>

        {farms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Farms Added Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding your first farm to begin monitoring biosecurity.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <Card key={farm.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {farm.location}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {farm.farm_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">
                          {farm.size_hectares ? `${farm.size_hectares} ha` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Animals</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {farm.animal_count}
                        </p>
                      </div>
                    </div>

                    {farm.registration_number && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Registration</p>
                        <p className="font-medium">{farm.registration_number}</p>
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(farm.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(farm)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(farm.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FarmManagement;