import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import {
  Vote,
  Trophy,
  Users,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Shield,
  Zap,
  Loader2
} from "lucide-react";

export default function DAO() {
  const { isAuthenticated, profile } = useWalletAuth();
  const { toast } = useToast();
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<Record<string, { isVoting: boolean; hasVoted: boolean; userVote?: 'for' | 'against' }>>({});
  const [proposals, setProposals] = useState([
    {
      id: "1",
      title: "Q2 2024 Development Fund Allocation",
      description: "Allocate 500,000 tokens for development initiatives including new feature development, security audits, and community tools.",
      category: "Treasury",
      status: "active",
      votesFor: 654321,
      votesAgainst: 123456,
      totalVotes: 777777,
      timeLeft: "3 days",
      proposer: "DevTeam_Lead",
      requiredXP: 100,
      details: {
        breakdown: [
          { item: "Core Development", amount: 300000, percentage: 60 },
          { item: "Security Audits", amount: 100000, percentage: 20 },
          { item: "Community Tools", amount: 100000, percentage: 20 }
        ]
      }
    },
    {
      id: "2",
      title: "New Mission Category: AI/ML",
      description: "Introduce artificial intelligence and machine learning as a new mission category with specialized XP multipliers.",
      category: "Governance",
      status: "active",
      votesFor: 234567,
      votesAgainst: 87654,
      totalVotes: 322221,
      timeLeft: "1 week",
      proposer: "AI_Researcher_99",
      requiredXP: 50,
      details: {
        changes: [
          "Add AI/ML mission category",
          "Implement 1.5x XP multiplier for AI missions",
          "Create specialized validator roles"
        ]
      }
    },
    {
      id: "3",
      title: "Guild System Implementation",
      description: "Implement a guild system allowing players to form groups, share XP bonuses, and compete in team challenges.",
      category: "Features",
      status: "passed",
      votesFor: 891234,
      votesAgainst: 45678,
      totalVotes: 936912,
      timeLeft: "Passed",
      proposer: "Guild_Master_X",
      requiredXP: 75,
      details: {
        features: [
          "Guild creation and management",
          "Shared XP bonus pools",
          "Inter-guild competitions",
          "Guild-specific missions"
        ]
      }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-primary/20 text-primary border-primary/30";
      case "passed": return "bg-primary/20 text-primary border-primary/30";
      case "rejected": return "bg-destructive/20 text-destructive border-destructive/30";
      case "pending": return "bg-accent/20 text-accent border-accent/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getVotePercentage = (votesFor: number, totalVotes: number) => {
    return Math.round((votesFor / totalVotes) * 100);
  };

  // Mock XP calculation based on profile
  const getCurrentUserXP = () => {
    if (!profile) return 0;
    // Mock calculation - in real app this would come from profile or blockchain
    return (profile.warrior_count || 0) * 50 + 150; // Base XP plus warrior bonuses
  };

  const handleVote = async (proposalId: string, vote: 'for' | 'against') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to vote on proposals.",
        variant: "destructive",
      });
      return;
    }

    const userXP = getCurrentUserXP();
    const proposal = proposals.find(p => p.id === proposalId);
    
    if (!proposal) return;

    if (userXP < proposal.requiredXP) {
      toast({
        title: "Insufficient XP",
        description: `You need ${proposal.requiredXP} XP to vote on this proposal. You currently have ${userXP} XP.`,
        variant: "destructive",
      });
      return;
    }

    const currentVoteState = votingStates[proposalId];
    if (currentVoteState?.hasVoted) {
      toast({
        title: "Already Voted",
        description: "You have already voted on this proposal.",
        variant: "destructive",
      });
      return;
    }

    // Set voting state
    setVotingStates(prev => ({
      ...prev,
      [proposalId]: { isVoting: true, hasVoted: false }
    }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update proposal vote counts
      setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
          const votingPower = userXP; // Use XP as voting power
          return {
            ...p,
            votesFor: vote === 'for' ? p.votesFor + votingPower : p.votesFor,
            votesAgainst: vote === 'against' ? p.votesAgainst + votingPower : p.votesAgainst,
            totalVotes: p.totalVotes + votingPower
          };
        }
        return p;
      }));

      // Update voting state
      setVotingStates(prev => ({
        ...prev,
        [proposalId]: { isVoting: false, hasVoted: true, userVote: vote }
      }));

      toast({
        title: "Vote Recorded!",
        description: `Your vote ${vote === 'for' ? 'for' : 'against'} "${proposal.title}" has been recorded with ${userXP} voting power.`,
      });

    } catch (error) {
      setVotingStates(prev => ({
        ...prev,
        [proposalId]: { isVoting: false, hasVoted: false }
      }));

      toast({
        title: "Voting Failed",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // DAO data with dynamic calculations
  const daoData = {
    treasuryValue: 2847000,
    totalMembers: 1247,
    activeProposals: proposals.filter(p => p.status === 'active').length,
    myVotingPower: getCurrentUserXP(),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-xp bg-clip-text text-transparent">
            DAO Governance
          </h1>
          <p className="text-muted-foreground mt-1">
            Shape the future of Trait Wars through democratic participation
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-neon">
          <Vote className="mr-2 h-4 w-4" />
          Create Proposal
        </Button>
      </div>

      {/* DAO Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Coins className="h-8 w-8 text-xp-gold" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Treasury Value</p>
                <p className="text-2xl font-bold text-xp-gold">
                  {(daoData.treasuryValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">DAO Members</p>
                <p className="text-2xl font-bold text-accent">{daoData.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Vote className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Proposals</p>
                <p className="text-2xl font-bold text-primary">{daoData.activeProposals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-cyber border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">My Voting Power</p>
                <p className="text-2xl font-bold text-primary">{daoData.myVotingPower}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="proposals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Proposals
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {!isAuthenticated && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your wallet to participate in DAO governance and vote on proposals.
              </AlertDescription>
            </Alert>
          )}
          
          {proposals.map((proposal) => {
            const voteState = votingStates[proposal.id];
            const userXP = getCurrentUserXP();
            const canVote = isAuthenticated && userXP >= proposal.requiredXP && !voteState?.hasVoted;
            
            return (
              <Card 
                key={proposal.id}
                className={`cursor-pointer transition-all border ${
                  selectedProposal === proposal.id 
                    ? 'border-primary shadow-neon bg-gradient-cyber' 
                    : 'border-border hover:border-primary/50 bg-gradient-mission'
                }`}
                onClick={() => setSelectedProposal(selectedProposal === proposal.id ? null : proposal.id)}
              >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                        {proposal.status.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {proposal.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by {proposal.proposer}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {proposal.timeLeft}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{proposal.description}</p>
                
                {/* Voting Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Support: {getVotePercentage(proposal.votesFor, proposal.totalVotes)}%</span>
                    <span>{proposal.totalVotes.toLocaleString()} total votes</span>
                  </div>
                  <Progress 
                    value={getVotePercentage(proposal.votesFor, proposal.totalVotes)} 
                    className="h-3 bg-secondary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-primary" />
                      {proposal.votesFor.toLocaleString()} for
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-destructive" />
                      {proposal.votesAgainst.toLocaleString()} against
                    </span>
                  </div>
                </div>

                {selectedProposal === proposal.id && (
                  <div className="border-t border-border pt-4 space-y-4">
                    {proposal.details.breakdown && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Fund Allocation:</h4>
                        <div className="space-y-2">
                          {proposal.details.breakdown.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{item.item}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xp-gold font-medium">
                                  {item.amount.toLocaleString()} tokens
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {item.percentage}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {proposal.details.changes && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Proposed Changes:</h4>
                        <ul className="space-y-1">
                          {proposal.details.changes.map((change, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {proposal.details.features && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">New Features:</h4>
                        <ul className="space-y-1">
                          {proposal.details.features.map((feature, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1 h-1 bg-accent rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {proposal.status === 'active' && (
                  <div className="space-y-3">
                    {voteState?.hasVoted && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          You voted <strong>{voteState.userVote}</strong> this proposal.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(proposal.id, 'for');
                        }}
                        disabled={!canVote || voteState?.isVoting}
                      >
                        {voteState?.isVoting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Vote For
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(proposal.id, 'against');
                        }}
                        disabled={!canVote || voteState?.isVoting}
                      >
                        {voteState?.isVoting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Vote Against
                      </Button>
                    </div>
                  </div>
                )}
                
                 <div className="flex items-center justify-between text-xs text-muted-foreground">
                   <div className="flex items-center gap-2">
                     <AlertCircle className="h-3 w-3" />
                     Requires {proposal.requiredXP} XP to vote
                   </div>
                   {isAuthenticated && (
                     <div className="flex items-center gap-2">
                       <Zap className="h-3 w-3" />
                       Your XP: {userXP}
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
           );
         })}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="bg-gradient-mission border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-xp-gold" />
                Top Builders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { rank: 1, username: "CryptoBuilder42", xp: 15647, traits: { builder: 95, community: 89, governance: 78 } },
                { rank: 2, username: "DevMaster", xp: 14523, traits: { builder: 87, community: 95, governance: 92 } },
                { rank: 3, username: "TraitHunter", xp: 13891, traits: { builder: 92, community: 76, governance: 85 } },
                { rank: 4, username: "BlockchainWiz", xp: 12456, traits: { builder: 68, community: 97, governance: 73 } },
                { rank: 5, username: "Builder_0x42", xp: 11234, traits: { builder: 85, community: 67, governance: 42 } }
              ].map((player, index) => (
                <div 
                  key={player.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    index === 0 ? 'bg-gradient-cyber border border-xp-gold/30' :
                    index === 1 ? 'bg-gradient-cyber border border-accent/30' :
                    index === 2 ? 'bg-gradient-cyber border border-primary/30' :
                    'bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-xp-gold text-background' :
                      index === 1 ? 'bg-accent text-accent-foreground' :
                      index === 2 ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index === 0 ? <Crown className="h-4 w-4" /> : player.rank}
                    </div>
                    <div>
                      <p className="font-semibold">{player.username}</p>
                      <p className="text-sm text-muted-foreground">{player.xp.toLocaleString()} XP</p>
                    </div>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <div className="flex gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-muted-foreground">Builder</div>
                      <div className="font-semibold text-primary">{player.traits.builder}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Community</div>
                      <div className="font-semibold text-accent">{player.traits.community}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">Governance</div>
                      <div className="font-semibold text-neon-purple">{player.traits.governance}</div>
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <Shield className={`h-5 w-5 ${
                      index === 0 ? 'text-xp-gold' :
                      index === 1 ? 'text-accent' :
                      'text-primary'
                    }`} />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}