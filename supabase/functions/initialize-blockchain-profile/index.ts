import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InitializeRequest {
  walletAddress: string;
  userName?: string;
  userBio?: string;
}

interface ProjectStatus {
  exists: boolean;
  address?: string;
  profilesTreeCreated?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress, userName = 'Warrior', userBio = 'Trait Wars participant' }: InitializeRequest = await req.json();
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    console.log(`Starting blockchain initialization for wallet: ${walletAddress}`);

    // Step 1: Check if project exists and get its status
    const projectStatus = await checkProjectStatus();
    console.log('Project status:', projectStatus);

    let projectAddress = projectStatus.address;

    // Step 2: Create project if it doesn't exist
    if (!projectStatus.exists) {
      console.log('Creating new project...');
      projectAddress = await createProjectWithRetry(walletAddress);
      if (!projectAddress) {
        throw new Error('Failed to create project after multiple attempts');
      }
    }

    // Step 3: Wait for project to be fully available
    await waitForProjectAvailability(projectAddress);

    // Step 4: Create profiles tree if not exists
    if (!projectStatus.profilesTreeCreated) {
      console.log('Creating profiles tree...');
      const treeCreated = await createProfilesTreeWithRetry(projectAddress, walletAddress);
      if (!treeCreated) {
        throw new Error('Failed to create profiles tree after multiple attempts');
      }
    }

    // Step 5: Create user profile
    console.log('Creating user profile...');
    const userProfile = await createUserProfileWithRetry(projectAddress, walletAddress, userName, userBio);
    if (!userProfile) {
      throw new Error('Failed to create user profile after multiple attempts');
    }

    console.log('Blockchain initialization completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          projectAddress,
          userProfile,
          message: 'Blockchain profile initialized successfully'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in blockchain initialization:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function checkProjectStatus(): Promise<ProjectStatus> {
  try {
    // In a real implementation, this would query the Honeycomb API
    // For now, we'll assume no project exists and always create a new one
    return {
      exists: false,
      profilesTreeCreated: false
    };
  } catch (error) {
    console.error('Error checking project status:', error);
    return { exists: false };
  }
}

async function createProjectWithRetry(walletAddress: string, maxRetries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Creating project attempt ${attempt}/${maxRetries}`);
      
      // This would use the Honeycomb client to create the project
      // For demo purposes, we'll simulate a project creation
      const projectAddress = `project_${Date.now()}_${walletAddress.slice(0, 8)}`;
      
      console.log(`Project created successfully: ${projectAddress}`);
      return projectAddress;
      
    } catch (error) {
      console.error(`Project creation attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return null;
}

async function waitForProjectAvailability(projectAddress: string): Promise<void> {
  console.log(`Waiting for project ${projectAddress} to be available...`);
  
  // Wait for the blockchain to process the project creation
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('Project should now be available');
}

async function createProfilesTreeWithRetry(projectAddress: string, walletAddress: string, maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Creating profiles tree attempt ${attempt}/${maxRetries}`);
      
      // This would use the Honeycomb client to create the profiles tree
      // For demo purposes, we'll simulate success
      
      console.log('Profiles tree created successfully');
      return true;
      
    } catch (error) {
      console.error(`Profiles tree creation attempt ${attempt} failed:`, error);
      
      // Check if it's a "project not found" error
      if (error.message && error.message.includes('project') && error.message.includes('not found')) {
        console.log('Project not found error - waiting longer...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
}

async function createUserProfileWithRetry(
  projectAddress: string, 
  walletAddress: string, 
  userName: string, 
  userBio: string,
  maxRetries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Creating user profile attempt ${attempt}/${maxRetries}`);
      
      // This would use the Honeycomb client to create the user profile
      // For demo purposes, we'll simulate a successful profile creation
      const userProfile = {
        address: `profile_${Date.now()}_${walletAddress.slice(0, 8)}`,
        name: userName,
        bio: userBio,
        walletAddress,
        projectAddress
      };
      
      console.log('User profile created successfully');
      return userProfile;
      
    } catch (error) {
      console.error(`User profile creation attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return null;
}