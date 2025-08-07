import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { honeycombClient } from '@/lib/honeycomb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Search, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  address: string;
  name: string;
  authority: string;
}

export const ProjectFinder = () => {
  const wallet = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchAddress, setSearchAddress] = useState('');

  // Find projects by authority (your wallet)
  const findMyProjects = useCallback(async () => {
    if (!wallet.publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try to find projects where your wallet is the authority
      const response = await honeycombClient.findProjects({
        authorities: [wallet.publicKey.toString()],
      });

      if (response.project && response.project.length > 0) {
        const foundProjects = response.project.map(p => ({
          address: p.address,
          name: p.name || 'Unnamed Project',
          authority: p.authority,
        }));
        setProjects(foundProjects);
        
        toast({
          title: "Projects found!",
          description: `Found ${foundProjects.length} project(s) associated with your wallet`,
        });
      } else {
        setProjects([]);
        toast({
          title: "No projects found",
          description: "No projects found for your wallet address",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error finding projects:', error);
      toast({
        title: "Error finding projects",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [wallet, toast]);

  // Search for a specific project by address
  const searchProject = useCallback(async () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Invalid address",
        description: "Please enter a project address to search",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await honeycombClient.findProjects({
        addresses: [searchAddress],
      });

      if (response.project && response.project.length > 0) {
        const foundProject = response.project[0];
        const projectData = {
          address: foundProject.address,
          name: foundProject.name || 'Unnamed Project',
          authority: foundProject.authority,
        };
        
        // Add to projects list if not already there
        setProjects(prev => {
          const exists = prev.some(p => p.address === projectData.address);
          return exists ? prev : [...prev, projectData];
        });
        
        toast({
          title: "Project found!",
          description: `Found project: ${projectData.name}`,
        });
      } else {
        toast({
          title: "Project not found",
          description: "No project found with that address",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching project:', error);
      toast({
        title: "Error searching project",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchAddress, toast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Find Your Honeycomb Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={findMyProjects} 
            disabled={loading || !wallet.publicKey}
            className="flex-shrink-0"
          >
            {loading ? 'Searching...' : 'Find My Projects'}
          </Button>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Enter project address to search..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={searchProject}
              disabled={loading || !searchAddress.trim()}
            >
              Search
            </Button>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Found Projects:</h4>
            {projects.map((project) => (
              <div key={project.address} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{project.name}</h5>
                  <Badge variant="secondary">Project</Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {project.address.slice(0, 8)}...{project.address.slice(-8)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(project.address, 'Project address')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Authority:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {project.authority.slice(0, 8)}...{project.authority.slice(-8)}
                    </code>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>To use this project:</strong> Copy the project address above and set it as EXISTING_PROJECT_ID in src/lib/honeycomb.ts
                  </AlertDescription>
                </Alert>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertDescription>
            <strong>Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Find My Projects" to search for projects where your wallet is the authority</li>
              <li>Or enter a specific project address to search for it</li>
              <li>Copy the project address from the results above</li>
              <li>Set it as EXISTING_PROJECT_ID in src/lib/honeycomb.ts</li>
              <li>This will allow you to create profile trees for your existing project</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Don't have a project yet?</h4>
          <p className="text-sm text-blue-700 mb-2">
            You can create a new project using the "Projects" tab in the Advanced Features section.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://docs.honeycombprotocol.com/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Honeycomb Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};