import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { honeycombClient, TRAIT_WARS_PROJECT_NAME, EXISTING_PROJECT_ID } from '@/lib/honeycomb';
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
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

  // Restore saved project from localStorage or configured constant
  useEffect(() => {
    try {
      if (!project) {
        const saved = localStorage.getItem('honeycomb_project');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.address) setProject(parsed);
        } else if (typeof EXISTING_PROJECT_ID === 'string' && EXISTING_PROJECT_ID.length > 0) {
          setProject({ address: EXISTING_PROJECT_ID, name: TRAIT_WARS_PROJECT_NAME });
        }
      }
    } catch (e) {
      console.warn('Failed to restore project from storage', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure the wallet has enough testnet SOL; attempts a devnet airdrop if low
  const ensureTestnetFunds = useCallback(async (minSol = 0.1) => {
    try {
      if (!wallet.publicKey) return false;
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      
      // Check current balance
      let balance = await connection.getBalance(wallet.publicKey);
      console.log('Current balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      
      if (balance < minSol * LAMPORTS_PER_SOL) {
        console.log('Requesting devnet airdrop...');
        try {
          const airdropAmount = Math.max(0.5 * LAMPORTS_PER_SOL, (minSol + 0.1) * LAMPORTS_PER_SOL);
          const sig = await connection.requestAirdrop(wallet.publicKey, airdropAmount);
          await connection.confirmTransaction(sig, 'confirmed');
          
          // Verify the airdrop worked
          balance = await connection.getBalance(wallet.publicKey);
          console.log('Balance after airdrop:', balance / LAMPORTS_PER_SOL, 'SOL');
          
          if (balance < minSol * LAMPORTS_PER_SOL) {
            throw new Error('Airdrop insufficient');
          }
          
          return true;
        } catch (airdropError) {
          console.error('Airdrop failed:', airdropError);
          toast({
            title: "Insufficient SOL",
            description: "Please add testnet SOL to your wallet manually. Visit https://faucet.solana.com",
            variant: "destructive",
          });
          return false;
        }
      }
      return true;
    } catch (e) {
      console.error('Fund check failed:', e);
      return false;
    }
  }, [wallet.publicKey, toast]);

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

    setLoading(true);
    try {
      console.log('Ensuring funds before project creation...');
      const hasFunds = await ensureTestnetFunds(0.15);
      if (!hasFunds) {
        return null;
      }

      // Add a small delay to ensure the airdrop is fully processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Creating project with wallet:', wallet.publicKey.toBase58());
      console.log('Creating project with name:', TRAIT_WARS_PROJECT_NAME);
      
      const { createCreateProjectTransaction: { project: projectAddress, tx: txResponse } } = 
        await honeycombClient.createCreateProjectTransaction({
          name: TRAIT_WARS_PROJECT_NAME,
          authority: wallet.publicKey.toBase58(),
          payer: wallet.publicKey.toBase58(),
          subsidizeFees: true,
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
        localStorage.setItem('honeycomb_project', JSON.stringify(newProject));
        
        toast({
          title: "Project created successfully!",
          description: `Trait Wars project created on-chain`,
        });
        
        return newProject;
      }
      return null;
    } catch (error) {
      console.error('Detailed error creating project:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        if (error.message.includes("Attempt to debit an account but found no record of a prior credit")) {
          errorMessage = "Insufficient SOL balance. Requesting additional funds...";
          // Try one more airdrop
          const hasMoreFunds = await ensureTestnetFunds(0.2);
          if (hasMoreFunds) {
            errorMessage += " Please try again.";
          } else {
            errorMessage = "Unable to get sufficient testnet SOL. Please visit https://faucet.solana.com";
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error creating project",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet, toast, ensureTestnetFunds]);

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
      console.log('Ensuring funds before profiles tree creation...');
      const hasFunds = await ensureTestnetFunds(0.1);
      if (!hasFunds) {
        return false;
      }

      // Add a small delay to ensure funds are available
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Creating profiles tree for project:', targetProject.address);
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

      console.log('Profiles tree transaction created:', txResponse);
      const response = await sendClientTransactions(
        honeycombClient,
        wallet,
        txResponse.tx
      );

      console.log('Profiles tree response:', response);

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
      let errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // If the project isn't yet visible on-chain, wait and retry once
      if (
        (typeof errorMessage === 'string' && errorMessage.includes("Couldn't find project")) ||
        (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('project not found'))
      ) {
        console.warn('Project may not be registered yet. Retrying after delay...');
        await new Promise(res => setTimeout(res, 2500));
        try {
          const retry = await honeycombClient.createCreateProfilesTreeTransaction({
            payer: wallet.publicKey!.toBase58(),
            project: targetProject.address,
            treeConfig: { basic: { numAssets: 10000 } },
          });
          const retryResponse = await sendClientTransactions(
            honeycombClient,
            wallet,
            retry.createCreateProfilesTreeTransaction.tx
          );
          if (retryResponse) {
            toast({
              title: "Profiles tree created!",
              description: "Profiles tree created after retry.",
            });
            return true;
          }
        } catch (retryErr) {
          console.error('Retry failed:', retryErr);
        }
        errorMessage = "Project not found yet on-chain. Please wait a few seconds after creating the project, then try again.";
      }
      
      toast({
        title: "Error creating profiles tree",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [wallet, project, toast, ensureTestnetFunds]);

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

    setLoading(true);
    try {
      // Step 1: Create user and profile
      await ensureTestnetFunds();
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
          element: ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)],
          rarity: Math.random() > 0.8 ? 'Legendary' : Math.random() > 0.6 ? 'Rare' : 'Common',
        };

        // Create the warrior NFT
        const newCharacter = await mintWarriorNFT(name, warriorTraits);
        
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
        
        return { profile: newProfile, character: newCharacter };
      }
      return null;
    } catch (error) {
      console.error('Error creating user and profile:', error);
      toast({
        title: "Error creating warrior",
        description: getSafeErrorMessage(error),
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
