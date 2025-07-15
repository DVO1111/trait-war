import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProgress {
  id: string;
  user_id: string;
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

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProgress(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // If no progress exists, create it
      if (!data) {
        const { data: newProgress, error: createError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            total_xp: 0,
            level: 1,
            current_level_xp: 0,
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
      console.error('Error fetching user progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProgress = async (updates: Partial<UserProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !progress) return;

      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProgress(data);
    } catch (err) {
      console.error('Error updating user progress:', err);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const awardXP = async (xpAmount: number, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !progress) return;

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

  const calculateXPForLevel = (level: number) => {
    return level * 100 + (level - 1) * 50;
  };

  const getXPToNextLevel = () => {
    if (!progress) return 0;
    const xpForNextLevel = calculateXPForLevel(progress.level + 1);
    const xpForCurrentLevel = progress.level > 1 ? calculateXPForLevel(progress.level) : 0;
    return xpForNextLevel - xpForCurrentLevel - progress.current_level_xp;
  };

  const getProgressToNextLevel = () => {
    if (!progress) return 0;
    const xpForNextLevel = calculateXPForLevel(progress.level + 1);
    const xpForCurrentLevel = progress.level > 1 ? calculateXPForLevel(progress.level) : 0;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return (progress.current_level_xp / xpNeededForLevel) * 100;
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  return {
    progress,
    loading,
    error,
    refetch: fetchUserProgress,
    updateUserProgress,
    awardXP,
    calculateXPForLevel,
    getXPToNextLevel,
    getProgressToNextLevel,
  };
};