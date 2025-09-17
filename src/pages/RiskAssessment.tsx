import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Home } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

interface AssessmentArea {
  id: string;
  name: string;
  description: string;
  questions: {
    id: string;
    text: string;
    weight: number;
  }[];
}

const assessmentAreas: AssessmentArea[] = [
  {
    id: 'access_control',
    name: 'Access Control',
    description: 'Measures to control who can enter your farm',
    questions: [
      { id: 'gate_security', text: 'Are all entry points secured with gates or barriers?', weight: 20 },
      { id: 'visitor_log', text: 'Do you maintain a visitor logbook?', weight: 15 },
      { id: 'vehicle_disinfection', text: 'Are vehicles disinfected before entering?', weight: 25 },
      { id: 'restricted_areas', text: 'Are production areas clearly marked as restricted?', weight: 20 },
      { id: 'entry_protocols', text: 'Do all visitors follow biosecurity protocols?', weight: 20 }
    ]
  },
  {
    id: 'animal_health',
    name: 'Animal Health Management',
    description: 'Health monitoring and disease prevention',
    questions: [
      { id: 'health_monitoring', text: 'Do you conduct daily health checks on animals?', weight: 30 },
      { id: 'vaccination_program', text: 'Is there a comprehensive vaccination program?', weight: 25 },
      { id: 'quarantine_facilities', text: 'Are quarantine facilities available for sick animals?', weight: 20 },
      { id: 'veterinary_visits', text: 'Are regular veterinary inspections conducted?', weight: 15 },
      { id: 'mortality_disposal', text: 'Is there a proper mortality disposal system?', weight: 10 }
    ]
  },
  {
    id: 'feed_water',
    name: 'Feed and Water Security',
    description: 'Safety of feed and water sources',
    questions: [
      { id: 'feed_storage', text: 'Is feed stored in secure, covered areas?', weight: 25 },
      { id: 'water_quality', text: 'Is water quality tested regularly?', weight: 30 },
      { id: 'feed_source', text: 'Do you source feed from approved suppliers only?', weight: 20 },
      { id: 'storage_pest_control', text: 'Are storage areas protected from pests?', weight: 15 },
      { id: 'water_disinfection', text: 'Is water disinfected when necessary?', weight: 10 }
    ]
  },
  {
    id: 'waste_management',
    name: 'Waste Management',
    description: 'Proper handling of farm waste and by-products',
    questions: [
      { id: 'waste_disposal', text: 'Is manure disposed of properly?', weight: 30 },
      { id: 'composting_system', text: 'Is there a proper composting system?', weight: 20 },
      { id: 'drainage_system', text: 'Are drainage systems maintained regularly?', weight: 20 },
      { id: 'contamination_prevention', text: 'Are measures in place to prevent cross-contamination?', weight: 20 },
      { id: 'waste_storage', text: 'Are waste storage areas properly secured?', weight: 10 }
    ]
  }
];

const RiskAssessment = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [farmId, setFarmId] = useState('');
  const [farms, setFarms] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFarms();
    }
  }, [user]);

  const fetchFarms = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      if (!profile) {
        console.error('No profile found for user:', user?.id);
        return;
      }

      const { data: farmsData } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', profile?.id);

      setFarms(farmsData || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const calculateAreaScore = (area: AssessmentArea) => {
    const areaResponses = area.questions.map(q => responses[q.id] || 0);
    const maxScore = area.questions.reduce((sum, q) => sum + (q.weight * 4), 0); // 4 is max score per question
    const actualScore = area.questions.reduce((sum, q, index) => sum + (q.weight * areaResponses[index]), 0);
    return Math.round((actualScore / maxScore) * 100);
  };

  const calculateOverallScore = () => {
    const areaScores = assessmentAreas.map(area => calculateAreaScore(area));
    return Math.round(areaScores.reduce((sum, score) => sum + score, 0) / areaScores.length);
  };

  const handleNext = () => {
    if (currentStep < assessmentAreas.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!farmId) {
      toast({
        title: "Please select a farm",
        description: "You need to select which farm this assessment is for.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const overallScore = calculateOverallScore();
      const areaScores = assessmentAreas.reduce((acc, area) => {
        acc[area.id] = calculateAreaScore(area);
        return acc;
      }, {} as Record<string, number>);

      const { error } = await supabase
        .from('risk_assessments')
        .insert({
          farm_id: farmId,
          overall_score: overallScore,
          areas: { 
            responses,
            area_scores: areaScores 
          },
          recommendations: notes,
          status: 'completed'
        });

      if (error) throw error;

      toast({
        title: "Assessment Completed!",
        description: `Your biosecurity score is ${overallScore}%. Assessment saved successfully.`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error saving assessment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const progress = ((currentStep + 1) / (assessmentAreas.length + 1)) * 100;
  const isOnReviewStep = currentStep === assessmentAreas.length;
  const currentArea = assessmentAreas[currentStep];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Risk Assessment' }]} className="mb-2" />
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold">Risk Assessment</h1>
            </div>
            <p className="text-muted-foreground">
              Complete this comprehensive biosecurity assessment to identify risks and improve your farm's safety measures.
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/dashboard"><Home className="w-4 h-4 mr-2" /> Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">
                  Step {currentStep + 1} of {assessmentAreas.length + 1}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {!isOnReviewStep ? (
            /* Assessment Questions */
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentArea.name}</CardTitle>
                <CardDescription>{currentArea.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Select Farm</label>
                    <Select value={farmId} onValueChange={setFarmId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose which farm to assess" />
                      </SelectTrigger>
                      <SelectContent>
                        {farms.map((farm) => (
                          <SelectItem key={farm.id} value={farm.id}>
                            {farm.name} ({farm.farm_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {currentArea.questions.map((question) => (
                  <div key={question.id} className="space-y-3">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{question.text}</p>
                      <Badge variant="secondary" className="text-xs">
                        Weight: {question.weight}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 1, label: 'Never', color: 'bg-destructive' },
                        { value: 2, label: 'Sometimes', color: 'bg-warning' },
                        { value: 3, label: 'Usually', color: 'bg-secondary' },
                        { value: 4, label: 'Always', color: 'bg-success' }
                      ].map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={responses[question.id] === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setResponses({ ...responses, [question.id]: option.value })}
                          className="h-12 flex flex-col"
                        >
                          <span className="text-xs">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.value}/4</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            /* Review and Submit */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Assessment Results
                  </CardTitle>
                  <CardDescription>
                    Review your scores and add any additional notes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {calculateOverallScore()}%
                      </div>
                      <p className="text-lg font-medium">Overall Biosecurity Score</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assessmentAreas.map((area) => {
                        const score = calculateAreaScore(area);
                        return (
                          <div key={area.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{area.name}</h4>
                              <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
                                {score}%
                              </Badge>
                            </div>
                            <Progress value={score} className="h-2" />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Additional Notes & Recommendations</label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional observations or planned improvements..."
                        className="min-h-24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {!isOnReviewStep ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete Assessment'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RiskAssessment;