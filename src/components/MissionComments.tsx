import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { MessageSquare, Send, Loader2, Heart, Reply } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface MissionCommentsProps {
  missionId: string;
}

export function MissionComments({ missionId }: MissionCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, profile } = useWalletAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      // Since we don't have a comments table yet, we'll use mock data
      // In a real implementation, you'd create a mission_comments table
      const mockComments: Comment[] = [
        {
          id: "1",
          content: "Great mission! Looking forward to completing this one.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          profiles: {
            username: "builder_42",
            display_name: "Builder 42",
            avatar_url: ""
          }
        },
        {
          id: "2", 
          content: "Anyone want to collaborate on this? I have some experience with smart contracts.",
          created_at: new Date(Date.now() - 7200000).toISOString(),
          profiles: {
            username: "dev_master",
            display_name: "Dev Master",
            avatar_url: ""
          }
        }
      ];
      
      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [missionId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !profile) return;

    setSubmitting(true);
    try {
      // Mock comment submission - in reality you'd save to database
      const mockComment: Comment = {
        id: Date.now().toString(),
        content: newComment,
        created_at: new Date().toISOString(),
        profiles: {
          username: profile.username || "anonymous",
          display_name: profile.display_name || profile.username || "Anonymous",
          avatar_url: profile.avatar_url || ""
        }
      };

      setComments(prev => [mockComment, ...prev]);
      setNewComment("");
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been added to the mission.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="bg-gradient-mission border-border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or ask questions about this mission..."
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Connect your wallet to join the discussion</p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                    {comment.profiles.avatar_url ? (
                      <img 
                        src={comment.profiles.avatar_url} 
                        alt={comment.profiles.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      comment.profiles.display_name[0] || "?"
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.profiles.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}