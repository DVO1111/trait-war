-- Fix critical security issue: Remove overly permissive profile access policy
-- The "Authenticated users can view profiles" policy allows ANY authenticated user 
-- to view ALL user profiles, which exposes sensitive personal data

-- Drop the dangerous policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Ensure the secure user-specific policy exists
-- This policy only allows users to view their own profile data
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
    AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Users can view own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
END $$;