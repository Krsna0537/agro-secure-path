-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Create admin user management functions
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT role = 'admin' FROM public.profiles WHERE user_id = auth.uid()), false);
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update RLS policies for admin access
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin' OR auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin' OR auth.uid() = user_id);

-- Admin policies for farms
CREATE POLICY "Admins can view all farms" 
ON public.farms 
FOR SELECT 
USING (public.get_current_user_role() = 'admin' OR owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all farms" 
ON public.farms 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Admin policies for alerts  
CREATE POLICY "Admins can manage alerts" 
ON public.alerts 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Insert sample admin user (you can update this with real admin email)
INSERT INTO public.profiles (user_id, full_name, role) 
VALUES ('00000000-0000-0000-0000-000000000000', 'System Admin', 'admin')
ON CONFLICT (user_id) DO NOTHING;