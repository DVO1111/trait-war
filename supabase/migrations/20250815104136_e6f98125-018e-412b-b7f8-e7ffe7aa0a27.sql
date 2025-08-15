-- Fix security issue: Remove public access to profile data
-- The public_profiles view should not be accessible to anonymous users

-- Drop the overly permissive policy on public_profiles view
DROP POLICY IF EXISTS "Anyone can view public profile information" ON public.public_profiles;

-- Drop the public_profiles view entirely as it's not needed and creates security risks
DROP VIEW IF EXISTS public.public_profiles;

-- Remove the policy that allows authenticated users to view all profiles
DROP POLICY IF EXISTS "Public profile information viewable by authenticated users" ON public.profiles;

-- Ensure only the user-specific policy remains
-- This policy should already exist from the previous migration:
-- "Users can view their own profile only" using (auth.uid() = user_id)

-- Verify no other permissive policies exist by checking if we need to recreate the secure policy
DO $$ 
BEGIN
  -- Check if the secure policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view their own profile only'
  ) THEN
    CREATE POLICY "Users can view their own profile only" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;