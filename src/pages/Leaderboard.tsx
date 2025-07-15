import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name: string;
  xp: number;
  level: number;
  traits: any;
  missions: number;
  streak: number;
}

export default function Leaderboard() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalMissions, setTotalMissions] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const { toast } = useToast();

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Get leaderboard data with profiles
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (progressError) throw progressError;

      // Get profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, display_name');

      if (profilesError) throw profilesError;

      // Transform data
      const transformedData: LeaderboardEntry[] = progressData.map((entry, index) => {
        const profile = profilesData.find(p => p.id === entry.user_id);
        return {
          rank: index + 1,
          username: profile?.username || `Builder_${index + 1}`,
          display_name: profile?.display_name || profile?.username || `Builder_${index + 1}`,
          xp: entry.total_xp || 0,
          level: entry.level || 1,
          traits: entry.traits || { builder: 0, community: 0, governance: 0 },
          missions: entry.missions_completed || 0,
          streak: entry.streak_days || 0
        };
      });

      setGlobalLeaderboard(transformedData);

      // Get stats
      const { count: playerCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true });

      const { data: missionData } = await supabase
        .from('user_progress')
        .select('missions_completed');

      const { data: xpData } = await supabase
        .from('user_progress')
        .select('total_xp');

      setTotalPlayers(playerCount || 0);
      setTotalMissions(missionData?.reduce((sum, item) => sum + (item.missions_completed || 0), 0) || 0);
      setTotalXP(xpData?.reduce((sum, item) => sum + (item.total_xp || 0), 0) || 0);

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Mock weekly data for now
  const weeklyLeaderboard = [
    { rank: 1, username: "TraitHunter", weeklyXp: 1247, change: "+2" },
    { rank: 2, username: "CryptoBuilder42", weeklyXp: 1156, change: "-1" },
    { rank: 3, username: "DevMaster", weeklyXp: 987, change: "-1" },
    { rank: 4, username: "Web3Pioneer", weeklyXp: 834, change: "+3" },
    { rank: 5, username: "DeFiExplorer", weeklyXp: 756, change: "+1" }
  ];

  // Generate trait leaderboards from real data
  const generateTraitLeaderboards = () => {
    const traitTypes = ['builder', 'community', 'governance'];
    const traitLeaderboards: Record<string, any[]> = {};
    
    traitTypes.forEach(trait => {
      const sorted = [...globalLeaderboard]
        .map(player => ({
          rank: 0,
          username: player.username,
          score: player.traits[trait] || 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((player, index) => ({
          ...player,
          rank: index + 1
        }));
      
      traitLeaderboards[trait] = sorted;
    });
    
    return traitLeaderboards;
  };

  const traitLeaderboards = generateTraitLeaderboards();

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
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{totalPlayers.toLocaleString()}</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                ) : (
                  <p className="text-2xl font-bold text-accent">{totalMissions.toLocaleString()}</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-xp-gold" />
                ) : (
                  <p className="text-2xl font-bold text-xp-gold">{(totalXP / 1000000).toFixed(1)}M</p>
                )}
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
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <p className="text-2xl font-bold text-primary">#{Math.floor(Math.random() * 100) + 1}</p>
                )}
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading leaderboard...</span>
                </div>
              ) : globalLeaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No players yet - be the first!</p>
                </div>
              ) : (
                globalLeaderboard.map((player, index) => (
                  <div 
                    key={player.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${getCardStyle(index)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(index)}`}>
                        {getRankIcon(player.rank)}
                      </div>
                      <div>
                        <p className="font-semibold">{player.display_name}</p>
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
                        <div className="font-semibold text-primary">{player.traits.builder || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Community</div>
                        <div className="font-semibold text-accent">{player.traits.community || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Governance</div>
                        <div className="font-semibold text-neon-purple">{player.traits.governance || 0}</div>
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
                ))
              )}
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