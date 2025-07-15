import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { honeycombClient, TRAIT_WARS_PROJECT_NAME } from '@/lib/honeycomb';
import { useToast } from '@/hooks/use-toast';

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
}

export const useHoneycomb = () => {
  const wallet = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<HoneycombProject | null>(null);
  const [profile, setProfile] = useState<HoneycombProfile | null>(null);
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

  // Create a user and profile in one transaction
  const createUserAndProfile = useCallback(async (name: string, bio?: string) => {
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
        setProfile({
          address: `profile_${Date.now()}`, // Simplified for demo
          name,
          bio,
        });
        
        toast({
          title: "Warrior created successfully!",
          description: `Your warrior profile "${name}" has been created on-chain`,
        });
      }
    } catch (error) {
      console.error('Error creating user and profile:', error);
      toast({
        title: "Error creating warrior",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    profile,
    characters,
    
    // Actions
    createProject,
    createProfilesTree,
    createUserAndProfile,
    createCharacter,
    participateInMission,
    
    // Utilities
    isConnected: !!wallet.publicKey,
    walletAddress: wallet.publicKey?.toBase58(),
  };
};