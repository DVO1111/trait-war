import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/security";
import { User, Session } from "@supabase/supabase-js";

interface WalletProfile {
  id: string;
  user_id: string;
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  warrior_count: number;
  is_anonymous: boolean;
  email_linked: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export const useWalletFirstAuth = () => {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const walletAddress = publicKey?.toBase58();

  // Set up Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && walletAddress) {
          // Load or create profile when authenticated
          await loadOrCreateProfile(walletAddress);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [walletAddress]);

  // Handle wallet connection/disconnection
  useEffect(() => {
    if (connected && walletAddress) {
      authenticateWithWallet();
    } else {
      handleDisconnect();
    }
  }, [connected, walletAddress]);

  const authenticateWithWallet = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);

      // Check if user already has a session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      
      if (existingSession) {
        // User already authenticated, load profile
        await loadOrCreateProfile(walletAddress);
      } else {
        // Sign in anonymously to create a Supabase user
        const { data, error } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              wallet_address: walletAddress,
              is_wallet_auth: true
            }
          }
        });

        if (error) {
          throw error;
        }

        // Profile creation will be handled by the auth state change listener
      }
    } catch (error) {
      console.error('Error authenticating with wallet:', error);
      toast({
        title: "Authentication Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateProfile = async (walletAddr: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddr)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingProfile) {
        // Update existing profile with current user_id
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ 
            user_id: user?.id || (await supabase.auth.getUser()).data.user?.id,
            last_login: new Date().toISOString() 
          })
          .eq('wallet_address', walletAddr)
          .select()
          .single();

        if (updateError) throw updateError;
        setProfile(updatedProfile);
      } else {
        // Create new profile using the database function
        const { data: newProfile, error: createError } = await supabase
          .rpc('create_wallet_profile', {
            p_wallet_address: walletAddr,
            p_display_name: `Warrior ${walletAddr.slice(0, 8)}`,
            p_username: null,
            p_bio: 'Web3 Warrior ready for battle!'
          });

        if (createError) throw createError;
        setProfile(newProfile);
      }

      toast({
        title: "Welcome to Trait Wars! 🚀",
        description: `Connected with ${walletAddr.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Error loading/creating profile:', error);
      toast({
        title: "Profile Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      setProfile(null);
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<WalletProfile>) => {
    if (!profile || !user) {
      throw new Error("Not authenticated");
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  const linkEmailPassword = async (email: string, password: string) => {
    if (!user || !profile) {
      throw new Error("Not authenticated");
    }

    try {
      // Update the user's email and password
      const { error: updateError } = await supabase.auth.updateUser({
        email,
        password
      });

      if (updateError) throw updateError;

      // Update profile to indicate email is linked
      await updateProfile({ email_linked: true, is_anonymous: false });

      toast({
        title: "Email linked successfully! 📧",
        description: "You can now sign in with email and password.",
      });

      return true;
    } catch (error) {
      console.error('Error linking email/password:', error);
      toast({
        title: "Failed to link email",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      await disconnect();
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return {
    // State
    user,
    session,
    profile,
    loading,
    walletAddress,
    connected,
    isAuthenticated: !!user && !!profile,
    
    // Actions
    updateProfile,
    linkEmailPassword,
    signOut,
    
    // Computed
    displayName: profile?.display_name || profile?.username || (walletAddress ? `${walletAddress.slice(0, 8)}...` : 'Unknown'),
    isAnonymous: profile?.is_anonymous ?? true,
    emailLinked: profile?.email_linked ?? false,
  };
};