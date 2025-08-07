import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFullBlockchainIntegration } from '@/hooks/useFullBlockchainIntegration';
import { BlockchainRewardsPanel } from '@/components/BlockchainRewardsPanel';
import { HoneycombDemo } from '@/components/HoneycombDemo';
import { HoneycombAdvancedDemo } from '@/components/HoneycombAdvancedDemo';
import { 
  CheckCircle, 
  Circle, 
  Wallet, 
  Trophy, 
  Zap,
  Settings,
  AlertCircle
} from 'lucide-react';

export default function Blockchain() {
  const {
    blockchainStatus,
    loading,
    project,
    honeycombProfile,
    characters,
    userRewards,
    initializeFullBlockchain,
    createCustomCharacterNFT,
    isFullyInitialized,
    walletConnected,
    isAuthenticated,
  } = useFullBlockchainIntegration();

  const [characterName, setCharacterName] = useState('');
  const [customTraits, setCustomTraits] = useState({
    strength: 50,
    agility: 50,
    intelligence: 50,
    element: 'Fire',
  });

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <Circle className="w-4 h-4 text-muted-foreground" />
    );
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  const calculateSetupProgress = () => {
    const steps = Object.values(blockchainStatus);
    const completed = steps.filter(Boolean).length;
    return (completed / steps.length) * 100;
  };

  if (!walletConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                To access blockchain features, you need to connect your Solana wallet first.
              </p>
              <Button>Connect Wallet</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain Integration</h1>
        <p className="text-muted-foreground">
          Manage your on-chain assets, rewards, and blockchain features
        </p>
      </div>

      {/* Setup Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Blockchain Setup Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(calculateSetupProgress())}% Complete
              </span>
            </div>
            <Progress value={calculateSetupProgress()} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(blockchainStatus.projectInitialized)}
                <span className="text-sm">Project Initialized</span>
                <Badge className={getStatusColor(blockchainStatus.projectInitialized)}>
                  {blockchainStatus.projectInitialized ? 'Ready' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusIcon(blockchainStatus.profilesTreeCreated)}
                <span className="text-sm">Profiles Tree Created</span>
                <Badge className={getStatusColor(blockchainStatus.profilesTreeCreated)}>
                  {blockchainStatus.profilesTreeCreated ? 'Ready' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusIcon(blockchainStatus.userProfileCreated)}
                <span className="text-sm">User Profile Created</span>
                <Badge className={getStatusColor(blockchainStatus.userProfileCreated)}>
                  {blockchainStatus.userProfileCreated ? 'Ready' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                {getStatusIcon(blockchainStatus.characterCreated)}
                <span className="text-sm">Character Created</span>
                <Badge className={getStatusColor(blockchainStatus.characterCreated)}>
                  {blockchainStatus.characterCreated ? 'Ready' : 'Pending'}
                </Badge>
              </div>
            </div>

            {!isFullyInitialized && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    Setup Required
                  </span>
                </div>
                <p className="text-sm text-amber-700 mb-4">
                  Initialize your blockchain profile to access all features including 
                  NFT rewards, on-chain verification, and token rewards.
                </p>
                <Button 
                  onClick={initializeFullBlockchain}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Initializing...' : 'Initialize Blockchain Profile'}
                </Button>
              </div>
            )}

            {isFullyInitialized && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Blockchain Ready! 🎉
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your blockchain profile is fully initialized and ready to earn rewards.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rewards">Rewards & Assets</TabsTrigger>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-6">
          <BlockchainRewardsPanel />
        </TabsContent>

        <TabsContent value="characters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Your Characters
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage your NFT characters and their traits
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characters.map((character) => (
                  <Card key={character.address} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{character.name}</h3>
                      {character.isNFT && (
                        <Badge variant="secondary">NFT</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {Object.entries(character.traits).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {characters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No characters yet. Initialize your blockchain profile to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Custom Character */}
          {isFullyInitialized && (
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Character</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a new character NFT with custom traits
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Character Name</label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter character name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Strength</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={customTraits.strength}
                        onChange={(e) => setCustomTraits(prev => ({ ...prev, strength: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm text-muted-foreground">{customTraits.strength}</span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Agility</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={customTraits.agility}
                        onChange={(e) => setCustomTraits(prev => ({ ...prev, agility: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm text-muted-foreground">{customTraits.agility}</span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Intelligence</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={customTraits.intelligence}
                        onChange={(e) => setCustomTraits(prev => ({ ...prev, intelligence: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-sm text-muted-foreground">{customTraits.intelligence}</span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Element</label>
                      <select
                        value={customTraits.element}
                        onChange={(e) => setCustomTraits(prev => ({ ...prev, element: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Fire">Fire</option>
                        <option value="Water">Water</option>
                        <option value="Earth">Earth</option>
                        <option value="Air">Air</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={() => createCustomCharacterNFT(characterName, customTraits)}
                    disabled={!characterName || loading}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Create Character NFT'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Honeycomb Protocol Integration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Direct integration with Honeycomb Protocol for advanced blockchain features
              </p>
            </CardHeader>
            <CardContent>
              <HoneycombDemo />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <HoneycombAdvancedDemo />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Upcoming Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                  <h4 className="font-semibold mb-2">On-Chain Mission Verification</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    All mission completions are recorded on the blockchain for immutable proof
                  </p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>

                <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                  <h4 className="font-semibold mb-2">Token Rewards System</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Earn actual tokens that can be traded or used in the ecosystem
                  </p>
                  <Badge variant="outline">In Development</Badge>
                </div>

                <div className="p-4 border border-dashed border-gray-300 rounded-lg">
                  <h4 className="font-semibold mb-2">NFT Marketplace</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Trade your earned NFTs with other users
                  </p>
                  <Badge variant="outline">Planned</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}