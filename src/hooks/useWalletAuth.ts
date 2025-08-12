import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PublicKey } from "@solana/web3.js";
import { getSafeErrorMessage } from "@/lib/security";

interface Profile {
  id: string;
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  warrior_count: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export const useWalletAuth = () => {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const walletAddress = publicKey?.toBase58();

  // Check if user has a profile when wallet connects
  useEffect(() => {
    if (connected && walletAddress) {
      checkOrCreateProfile();
    } else {
      setProfile(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [connected, walletAddress]);

  const checkOrCreateProfile = async () => {
    if (!walletAddress) return;

    try {
      setLoading(true);
      
      // Check if profile exists via secure RPC
      const { data, error } = await (supabase as any)
        .rpc('get_profile_by_wallet', { p_wallet_address: walletAddress });

      if (error) {
        console.error('Error checking profile via RPC:', error);
        return;
      }

      const existingProfile = Array.isArray(data) ? data[0] : data;

      if (existingProfile) {
        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('wallet_address', walletAddress);

        setProfile(existingProfile);
        setIsAuthenticated(true);
        
        toast({
          title: "Welcome back!",
          description: `Connected as ${existingProfile.display_name || existingProfile.username || walletAddress.slice(0, 8)}...`,
        });
      } else {
        // New user - they'll need to complete profile setup
        setIsAuthenticated(true);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error in checkOrCreateProfile:', error);
      toast({
        title: "Connection Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithWallet = useCallback(async () => {
    if (!publicKey || !signMessage) {
      toast({
        title: "Wallet not ready",
        description: "Please ensure your wallet is connected and supports message signing.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      // Create a message to sign for authentication
      const message = new TextEncoder().encode(
        `Sign this message to authenticate with Trait Wars.\n\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`
      );

      // Sign the message
      const signature = await signMessage(message);
      
      // Verify signature (basic verification - in production you'd want more robust verification)
      if (!signature) {
        throw new Error("Failed to sign message");
      }

      // Authentication successful
      await checkOrCreateProfile();
      return true;

    } catch (error) {
      console.error('Error signing in with wallet:', error);
      toast({
        title: "Authentication Failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, toast]);

  const createProfile = async (userData: {
    username: string;
    displayName: string;
    bio?: string;
  }) => {
    if (!walletAddress) {
      throw new Error("Wallet not connected");
    }

    try {
      // Use the database function to create wallet profile (bypasses RLS)
      const { data, error } = await supabase
        .rpc('create_wallet_profile', {
          p_wallet_address: walletAddress,
          p_username: userData.username,
          p_display_name: userData.displayName,
          p_bio: userData.bio || null,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error("Username already taken. Please choose a different username.");
        }
        throw error;
      }

      setProfile(data);
      
      toast({
        title: "Profile Created!",
        description: `Welcome to Trait Wars, ${userData.displayName}!`,
      });

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!walletAddress || !profile) {
      throw new Error("Not authenticated");
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('wallet_address', walletAddress)
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

  const signOut = async () => {
    try {
      await disconnect();
      setProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error disconnecting",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return {
    // State
    profile,
    loading,
    isAuthenticated,
    walletAddress,
    connected,
    
    // Actions
    signInWithWallet,
    createProfile,
    updateProfile,
    signOut,
    
    // Computed
    needsProfileSetup: isAuthenticated && !profile,
    displayName: profile?.display_name || profile?.username || (walletAddress ? `${walletAddress.slice(0, 8)}...` : 'Unknown'),
  };
};