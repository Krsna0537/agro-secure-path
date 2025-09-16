import React from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardCheck, FileText, ShieldCheck, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@/components/Breadcrumbs';

const Compliance = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Compliance' }]} className="mb-2" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Compliance</h1>
          </div>
          <p className="text-muted-foreground">Track regulatory compliance and prepare for audits and certifications.</p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button variant="ghost" asChild>
              <a href="/dashboard"><Home className="w-4 h-4 mr-2" /> Dashboard</a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regulatory Checklist</CardTitle>
              <CardDescription>Maintain an up-to-date list of required actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/#compliance">View Checklist</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audit Preparation</CardTitle>
              <CardDescription>Ensure all documentation is ready.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="/farms">Manage Records</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Certificates & Reports</CardTitle>
              <CardDescription>Access downloaded files and submissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Compliance;


