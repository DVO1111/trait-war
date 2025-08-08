import React, { useState } from 'react';
import { useHoneycombAdvanced } from '@/hooks/useHoneycombAdvanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletButton } from '@/components/WalletButton';

export const HoneycombAdvancedDemo = () => {
  const {
    loading,
    projects,
    users,
    profiles,
    createProject,
    createProfilesTree,
    createUser,
    createUserWithProfile,
    findUsers,
    createProfile,
    updateProfile,
    findProfiles,
    addXPAndAchievements,
    isConnected,
    walletAddress,
  } = useHoneycombAdvanced();

  // Form states
  const [projectName, setProjectName] = useState('');
  const [userName, setUserName] = useState('');
  const [userBio, setUserBio] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [xpAmount, setXpAmount] = useState<number>(100);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    await createProject(projectName, {
      achievements: ["Pioneer", "Creator", "Explorer", "Champion"],
      customDataFields: ["NFTs owned", "Level", "XP", "Achievements"]
    });
    setProjectName('');
  };

  const handleCreateProfilesTree = async () => {
    if (!selectedProject) return;
    await createProfilesTree(selectedProject, {
      basic: { numAssets: 10000 }
    });
  };

  const handleCreateUserWithProfile = async () => {
    if (!selectedProject || !userName.trim()) return;
    await createUserWithProfile(
      selectedProject,
      {
        name: userName,
        bio: userBio || undefined,
      },
      'main'
    );
    setUserName('');
    setUserBio('');
  };

  const handleFindUsers = async () => {
    if (!walletAddress) return;
    await findUsers({
      wallets: [walletAddress],
      includeProof: true,
    });
  };

  const handleFindProfiles = async () => {
    if (!selectedProject) return;
    await findProfiles({
      projects: [selectedProject],
      includeProof: true,
    });
  };

  const handleAddXP = async () => {
    if (!selectedProfile) return;
    await addXPAndAchievements(selectedProfile, {
      addXp: xpAmount,
      addAchievements: [1, 2], // Example achievement IDs
    });
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Honeycomb Protocol Advanced Demo</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Connect your Solana wallet to get started with the advanced Honeycomb features.</p>
          <WalletButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Honeycomb Protocol Advanced Features</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connected: {walletAddress} | Network: Honeycomb Testnet
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCreateProject} 
                  disabled={loading || !projectName.trim()}
                >
                  Create Project
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Existing Projects</h4>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects created yet</p>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <div key={project.address} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProject(project.address)}
                          >
                            Select
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCreateProfilesTree()}
                            disabled={loading || selectedProject !== project.address}
                          >
                            Create Profiles Tree
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedProject && (
                <Alert>
                  <AlertDescription>
                    Selected project: {projects.find(p => p.address === selectedProject)?.name}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="User name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
                <Textarea
                  placeholder="User bio (optional)"
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateUserWithProfile}
                  disabled={loading || !selectedProject || !userName.trim()}
                >
                  Create User + Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFindUsers}
                  disabled={loading}
                >
                  Find My Users
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Found Users</h4>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users found</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.address} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.info.name}</p>
                            <p className="text-sm text-muted-foreground">{user.info.bio}</p>
                            <p className="text-xs text-muted-foreground">ID: {user.id} | {user.address}</p>
                          </div>
                          <Badge variant="secondary">User</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleFindProfiles}
                disabled={loading || !selectedProject}
              >
                Find Profiles for Selected Project
              </Button>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Found Profiles</h4>
                {profiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No profiles found</p>
                ) : (
                  <div className="space-y-2">
                    {profiles.map((profile) => (
                      <div key={profile.address} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{profile.info.name}</p>
                            <p className="text-sm text-muted-foreground">{profile.info.bio}</p>
                            <p className="text-xs text-muted-foreground">
                              Identity: {profile.identity} | {profile.address}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">Profile</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedProfile(profile.address)}
                            >
                              Select
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>XP & Achievement Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProfile && (
                <Alert>
                  <AlertDescription>
                    Selected profile: {profiles.find(p => p.address === selectedProfile)?.info.name}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="XP Amount"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(Number(e.target.value))}
                  className="w-32"
                />
                <Button
                  onClick={handleAddXP}
                  disabled={loading || !selectedProfile}
                >
                  Add XP & Achievements
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>This will add the specified XP amount and example achievements [1, 2] to the selected profile.</p>
                <p>Note: You need project authority to add XP and achievements.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && (
        <Alert>
          <AlertDescription>
            Processing transaction... Please confirm in your wallet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};