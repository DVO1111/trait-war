-- Update profiles table for wallet-first authentication
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_linked BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Update RLS policies to work with wallet authentication
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create new policies for wallet-first auth
CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to handle wallet-first profile creation
CREATE OR REPLACE FUNCTION public.create_wallet_profile(
  p_wallet_address TEXT,
  p_username TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
  result public.profiles;
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (
    user_id,
    wallet_address,
    username,
    display_name,
    bio,
    is_anonymous,
    email_linked,
    last_login
  ) VALUES (
    auth.uid(),
    p_wallet_address,
    p_username,
    p_display_name,
    p_bio,
    true,
    false,
    NOW()
  )
  ON CONFLICT (wallet_address) 
  DO UPDATE SET
    last_login = NOW(),
    user_id = auth.uid()
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update other tables to use user_id instead of wallet addresses where needed
-- Update missions table
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS creator_user_id UUID REFERENCES auth.users(id);

-- Update user_progress table  
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Update user_mission_progress table
ALTER TABLE public.user_mission_progress
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Update mission_submissions table
ALTER TABLE public.mission_submissions
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_missions_creator_user_id ON public.missions(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_auth_user_id ON public.user_progress(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_mission_progress_auth_user_id ON public.user_mission_progress(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_mission_submissions_auth_user_id ON public.mission_submissions(auth_user_id);