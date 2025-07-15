import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mission, MissionSubmission } from "@/hooks/useMissions";

export interface CreatorMission extends Mission {
  submission_count: number;
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
}

export interface CreatorSubmission extends MissionSubmission {
  mission: Mission;
  user_profile: {
    username: string | null;
    display_name: string | null;
  };
}

export interface CreatorNotification {
  id: string;
  creator_id: string;
  mission_id: string;
  submission_id: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  mission?: Mission;
  submission?: MissionSubmission;
}

export const useCreator = () => {
  const [creatorMissions, setCreatorMissions] = useState<CreatorMission[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<CreatorSubmission[]>([]);
  const [notifications, setNotifications] = useState<CreatorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCreatorMissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('missions')
        .select(`
          *,
          mission_submissions (
            id,
            status
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include submission counts
      const transformedMissions = data?.map(mission => ({
        ...mission,
        submission_count: mission.mission_submissions.length,
        pending_submissions: mission.mission_submissions.filter(s => s.status === 'pending').length,
        approved_submissions: mission.mission_submissions.filter(s => s.status === 'approved').length,
        rejected_submissions: mission.mission_submissions.filter(s => s.status === 'rejected').length,
      })) || [];

      setCreatorMissions(transformedMissions);
    } catch (err) {
      console.error('Error fetching creator missions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch creator missions');
    }
  };

  const fetchPendingSubmissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mission_submissions')
        .select(`
          *,
          missions!inner (*)
        `)
        .eq('missions.creator_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles separately to avoid foreign key issues
      const userIds = data?.map(s => s.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, display_name, wallet_address')
        .in('wallet_address', userIds);

      const transformedSubmissions = data?.map(submission => {
        const userProfile = profiles?.find(p => p.wallet_address === submission.user_id);
        return {
          ...submission,
          mission: submission.missions,
          user_profile: userProfile || { username: null, display_name: null }
        };
      }) || [];

      setPendingSubmissions(transformedSubmissions as CreatorSubmission[]);
    } catch (err) {
      console.error('Error fetching pending submissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending submissions');
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('creator_notifications')
        .select(`
          *,
          missions (
            id,
            title
          ),
          mission_submissions (
            id,
            title,
            user_id
          )
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const reviewSubmission = async (
    submissionId: string, 
    status: 'approved' | 'rejected' | 'in_review',
    feedback?: string
  ) => {
    try {
      const { error } = await supabase
        .from('mission_submissions')
        .update({
          status,
          review_feedback: feedback || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;

      // Refresh data
      await fetchPendingSubmissions();
      await fetchCreatorMissions();

      toast({
        title: `Submission ${status === 'approved' ? 'Approved' : 'Rejected'}! ✅`,
        description: `The submission has been ${status}.`,
      });

      return true;
    } catch (err) {
      console.error('Error reviewing submission:', err);
      toast({
        title: "Review Error",
        description: err instanceof Error ? err.message : "Failed to review submission",
        variant: "destructive",
      });
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('creator_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getUnreadNotificationCount = () => {
    return notifications.filter(n => !n.is_read).length;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCreatorMissions(),
        fetchPendingSubmissions(),
        fetchNotifications()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Set up real-time subscription for new submissions
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('creator_notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'creator_notifications',
            filter: `creator_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('New notification received:', payload);
            fetchNotifications();
            fetchPendingSubmissions();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    setupSubscription();
  }, []);

  return {
    creatorMissions,
    pendingSubmissions,
    notifications,
    loading,
    error,
    reviewSubmission,
    markNotificationAsRead,
    getUnreadNotificationCount,
    refetch: () => Promise.all([
      fetchCreatorMissions(),
      fetchPendingSubmissions(),
      fetchNotifications()
    ])
  };
};