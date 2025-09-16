import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AlertsManager from '@/components/AlertsManager';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@/components/Breadcrumbs';

const Alerts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alerts' }]} className="mb-2" />
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">System Alerts</h1>
          </div>
          <p className="text-muted-foreground">Stay informed about important biosecurity alerts, disease outbreaks, and system notifications.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button variant="ghost" asChild>
              <a href="/dashboard"><Home className="w-4 h-4 mr-2" /> Dashboard</a>
            </Button>
          </div>
        </div>

        <AlertsManager showCreateButton={true} />
      </main>
      <Footer />
    </div>
  );
};

export default Alerts;