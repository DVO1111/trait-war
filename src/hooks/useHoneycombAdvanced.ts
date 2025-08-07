import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { honeycombClient, EXISTING_PROJECT_ID } from '@/lib/honeycomb';
import { useToast } from '@/hooks/use-toast';

interface HoneycombProject {
  address: string;
  name: string;
  authority: string;
}

interface HoneycombUser {
  address: string;
  id: number;
  info: {
    name: string;
    bio?: string;
    pfp?: string;
  };
}

interface HoneycombProfile {
  address: string;
  userAddress: string;
  projectAddress: string;
  identity: string;
  info: {
    name: string;
    bio?: string;
    pfp?: string;
  };
  customData?: Record<string, string[]>;
}

interface CreateProfilesTreeConfig {
  basic?: {
    numAssets: number;
  };
  advanced?: {
    maxDepth: number;
    maxBufferSize: number;
    canopyDepth: number;
  };
}

export const useHoneycombAdvanced = () => {
  const wallet = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<HoneycombProject[]>([]);
  const [users, setUsers] = useState<HoneycombUser[]>([]);
  const [profiles, setProfiles] = useState<HoneycombProfile[]>([]);

  // Create project with proper authority
  const createProject = useCallback(async (projectName: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { createCreateProjectTransaction: { project: projectAddress, tx } } = 
        await honeycombClient.createCreateProjectTransaction({
          name: projectName,
          authority: wallet.publicKey.toBase58(),
        });

      const response = await sendClientTransactions(honeycombClient, wallet, tx);

      if (response) {
        const newProject: HoneycombProject = {
          address: projectAddress,
          name: projectName,
          authority: wallet.publicKey.toBase58(),
        };
        
        setProjects(prev => [...prev, newProject]);
        
        toast({
          title: "Project created successfully!",
          description: `Project "${projectName}" created with address: ${projectAddress}`,
        });
        
        return newProject;
      }
      return null;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error creating project",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Create profiles tree with configurable options
  const createProfilesTree = useCallback(async (
    projectAddress: string, 
    config: CreateProfilesTreeConfig = { basic: { numAssets: 10000 } }
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { createCreateProfilesTreeTransaction: txResponse } = 
        await honeycombClient.createCreateProfilesTreeTransaction({
          payer: wallet.publicKey.toBase58(),
          project: projectAddress,
          treeConfig: config,
        });

      const response = await sendClientTransactions(honeycombClient, wallet, txResponse.tx);

      if (response) {
        toast({
          title: "Profiles tree created successfully!",
          description: `Profiles tree created for project. Can store up to ${config.basic?.numAssets || 'configured'} profiles.`,
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
  }, [wallet, toast]);

  // Create a new user
  const createUser = useCallback(async (userInfo: { name: string; pfp?: string; bio?: string }) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { createNewUserTransaction: txResponse } = 
        await honeycombClient.createNewUserTransaction({
          wallet: wallet.publicKey.toString(),
          info: {
            name: userInfo.name,
            bio: userInfo.bio || "",
            pfp: userInfo.pfp || "",
          },
          payer: wallet.publicKey.toString(),
        });

      const response = await sendClientTransactions(honeycombClient, wallet, txResponse);

      if (response) {
        toast({
          title: "User created successfully!",
          description: `User "${userInfo.name}" has been created on-chain`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error creating user",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Create user and profile in one transaction
  const createUserWithProfile = useCallback(async (
    projectAddress: string,
    userInfo: { name: string; pfp?: string; bio?: string },
    profileIdentity: string = "main"
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { createNewUserWithProfileTransaction: txResponse } = 
        await honeycombClient.createNewUserWithProfileTransaction({
          project: projectAddress,
          wallet: wallet.publicKey.toString(),
          payer: wallet.publicKey.toString(),
          profileIdentity,
          userInfo: {
            name: userInfo.name,
            bio: userInfo.bio || "",
            pfp: userInfo.pfp || "",
          },
        });

      const response = await sendClientTransactions(honeycombClient, wallet, txResponse);

      if (response) {
        toast({
          title: "User and profile created!",
          description: `User "${userInfo.name}" and profile created successfully`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating user with profile:', error);
      toast({
        title: "Error creating user with profile",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Find users by various filters
  const findUsers = useCallback(async (filters: {
    wallets?: string[];
    addresses?: string[];
    ids?: number[];
    includeProof?: boolean;
  } = {}) => {
    try {
      const response = await honeycombClient.findUsers(filters);
      if (response.user) {
        setUsers(response.user);
        return response.user;
      }
      return [];
    } catch (error) {
      console.error('Error finding users:', error);
      toast({
        title: "Error finding users",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Find profiles by various filters
  const findProfiles = useCallback(async (filters: {
    userIds?: number[];
    projects?: string[];
    addresses?: string[];
    identities?: string[];
    includeProof?: boolean;
  } = {}) => {
    try {
      const response = await honeycombClient.findProfiles(filters);
      if (response.profile) {
        // Map the response to our interface format
        const mappedProfiles = response.profile.map(p => ({
          address: p.address,
          userAddress: p.user?.address || "",
          projectAddress: p.project,
          identity: p.identity,
          info: {
            name: p.info.name || "",
            bio: p.info.bio,
            pfp: p.info.pfp,
          },
          customData: p.customData,
        }));
        setProfiles(mappedProfiles);
        return mappedProfiles;
      }
      return [];
    } catch (error) {
      console.error('Error finding profiles:', error);
      toast({
        title: "Error finding profiles",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Create a standalone profile (requires existing user)
  const createProfile = useCallback(async (
    projectAddress: string,
    identity: string,
    info: { name: string; bio?: string; pfp?: string },
    accessToken?: string
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const options = accessToken ? {
        fetchOptions: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      } : {};

      const { createNewProfileTransaction: txResponse } = 
        await honeycombClient.createNewProfileTransaction({
          project: projectAddress,
          payer: wallet.publicKey.toString(),
          identity,
          info,
        }, options);

      const response = await sendClientTransactions(honeycombClient, wallet, txResponse);

      if (response) {
        toast({
          title: "Profile created successfully!",
          description: `Profile "${info.name}" created for project`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error creating profile",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Update profile with custom data
  const updateProfile = useCallback(async (
    profileAddress: string,
    updates: {
      info?: { name?: string; bio?: string; pfp?: string };
      customData?: {
        add?: Record<string, string[]>;
        remove?: string[];
      };
    },
    accessToken?: string
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const options = accessToken ? {
        fetchOptions: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      } : {};

      const { createUpdateProfileTransaction: txResponse } = 
        await honeycombClient.createUpdateProfileTransaction({
          payer: wallet.publicKey.toString(),
          profile: profileAddress,
          ...updates,
        }, options);

      const response = await sendClientTransactions(honeycombClient, wallet, txResponse);

      if (response) {
        toast({
          title: "Profile updated successfully!",
          description: "Profile information has been updated",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Add XP and achievements to profile
  const addXPAndAchievements = useCallback(async (
    profileAddress: string,
    platformData: {
      addXp?: number;
      addAchievements?: number[];
      custom?: {
        add?: [string, string][];
        remove?: string[];
      };
    },
    authorityWallet?: any // Authority wallet for the project
  ) => {
    const walletToUse = authorityWallet || wallet;
    
    if (!walletToUse.publicKey || !walletToUse.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { createUpdatePlatformDataTransaction: txResponse } = 
        await honeycombClient.createUpdatePlatformDataTransaction({
          profile: profileAddress,
          authority: walletToUse.publicKey.toString(),
          platformData: {
            addXp: platformData.addXp?.toString(),
            addAchievements: platformData.addAchievements,
            custom: platformData.custom,
          },
        });

      const response = await sendClientTransactions(honeycombClient, walletToUse, txResponse);

      if (response) {
        toast({
          title: "Platform data updated!",
          description: `Added ${platformData.addXp || 0} XP and ${platformData.addAchievements?.length || 0} achievements`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating platform data:', error);
      toast({
        title: "Error updating platform data",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Find projects by various filters
  const findProjects = useCallback(async (filters: {
    authorities?: string[];
    addresses?: string[];
    names?: string[];
    includeProof?: boolean;
  } = {}) => {
    try {
      const response = await honeycombClient.findProjects(filters);
      if (response.project) {
        return response.project;
      }
      return [];
    } catch (error) {
      console.error('Error finding projects:', error);
      toast({
        title: "Error finding projects",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  return {
    loading,
    projects,
    users,
    profiles,
    
    // Project operations
    createProject,
    createProfilesTree,
    findProjects,
    
    // User operations
    createUser,
    createUserWithProfile,
    findUsers,
    
    // Profile operations
    createProfile,
    updateProfile,
    findProfiles,
    addXPAndAchievements,
    
    // Connection status
    isConnected: !!wallet.connected,
    walletAddress: wallet.publicKey?.toBase58(),
    
    // Helper for existing project
    existingProjectId: EXISTING_PROJECT_ID,
  };
};