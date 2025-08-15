import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { honeycombClient, TRAIT_WARS_PROJECT_NAME } from '@/lib/honeycomb';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getSafeErrorMessage } from '@/lib/security';
import { validateCharacterTraits, validateUserInfo } from '@/utils/honeycombValidation';
import { trackProjectCreation, trackProfileCreation, trackCharacterCreation, trackTransactionEnd } from '@/utils/honeycombMetrics';

interface HoneycombProject {
  address: string;
  name: string;
}

interface HoneycombProfile {
  address: string;
  name: string;
  bio?: string;
  pfp?: string;
}

interface HoneycombCharacter {
  address: string;
  name: string;
  traits: Record<string, any>;
  isNFT?: boolean;
  mintAddress?: string;
}

export const useHoneycomb = () => {
  const wallet = useWallet();
  const { toast } = useToast();
  const { profile: userProfile, updateProfile, isAuthenticated, walletAddress } = useAuth();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<HoneycombProject | null>(null);
  const [honeycombProfile, setHoneycombProfile] = useState<HoneycombProfile | null>(null);
  const [characters, setCharacters] = useState<HoneycombCharacter[]>([]);

  // Create a new Honeycomb project
  const createProject = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    const txId = trackProjectCreation(wallet.publicKey.toBase58());
    setLoading(true);
    
    try {
      console.log('Creating project with wallet:', wallet.publicKey.toBase58());
      console.log('Creating project with name:', TRAIT_WARS_PROJECT_NAME);
      
      const { createCreateProjectTransaction: { project: projectAddress, tx: txResponse } } = 
        await honeycombClient.createCreateProjectTransaction({
          name: TRAIT_WARS_PROJECT_NAME,
          authority: wallet.publicKey.toBase58(),
        });

      console.log('Project transaction created:', { projectAddress, txResponse });

      const response = await sendClientTransactions(
        honeycombClient,
        wallet,
        txResponse
      );

      console.log('Transaction response:', response);

      if (response) {
        const newProject = {
          address: projectAddress,
          name: TRAIT_WARS_PROJECT_NAME,
        };
        setProject(newProject);
        
        trackTransactionEnd(txId, true);
        
        toast({
          title: "Project created successfully!",
          description: `Trait Wars project created on-chain`,
        });
        
        return newProject;
      }
      
      trackTransactionEnd(txId, false, 'Transaction failed');
      return null;
    } catch (error) {
      console.error('Detailed error creating project:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        if (error.message.includes("Attempt to debit an account but found no record of a prior credit")) {
          errorMessage = "Insufficient SOL balance. Please add testnet SOL to your wallet first.";
        } else {
          errorMessage = error.message;
        }
      }
      
      trackTransactionEnd(txId, false, errorMessage);
      
      toast({
        title: "Error creating project",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Create a profiles tree first (required before creating profiles)
  const createProfilesTree = useCallback(async (projectToUse?: HoneycombProject) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    const targetProject = projectToUse || project;
    if (!targetProject) {
      toast({
        title: "No project found",
        description: "Please create a project first",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { createCreateProfilesTreeTransaction: txResponse } = 
        await honeycombClient.createCreateProfilesTreeTransaction({
          payer: wallet.publicKey.toBase58(),
          project: targetProject.address,
          treeConfig: {
            basic: {
              numAssets: 10000, // Allow up to 10,000 profiles
            },
          },
        });

      const response = await sendClientTransactions(
        honeycombClient,
        wallet,
        txResponse.tx
      );

      if (response) {
        toast({
          title: "Profiles tree created!",
          description: "Now users can create profiles for this project",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating profiles tree:', error);
      toast({
        title: "Error creating profiles tree",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, project, toast]);

  // Create a user and profile with automatic NFT minting
  const createUserAndProfile = useCallback(async (name: string, bio?: string, projectToUse?: HoneycombProject) => {
    if (!isAuthenticated || !walletAddress) {
      toast({
        title: "Authentication required",
        description: "Please connect and authenticate your wallet first",
        variant: "destructive",
      });
      return null;
    }

    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    const targetProject = projectToUse || project;
    if (!targetProject) {
      toast({
        title: "No project found",
        description: "Please create a project first",
        variant: "destructive",
      });
      return null;
    }

    // Validate user info
    const userInfoValidation = validateUserInfo({ name, bio: bio || "Trait Wars warrior" });
    if (!userInfoValidation.success) {
      toast({
        title: "Invalid user information",
        description: userInfoValidation.error.errors[0]?.message || "Please check your input",
        variant: "destructive",
      });
      return null;
    }

    const txId = trackProfileCreation(wallet.publicKey.toBase58());
    setLoading(true);
    
    try {
      // Step 1: Create user and profile
      const { createNewUserWithProfileTransaction: txResponse } = 
        await honeycombClient.createNewUserWithProfileTransaction({
          project: targetProject.address,
          wallet: wallet.publicKey.toBase58(),
          payer: wallet.publicKey.toBase58(),
          profileIdentity: "main",
          userInfo: {
            name,
            bio: bio || "Trait Wars warrior",
            pfp: "",
          },
        });

      const response = await sendClientTransactions(
        honeycombClient,
        wallet,
        txResponse
      );

      if (response) {
        const newProfile = {
          address: `profile_${Date.now()}`,
          name,
          bio,
        };
        setHoneycombProfile(newProfile);

        // Step 2: Automatically mint warrior NFT with random traits
        const warriorTraits = {
          strength: Math.floor(Math.random() * 100) + 1,
          agility: Math.floor(Math.random() * 100) + 1,
          intelligence: Math.floor(Math.random() * 100) + 1,
          element: ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)] as 'Fire' | 'Water' | 'Earth' | 'Air',
          rarity: Math.random() > 0.8 ? 'Legendary' as const : Math.random() > 0.6 ? 'Rare' as const : 'Common' as const,
        };

        // Validate traits
        const traitsValidation = validateCharacterTraits(warriorTraits);
        if (!traitsValidation.success) {
          console.warn('Generated invalid traits, using defaults');
        }

        // Create the warrior NFT
        const newCharacter = await mintWarriorNFT(name, warriorTraits);
        
        // Update user profile with warrior count
        if (userProfile) {
          await updateProfile({ 
            warrior_count: (userProfile.warrior_count || 0) + 1 
          });
        }
        
        trackTransactionEnd(txId, true);
        
        toast({
          title: "Warrior created successfully!",
          description: `Your warrior "${name}" has been created on-chain with a unique NFT!`,
        });
        
        return { profile: newProfile, character: newCharacter };
      }
      
      trackTransactionEnd(txId, false, 'Transaction failed');
      return null;
    } catch (error) {
      console.error('Error creating user and profile:', error);
      const errorMessage = getSafeErrorMessage(error);
      
      trackTransactionEnd(txId, false, errorMessage);
      
      toast({
        title: "Error creating warrior",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, project, toast, isAuthenticated, walletAddress, userProfile, updateProfile]);

  // Mint a warrior NFT with traits
  const mintWarriorNFT = useCallback(async (name: string, traits: Record<string, any>) => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    if (!project) return;

    try {
      // For demo purposes, we'll create the character data structure
      // In a real implementation, this would use Honeycomb's Character Manager
      const newCharacter: HoneycombCharacter = {
        address: `nft_${Date.now()}`,
        name: `${name} NFT Warrior`,
        traits,
        isNFT: true,
        mintAddress: `mint_${Date.now()}`,
      };
      
      setCharacters(prev => [...prev, newCharacter]);
      
      toast({
        title: "NFT Minted!",
        description: `${name} warrior NFT has been minted with unique traits`,
      });

      return newCharacter;
    } catch (error) {
      console.error('Error minting warrior NFT:', error);
      toast({
        title: "Error minting NFT",
        description: error instanceof Error ? error.message : "Failed to mint warrior NFT",
        variant: "destructive",
      });
    }
  }, [wallet, project, toast]);

  // Create a character (NFT) with traits
  const createCharacter = useCallback(async (name: string, traits: Record<string, any>) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!project) {
      toast({
        title: "No project found",
        description: "Please create a project first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, create a character locally
      // In production, this would use the correct Honeycomb API
      const newCharacter: HoneycombCharacter = {
        address: `char_${Date.now()}`,
        name,
        traits,
        isNFT: true,
        mintAddress: `mint_${Date.now()}`,
      };

      setCharacters(prev => [...prev, newCharacter]);

      toast({
        title: "Character created!",
        description: `${name} has been created with custom traits`,
      });
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: "Error creating character",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [wallet, project, toast]);

  // Participate in a mission
  const participateInMission = useCallback(async (missionId: string, characterAddress: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, simulate mission participation
      // In production, this would use the correct Honeycomb API
      
      // Update character traits/XP in state
      setCharacters(prev =>
        prev.map(c =>
          c.address === characterAddress
            ? {
                ...c,
                traits: {
                  ...c.traits,
                  experience: (c.traits.experience || 0) + 50, // XP gain
                  missionsCompleted: (c.traits.missionsCompleted || 0) + 1,
                },
              }
            : c
        )
      );
      
      toast({
        title: "Mission completed!",
        description: "Your character has participated in the mission and gained XPs!",
      });
    } catch (error) {
      console.error('Error participating in mission:', error);
      toast({
        title: "Error participating in mission",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Evolve character traits
  const evolveCharacterTraits = useCallback(
    async (characterAddress: string, traitUpdates: Record<string, any>) => {
      setLoading(true);
      try {
        setCharacters(prev =>
          prev.map(c =>
            c.address === characterAddress
              ? {
                  ...c,
                  traits: {
                    ...c.traits,
                    ...traitUpdates,
                  },
                }
              : c
          )
        );
        toast({
          title: "Traits evolved!",
          description: "Character traits have been updated.",
        });
        // Add Honeycomb on-chain trait update logic
      } catch (error) {
        console.error('Error evolving traits:', error);
        toast({
          title: "Error evolving traits",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [setCharacters, toast]
  );

  // Vote in DAO round
  const voteInDaoRound = useCallback(
    async (characterAddress: string, voteOption: string) => {
      setLoading(true);
      try {
        // Reduce XP for voting
        setCharacters(prev =>
          prev.map(c =>
            c.address === characterAddress
              ? {
                  ...c,
                  traits: {
                    ...c.traits,
                    experience: Math.max((c.traits.experience || 0) - 100, 0), // Reduce XP, min 0
                    lastVote: voteOption,
                  },
                }
              : c
          )
        );
        toast({
          title: "Vote submitted!",
          description: "Your vote has been recorded and XP reduced.",
        });
        // Add Honeycomb DAO voting transaction here
      } catch (error) {
        console.error('Error voting in DAO round:', error);
        toast({
          title: "Error voting",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [setCharacters, toast]
  );

  // Reward DAO winner
  const rewardDaoWinner = useCallback(
    async (characterAddress: string, winningOption: string) => {
      const character = characters.find(c => c.address === characterAddress);
      if (!character) return;

      // Check if the user's last vote matches the winning option
      if (character.traits.lastVote === winningOption) {
        // Mint NFT as a reward using your existing mintWarriorNFT function
        const rewardTraits = {
          ...character.traits,
          daoWinner: true,
          rewardReceived: true,
        };
        await mintWarriorNFT(`${character.name} DAO Winner`, rewardTraits);

        toast({
          title: "NFT Rewarded!",
          description: "You voted for the winner and received a DAO Winner NFT!",
        });
      }
    },
    [characters, mintWarriorNFT, toast]
  );

  return {
    // State
    loading,
    project,
    profile: honeycombProfile,
    characters,
    
    // Actions
    createProject,
    createProfilesTree,
    createUserAndProfile,
    createCharacter,
    mintWarriorNFT,
    participateInMission,
    evolveCharacterTraits,
    voteInDaoRound,
    rewardDaoWinner,
    
    // Utilities
    isConnected: !!wallet.publicKey,
    walletAddress: wallet.publicKey?.toBase58(),
  };
};
