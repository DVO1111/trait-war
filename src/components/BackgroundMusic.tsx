import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface BackgroundMusicProps {
  isEnabled: boolean;
  volume: number;
}

export const BackgroundMusic = ({ isEnabled, volume }: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSettings, setCurrentSettings] = useState({ isEnabled, volume });

  // Listen for settings changes from localStorage
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setCurrentSettings(event.detail);
    };

    window.addEventListener('musicSettingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('musicSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  // Control audio playback based on settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentSettings.volume / 100;
      
      if (currentSettings.isEnabled && !isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Autoplay prevented:', error);
        });
      } else if (!currentSettings.isEnabled && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentSettings, isPlaying]);

  // Update settings when props change
  useEffect(() => {
    setCurrentSettings({ isEnabled, volume });
  }, [isEnabled, volume]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Play failed:', error);
        });
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onLoadedData={() => {}}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="https://soundcloud.com/olamidemusic/billionaires-club-feat-wizkid" type="audio/mpeg" />
        <source src="/audio/billionaires-club-olamide.mp3" type="audio/mpeg" />
        {/* Billionaire Club by Olamide ft. Wizkid & Darkoo */}
        Your browser does not support the audio element.
      </audio>
      
      <Button
        variant="ghost"
        size="icon"
        className="bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/10 transition-all duration-300"
        onClick={handlePlayPause}
        title={isPlaying ? "Pause Billionaire Club" : "Play Billionaire Club"}
      >
        {isPlaying ? (
          currentSettings.isEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Play className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};