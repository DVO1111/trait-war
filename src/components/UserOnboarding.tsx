
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Target, 
  Trophy, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Crown
} from "lucide-react";

interface UserOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserOnboarding = ({ isOpen, onClose }: UserOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      title: "Welcome to Trait Wars! 🎮",
      description: "Build your Web3 reputation through missions and earn XP",
      icon: <Star className="h-8 w-8 text-xp-gold" />,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-6xl">🏆</div>
            <h3 className="text-xl font-bold">Ready to become a Builder?</h3>
            <p className="text-muted-foreground">
              Trait Wars is a gamified platform where you complete missions, earn XP, 
              and level up your Web3 skills while building real projects.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-cyber border-primary/20">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Complete Missions</p>
                <p className="text-xs text-muted-foreground">Build real projects</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-cyber border-xp-gold/20">
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 text-xp-gold mx-auto mb-2" />
                <p className="text-sm font-medium">Earn XP</p>
                <p className="text-xs text-muted-foreground">Level up your skills</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "How XP and Levels Work 📊",
      description: "Understanding the progression system",
      icon: <Trophy className="h-8 w-8 text-xp-gold" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-cyber rounded-lg border border-primary/20">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <div>
                <p className="font-medium">Start a Mission</p>
                <p className="text-sm text-muted-foreground">Choose from tech, community, or governance missions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-cyber rounded-lg border border-accent/20">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <span className="text-accent-foreground font-bold">2</span>
              </div>
              <div>
                <p className="font-medium">Submit Your Work</p>
                <p className="text-sm text-muted-foreground">Share your GitHub repo, demo, or documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-cyber rounded-lg border border-xp-gold/20">
              <div className="w-8 h-8 bg-xp-gold rounded-full flex items-center justify-center">
                <span className="text-black font-bold">3</span>
              </div>
              <div>
                <p className="font-medium">Earn XP & Level Up</p>
                <p className="text-sm text-muted-foreground">Get reviewed and earn XP to advance your level</p>
              </div>
            </div>
          </div>
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-xp-gold" />
              <span className="font-medium">Level Example</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 5 Progress</span>
                <span>350 / 600 XP</span>
              </div>
              <Progress value={58} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Each level requires more XP: Level 1 needs 100 XP, Level 2 needs 250 XP, etc.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Mission Categories 🎯",
      description: "Different ways to earn XP and build your reputation",
      icon: <Target className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-gradient-cyber border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">🔧</span>
                  </div>
                  <div>
                    <p className="font-medium">Tech & Build</p>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      High XP
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Build dApps, smart contracts, tools, and technical solutions
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-cyber border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-accent-foreground text-sm">👥</span>
                  </div>
                  <div>
                    <p className="font-medium">Community</p>
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      Medium XP
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create content, host events, moderate discussions
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-cyber border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground text-sm">🗳️</span>
                  </div>
                  <div>
                    <p className="font-medium">Governance</p>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                      Quick XP
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Participate in DAO voting, write proposals, review treasury
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Start! 🚀",
      description: "Your journey begins now",
      icon: <Zap className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="text-center space-y-3">
            <div className="text-6xl">🎯</div>
            <h3 className="text-xl font-bold">You're All Set!</h3>
            <p className="text-muted-foreground">
              Head to the Mission Center to find your first mission and start earning XP.
            </p>
          </div>
          <div className="bg-gradient-cyber p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">Pro Tips:</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Start with Beginner missions if you're new to Web3</li>
              <li>• Submit high-quality work to earn maximum XP</li>
              <li>• Join the Discord community for help and collaboration</li>
              <li>• Check the leaderboard to see top builders</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('traitWarsOnboardingCompleted', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gaming-dark border-gaming-accent/30">
        <DialogHeader>
          <DialogTitle className="text-gaming-text flex items-center gap-2">
            {currentStepData.icon}
            {currentStepData.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gaming-muted">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          </div>

          {/* Step content */}
          <div className="min-h-[300px]">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-primary/30 text-foreground hover:bg-secondary/50"
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                >
                  Let's Build!
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
