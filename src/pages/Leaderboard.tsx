import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Crown,
  Shield,
  Medal,
  TrendingUp,
  Users,
  Target,
  Zap,
  Star
} from "lucide-react";

export default function Leaderboard() {
  // Mock leaderboard data
  const globalLeaderboard = [
    { rank: 1, username: "CryptoBuilder42", xp: 15647, level: 47, traits: { builder: 95, community: 89, governance: 78 }, missions: 143, streak: 23 },
    { rank: 2, username: "DevMaster", xp: 14523, level: 45, traits: { builder: 87, community: 95, governance: 92 }, missions: 128, streak: 19 },
    { rank: 3, username: "TraitHunter", xp: 13891, level: 43, traits: { builder: 92, community: 76, governance: 85 }, missions: 156, streak: 31 },
    { rank: 4, username: "BlockchainWiz", xp: 12456, level: 39, traits: { builder: 68, community: 97, governance: 73 }, missions: 98, streak: 12 },
    { rank: 5, username: "Builder_0x42", xp: 11234, level: 37, traits: { builder: 85, community: 67, governance: 42 }, missions: 89, streak: 7 },
    { rank: 6, username: "Web3Pioneer", xp: 10987, level: 35, traits: { builder: 78, community: 84, governance: 56 }, missions: 76, streak: 15 },
    { rank: 7, username: "CodeNinja", xp: 9876, level: 33, traits: { builder: 91, community: 62, governance: 48 }, missions: 102, streak: 9 },
    { rank: 8, username: "DeFiExplorer", xp: 9543, level: 31, traits: { builder: 74, community: 88, governance: 67 }, missions: 65, streak: 21 },
    { rank: 9, username: "SmartContractGuru", xp: 8765, level: 29, traits: { builder: 89, community: 71, governance: 82 }, missions: 94, streak: 5 },
    { rank: 10, username: "CryptoVision", xp: 8234, level: 27, traits: { builder: 66, community: 93, governance: 59 }, missions: 58, streak: 14 }
  ];

  const weeklyLeaderboard = [
    { rank: 1, username: "TraitHunter", weeklyXp: 1247, change: "+2" },
    { rank: 2, username: "CryptoBuilder42", weeklyXp: 1156, change: "-1" },
    { rank: 3, username: "DevMaster", weeklyXp: 987, change: "-1" },
    { rank: 4, username: "Web3Pioneer", weeklyXp: 834, change: "+3" },
    { rank: 5, username: "DeFiExplorer", weeklyXp: 756, change: "+1" }
  ];

  const traitLeaderboards = {
    builder: [
      { rank: 1, username: "CryptoBuilder42", score: 95 },
      { rank: 2, username: "TraitHunter", score: 92 },
      { rank: 3, username: "SmartContractGuru", score: 89 },
      { rank: 4, username: "CodeNinja", score: 91 },
      { rank: 5, username: "DevMaster", score: 87 }
    ],
    community: [
      { rank: 1, username: "BlockchainWiz", score: 97 },
      { rank: 2, username: "DevMaster", score: 95 },
      { rank: 3, username: "CryptoVision", score: 93 },
      { rank: 4, username: "CryptoBuilder42", score: 89 },
      { rank: 5, username: "DeFiExplorer", score: 88 }
    ],
    governance: [
      { rank: 1, username: "DevMaster", score: 92 },
      { rank: 2, username: "TraitHunter", score: 85 },
      { rank: 3, username: "SmartContractGuru", score: 82 },
      { rank: 4, username: "CryptoBuilder42", score: 78 },
      { rank: 5, username: "BlockchainWiz", score: 73 }
    ]
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4" />;
    if (rank === 2) return <Medal className="h-4 w-4" />;
    if (rank === 3) return <Star className="h-4 w-4" />;
    return rank;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-xp-gold text-background';
    if (rank === 2) return 'bg-accent text-accent-foreground';
    if (rank === 3) return 'bg-primary text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getCardStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-cyber border border-xp-gold/30';
    if (rank === 2) return 'bg-gradient-cyber border border-accent/30';
    if (rank === 3) return 'bg-gradient-cyber border border-primary/30';
    return 'bg-secondary/50';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-xp bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            See how you stack up against other builders in the Trait Wars
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Players</p>
                <p className="text-2xl font-bold text-primary">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Missions Completed</p>
                <p className="text-2xl font-bold text-accent">12,543</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-xp-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-xp-gold" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total XP Earned</p>
                <p className="text-2xl font-bold text-xp-gold">2.1M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold text-primary">#342</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-secondary">
          <TabsTrigger value="global" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Global
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="traits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            By Traits
          </TabsTrigger>
          <TabsTrigger value="guilds" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Guilds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-xp-gold" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {globalLeaderboard.map((player, index) => (
                <div 
                  key={player.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${getCardStyle(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(index)}`}>
                      {getRankIcon(player.rank)}
                    </div>
                    <div>
                      <p className="font-semibold">{player.username}</p>
                      <p className="text-sm text-muted-foreground">Level {player.level} • {player.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <div className="flex gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">Missions</div>
                      <div className="font-semibold text-primary">{player.missions}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Streak</div>
                      <div className="font-semibold text-accent">{player.streak}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">Builder</div>
                      <div className="font-semibold text-primary">{player.traits.builder}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Community</div>
                      <div className="font-semibold text-accent">{player.traits.community}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Governance</div>
                      <div className="font-semibold text-neon-purple">{player.traits.governance}</div>
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <Shield className={`h-5 w-5 ${
                      index === 0 ? 'text-xp-gold' :
                      index === 1 ? 'text-accent' :
                      'text-primary'
                    }`} />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-accent" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyLeaderboard.map((player, index) => (
                <div 
                  key={player.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${getCardStyle(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(index)}`}>
                      {getRankIcon(player.rank)}
                    </div>
                    <div>
                      <p className="font-semibold">{player.username}</p>
                      <p className="text-sm text-muted-foreground">{player.weeklyXp.toLocaleString()} XP this week</p>
                    </div>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <Badge 
                    variant={player.change.startsWith('+') ? 'default' : 'secondary'}
                    className={player.change.startsWith('+') ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}
                  >
                    {player.change}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(traitLeaderboards).map(([trait, players]) => (
              <Card key={trait} className="bg-gradient-mission border-border">
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {trait} Leaders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {players.map((player, index) => (
                    <div 
                      key={player.rank}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${getRankStyle(index)}`}>
                        {player.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{player.username}</p>
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {player.score}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guilds" className="space-y-4">
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Guild Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Guild system coming soon!</p>
                <p className="text-sm mt-2">Form alliances and compete as a team</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}