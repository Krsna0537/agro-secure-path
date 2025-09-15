import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardOverview from "@/components/DashboardOverview";
import FeatureCard from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Shield, 
  Target, 
  BookOpen, 
  FileCheck, 
  Bell, 
  Globe, 
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import heroImage from "@/assets/farm-hero.jpg";

const Index = () => {
  const { user } = useAuth();
  
  // If user is logged in, show dashboard overview instead
  if (user) {
    return <DashboardOverview />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Modern farm with digital technology integration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Digital Biosecurity for<br />
            <span className="text-accent">Safer Farms</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Comprehensive digital platform for implementing and monitoring biosecurity 
            measures in pig and poultry farming operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <a href="/risk-assessment">Start Risk Assessment</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href="/#contact">Watch Demo</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Your Farm Management Dashboard
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor your farm's biosecurity status, compliance levels, and training progress in real-time
            </p>
          </div>
          <div className="bg-card rounded-lg shadow-lg border border-border">
            <DashboardOverview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Comprehensive Biosecurity Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to implement, monitor, and maintain robust biosecurity 
              practices on your pig and poultry farms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Risk Assessment Tools"
              description="Customizable assessment frameworks based on local epidemiological conditions and farm-specific factors"
              icon={Target}
            />
            <FeatureCard
              title="Interactive Training"
              description="Comprehensive training modules for farmers, workers, and veterinarians with multilingual support"
              icon={BookOpen}
            />
            <FeatureCard
              title="Compliance Tracking"
              description="Monitor and track compliance with regulatory frameworks and work toward disease-free compartment recognition"
              icon={FileCheck}
            />
            <FeatureCard
              title="Real-time Alerts"
              description="Instant notifications for disease outbreaks, biosecurity breaches, and maintenance requirements"
              icon={Bell}
            />
            <FeatureCard
              title="Global Accessibility"
              description="Mobile-first design with multilingual support for farmers in remote and rural areas"
              icon={Globe}
            />
            <FeatureCard
              title="Stakeholder Network"
              description="Connect with veterinarians, extension workers, and other farmers for collaborative support"
              icon={Users}
            />
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Compliance & Recognition</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track compliance with national and international standards and work towards disease-free compartment recognition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2 text-foreground">Regulatory Tracking</h4>
                <p className="text-muted-foreground">Monitor adherence to biosecurity regulations and generate reports.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2 text-foreground">Audit Readiness</h4>
                <p className="text-muted-foreground">Maintain records required for inspections and certification.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2 text-foreground">Compartment Goals</h4>
                <p className="text-muted-foreground">Track progress towards disease-free compartment recognition.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Contact Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Questions or feedback? We’d love to hear from you.
            </p>
          </div>
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild className="w-full">
              <a href="/auth">Sign In to Get Started</a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="#features">Explore Features</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section id="training" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                Empower Your Team with Expert Training
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Access comprehensive training modules designed by veterinary experts 
                and agricultural specialists. Build knowledge and confidence in 
                implementing effective biosecurity measures.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-foreground">Biosecurity fundamentals and best practices</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-foreground">Disease prevention and early detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-foreground">Emergency response protocols</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-foreground">Regulatory compliance requirements</span>
                </div>
              </div>
              
              <Button size="lg" asChild>
                <a href="/training">Explore Training Modules</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-success mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">95%</h4>
                  <p className="text-muted-foreground">Course completion rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">25,000+</h4>
                  <p className="text-muted-foreground">Farmers trained</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">12</h4>
                  <p className="text-muted-foreground">Training modules</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="h-12 w-12 text-warning mx-auto mb-4" />
                  <h4 className="font-semibold text-foreground mb-2">8</h4>
                  <p className="text-muted-foreground">Languages supported</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Secure Your Farm?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers who are already using FarmSecure Portal 
            to protect their livestock and improve their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <a href="/risk-assessment">Start Free Assessment</a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary" asChild>
              <a href="/#contact">Contact Sales</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
