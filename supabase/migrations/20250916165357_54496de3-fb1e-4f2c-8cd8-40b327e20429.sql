-- Add role column to profiles table with proper default
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

-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own farms" ON public.farms;
DROP POLICY IF EXISTS "Users can update their own farms" ON public.farms;
DROP POLICY IF EXISTS "Alerts are viewable by authenticated users" ON public.alerts;

-- Create enhanced RLS policies for admin access
CREATE POLICY "Users and admins can view profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin' OR auth.uid() = user_id);

CREATE POLICY "Users and admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin' OR auth.uid() = user_id);

-- Enhanced farm policies for admins
CREATE POLICY "Users and admins can view farms" 
ON public.farms 
FOR SELECT 
USING (public.get_current_user_role() = 'admin' OR owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users and admins can manage farms" 
ON public.farms 
FOR ALL 
USING (public.get_current_user_role() = 'admin' OR owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Admin policies for alerts  
CREATE POLICY "Everyone can view active alerts" 
ON public.alerts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can insert alerts" 
ON public.alerts 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update alerts" 
ON public.alerts 
FOR UPDATE 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete alerts" 
ON public.alerts 
FOR DELETE 
USING (public.get_current_user_role() = 'admin');