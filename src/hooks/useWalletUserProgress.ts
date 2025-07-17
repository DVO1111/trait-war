import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";

export interface WalletUserProgress {
  id: string;
  user_id: string | null;
  profile_id: string | null;
  total_xp: number;
  level: number;
  current_level_xp: number;
  missions_completed: number;
  streak_days: number;
  last_activity_date: string | null;
  traits: any;
  created_at: string;
  updated_at: string;
}

export const useWalletUserProgress = () => {
  const [progress, setProgress] = useState<WalletUserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { publicKey } = useWallet();

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const walletAddress = publicKey?.toBase58();
      if (!walletAddress) {
        setProgress(null);
        return;
      }

      // Get profile first to find user progress
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProgress(null);
        return;
      }

      // Now get user progress using profile_id
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no progress exists, it should have been created by the create_wallet_profile function
      // But let's check and create it if it doesn't exist
      if (!data) {
        const { data: newProgress, error: createError } = await supabase
          .from('user_progress')
          .insert({
            user_id: null,
            profile_id: profile.id,
            total_xp: 200, // Welcome bonus
            level: 1,
            current_level_xp: 200,
            missions_completed: 0,
            streak_days: 0,
            traits: {},
          })
          .select()
          .single();

        if (createError) throw createError;
        setProgress(newProgress);
      } else {
        setProgress(data);
      }
    } catch (err) {
      console.error('Error fetching wallet user progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProgress = async (updates: Partial<WalletUserProgress>) => {
    try {
      const walletAddress = publicKey?.toBase58();
      if (!walletAddress || !progress) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('profile_id', profile.id)
        .select()
        .single();

      if (error) throw error;
      
      setProgress(data);
    } catch (err) {
      console.error('Error updating wallet user progress:', err);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const awardXP = async (xpAmount: number, reason: string) => {
    try {
      if (!progress) return;

      const newTotalXP = progress.total_xp + xpAmount;
      const newMissionsCompleted = progress.missions_completed + 1;
      
      await updateUserProgress({
        total_xp: newTotalXP,
        missions_completed: newMissionsCompleted,
        last_activity_date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: "XP Earned! 🎉",
        description: `+${xpAmount} XP for ${reason}`,
      });
    } catch (err) {
      console.error('Error awarding XP:', err);
    }
  };

  const deductXP = async (xpAmount: number, reason: string) => {
    try {
      if (!progress) return false;

      if (progress.total_xp < xpAmount) {
        toast({
          title: "Insufficient XP",
          description: `You need ${xpAmount} XP but only have ${progress.total_xp} XP.`,
          variant: "destructive",
        });
        return false;
      }

      const newTotalXP = progress.total_xp - xpAmount;
      
      await updateUserProgress({
        total_xp: newTotalXP,
        last_activity_date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: "XP Deducted",
        description: `-${xpAmount} XP for ${reason}`,
      });

      return true;
    } catch (err) {
      console.error('Error deducting XP:', err);
      return false;
    }
  };

  const addPurchasedXP = async (xpAmount: number) => {
    try {
      if (!progress) return false;

      const newTotalXP = progress.total_xp + xpAmount;
      
      await updateUserProgress({
        total_xp: newTotalXP,
        last_activity_date: new Date().toISOString().split('T')[0],
      });

      return true;
    } catch (err) {
      console.error('Error adding purchased XP:', err);
      return false;
    }
  };

  const calculateXPForLevel = (level: number) => {
    return level * 100 + (level - 1) * 50;
  };

  const getXPToNextLevel = () => {
    if (!progress) return 0;
    const xpForNextLevel = calculateXPForLevel(progress.level + 1);
    const xpForCurrentLevel = progress.level > 1 ? calculateXPForLevel(progress.level) : 0;
    return xpForNextLevel - xpForCurrentLevel - progress.current_level_xp;
  };

  const getXPNeededForNextLevel = () => {
    if (!progress) return 0;
    const xpForNextLevel = calculateXPForLevel(progress.level + 1);
    const xpForCurrentLevel = progress.level > 1 ? calculateXPForLevel(progress.level) : 0;
    return xpForNextLevel - xpForCurrentLevel;
  };

  const getProgressToNextLevel = () => {
    if (!progress) return 0;
    const xpNeededForLevel = getXPNeededForNextLevel();
    return (progress.current_level_xp / xpNeededForLevel) * 100;
  };

  useEffect(() => {
    if (publicKey) {
      fetchUserProgress();
    } else {
      setProgress(null);
      setLoading(false);
    }
  }, [publicKey]);

  return {
    progress,
    loading,
    error,
    refetch: fetchUserProgress,
    updateUserProgress,
    awardXP,
    deductXP,
    addPurchasedXP,
    calculateXPForLevel,
    getXPToNextLevel,
    getXPNeededForNextLevel,
    getProgressToNextLevel,
  };
};