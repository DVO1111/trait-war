import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Target, 
  Users, 
  Trophy, 
  Settings, 
  Zap,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GameLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Missions", href: "/missions", icon: Target },
  { name: "DAO", href: "/dao", icon: Users },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function GameLayout({ children }: GameLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Mock player data - in real app this would come from blockchain/state
  const playerData = {
    username: "Builder_0x42",
    level: 12,
    xp: 2847,
    xpToNext: 3500,
    traits: {
      builder: 85,
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
                <h3 className="font-semibold text-sm">{playerData.username}</h3>
                <p className="text-xs text-muted-foreground">Level {playerData.level}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>XP Progress</span>
                  <span>{playerData.xp} / {playerData.xpToNext}</span>
                </div>
                <Progress 
                  value={(playerData.xp / playerData.xpToNext) * 100} 
                  className="h-2 bg-secondary"
                />
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
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}