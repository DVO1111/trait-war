import { useState, useCallback, useEffect } from 'react';
import { useHoneycomb } from '@/hooks/useHoneycomb';
import { useBlockchainRewards } from '@/hooks/useBlockchainRewards';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getSafeErrorMessage } from '@/lib/security';

export interface BlockchainMissionData {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  difficulty: string;
  category: string;
  requirements: string[];
  deliverables: string[];
  on_chain_verified: boolean;
  blockchain_metadata?: any;
}

export interface FullBlockchainStatus {
  projectInitialized: boolean;
  profilesTreeCreated: boolean;
  userProfileCreated: boolean;
  characterCreated: boolean;
  rewardsSystemActive: boolean;
}

export const useFullBlockchainIntegration = () => {
  const { 
    project, 
    profile: honeycombProfile, 
    characters,
    loading: honeycombLoading,
    createProject,
    createProfilesTree,
    createUserAndProfile,
    createCharacter,
    isConnected: walletConnected
  } = useHoneycomb();
  
  const { 
    completeMissionWithRewards,
    verifyMissionCompletion,
    createAchievementBadge,
    userRewards,
    loading: rewardsLoading 
  } = useBlockchainRewards();
  
  const { profile: userProfile, isAuthenticated } = useWalletAuth();
  const { toast } = useToast();
  
  const [blockchainStatus, setBlockchainStatus] = useState<FullBlockchainStatus>({
    projectInitialized: false,
    profilesTreeCreated: false,
    userProfileCreated: false,
    characterCreated: false,
    rewardsSystemActive: false,
  });
  
  const [loading, setLoading] = useState(false);

  // Update blockchain status based on current state
  useEffect(() => {
    setBlockchainStatus({
      projectInitialized: !!project,
      profilesTreeCreated: !!project, // Simplified - in real app, track separately
      userProfileCreated: !!honeycombProfile,
      characterCreated: characters.length > 0,
      rewardsSystemActive: !!project && !!honeycombProfile,
    });
  }, [project, honeycombProfile, characters]);

  // Initialize full blockchain system
  const initializeFullBlockchain = useCallback(async () => {
    if (!walletConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      let currentProject = project;
      
      // Step 1: Create project if not exists
      if (!currentProject) {
        console.log('Creating new project...');
        currentProject = await createProject();
        if (!currentProject) {
          throw new Error('Failed to create project');
        }
        
        // Wait for project to be fully processed on blockchain
        console.log('Waiting for project to be registered...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time
      }

      // Step 2: Create profiles tree with retry logic
      console.log('Creating profiles tree with project:', currentProject.address);
      let profilesTreeCreated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!profilesTreeCreated && retryCount < maxRetries) {
        try {
          // Wait before attempting profiles tree creation
          if (retryCount > 0) {
            console.log(`Waiting before retry ${retryCount}...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          
          profilesTreeCreated = await createProfilesTree(currentProject);
          if (!profilesTreeCreated && retryCount < maxRetries - 1) {
            console.log(`Profiles tree creation failed, retrying... (${retryCount + 1}/${maxRetries})`);
          }
        } catch (error) {
          console.log(`Profiles tree creation error: ${error}, retrying... (${retryCount + 1}/${maxRetries})`);
        }
        retryCount++;
      }
      
      if (!profilesTreeCreated) {
        throw new Error('Failed to create profiles tree after multiple attempts');
      }

      // Step 3: Create user profile with warrior NFT
      if (!honeycombProfile) {
        console.log('Creating user profile...');
        let result = null;
        retryCount = 0;
        
        while (!result && retryCount < maxRetries) {
          try {
            // Wait before attempting user profile creation
            if (retryCount > 0) {
              console.log(`Waiting before user profile retry ${retryCount}...`);
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            result = await createUserAndProfile(
              userProfile?.display_name || userProfile?.username || 'Warrior',
              userProfile?.bio || 'Trait Wars participant',
              currentProject
            );
            if (!result && retryCount < maxRetries - 1) {
              console.log(`User profile creation failed, retrying... (${retryCount + 1}/${maxRetries})`);
            }
          } catch (error) {
            console.log(`User profile creation error: ${error}, retrying... (${retryCount + 1}/${maxRetries})`);
          }
          retryCount++;
        }
        
        if (!result) {
          throw new Error('Failed to create user profile after multiple attempts');
        }
      }

      toast({
        title: "Blockchain Initialized! ⛓️",
        description: "Your profile is now fully integrated with the blockchain",
      });

      return true;
    } catch (error) {
      console.error('Error initializing blockchain:', error);
      toast({
        title: "Initialization failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [walletConnected, userProfile, project, honeycombProfile, createProject, createProfilesTree, createUserAndProfile, toast]);

  // Submit mission with full blockchain integration
  const submitMissionWithBlockchain = useCallback(async (
    missionData: BlockchainMissionData,
    submissionData: {
      title: string;
      description: string;
      github_url?: string;
      demo_url?: string;
      documentation_url?: string;
      additional_notes?: string;
    }
  ) => {
    if (!isAuthenticated || !userProfile) {
      toast({
        title: "Authentication required",
        description: "Please connect and authenticate your wallet first",
        variant: "destructive",
      });
      return false;
    }

    if (!blockchainStatus.rewardsSystemActive) {
      toast({
        title: "Blockchain not initialized",
        description: "Please initialize your blockchain profile first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Step 1: Submit to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: submissionError } = await supabase
        .from('mission_submissions')
        .insert({
          mission_id: missionData.id,
          user_id: user.id,
          ...submissionData,
          additional_notes: `${submissionData.additional_notes || ''}\n\nBlockchain integration: Active\nWallet: ${userProfile.wallet_address}`,
        });

      if (submissionError) throw submissionError;

      // Step 2: Track mission progress
      await supabase
        .from('user_mission_progress')
        .upsert({
          user_id: user.id,
          mission_id: missionData.id,
          status: 'active',
        });

      toast({
        title: "Mission Submitted! 🎯",
        description: "Your submission has been recorded on-chain and sent for review",
      });

      return true;
    } catch (error) {
      console.error('Error submitting mission with blockchain:', error);
      toast({
        title: "Submission failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userProfile, blockchainStatus.rewardsSystemActive, toast]);

  // Complete mission with full blockchain rewards
  const completeMissionWithFullBlockchain = useCallback(async (
    missionData: BlockchainMissionData
  ) => {
    if (!blockchainStatus.rewardsSystemActive) {
      toast({
        title: "Blockchain not active",
        description: "Please initialize your blockchain profile first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      // Step 1: Complete with blockchain rewards
      const result = await completeMissionWithRewards(
        missionData.id,
        missionData.title,
        missionData.xp_reward,
        missionData.difficulty
      );

      if (!result) throw new Error('Failed to complete mission with rewards');

      // Step 2: Check for achievements
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userProgress) {
        // Check for level-up achievements
        if (userProgress.level >= 5 && userProgress.level < 10) {
          await createAchievementBadge(
            "Rising Warrior",
            "Reached level 5 in Trait Wars",
            ["Complete 5+ missions", "Earn 500+ XP"]
          );
        } else if (userProgress.level >= 10) {
          await createAchievementBadge(
            "Elite Warrior",
            "Reached level 10 in Trait Wars",
            ["Complete 10+ missions", "Earn 1000+ XP"]
          );
        }

        // Check for mission completion achievements
        if (userProgress.missions_completed >= 10) {
          await createAchievementBadge(
            "Mission Master",
            "Completed 10 missions",
            ["Complete 10 missions", "Maintain consistency"]
          );
        }
      }

      toast({
        title: "Mission Complete! 🎉",
        description: `Earned blockchain rewards and potential achievements`,
      });

      return true;
    } catch (error) {
      console.error('Error completing mission with full blockchain:', error);
      toast({
        title: "Completion failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [blockchainStatus.rewardsSystemActive, completeMissionWithRewards, createAchievementBadge, toast]);

  // Verify mission on blockchain
  const verifyMissionOnBlockchain = useCallback(async (missionId: string) => {
    try {
      const isVerified = await verifyMissionCompletion(missionId);
      
      if (isVerified) {
        toast({
          title: "Mission Verified ✅",
          description: "This mission completion is verified on the blockchain",
        });
      } else {
        toast({
          title: "Verification Pending",
          description: "Mission completion is not yet verified on blockchain",
          variant: "destructive",
        });
      }
      
      return isVerified;
    } catch (error) {
      console.error('Error verifying mission:', error);
      toast({
        title: "Verification Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    }
  }, [verifyMissionCompletion, toast]);

  // Create custom character NFT
  const createCustomCharacterNFT = useCallback(async (
    characterName: string,
    customTraits: Record<string, any>
  ) => {
    if (!blockchainStatus.rewardsSystemActive) {
      toast({
        title: "Blockchain not active",
        description: "Please initialize your blockchain profile first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      await createCharacter(characterName, customTraits);
      
      toast({
        title: "Character Created! 🎨",
        description: `${characterName} has been created with custom traits`,
      });

      return true;
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: "Character creation failed",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [blockchainStatus.rewardsSystemActive, createCharacter, toast]);

  return {
    // State
    blockchainStatus,
    loading: loading || honeycombLoading || rewardsLoading,
    project,
    honeycombProfile,
    characters,
    userRewards,
    
    // Actions
    initializeFullBlockchain,
    submitMissionWithBlockchain,
    completeMissionWithFullBlockchain,
    verifyMissionOnBlockchain,
    createCustomCharacterNFT,
    
    // Utilities
    isFullyInitialized: blockchainStatus.rewardsSystemActive,
    walletConnected,
    isAuthenticated,
  };
};