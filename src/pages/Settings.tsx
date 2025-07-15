import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Volume2,
  VolumeX,
  Monitor,
  Moon,
  Sun,
  Bell,
  Shield,
  User,
  Gamepad2,
  Palette,
  Database,
  Zap,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { connected, publicKey, disconnect } = useWallet();
  const { toast } = useToast();

  // Settings state
  const [settings, setSettings] = useState({
    // Audio
    soundEnabled: true,
    musicEnabled: true,
    volume: 75,
    
    // Notifications
    missionNotifications: true,
    xpNotifications: true,
    daoNotifications: true,
    emailNotifications: false,
    
    // Gameplay
    autoSave: true,
    animations: true,
    showHints: true,
    difficultyMode: 'normal',
    
    // Privacy
    profileVisible: true,
    statsVisible: true,
    activityVisible: false,
    
    // Profile
    username: 'Builder_0x42',
    bio: 'Building the future, one block at a time.',
    avatar: ''
  });

  const handleSaveSettings = () => {
    // Simulate saving to blockchain/database
    toast({
      title: "Settings Saved! ⚙️",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleResetSettings = () => {
    // Reset to defaults
    setSettings({
      soundEnabled: true,
      musicEnabled: true,
      volume: 75,
      missionNotifications: true,
      xpNotifications: true,
      daoNotifications: true,
      emailNotifications: false,
      autoSave: true,
      animations: true,
      showHints: true,
      difficultyMode: 'normal',
      profileVisible: true,
      statsVisible: true,
      activityVisible: false,
      username: 'Builder_0x42',
      bio: 'Building the future, one block at a time.',
      avatar: ''
    });

    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  const handleDisconnectWallet = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been safely disconnected.",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-xp bg-clip-text text-transparent flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Game Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Customize your Trait Wars experience
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={settings.username}
                    onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <Label>Wallet Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {connected ? (
                      <>
                        <Badge className="bg-primary/20 text-primary">Connected</Badge>
                        <span className="text-xs text-muted-foreground">
                          {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                        </span>
                      </>
                    ) : (
                      <Badge variant="secondary">Disconnected</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.bio}
                  onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-secondary border-border"
                  placeholder="Tell other builders about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === 'light' ? 'gaming' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'gaming' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'gaming' : 'ghost'}
                    size="sm"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">Enable Animations</Label>
                <Switch
                  id="animations"
                  checked={settings.animations}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, animations: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hints">Show Gameplay Hints</Label>
                <Switch
                  id="hints"
                  checked={settings.showHints}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showHints: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound Effects</Label>
                <Switch
                  id="sound"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="music">Background Music</Label>
                <Switch
                  id="music"
                  checked={settings.musicEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, musicEnabled: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume">Master Volume: {settings.volume}%</Label>
                <Input
                  type="range"
                  id="volume"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mission-notifs">Mission Updates</Label>
                <Switch
                  id="mission-notifs"
                  checked={settings.missionNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, missionNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="xp-notifs">XP & Level Ups</Label>
                <Switch
                  id="xp-notifs"
                  checked={settings.xpNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, xpNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dao-notifs">DAO Proposals</Label>
                <Switch
                  id="dao-notifs"
                  checked={settings.daoNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, daoNotifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifs">Email Notifications</Label>
                <Switch
                  id="email-notifs"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Gameplay Settings */}
          <Card className="bg-gradient-cyber border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-primary" />
                Gameplay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autosave">Auto-save Progress</Label>
                <Switch
                  id="autosave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Mode</Label>
                <select
                  id="difficulty"
                  value={settings.difficultyMode}
                  onChange={(e) => setSettings(prev => ({ ...prev, difficultyMode: e.target.value }))}
                  className="w-full p-2 bg-secondary border border-border rounded-lg text-foreground"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-gradient-cyber border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-visible">Public Profile</Label>
                <Switch
                  id="profile-visible"
                  checked={settings.profileVisible}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, profileVisible: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="stats-visible">Show Stats</Label>
                <Switch
                  id="stats-visible"
                  checked={settings.statsVisible}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, statsVisible: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="activity-visible">Activity Feed</Label>
                <Switch
                  id="activity-visible"
                  checked={settings.activityVisible}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, activityVisible: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Import Settings
              </Button>
              {connected && (
                <Button 
                  variant="outline" 
                  className="w-full border-destructive text-destructive hover:bg-destructive/10"
                  onClick={handleDisconnectWallet}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </Button>
              )}
              <Separator />
              <Button 
                variant="outline" 
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => {
                  toast({
                    title: "Account Deletion",
                    description: "This feature will be available soon. Contact support for assistance.",
                  });
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}