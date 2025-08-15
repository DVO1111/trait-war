import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHoneycomb } from '@/hooks/useHoneycomb';
import { honeycombMetrics } from '@/utils/honeycombMetrics';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Target,
  TrendingUp,
  Zap,
  Trophy
} from 'lucide-react';

interface BountyRequirement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'integration' | 'functionality' | 'performance' | 'security';
}

export const HoneycombBountyStatus = () => {
  const {
    project,
    profile,
    characters,
    isConnected,
  } = useHoneycomb();

  const metrics = honeycombMetrics.exportMetrics();

  // Define bounty requirements based on Honeycomb Protocol standards
  const requirements: BountyRequirement[] = [
    {
      id: 'wallet-connection',
      title: 'Wallet Connection',
      description: 'Successfully connect and authenticate with Solana wallet',
      completed: isConnected,
      priority: 'high',
      category: 'integration',
    },
    {
      id: 'project-creation',
      title: 'Project Initialization',
      description: 'Create and initialize a Honeycomb project on-chain',
      completed: !!project,
      priority: 'high',
      category: 'integration',
    },
    {
      id: 'profile-creation',
      title: 'User Profile System',
      description: 'Implement user profile creation and management',
      completed: !!profile,
      priority: 'high',
      category: 'functionality',
    },
    {
      id: 'character-nfts',
      title: 'Character NFT System',
      description: 'Create and manage character NFTs with traits',
      completed: characters.length > 0,
      priority: 'medium',
      category: 'functionality',
    },
    {
      id: 'error-handling',
      title: 'Robust Error Handling',
      description: 'Implement comprehensive error handling for all transactions',
      completed: metrics.successRate >= 0.9, // 90% success rate
      priority: 'high',
      category: 'security',
    },
    {
      id: 'performance-metrics',
      title: 'Performance Monitoring',
      description: 'Track and monitor transaction performance',
      completed: metrics.totalTransactions > 0,
      priority: 'medium',
      category: 'performance',
    },
    {
      id: 'data-validation',
      title: 'Input Validation',
      description: 'Validate all user inputs and transaction data',
      completed: true, // Implemented with Zod schemas
      priority: 'high',
      category: 'security',
    },
    {
      id: 'user-feedback',
      title: 'User Experience',
      description: 'Provide clear feedback for all user actions',
      completed: true, // Toast notifications implemented
      priority: 'medium',
      category: 'functionality',
    },
  ];

  const completedRequirements = requirements.filter(req => req.completed);
  const completionPercentage = (completedRequirements.length / requirements.length) * 100;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'integration': return 'bg-blue-100 text-blue-800';
      case 'functionality': return 'bg-green-100 text-green-800';
      case 'performance': return 'bg-yellow-100 text-yellow-800';
      case 'security': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Target className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Honeycomb Bounty Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-muted-foreground">
                {completedRequirements.length}/{requirements.length} Requirements
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="text-center">
              <Badge 
                variant={completionPercentage === 100 ? "default" : "secondary"}
                className="text-lg px-4 py-2"
              >
                {Math.round(completionPercentage)}% Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Grid */}
      <div className="grid gap-4">
        {requirements.map((requirement) => (
          <Card 
            key={requirement.id}
            className={`transition-all ${
              requirement.completed 
                ? 'border-green-200 bg-green-50/50' 
                : 'border-gray-200'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {requirement.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    getPriorityIcon(requirement.priority)
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{requirement.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(requirement.category)}
                    >
                      {requirement.category}
                    </Badge>
                    {!requirement.completed && (
                      <Badge variant="outline" className="text-xs">
                        {requirement.priority} priority
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {requirement.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.totalTransactions}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(metrics.successRate * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Success Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(metrics.averageTime)}ms
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Response Time
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {completionPercentage < 100 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Next Steps:</p>
              <ul className="list-disc list-inside space-y-1">
                {requirements
                  .filter(req => !req.completed && req.priority === 'high')
                  .map(req => (
                    <li key={req.id} className="text-sm">
                      {req.title}: {req.description}
                    </li>
                  ))
                }
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {completionPercentage === 100 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">🎉 Congratulations!</p>
              <p>Your Honeycomb Protocol integration meets all bounty requirements. 
                 Your app is ready for submission!</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};