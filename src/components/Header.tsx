import { Button } from "@/components/ui/button";
import ProfileMenu from "@/components/ProfileMenu";
import { Shield, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">FarmSecure Portal</h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="/#training" className="text-muted-foreground hover:text-foreground transition-colors">
                  Training
                </a>
                <a href="/#compliance" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compliance
                </a>
                <a href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </>
            ) : (
              <>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </a>
                <a href="/farms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Farms
                </a>
                <a href="/risk-assessment" className="text-muted-foreground hover:text-foreground transition-colors">
                  Assessment
                </a>
                <a href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
                  Training
                </a>
                <a href="/alerts" className="text-muted-foreground hover:text-foreground transition-colors">
                  Alerts
                </a>
                {role === 'admin' && (
                  <a href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                    Admin
                  </a>
                )}
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <a href="/auth">Login</a>
                </Button>
                <Button asChild>
                  <a href="/auth">Get Started</a>
                </Button>
              </>
            ) : (
              <ProfileMenu />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-3">
              {!user ? (
                <>
                  <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                  <a href="/#training" className="text-muted-foreground hover:text-foreground transition-colors">
                    Training
                  </a>
                  <a href="/#compliance" className="text-muted-foreground hover:text-foreground transition-colors">
                    Compliance
                  </a>
                  <a href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="/auth">Login</a>
                    </Button>
                    <Button className="justify-start" asChild>
                      <a href="/auth">Get Started</a>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    Dashboard
                  </a>
                  <a href="/farms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Farms
                  </a>
                  <a href="/risk-assessment" className="text-muted-foreground hover:text-foreground transition-colors">
                    Assessment
                  </a>
                  <a href="/training" className="text-muted-foreground hover:text-foreground transition-colors">
                    Training
                  </a>
                  <a href="/alerts" className="text-muted-foreground hover:text-foreground transition-colors">
                    Alerts
                  </a>
                  {role === 'admin' && (
                    <a href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                      Admin Panel
                    </a>
                  )}
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button variant="outline" className="justify-start" onClick={signOut}>
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;