import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Target, 
  Users, 
  Trophy, 
  Settings, 
  Zap,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WalletButton } from "@/components/WalletButton";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";

interface GameLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Missions", href: "/missions", icon: Target },
  { name: "Blockchain", href: "/blockchain", icon: Coins },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Creator", href: "/creator", icon: Crown },
  { name: "DAO", href: "/dao", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function GameLayout({ children }: GameLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading, signOut, isAuthenticated, displayName } = useAuth();
  const { progress, getXPNeededForNextLevel, getProgressToNextLevel, loading: progressLoading } = useUserProgress();



  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Get real player data from progress with fallbacks
  const playerData = {
    username: displayName || "Builder",
    level: progress?.level || 1,
    xp: progress?.total_xp || 0,
    currentLevelXP: progress?.current_level_xp || 0,
    xpToNext: progress ? getXPNeededForNextLevel() : 250, // Default to 250 for level 1
    progressToNext: progress ? getProgressToNextLevel() : 0,
    traits: {
      builder: 85, // These would come from blockchain/missions in the future
      community: 67,
      governance: 42
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="flex h-full flex-col bg-gradient-mission border-r border-border">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4">
            {sidebarOpen && (
              <h1 className="text-xl font-bold bg-gradient-xp bg-clip-text text-transparent">
                Trait Wars
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-secondary"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Player Stats */}
          {sidebarOpen && (
            <Card className="mx-4 mb-6 p-4 bg-gradient-cyber border-primary/20">
              <div className="text-center mb-3">
                <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center shadow-neon">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-sm">{displayName}</h3>
                <p className="text-xs text-muted-foreground">Level {playerData.level}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>XP Progress</span>
                  <span>{playerData.currentLevelXP} / {playerData.xpToNext}</span>
                </div>
                <Progress 
                  value={playerData.progressToNext} 
                  className="h-2 bg-secondary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total XP: {playerData.xp.toLocaleString()}</span>
                  <span>Level {playerData.level}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-neon'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <item.icon className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} h-5 w-5`} />
                  {sidebarOpen && item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Traits (if sidebar open) */}
          {sidebarOpen && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">TRAITS</h4>
              <div className="space-y-2">
                {Object.entries(playerData.traits).map(([trait, value]) => (
                  <div key={trait} className="flex justify-between items-center text-xs">
                    <span className="capitalize">{trait}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-secondary rounded-full">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-8 text-right">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Header Bar */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">Trait Wars</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {displayName}
              </div>
              <WalletButton />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <SettingsDialog />
            </div>
          </div>
        </header>
        
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}