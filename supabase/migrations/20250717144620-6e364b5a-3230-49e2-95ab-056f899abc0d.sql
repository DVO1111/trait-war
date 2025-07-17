-- Fix the create_wallet_profile function to work without auth.uid()
CREATE OR REPLACE FUNCTION public.create_wallet_profile(
  p_wallet_address text,
  p_username text DEFAULT NULL,
  p_display_name text DEFAULT NULL,
  p_bio text DEFAULT NULL
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result public.profiles;
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
  
  RETURN result;
END;
$$;