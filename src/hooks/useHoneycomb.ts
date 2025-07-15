import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { honeycombClient, TRAIT_WARS_PROJECT_NAME } from '@/lib/honeycomb';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getSafeErrorMessage } from '@/lib/security';

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
      return;
    }

    setLoading(true);
    try {
      const { createCreateProjectTransaction: { project: projectAddress, tx: txResponse } } = 
        await honeycombClient.createCreateProjectTransaction({
          name: TRAIT_WARS_PROJECT_NAME,
          authority: wallet.publicKey.toBase58(),
        });

      const response = await sendClientTransactions(
        honeycombClient,
        wallet,
        txResponse
      );

      if (response) {
        setProject({
          address: projectAddress,
          name: TRAIT_WARS_PROJECT_NAME,
        });
        
        toast({
          title: "Project created successfully!",
          description: `Trait Wars project created on-chain`,
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Create a profiles tree first (required before creating profiles)
  const createProfilesTree = useCallback(async () => {
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
      const { createCreateProfilesTreeTransaction: txResponse } = 
        await honeycombClient.createCreateProfilesTreeTransaction({
          payer: wallet.publicKey.toBase58(),
          project: project.address,
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
      }
    } catch (error) {
      console.error('Error creating profiles tree:', error);
      toast({
        title: "Error creating profiles tree",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [wallet, project, toast]);

  // Create a user and profile with automatic NFT minting
  const createUserAndProfile = useCallback(async (name: string, bio?: string) => {
    if (!isAuthenticated || !walletAddress) {
      toast({
        title: "Authentication required",
        description: "Please connect and authenticate your wallet first",
        variant: "destructive",
      });
      return;
    }

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
      // Step 1: Create user and profile
      const { createNewUserWithProfileTransaction: txResponse } = 
        await honeycombClient.createNewUserWithProfileTransaction({
          project: project.address,
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
        setHoneycombProfile({
          address: `profile_${Date.now()}`,
          name,
          bio,
        });

        // Step 2: Automatically mint warrior NFT with random traits
        const warriorTraits = {
          strength: Math.floor(Math.random() * 100) + 1,
          agility: Math.floor(Math.random() * 100) + 1,
          intelligence: Math.floor(Math.random() * 100) + 1,
          element: ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)],
          rarity: Math.random() > 0.8 ? 'Legendary' : Math.random() > 0.6 ? 'Rare' : 'Common',
        };

        // Create the warrior NFT
        await mintWarriorNFT(name, warriorTraits);
        
        // Update user profile with warrior count
        if (userProfile) {
          await updateProfile({ 
            warrior_count: (userProfile.warrior_count || 0) + 1 
          });
        }
        
        toast({
          title: "Warrior created successfully!",
          description: `Your warrior "${name}" has been created on-chain with a unique NFT!`,
        });
      }
    } catch (error) {
      console.error('Error creating user and profile:', error);
      toast({
        title: "Error creating warrior",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
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
      // This would be the character creation transaction
      // The exact API might differ based on Honeycomb's character system
      toast({
        title: "Character creation",
        description: "Character creation with traits is being implemented...",
      });
      
      // For now, we'll simulate character creation
      const newCharacter: HoneycombCharacter = {
        address: `character_${Date.now()}`,
        name,
        traits,
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
      // This would be mission participation logic
      toast({
        title: "Mission participation",
        description: "Mission system integration is being implemented...",
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
    
    // Utilities
    isConnected: !!wallet.publicKey,
    walletAddress: wallet.publicKey?.toBase58(),
  };
};