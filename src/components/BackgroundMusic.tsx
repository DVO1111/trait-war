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
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (audioRef.current && isLoaded) {
      audioRef.current.volume = currentSettings.volume / 100;
      
      if (currentSettings.isEnabled && !isPlaying) {
        console.log('Attempting to play Billionaire Club...');
        audioRef.current.play().then(() => {
          console.log('Audio playing successfully');
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Autoplay prevented or failed:', error);
          setError('Autoplay blocked - click the play button');
        });
      } else if (!currentSettings.isEnabled && isPlaying) {
        console.log('Pausing audio...');
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentSettings.isEnabled, currentSettings.volume, isLoaded]); // Fixed dependency array

  // Update settings when props change
  useEffect(() => {
    setCurrentSettings({ isEnabled, volume });
  }, [isEnabled, volume]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        console.log('Manual pause clicked');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Manual play clicked');
        audioRef.current.play().then(() => {
          console.log('Manual play successful');
          setIsPlaying(true);
          setError(null);
        }).catch((error) => {
          console.error('Manual play failed:', error);
          setError('Failed to play audio');
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
        onLoadedData={() => {
          console.log('Audio loaded successfully');
          setIsLoaded(true);
          setError(null);
        }}
        onError={(e) => {
          console.error('Audio loading error:', e);
          setError('Failed to load audio file');
          setIsLoaded(false);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/audio/billionaires-club-olamide.mp3" type="audio/mpeg" />
        <source src="/audio/billionaires-club-olamide.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
      
      {error && (
        <div className="mb-2 text-xs text-red-500 bg-background/80 p-1 rounded">
          {error}
        </div>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/10 transition-all duration-300"
        onClick={handlePlayPause}
        title={`${isPlaying ? "Pause" : "Play"} Billionaire Club ${isLoaded ? "" : "(Loading...)"}`}
      >
        {!isLoaded ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
        ) : isPlaying ? (
          currentSettings.isEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Play className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};