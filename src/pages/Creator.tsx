import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreator } from "@/hooks/useCreator";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import {
  Target,
  Clock,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  ExternalLink,
  Github,
  Globe,
  FileText,
  Loader2,
  AlertCircle,
  Crown,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function Creator() {
  const { isAuthenticated } = useWalletAuth();
  const { 
    creatorMissions, 
    pendingSubmissions, 
    notifications,
    loading, 
    error,
    reviewSubmission,
    markNotificationAsRead,
    getUnreadNotificationCount
  } = useCreator();
  
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Creator Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to access the Creator Dashboard
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleReviewSubmission = async (submissionId: string, status: 'approved' | 'rejected') => {
    setIsSubmitting(true);
    const success = await reviewSubmission(submissionId, status, reviewFeedback);
    if (success) {
      setSelectedSubmission(null);
      setReviewFeedback("");
    }
    setIsSubmitting(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-primary/20 text-primary border-primary/30";
      case "Intermediate": return "bg-accent/20 text-accent border-accent/30";
      case "Advanced": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "approved": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-500 border-red-500/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading creator dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading creator dashboard: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedSubmissionData = pendingSubmissions.find(s => s.id === selectedSubmission);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-xp bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your missions and review submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {getUnreadNotificationCount()} New Notifications
          </Badge>
          <Button className="bg-primary hover:bg-primary/90 shadow-neon">
            <Target className="mr-2 h-4 w-4" />
            Create Mission
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Missions</p>
                <p className="text-2xl font-bold text-primary">{creatorMissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingSubmissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-500">
                  {creatorMissions.reduce((sum, mission) => sum + mission.approved_submissions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-xp-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-xp-gold" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">XP Awarded</p>
                <p className="text-2xl font-bold text-xp-gold">
                  {creatorMissions.reduce((sum, mission) => sum + (mission.xp_reward * mission.approved_submissions), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending Reviews ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="missions">
            My Missions ({creatorMissions.length})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications ({getUnreadNotificationCount()})
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingSubmissions.length === 0 ? (
            <Card className="bg-gradient-mission border-border">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">
                  All submissions have been reviewed. Great work!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-gradient-mission border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{submission.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          For: {submission.mission.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(submission.mission.difficulty)}>
                            {submission.mission.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="bg-xp-gold/20 text-xp-gold">
                            {submission.mission.xp_reward} XP
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Submitter:</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.user_profile.display_name || submission.user_profile.username || 'Anonymous'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Description:</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {submission.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {submission.github_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={submission.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            Code
                          </a>
                        </Button>
                      )}
                      {submission.demo_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={submission.demo_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-1" />
                            Demo
                          </a>
                        </Button>
                      )}
                      {submission.documentation_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={submission.documentation_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-1" />
                            Docs
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedSubmission(submission.id)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          {creatorMissions.length === 0 ? (
            <Card className="bg-gradient-mission border-border">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Missions Created</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first mission to get started!
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Create Mission
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {creatorMissions.map((mission) => (
                <Card key={mission.id} className="bg-gradient-mission border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{mission.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(mission.difficulty)}>
                            {mission.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="bg-xp-gold/20 text-xp-gold">
                            {mission.xp_reward} XP
                          </Badge>
                        </div>
                      </div>
                      {mission.is_official && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary">
                          Official
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {mission.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{mission.submission_count}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">{mission.pending_submissions}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">{mission.approved_submissions}</p>
                        <p className="text-xs text-muted-foreground">Approved</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="bg-gradient-mission border-border">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground">
                  You'll receive notifications here when users submit to your missions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`bg-gradient-mission border-border ${
                    !notification.is_read ? 'border-primary/50' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          New submission received for "{notification.mission?.title}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedSubmissionData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gaming-dark border-gaming-accent/30">
            <CardHeader>
              <CardTitle className="text-gaming-text">
                Review Submission: {selectedSubmissionData.title}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gaming-text">Mission:</Label>
                  <p className="text-gaming-muted">{selectedSubmissionData.mission.title}</p>
                </div>
                
                <div>
                  <Label className="text-gaming-text">Description:</Label>
                  <p className="text-gaming-muted">{selectedSubmissionData.description}</p>
                </div>
                
                <div className="flex gap-2">
                  {selectedSubmissionData.github_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedSubmissionData.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        View Code
                      </a>
                    </Button>
                  )}
                  {selectedSubmissionData.demo_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedSubmissionData.demo_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-1" />
                        View Demo
                      </a>
                    </Button>
                  )}
                  {selectedSubmissionData.documentation_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={selectedSubmissionData.documentation_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-1" />
                        View Docs
                      </a>
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="feedback" className="text-gaming-text">Review Feedback (Optional):</Label>
                  <Textarea
                    id="feedback"
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Provide feedback to help the submitter improve..."
                    className="bg-gaming-card border-gaming-accent/30 text-gaming-text mt-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubmission(null)}
                  className="flex-1 border-gaming-accent/30 text-gaming-text hover:bg-gaming-accent/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmissionData.id, 'rejected')}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmissionData.id, 'approved')}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}