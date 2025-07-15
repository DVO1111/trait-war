import { useState } from 'react';
import { Settings, Volume2, VolumeX, Monitor, Moon, Sun } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';

export const SettingsDialog = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gaming-accent hover:bg-gaming-accent/20">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gaming-dark border-gaming-accent/30">
        <DialogHeader>
          <DialogTitle className="text-gaming-text flex items-center gap-2">
            <Settings className="h-5 w-5 text-gaming-accent" />
            Game Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gaming-text">Display</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="theme" className="text-gaming-muted">Theme</Label>
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
          </div>

          <Separator className="bg-gaming-accent/20" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gaming-text">Audio</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound" className="text-gaming-muted flex items-center gap-2">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Sound Effects
              </Label>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </div>

          <Separator className="bg-gaming-accent/20" />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gaming-text">Gameplay</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-gaming-muted">Mission Notifications</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autosave" className="text-gaming-muted">Auto-save Progress</Label>
              <Switch
                id="autosave"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};