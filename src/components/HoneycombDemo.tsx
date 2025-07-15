import { useState } from 'react';
import { useHoneycomb } from '@/hooks/useHoneycomb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, User, Target, Trophy } from 'lucide-react';

export const HoneycombDemo = () => {
  const {
    loading,
    project,
    profile,
    characters,
    createProject,
    createProfilesTree,
    createUserAndProfile,
    createCharacter,
    participateInMission,
    isConnected,
    walletAddress,
  } = useHoneycomb();

  const [warriorName, setWarriorName] = useState('');
  const [characterName, setCharacterName] = useState('');

  if (!isConnected) {
    return (
      <Card className="border-gaming-secondary bg-gaming-dark/50">
        <CardHeader>
          <CardTitle className="text-gaming-accent flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Honeycomb Protocol Integration
          </CardTitle>
          <CardDescription>
            Connect your wallet to start using on-chain progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Please connect your Solana wallet to interact with Honeycomb Protocol
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gaming-secondary bg-gaming-dark/50">
        <CardHeader>
          <CardTitle className="text-gaming-accent flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Honeycomb Protocol Integration
          </CardTitle>
          <CardDescription>
            On-chain progression powered by Honeycomb Protocol
          </CardDescription>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              Wallet: {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Honeynet Testnet
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 1: Create Project */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${project ? 'bg-green-500' : 'bg-gray-400'}`} />
              <h3 className="font-semibold">Step 1: Create Trait Wars Project</h3>
            </div>
            {!project ? (
              <Button 
                onClick={createProject} 
                disabled={loading}
                className="w-full"
                variant="default"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create On-Chain Project
              </Button>
            ) : (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">
                  ✓ Project "{project.name}" created successfully!
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Create Profiles Tree */}
          {project && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <h3 className="font-semibold">Step 2: Initialize Profiles System</h3>
              </div>
              <Button 
                onClick={createProfilesTree} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Profiles Tree
              </Button>
            </div>
          )}

          {/* Step 3: Create Warrior Profile */}
          {project && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${profile ? 'bg-green-500' : 'bg-gray-400'}`} />
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Step 3: Create Your Warrior
                </h3>
              </div>
              {!profile ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="warriorName">Warrior Name</Label>
                    <Input
                      id="warriorName"
                      value={warriorName}
                      onChange={(e) => setWarriorName(e.target.value)}
                      placeholder="Enter your warrior name"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={() => createUserAndProfile(warriorName, "A mighty warrior in the Trait Wars")} 
                    disabled={loading || !warriorName}
                    className="w-full"
                    variant="default"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Warrior Profile
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✓ Warrior "{profile.name}" created on-chain with NFT!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your warrior NFT has been automatically minted with unique traits
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Create Character with Traits */}
          {profile && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <h3 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Step 4: Create Character with Traits
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="characterName">Character Name</Label>
                  <Input
                    id="characterName"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter character name"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={() => createCharacter(characterName, {
                    strength: Math.floor(Math.random() * 100) + 1,
                    agility: Math.floor(Math.random() * 100) + 1,
                    intelligence: Math.floor(Math.random() * 100) + 1,
                    element: ['Fire', 'Water', 'Earth', 'Air'][Math.floor(Math.random() * 4)],
                  })} 
                  disabled={loading || !characterName}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Forge Character with Random Traits
                </Button>
              </div>
            </div>
          )}

          {/* Characters Display */}
          {characters.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Your Characters
              </h3>
              <div className="grid gap-3">
                {characters.map((character, index) => (
                  <Card key={index} className="bg-gaming-dark/30 border-gaming-secondary/50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gaming-accent flex items-center gap-2">
                            {character.name}
                            {character.isNFT && <Badge variant="secondary" className="text-xs">NFT</Badge>}
                          </h4>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {Object.entries(character.traits).map(([trait, value]) => (
                              <Badge key={trait} variant="outline" className="text-xs">
                                {trait}: {value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => participateInMission('mission_1', character.address)}
                          disabled={loading}
                        >
                          Send on Mission
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};