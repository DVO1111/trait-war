import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HoneycombDemo } from "@/components/HoneycombDemo";
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
  Calendar
} from "lucide-react";

export default function Dashboard() {
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  // Mock data - would come from blockchain/API in real app
  const dashboardData = {
    todayXP: 127,
    weeklyStreak: 5,
    activeMissions: 3,
    completedToday: 2,
    featuredMissions: [
      {
        id: "1",
        title: "Build a DeFi Tool",
        category: "Tech",
        xp: 150,
        difficulty: "Advanced",
        timeLeft: "2 days",
        participants: 12,
        description: "Create a decentralized finance tool that helps users manage their portfolios"
      },
      {
        id: "2", 
        title: "Write Solana Tutorial",
        category: "Community",
        xp: 75,
        difficulty: "Intermediate", 
        timeLeft: "5 days",
        participants: 8,
        description: "Create an educational tutorial for new Solana developers"
      },
      {
        id: "3",
        title: "Vote on Treasury Proposal",
        category: "Governance",
        xp: 25,
        difficulty: "Beginner",
        timeLeft: "12 hours",
        participants: 156,
        description: "Review and vote on the latest DAO treasury allocation proposal"
      }
    ],
    recentActivity: [
      { type: "mission_complete", text: "Completed 'Deploy Smart Contract'", xp: 100, time: "2h ago" },
      { type: "level_up", text: "Reached Level 12!", xp: 0, time: "1d ago" },
      { type: "trait_boost", text: "Builder trait increased to 85", xp: 0, time: "2d ago" }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-primary/20 text-primary";
      case "Intermediate": return "bg-accent/20 text-accent";
      case "Advanced": return "bg-destructive/20 text-destructive";
      default: return "bg-secondary text-secondary-foreground";
    }
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
                <p className="text-sm font-medium text-muted-foreground">Today's XP</p>
                <p className="text-2xl font-bold text-xp-gold">+{dashboardData.todayXP}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Weekly Streak</p>
                <p className="text-2xl font-bold text-accent">{dashboardData.weeklyStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Missions</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.activeMissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-primary">{dashboardData.completedToday}</p>
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
              {dashboardData.featuredMissions.map((mission) => (
                <Card 
                  key={mission.id}
                  className={`p-4 cursor-pointer transition-all border ${
                    selectedMission === mission.id 
                      ? 'border-primary shadow-neon' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMission(selectedMission === mission.id ? null : mission.id)}
                >
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
                          {mission.xp} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {mission.timeLeft}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {mission.participants} participants
                        </span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-4 bg-primary hover:bg-primary/90"
                    >
                      Start <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
              
              <div className="text-center pt-4">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  View All Missions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-accent" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
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
    </div>
  );
}