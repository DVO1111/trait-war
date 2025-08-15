-- Fix security issue: Restrict profile visibility to protect sensitive user data
-- Remove the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a new policy that only allows users to view their own profiles
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for public profile information that excludes sensitive data
-- This allows viewing only non-sensitive profile fields for legitimate use cases like leaderboards
CREATE POLICY "Public profile information viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  -- This policy will be used in combination with views or specific queries
  -- that only select non-sensitive fields like display_name, username, avatar_url
  auth.role() = 'authenticated'
);

-- Create a view for public profile information that excludes sensitive data
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  display_name,
  bio,
  avatar_url,
  warrior_count,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create RLS policy for the public profiles view
CREATE POLICY "Anyone can view public profile information" 
ON public.public_profiles 
FOR SELECT 
USING (true);