-- Update user_progress table to work with wallet-based users
-- Add profile_id column to reference the profiles table
ALTER TABLE public.user_progress ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the create_wallet_profile function to properly create user progress
CREATE OR REPLACE FUNCTION public.create_wallet_profile(p_wallet_address text, p_username text DEFAULT NULL::text, p_display_name text DEFAULT NULL::text, p_bio text DEFAULT NULL::text)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result public.profiles;
  existing_profile_id uuid;
BEGIN
  -- Insert or update profile (don't use auth.uid() since we're doing wallet-first auth)
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
    NULL, -- Don't use auth.uid() for wallet-first auth
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
    username = p_username,
    display_name = p_display_name,
    bio = p_bio,
    last_login = NOW()
  RETURNING * INTO result;
  
  -- Check if user_progress already exists for this profile
  SELECT profile_id INTO existing_profile_id 
  FROM public.user_progress 
  WHERE profile_id = result.id;
  
  -- Create user_progress entry with 200XP welcome bonus only if it doesn't exist
  IF existing_profile_id IS NULL THEN
    INSERT INTO public.user_progress (
      user_id,
      profile_id,
      total_xp,
      level,
      current_level_xp,
      missions_completed,
      streak_days,
      last_activity_date
    ) VALUES (
      NULL, -- Don't use auth.uid() for wallet-first auth
      result.id, -- Reference the profile
      200, -- Welcome bonus
      1,
      200,
      0,
      0,
      CURRENT_DATE
    );
  END IF;
  
  RETURN result;
END;
$function$