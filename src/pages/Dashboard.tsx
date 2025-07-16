import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HoneycombDemo } from "@/components/HoneycombDemo";
import { UserOnboarding } from "@/components/UserOnboarding";
import { useMissions } from "@/hooks/useMissions";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useWalletFirstAuth } from "@/hooks/useWalletFirstAuth";
import solanaLogo from "@/assets/solana-logo.svg";
import superteamLogo from "@/assets/superteam-logo.png";
import superteamNigeriaLogo from "@/assets/superteam-nigeria-logo.png";
import {
  Target,
  Trophy,
  Users,
  Clock,
  Zap,
  Star,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Calendar,
  Crown,
  Medal,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  
  const { missions, loading: missionsLoading } = useMissions();
  const { progress, loading: progressLoading } = useUserProgress();
  const { isAuthenticated } = useWalletFirstAuth();

  // Check if user has completed onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('traitWarsOnboardingCompleted');
    if (!onboardingCompleted && isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  // Get featured missions (first 3 from database)
  const featuredMissions = missions.slice(0, 3);

  // Mock recent activity - would come from database in real app
  const recentActivity = [
    { type: "mission_complete", text: "Completed 'Deploy Smart Contract'", xp: 100, time: "2h ago" },
    { type: "level_up", text: "Reached Level 12!", xp: 0, time: "1d ago" },
    { type: "trait_boost", text: "Builder trait increased to 85", xp: 0, time: "2d ago" }
  ];

  // Calculate today's XP (mock for now)
  const todayXP = 127;
  const weeklyStreak = 5;
  const activeMissions = 3;
  const completedToday = 2;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-primary/20 text-primary";
      case "Intermediate": return "bg-accent/20 text-accent";
      case "Advanced": return "bg-destructive/20 text-destructive";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  // Top 3 leaderboard data
  const topBuilders = [
    { 
      rank: 1, 
      username: "CryptoBuilder42", 
      xp: 15647, 
      level: 47, 
      avatar: "🏆"
    },
    { 
      rank: 2, 
      username: "DevMaster", 
      xp: 14523, 
      level: 45, 
      avatar: "🥈"
    },
    { 
      rank: 3, 
      username: "TraitHunter", 
      xp: 13891, 
      level: 43, 
      avatar: "🥉"
    }
  ];

  const getBadgeLogo = (rank: number) => {
    if (rank === 1) return solanaLogo;
    if (rank === 2) return superteamNigeriaLogo;
    if (rank === 3) return superteamLogo;
    return null;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-xp-gold" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-accent" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-primary" />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-xp-gold/20 to-xp-gold/10 border-xp-gold/30';
    if (rank === 2) return 'bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30';
    if (rank === 3) return 'bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30';
    return 'bg-secondary/50';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-xp bg-clip-text text-transparent">
            Builder Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Builder! Ready to earn some XP?
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-neon">
          <Zap className="mr-2 h-4 w-4" />
          Quick Mission
        </Button>
      </div>

      {/* Honeycomb Protocol Integration */}
      <HoneycombDemo />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-xp-gold" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                {progressLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-xp-gold">{progress?.total_xp || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                {progressLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-accent">Level {progress?.level || 1}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Missions Completed</p>
                {progressLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">{progress?.missions_completed || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Streak Days</p>
                {progressLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-primary">{progress?.streak_days || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Missions */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-primary" />
                Featured Missions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {missionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading missions...</span>
                </div>
              ) : featuredMissions.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No missions available</p>
                </div>
              ) : (
                featuredMissions.map((mission) => (
                  <Card 
                    key={mission.id}
                    className={`p-4 cursor-pointer transition-all border ${
                      selectedMission === mission.id 
                        ? 'border-primary shadow-neon' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMission(selectedMission === mission.id ? null : mission.id)}
                  >
                    <Link to="/missions" className="block">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{mission.title}</h3>
                            <Badge variant="secondary" className={getDifficultyColor(mission.difficulty)}>
                              {mission.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {mission.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {mission.xp_reward} XP
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {mission.expires_at ? new Date(mission.expires_at).toLocaleDateString() : 'No deadline'}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="ml-4 bg-primary hover:bg-primary/90"
                          onClick={(e) => e.stopPropagation()}
                          asChild
                        >
                          <Link to="/missions">
                            Start <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </Link>
                  </Card>
                ))
              )}
              
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10"
                  asChild
                >
                  <Link to="/missions">
                    View All Missions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Top Builders */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-xp-gold" />
                Top Builders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topBuilders.map((builder) => (
                <div 
                  key={builder.rank}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${getRankStyle(builder.rank)}`}
                >
                  <div className="flex items-center gap-2">
                    {getRankIcon(builder.rank)}
                    <span className="text-2xl">{builder.avatar}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{builder.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {builder.level} • {builder.xp.toLocaleString()} XP
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getBadgeLogo(builder.rank) && (
                      <div className="relative">
                        <img 
                          src={getBadgeLogo(builder.rank)!} 
                          alt={
                            builder.rank === 1 ? "Solana" : 
                            builder.rank === 2 ? "Superteam Nigeria" : 
                            "Superteam"
                          } 
                          className="w-6 h-6"
                        />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border border-background flex items-center justify-center">
                          <span className="text-xs font-bold text-primary-foreground">{builder.rank}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  asChild
                >
                  <Link to="/leaderboard">
                    View Full Leaderboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="mt-1">
                    {activity.type === 'mission_complete' && <CheckCircle className="h-4 w-4 text-primary" />}
                    {activity.type === 'level_up' && <Trophy className="h-4 w-4 text-xp-gold" />}
                    {activity.type === 'trait_boost' && <TrendingUp className="h-4 w-4 text-accent" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {activity.xp > 0 && (
                        <Badge variant="secondary" className="text-xs bg-xp-gold/20 text-xp-gold">
                          +{activity.xp} XP
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Onboarding */}
      <UserOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}