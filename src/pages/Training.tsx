import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Clock, Target, Play, CheckCircle, Award, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  duration_minutes: number;
  farm_type: string;
  difficulty_level: string;
  is_active: boolean;
}

interface UserProgress {
  id: string;
  module_id: string;
  status: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string;
}

const Training = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTrainingData();
    }
  }, [user]);

  const fetchTrainingData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      // Fetch all training modules
      const { data: modulesData } = await supabase
        .from('training_modules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      // Fetch user's training progress
      const { data: progressData } = await supabase
        .from('user_training_progress')
        .select('*')
        .eq('user_id', profile?.id);

      setModules(modulesData || []);
      
      // Create a map of progress by module_id
      const progressMap = (progressData || []).reduce((acc, progress) => {
        acc[progress.module_id] = progress;
        return acc;
      }, {} as Record<string, UserProgress>);
      
      setUserProgress(progressMap);
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const startModule = async (module: TrainingModule) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { error } = await supabase
        .from('user_training_progress')
        .upsert({
          user_id: profile?.id,
          module_id: module.id,
          status: 'in_progress',
          progress_percentage: 0,
          started_at: new Date().toISOString()
        });

      if (error) throw error;

      setSelectedModule(module);
      setCurrentStep(0);
      await fetchTrainingData(); // Refresh progress
    } catch (error) {
      console.error('Error starting module:', error);
      toast({
        title: "Error starting module",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const completeModule = async (module: TrainingModule) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      const { error } = await supabase
        .from('user_training_progress')
        .upsert({
          user_id: profile?.id,
          module_id: module.id,
          status: 'completed',
          progress_percentage: 100,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Module Completed! 🎉",
        description: `You've successfully completed "${module.title}".`,
      });

      setSelectedModule(null);
      await fetchTrainingData(); // Refresh progress
    } catch (error) {
      console.error('Error completing module:', error);
      toast({
        title: "Error completing module",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p>Loading training modules...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const completedModules = Object.values(userProgress).filter(p => p.status === 'completed').length;
  const inProgressModules = Object.values(userProgress).filter(p => p.status === 'in_progress').length;
  const overallProgress = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  if (selectedModule) {
    const moduleSteps = selectedModule.content.split('\n\n').filter(step => step.trim());
    const isLastStep = currentStep === moduleSteps.length - 1;
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setSelectedModule(null)} className="mb-4">
                ← Back to Training
              </Button>
              <h1 className="text-3xl font-bold mb-2">{selectedModule.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedModule.duration_minutes} minutes
                </div>
                <Badge variant="secondary">{selectedModule.difficulty_level}</Badge>
                <Badge variant="outline">{selectedModule.farm_type}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Step {currentStep + 1} of {moduleSteps.length}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        Progress: {Math.round(((currentStep + 1) / moduleSteps.length) * 100)}%
                      </div>
                    </div>
                    <Progress value={((currentStep + 1) / moduleSteps.length) * 100} className="h-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-base leading-relaxed whitespace-pre-line">
                        {moduleSteps[currentStep]}
                      </p>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      
                      {!isLastStep ? (
                        <Button onClick={() => setCurrentStep(Math.min(moduleSteps.length - 1, currentStep + 1))}>
                          Next
                        </Button>
                      ) : (
                        <Button onClick={() => completeModule(selectedModule)}>
                          Complete Module
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Module Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{selectedModule.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Farm Type</p>
                      <p className="text-sm text-muted-foreground capitalize">{selectedModule.farm_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Difficulty</p>
                      <p className="text-sm text-muted-foreground capitalize">{selectedModule.difficulty_level}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Training Center</h1>
          </div>
          <p className="text-muted-foreground">
            Enhance your biosecurity knowledge with our comprehensive training modules.
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button variant="ghost" asChild>
              <a href="/dashboard"><Home className="w-4 h-4 mr-2" /> Dashboard</a>
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <div className="text-2xl font-bold">{overallProgress}%</div>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
              <Progress value={overallProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <div className="text-2xl font-bold">{completedModules}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <div className="text-2xl font-bold">{inProgressModules}</div>
                </div>
                <Play className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Modules */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pig">Pig Farming</TabsTrigger>
            <TabsTrigger value="poultry">Poultry</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const progress = userProgress[module.id];
                const status = progress?.status || 'not_started';
                
                return (
                  <Card key={module.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                        <Badge variant={
                          status === 'completed' ? 'default' : 
                          status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {status === 'completed' ? 'Completed' : 
                           status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-3">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {module.duration_minutes} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {module.difficulty_level}
                          </div>
                        </div>
                        
                        {progress && status !== 'not_started' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress.progress_percentage || 0}%</span>
                            </div>
                            <Progress value={progress.progress_percentage || 0} className="h-2" />
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => startModule(module)}
                        className="w-full"
                        variant={status === 'completed' ? 'outline' : 'default'}
                      >
                        {status === 'completed' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review Module
                          </>
                        ) : status === 'in_progress' ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Start Module
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.filter(m => m.farm_type === 'general').map((module) => (
                <Card key={module.id}>
                  {/* Same module card content */}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pig">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.filter(m => m.farm_type === 'pig').map((module) => (
                <Card key={module.id}>
                  {/* Same module card content */}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="poultry">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.filter(m => m.farm_type === 'poultry').map((module) => (
                <Card key={module.id}>
                  {/* Same module card content */}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Training;