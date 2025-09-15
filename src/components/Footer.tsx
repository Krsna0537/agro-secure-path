import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold text-foreground">FarmSecure Portal</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Empowering farmers with digital tools for comprehensive biosecurity management 
              in pig and poultry production systems.
            </p>
            <p className="text-sm text-muted-foreground">
              Building resilient and sustainable livestock farming communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <div className="space-y-2">
              <a href="/risk-assessment" className="block text-muted-foreground hover:text-foreground transition-colors">
                Risk Assessment
              </a>
              <a href="/training" className="block text-muted-foreground hover:text-foreground transition-colors">
                Training Modules
              </a>
              <a href="/compliance" className="block text-muted-foreground hover:text-foreground transition-colors">
                Compliance Tracking
              </a>
              <a href="/alerts" className="block text-muted-foreground hover:text-foreground transition-colors">
                Alert System
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <div className="space-y-2">
              <a href="/#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </a>
              <a href="/#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </a>
              <a href="/#contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </a>
              <a href="/#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                Community Forum
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 FarmSecure Portal. Built for agricultural excellence and biosecurity.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;