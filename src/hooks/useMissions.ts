
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFullBlockchainIntegration } from "@/hooks/useFullBlockchainIntegration";

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  xp_reward: number;
  difficulty: string;
  expires_at: string | null;
  creator_id: string | null;
  is_official: boolean;
  requirements: string[];
  deliverables: string[];
  max_participants: number | null;
  created_at: string;
  updated_at: string;
}

export interface MissionSubmission {
  id: string;
  mission_id: string;
  user_id: string;
  title: string;
  description: string;
  github_url: string | null;
  demo_url: string | null;
  documentation_url: string | null;
  additional_notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  reviewed_by: string | null;
  review_notes: string | null;
  xp_awarded: number;
  created_at: string;
  updated_at: string;
}

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMissions(data || []);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch missions');
      toast({
        title: "Error",
        description: "Failed to load missions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitMission = async (
    missionId: string,
    submissionData: {
      title: string;
      description: string;
      github_url?: string;
      demo_url?: string;
      documentation_url?: string;
      additional_notes?: string;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('mission_submissions')
        .insert({
          mission_id: missionId,
          user_id: user.id,
          ...submissionData,
        });

      if (error) throw error;

      // Also track this mission as started
      await supabase
        .from('user_mission_progress')
        .upsert({
          user_id: user.id,
          mission_id: missionId,
          status: 'active',
        });

      toast({
        title: "Mission Submitted! 🎉",
        description: "Your submission has been sent for review.",
      });
      
      return true;
    } catch (err) {
      console.error('Error submitting mission:', err);
      toast({
        title: "Submission Error",
        description: err instanceof Error ? err.message : "Failed to submit mission",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUserMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_mission_progress')
        .select(`
          *,
          missions (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user missions:', err);
      return [];
    }
  };

  const getUserSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          missions (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  return {
    missions,
    loading,
    error,
    refetch: fetchMissions,
    submitMission,
    getUserMissions,
    getUserSubmissions,
  };
};
