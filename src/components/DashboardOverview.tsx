import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Bell,
  TrendingUp,
  Activity
} from "lucide-react";

const DashboardOverview = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to FarmSecure Portal</h2>
        <p className="text-muted-foreground mb-4">
          Your comprehensive biosecurity management dashboard for pig and poultry farms
        </p>
        <Button asChild>
          <a href="/risk-assessment">Complete Farm Assessment</a>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Biosecurity Score"
          value="87%"
          description="Above average"
          icon={Shield}
          variant="success"
        />
        <StatsCard
          title="Active Alerts"
          value="2"
          description="Requires attention"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatsCard
          title="Compliance Rate"
          value="94%"
          description="Meeting standards"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Training Progress"
          value="6/8"
          description="Modules completed"
          icon={BookOpen}
          variant="default"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Farm Perimeter</span>
                <span className="text-sm font-medium text-success">Low Risk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Visitor Protocol</span>
                <span className="text-sm font-medium text-warning">Medium Risk</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Feed Storage</span>
                <span className="text-sm font-medium text-success">Low Risk</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="/risk-assessment">View Full Assessment</a>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card id="alerts">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium">Temperature Alert</p>
                <p className="text-xs text-muted-foreground">Feed storage area</p>
              </div>
              <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium">Maintenance Due</p>
                <p className="text-xs text-muted-foreground">Disinfection system</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="/alerts">View All Alerts</a>
            </Button>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Training Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Biosecurity Basics</span>
                  <span className="text-success">Completed</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Disease Prevention</span>
                  <span className="text-success">Completed</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Emergency Response</span>
                  <span className="text-muted-foreground">In Progress</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="/training">Continue Training</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;