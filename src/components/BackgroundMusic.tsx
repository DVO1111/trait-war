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

  // Create a simple ambient tone using Web Audio API as a placeholder
  const createAmbientTone = () => {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a subtle ambient drone
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      return { oscillator, gainNode, audioContext };
    }
    return null;
  };

  const [audioNodes, setAudioNodes] = useState<any>(null);

  useEffect(() => {
    if (isEnabled && !isPlaying && !audioNodes) {
      const nodes = createAmbientTone();
      if (nodes) {
        setAudioNodes(nodes);
        nodes.oscillator.start();
        nodes.gainNode.gain.setValueAtTime((volume / 100) * 0.1, nodes.audioContext.currentTime);
        setIsPlaying(true);
      }
    } else if (!isEnabled && audioNodes) {
      audioNodes.oscillator.stop();
      audioNodes.audioContext.close();
      setAudioNodes(null);
      setIsPlaying(false);
    } else if (audioNodes && isEnabled) {
      audioNodes.gainNode.gain.setValueAtTime((volume / 100) * 0.1, audioNodes.audioContext.currentTime);
    }
  }, [isEnabled, volume]);

  useEffect(() => {
    return () => {
      if (audioNodes) {
        try {
          audioNodes.oscillator.stop();
          audioNodes.audioContext.close();
        } catch (e) {
          // Audio context may already be closed
        }
      }
    };
  }, [audioNodes]);

  const handlePlayPause = () => {
    if (isPlaying && audioNodes) {
      audioNodes.oscillator.stop();
      audioNodes.audioContext.close();
      setAudioNodes(null);
      setIsPlaying(false);
    } else if (!isPlaying) {
      const nodes = createAmbientTone();
      if (nodes) {
        setAudioNodes(nodes);
        nodes.oscillator.start();
        nodes.gainNode.gain.setValueAtTime((volume / 100) * 0.1, nodes.audioContext.currentTime);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">      
      <Button
        variant="ghost"
        size="icon"
        className="bg-background/80 backdrop-blur-sm border border-border hover:bg-primary/10 transition-all duration-300 animate-pulse"
        onClick={handlePlayPause}
        title={isPlaying ? "Pause Superteam Ambient Music" : "Play Superteam Ambient Music"}
      >
        {isPlaying ? (
          isEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Play className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};