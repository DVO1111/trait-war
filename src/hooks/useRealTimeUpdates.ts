import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealTimeUpdates = (
  onMissionUpdate?: () => void,
  onLeaderboardUpdate?: () => void,
  onSubmissionUpdate?: () => void
) => {
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Create a channel for real-time updates
    channelRef.current = supabase
      .channel('trait-wars-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions'
        },
        (payload) => {
          console.log('Mission update:', payload);
          if (onMissionUpdate) {
            onMissionUpdate();
          }
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Mission Available! 🎯",
              description: `A new mission "${payload.new.title}" has been created`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_submissions'
        },
        (payload) => {
          console.log('Submission update:', payload);
          if (onSubmissionUpdate) {
            onSubmissionUpdate();
          }
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
            toast({
              title: "Mission Approved! 🎉",
              description: `Your mission submission has been approved and XP awarded`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress'
        },
        (payload) => {
          console.log('Progress update:', payload);
          if (onLeaderboardUpdate) {
            onLeaderboardUpdate();
          }
          
          if (payload.eventType === 'UPDATE' && payload.new.total_xp > payload.old.total_xp) {
            const xpGained = payload.new.total_xp - payload.old.total_xp;
            toast({
              title: "XP Updated! ⚡",
              description: `Your XP has been updated (+${xpGained} XP)`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [onMissionUpdate, onLeaderboardUpdate, onSubmissionUpdate, toast]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
};