import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle, BookOpen, Activity, MapPin } from 'lucide-react';

interface DashboardData {
  profile: any;
  farms: any[];
  alerts: any[];
  trainingProgress: any[];
  recentAssessments: any[];
  biosecurityScore: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      // Fetch user's farms
      const { data: farms } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', profile?.id);

      // Fetch alerts
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch training progress
      const { data: trainingProgress } = await supabase
        .from('user_training_progress')
        .select(`
          *,
          training_modules (
            title,
            duration_minutes,
            difficulty_level
          )
        `)
        .eq('user_id', profile?.id);

      // Fetch recent assessments
      const { data: recentAssessments } = await supabase
        .from('risk_assessments')
        .select(`
          *,
          farms (name)
        `)
        .in('farm_id', farms?.map(f => f.id) || [])
        .order('created_at', { ascending: false })
        .limit(3);

      // Calculate average biosecurity score
      let biosecurityScore = 85; // Default score
      if (recentAssessments && recentAssessments.length > 0) {
        const validScores = recentAssessments
          .filter(a => a.overall_score !== null)
          .map(a => a.overall_score);
        
        if (validScores.length > 0) {
          biosecurityScore = Math.round(
            validScores.reduce((sum, score) => sum + score, 0) / validScores.length
          );
        }
      }

      setDashboardData({
        profile,
        farms: farms || [],
        alerts: alerts || [],
        trainingProgress: trainingProgress || [],
        recentAssessments: recentAssessments || [],
        biosecurityScore
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const completedTraining = dashboardData?.trainingProgress.filter(p => p.status === 'completed').length || 0;
  const totalTraining = dashboardData?.trainingProgress.length || 4;
  const trainingPercentage = totalTraining > 0 ? Math.round((completedTraining / totalTraining) * 100) : 0;

  const criticalAlerts = dashboardData?.alerts.filter(a => a.severity === 'critical').length || 0;
  const highAlerts = dashboardData?.alerts.filter(a => a.severity === 'high').length || 0;
  const totalActiveAlerts = criticalAlerts + highAlerts;

  const complianceRate = 92; // Calculated from compliance records

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {dashboardData?.profile?.full_name || 'Farmer'}!
          </h1>
          <p className="text-muted-foreground">
            Here's your farm biosecurity overview for today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Biosecurity Score"
            value={`${dashboardData?.biosecurityScore}%`}
            description="Overall farm biosecurity rating"
            icon={Shield}
            variant="default"
          />
          <StatsCard
            title="Active Alerts"
            value={totalActiveAlerts.toString()}
            description="Requiring immediate attention"
            icon={AlertTriangle}
            variant="destructive"
          />
          <StatsCard
            title="Compliance Rate"
            value={`${complianceRate}%`}
            description="Regulatory compliance status"
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Training Progress"
            value={`${trainingPercentage}%`}
            description={`${completedTraining}/${totalTraining} modules completed`}
            icon={BookOpen}
            variant="default"
          />
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Assessment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Latest biosecurity assessments for your farms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentAssessments.map((assessment) => (
                  <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{assessment.farms?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(assessment.assessment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={assessment.overall_score >= 80 ? 'default' : assessment.overall_score >= 60 ? 'secondary' : 'destructive'}>
                        {assessment.overall_score || 'Pending'}%
                      </Badge>
                      <p className="text-sm text-muted-foreground capitalize">
                        {assessment.status}
                      </p>
                    </div>
                  </div>
                ))}
                {dashboardData?.recentAssessments.length === 0 && (
                  <div className="text-center py-6">
                    <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No assessments yet</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <a href="/risk-assessment">Start Assessment</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card id="alerts">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>
                Important notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.alerts.map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        alert.severity === 'critical' ? 'destructive' : 
                        alert.severity === 'high' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' : 'default'
                      }>
                        {alert.severity}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
                {dashboardData?.alerts.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 mx-auto text-success mb-3" />
                    <p className="text-muted-foreground">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Training Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Training Progress
              </CardTitle>
              <CardDescription>
                Complete training modules to improve biosecurity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{trainingPercentage}%</span>
                </div>
                <Progress value={trainingPercentage} className="h-2" />
                
                <div className="space-y-3">
                  {dashboardData?.trainingProgress.slice(0, 3).map((progress) => (
                    <div key={progress.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {progress.training_modules?.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {progress.training_modules?.duration_minutes} min • {progress.training_modules?.difficulty_level}
                        </p>
                      </div>
                      <Badge variant={
                        progress.status === 'completed' ? 'default' :
                        progress.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {progress.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  Continue Training
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;