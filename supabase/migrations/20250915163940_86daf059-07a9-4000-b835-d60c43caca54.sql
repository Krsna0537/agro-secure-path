-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  farm_type TEXT CHECK (farm_type IN ('pig', 'poultry', 'mixed')),
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  farm_type TEXT NOT NULL CHECK (farm_type IN ('pig', 'poultry', 'mixed')),
  location TEXT NOT NULL,
  size_hectares DECIMAL,
  animal_count INTEGER DEFAULT 0,
  registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  areas JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT,
  status TEXT CHECK (status IN ('draft', 'completed', 'reviewed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training modules table
CREATE TABLE public.training_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  duration_minutes INTEGER DEFAULT 0,
  farm_type TEXT CHECK (farm_type IN ('pig', 'poultry', 'mixed', 'general')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user training progress table
CREATE TABLE public.user_training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Create compliance records table
CREATE TABLE public.compliance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('compliant', 'non_compliant', 'pending', 'expired')) DEFAULT 'pending',
  certificate_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('disease_outbreak', 'compliance', 'biosecurity', 'weather', 'system')) NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  location TEXT,
  farm_type TEXT CHECK (farm_type IN ('pig', 'poultry', 'mixed', 'all')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create biosecurity scores table
CREATE TABLE public.biosecurity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  category_scores JSONB NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biosecurity_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for farms
CREATE POLICY "Users can view their own farms" ON public.farms FOR SELECT USING (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their own farms" ON public.farms FOR INSERT WITH CHECK (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own farms" ON public.farms FOR UPDATE USING (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for risk assessments
CREATE POLICY "Users can view their farm assessments" ON public.risk_assessments FOR SELECT USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert their farm assessments" ON public.risk_assessments FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can update their farm assessments" ON public.risk_assessments FOR UPDATE USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- RLS Policies for training modules (public read)
CREATE POLICY "Training modules are viewable by authenticated users" ON public.training_modules FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for user training progress
CREATE POLICY "Users can view their own training progress" ON public.user_training_progress FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their own training progress" ON public.user_training_progress FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users can update their own training progress" ON public.user_training_progress FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for compliance records
CREATE POLICY "Users can view their farm compliance records" ON public.compliance_records FOR SELECT USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert their farm compliance records" ON public.compliance_records FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can update their farm compliance records" ON public.compliance_records FOR UPDATE USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- RLS Policies for alerts (public read for authenticated users)
CREATE POLICY "Alerts are viewable by authenticated users" ON public.alerts FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for biosecurity scores
CREATE POLICY "Users can view their farm biosecurity scores" ON public.biosecurity_scores FOR SELECT USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));
CREATE POLICY "Users can insert their farm biosecurity scores" ON public.biosecurity_scores FOR INSERT WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON public.risk_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON public.training_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_training_progress_updated_at BEFORE UPDATE ON public.user_training_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON public.compliance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample training modules
INSERT INTO public.training_modules (title, description, content, duration_minutes, farm_type, difficulty_level) VALUES
  ('Basic Biosecurity Principles', 'Introduction to fundamental biosecurity concepts for livestock farms', 'Comprehensive overview of biosecurity measures including quarantine, sanitation, and visitor protocols.', 45, 'general', 'beginner'),
  ('Poultry Disease Prevention', 'Advanced disease prevention strategies for poultry operations', 'In-depth coverage of avian influenza prevention, vaccination protocols, and early detection methods.', 60, 'poultry', 'intermediate'),
  ('Pig Farm Hygiene Protocols', 'Essential hygiene practices for pig farming operations', 'Detailed protocols for cleaning, disinfection, and waste management in pig operations.', 50, 'pig', 'intermediate'),
  ('Emergency Response Planning', 'Creating and implementing emergency response plans', 'Step-by-step guide to developing emergency protocols for disease outbreaks and biosecurity breaches.', 75, 'general', 'advanced');

-- Insert sample alerts
INSERT INTO public.alerts (title, message, alert_type, severity, location, farm_type) VALUES
  ('Avian Influenza Alert', 'H5N1 detected in neighboring region. Implement enhanced biosecurity measures immediately.', 'disease_outbreak', 'high', 'Northern Region', 'poultry'),
  ('Compliance Deadline Reminder', 'Annual biosecurity certification renewal due within 30 days.', 'compliance', 'medium', 'All Regions', 'all'),
  ('Weather Advisory', 'Heavy rains expected. Check drainage systems and prepare for flooding risks.', 'weather', 'medium', 'Central Region', 'all');