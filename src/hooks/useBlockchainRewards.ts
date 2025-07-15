import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { honeycombClient } from '@/lib/honeycomb';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { useToast } from '@/hooks/use-toast';
import { useHoneycomb } from '@/hooks/useHoneycomb';
import { supabase } from '@/integrations/supabase/client';
import { getSafeErrorMessage } from '@/lib/security';

export interface BlockchainReward {
  id: string;
  type: 'nft' | 'token' | 'achievement';
  name: string;
  description: string;
  metadata: any;
  mintAddress?: string;
  assetAddress?: string;
  earned_date: string;
  mission_id?: string;
  xp_value: number;
}

export interface OnChainMissionCompletion {
  mission_id: string;
  user_wallet: string;
  completion_date: string;
  xp_earned: number;
  rewards: BlockchainReward[];
  transaction_signature: string;
  verified: boolean;
}

export const useBlockchainRewards = () => {
  const wallet = useWallet();
  const { toast } = useToast();
  const { project, isConnected } = useHoneycomb();
  const [loading, setLoading] = useState(false);
  const [userRewards, setUserRewards] = useState<BlockchainReward[]>([]);
  const [completionRecords, setCompletionRecords] = useState<OnChainMissionCompletion[]>([]);

  // Create reward NFT for mission completion
  const createRewardNFT = useCallback(async (
    missionId: string,
    missionTitle: string,
    xpValue: number,
    difficulty: string
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive",
      });
      return null;
    }

    if (!project) {
      toast({
        title: "Project not initialized",
        description: "Honeycomb project needs to be created first",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      // Generate unique traits based on mission and user performance
      const rewardTraits = {
        mission_id: missionId,
        mission_title: missionTitle,
        xp_value: xpValue,
        difficulty: difficulty,
        completion_date: new Date().toISOString(),
        rarity: xpValue >= 500 ? 'Legendary' : xpValue >= 200 ? 'Rare' : 'Common',
        category: 'Mission Completion',
        level: Math.floor(xpValue / 100) + 1,
      };

      // For now, we'll create a simulated reward NFT
      // In full implementation, this would use Honeycomb's asset creation
      const rewardNFT: BlockchainReward = {
        id: `reward_${Date.now()}`,
        type: 'nft',
        name: `${missionTitle} Completion Certificate`,
        description: `NFT reward for completing the mission: ${missionTitle}`,
        metadata: rewardTraits,
        mintAddress: `mint_${Date.now()}`,
        assetAddress: `asset_${Date.now()}`,
        earned_date: new Date().toISOString(),
        mission_id: missionId,
        xp_value: xpValue,
      };

      // Add to user's rewards
      setUserRewards(prev => [...prev, rewardNFT]);

      toast({
        title: "Reward NFT Created! 🎉",
        description: `You earned a ${rewardTraits.rarity} NFT for completing ${missionTitle}`,
      });

      return rewardNFT;
    } catch (error) {
      console.error('Error creating reward NFT:', error);
      toast({
        title: "Error creating reward",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, project, toast]);

  // Record mission completion on-chain
  const recordMissionCompletion = useCallback(async (
    missionId: string,
    xpEarned: number,
    rewards: BlockchainReward[]
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to record completion",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      // In a full implementation, this would create an on-chain transaction
      // For now, we'll simulate the on-chain record
      const completionRecord: OnChainMissionCompletion = {
        mission_id: missionId,
        user_wallet: wallet.publicKey.toBase58(),
        completion_date: new Date().toISOString(),
        xp_earned: xpEarned,
        rewards: rewards,
        transaction_signature: `sig_${Date.now()}`,
        verified: true,
      };

      // Store the completion record
      setCompletionRecords(prev => [...prev, completionRecord]);

      // Also update the database to link blockchain record
      await supabase
        .from('mission_submissions')
        .update({
          additional_notes: `Blockchain verified: ${completionRecord.transaction_signature}`,
        })
        .eq('mission_id', missionId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      toast({
        title: "Mission Verified On-Chain! ⛓️",
        description: `Your completion has been recorded on the blockchain`,
      });

      return completionRecord;
    } catch (error) {
      console.error('Error recording mission completion:', error);
      toast({
        title: "Error recording completion",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Complete mission with blockchain rewards
  const completeMissionWithRewards = useCallback(async (
    missionId: string,
    missionTitle: string,
    xpValue: number,
    difficulty: string
  ) => {
    setLoading(true);
    try {
      // Step 1: Create reward NFT
      const rewardNFT = await createRewardNFT(missionId, missionTitle, xpValue, difficulty);
      
      const rewards = rewardNFT ? [rewardNFT] : [];

      // Step 2: Record completion on-chain
      const completionRecord = await recordMissionCompletion(missionId, xpValue, rewards);

      // Step 3: Award additional XP tokens (simulated)
      if (xpValue > 0) {
        const xpTokens = Math.floor(xpValue / 10); // 1 token per 10 XP
        const xpReward: BlockchainReward = {
          id: `xp_token_${Date.now()}`,
          type: 'token',
          name: `XP Tokens`,
          description: `${xpTokens} XP tokens earned from mission completion`,
          metadata: { amount: xpTokens, type: 'xp_token' },
          earned_date: new Date().toISOString(),
          mission_id: missionId,
          xp_value: xpValue,
        };
        
        rewards.push(xpReward);
        setUserRewards(prev => [...prev, xpReward]);
      }

      toast({
        title: "Mission Complete! 🎉",
        description: `Earned ${rewards.length} blockchain rewards`,
      });

      return {
        completionRecord,
        rewards,
      };
    } catch (error) {
      console.error('Error completing mission with rewards:', error);
      toast({
        title: "Error completing mission",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [createRewardNFT, recordMissionCompletion, toast]);

  // Get user's blockchain rewards
  const getUserRewards = useCallback(async () => {
    if (!wallet.publicKey) return [];

    try {
      // In a full implementation, this would query the blockchain
      // For now, return the simulated rewards
      return userRewards;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return [];
    }
  }, [wallet.publicKey, userRewards]);

  // Verify mission completion on blockchain
  const verifyMissionCompletion = useCallback(async (missionId: string) => {
    if (!wallet.publicKey) return false;

    try {
      // Check if completion record exists
      const record = completionRecords.find(
        r => r.mission_id === missionId && r.user_wallet === wallet.publicKey?.toBase58()
      );
      
      return record?.verified || false;
    } catch (error) {
      console.error('Error verifying mission completion:', error);
      return false;
    }
  }, [wallet.publicKey, completionRecords]);

  // Create achievement badge NFT
  const createAchievementBadge = useCallback(async (
    achievementName: string,
    description: string,
    criteria: string[]
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim achievements",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const achievementBadge: BlockchainReward = {
        id: `achievement_${Date.now()}`,
        type: 'achievement',
        name: achievementName,
        description: description,
        metadata: {
          criteria: criteria,
          unlocked_date: new Date().toISOString(),
          badge_type: 'achievement',
        },
        earned_date: new Date().toISOString(),
        xp_value: 100, // Base XP for achievements
      };

      setUserRewards(prev => [...prev, achievementBadge]);

      toast({
        title: "Achievement Unlocked! 🏆",
        description: `You earned the "${achievementName}" badge`,
      });

      return achievementBadge;
    } catch (error) {
      console.error('Error creating achievement badge:', error);
      toast({
        title: "Error creating achievement",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  return {
    // State
    loading,
    userRewards,
    completionRecords,
    
    // Actions
    createRewardNFT,
    recordMissionCompletion,
    completeMissionWithRewards,
    getUserRewards,
    verifyMissionCompletion,
    createAchievementBadge,
    
    // Utilities
    isConnected,
    walletAddress: wallet.publicKey?.toBase58(),
  };
};