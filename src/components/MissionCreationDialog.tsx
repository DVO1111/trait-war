import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { 
  Plus,
  X,
  Target,
  Star,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';

// Validation schema for mission creation
const missionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters long")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.enum(["tech", "community", "governance", "education"], {
    required_error: "Please select a category"
  }),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a difficulty level"
  }),
  xp_reward: z.number().min(10, "XP reward must be at least 10")
    .max(1000, "XP reward must be less than 1000"),
  expires_at: z.string().optional(),
  max_participants: z.number().min(1, "Must allow at least 1 participant").optional(),
  requirements: z.array(z.string()).min(1, "At least one requirement is needed"),
  deliverables: z.array(z.string()).min(1, "At least one deliverable is needed"),
});

interface MissionCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MissionCreationDialog = ({ isOpen, onClose, onSuccess }: MissionCreationDialogProps) => {
  const [missionData, setMissionData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    xp_reward: 50,
    expires_at: '',
    max_participants: 50,
    requirements: [''],
    deliverables: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

    try {
      // Filter out empty requirements and deliverables
      const filteredRequirements = missionData.requirements.filter(req => req.trim() !== '');
      const filteredDeliverables = missionData.deliverables.filter(del => del.trim() !== '');

      // Validate mission data
      const validatedData = missionSchema.parse({
        ...missionData,
        requirements: filteredRequirements,
        deliverables: filteredDeliverables,
        expires_at: missionData.expires_at || undefined,
        max_participants: missionData.max_participants || undefined
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Insert mission into database
      const { error } = await supabase
        .from('missions')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          category: validatedData.category,
          difficulty: validatedData.difficulty,
          xp_reward: validatedData.xp_reward,
          expires_at: validatedData.expires_at ? new Date(validatedData.expires_at).toISOString() : null,
          max_participants: validatedData.max_participants,
          requirements: validatedData.requirements,
          deliverables: validatedData.deliverables,
          creator_id: user.id,
          is_official: false
        });

      if (error) throw error;

      toast({
        title: "Mission Created Successfully! 🎉",
        description: `"${validatedData.title}" has been created and is now live.`,
      });

      // Reset form
      setMissionData({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        xp_reward: 50,
        expires_at: '',
        max_participants: 50,
        requirements: [''],
        deliverables: ['']
      });

      onSuccess();
      onClose();
      
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
          description: "Please fix the errors in your mission and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Creation Error",
          description: error instanceof Error ? error.message : "Failed to create mission. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRequirement = () => {
    setMissionData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    setMissionData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setMissionData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addDeliverable = () => {
    setMissionData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setMissionData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setMissionData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((del, i) => i === index ? value : del)
    }));
  };

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gaming-dark border-gaming-accent/30">
        <DialogHeader>
          <DialogTitle className="text-gaming-text flex items-center gap-2">
            <Target className="h-5 w-5 text-gaming-accent" />
            Create New Mission
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gaming-text">Mission Title *</Label>
              <Input
                id="title"
                value={missionData.title}
                onChange={(e) => setMissionData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a clear, engaging mission title"
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
                value={missionData.description}
                onChange={(e) => setMissionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the mission objective, context, and what participants will learn or build"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-gaming-text">Category *</Label>
                <Select
                  value={missionData.category}
                  onValueChange={(value) => setMissionData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-gaming-card border-gaming-accent/30 text-gaming-text">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">🔧 Tech & Build</SelectItem>
                    <SelectItem value="community">👥 Community</SelectItem>
                    <SelectItem value="governance">🗳️ Governance</SelectItem>
                    <SelectItem value="education">📚 Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-gaming-text">Difficulty *</Label>
                <Select
                  value={missionData.difficulty}
                  onValueChange={(value) => setMissionData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="bg-gaming-card border-gaming-accent/30 text-gaming-text">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="xp_reward" className="text-gaming-text">XP Reward *</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  min="10"
                  max="1000"
                  value={missionData.xp_reward}
                  onChange={(e) => setMissionData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 50 }))}
                  className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expires_at" className="text-gaming-text">Deadline (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={missionData.expires_at}
                  onChange={(e) => setMissionData(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                />
              </div>

              <div>
                <Label htmlFor="max_participants" className="text-gaming-text">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  min="1"
                  value={missionData.max_participants}
                  onChange={(e) => setMissionData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 50 }))}
                  className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gaming-text">Requirements *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
                className="border-gaming-accent/30 text-gaming-text hover:bg-gaming-accent/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Requirement
              </Button>
            </div>
            <div className="space-y-2">
              {missionData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="e.g., Basic JavaScript knowledge"
                    className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                  />
                  {missionData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-gaming-text">Deliverables *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDeliverable}
                className="border-gaming-accent/30 text-gaming-text hover:bg-gaming-accent/10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Deliverable
              </Button>
            </div>
            <div className="space-y-2">
              {missionData.deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                    placeholder="e.g., GitHub repository with working code"
                    className="bg-gaming-card border-gaming-accent/30 text-gaming-text"
                  />
                  {missionData.deliverables.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDeliverable(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {missionData.title && missionData.difficulty && (
            <div className="p-4 bg-gaming-card rounded-lg border border-gaming-accent/20">
              <h3 className="text-sm font-semibold text-gaming-text mb-2">Preview:</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gaming-text">{missionData.title}</h4>
                  <div className="flex items-center gap-2">
                    {missionData.difficulty && (
                      <Badge className={getDifficultyColor(missionData.difficulty)}>
                        {missionData.difficulty}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-xp-gold/20 text-xp-gold">
                      {missionData.xp_reward} XP
                    </Badge>
                  </div>
                </div>
                {missionData.description && (
                  <p className="text-sm text-gaming-muted line-clamp-2">{missionData.description}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-gaming-card rounded-lg border border-gaming-accent/20">
            <AlertCircle className="h-4 w-4 text-gaming-accent" />
            <p className="text-xs text-gaming-muted">
              Your mission will be reviewed by the community. Make sure to provide clear requirements and deliverables.
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
              disabled={isSubmitting || !missionData.title || !missionData.description}
              className="flex-1 bg-gaming-accent text-black hover:bg-gaming-accent/80"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Create Mission
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};