import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { 
  Upload, 
  Link, 
  FileText, 
  Github, 
  Globe, 
  Send,
  Star,
  Clock,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  xp: number;
  difficulty: string;
  timeLeft: string;
  participants: number;
  creator: string;
  isOfficial: boolean;
  requirements: string[];
  deliverables: string[];
}

// Validation schema for mission submission
const submissionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters long")
    .max(1000, "Description must be less than 1000 characters"),
  githubUrl: z.string().optional().refine((url) => {
    if (!url) return true;
    return z.string().url().safeParse(url).success && url.includes('github.com');
  }, "Please enter a valid GitHub URL"),
  demoUrl: z.string().optional().refine((url) => {
    if (!url) return true;
    return z.string().url().safeParse(url).success;
  }, "Please enter a valid demo URL"),
  documentationUrl: z.string().optional().refine((url) => {
    if (!url) return true;
    return z.string().url().safeParse(url).success;
  }, "Please enter a valid documentation URL"),
  additionalNotes: z.string().max(500, "Additional notes must be less than 500 characters").optional()
});

interface MissionSubmissionDialogProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MissionSubmissionDialog = ({ mission, isOpen, onClose }: MissionSubmissionDialogProps) => {
  const [submissionData, setSubmissionData] = useState({
    title: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
    documentationUrl: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Validate submission data
      const validatedData = submissionSchema.parse(submissionData);
      
      // Additional security checks
      if (validatedData.title.trim() !== validatedData.title) {
        throw new Error("Title contains invalid characters");
      }

      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Mission Submitted Successfully! 🎉",
        description: `Your submission for "${mission?.title}" has been sent for review. You'll earn ${mission?.xp} XP once approved.`,
      });

      onClose();
      
      // Reset form
      setSubmissionData({
        title: '',
        description: '',
        githubUrl: '',
        demoUrl: '',
        documentationUrl: '',
        additionalNotes: ''
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: "Validation Error",
          description: "Please fix the errors in your submission and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Error",
          description: "Failed to submit mission. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mission) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-primary/20 text-primary border-primary/30";
      case "Intermediate": return "bg-accent/20 text-accent border-accent/30";
      case "Advanced": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gaming-dark border-gaming-accent/30">
        <DialogHeader>
          <DialogTitle className="text-gaming-text flex items-center gap-2">
            <Send className="h-5 w-5 text-gaming-accent" />
            Submit Mission
          </DialogTitle>
        </DialogHeader>
        
        {/* Mission Info */}
        <div className="space-y-4 p-4 bg-gaming-card rounded-lg border border-gaming-accent/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gaming-text">{mission.title}</h3>
              <p className="text-sm text-gaming-muted">{mission.description}</p>
            </div>
            <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
              {mission.difficulty}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gaming-muted">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-gaming-accent" />
              <span className="text-gaming-accent font-medium">{mission.xp} XP</span>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Deliverables */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gaming-accent" />
              <h3 className="text-sm font-semibold text-gaming-text">Required Deliverables</h3>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs">
              {mission.deliverables.map((deliverable, index) => (
                <div key={index} className="flex items-center gap-2 text-gaming-muted">
                  <div className="w-1 h-1 bg-gaming-accent rounded-full" />
                  {deliverable}
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gaming-accent/20" />

          {/* Submission Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gaming-text">Submission Title *</Label>
              <Input
                id="title"
                value={submissionData.title}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your submission a clear title"
                className={`bg-gaming-card border-gaming-accent/30 text-gaming-text ${
                  validationErrors.title ? 'border-destructive' : ''
                }`}
                required
              />
              {validationErrors.title && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-sm">{validationErrors.title}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-gaming-text">Description *</Label>
              <Textarea
                id="description"
                value={submissionData.description}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you built and how it meets the mission requirements"
                className={`bg-gaming-card border-gaming-accent/30 text-gaming-text min-h-[100px] ${
                  validationErrors.description ? 'border-destructive' : ''
                }`}
                required
              />
              {validationErrors.description && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription className="text-sm">{validationErrors.description}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="github" className="text-gaming-text flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </Label>
                <Input
                  id="github"
                  value={submissionData.githubUrl}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                  className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                />
              </div>

              <div>
                <Label htmlFor="demo" className="text-gaming-text flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Live Demo URL
                </Label>
                <Input
                  id="demo"
                  value={submissionData.demoUrl}
                  onChange={(e) => setSubmissionData(prev => ({ ...prev, demoUrl: e.target.value }))}
                  placeholder="https://your-demo.com"
                  className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="docs" className="text-gaming-text flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documentation URL
              </Label>
              <Input
                id="docs"
                value={submissionData.documentationUrl}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                placeholder="Link to documentation, tutorial, or additional materials"
                className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-gaming-text">Additional Notes</Label>
              <Textarea
                id="notes"
                value={submissionData.additionalNotes}
                onChange={(e) => setSubmissionData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any additional information, challenges faced, or future improvements"
                className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gaming-card rounded-lg border border-gaming-accent/20">
            <AlertCircle className="h-4 w-4 text-gaming-accent" />
            <p className="text-xs text-gaming-muted">
              Your submission will be reviewed by the mission creator and DAO validators. 
              You'll receive {mission.xp} XP once approved.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gaming-accent/30 text-gaming-text hover:bg-gaming-accent/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !submissionData.title || !submissionData.description}
              className="flex-1 bg-gaming-accent text-black hover:bg-gaming-accent/80"
            >
              {isSubmitting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Mission
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};