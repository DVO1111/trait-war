import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBlockchainRewards } from '@/hooks/useBlockchainRewards';
import { useHoneycomb } from '@/hooks/useHoneycomb';
import { Trophy, Coins, Award, ExternalLink, Wallet } from 'lucide-react';

export const BlockchainRewardsPanel = () => {
  const { 
    userRewards, 
    completionRecords, 
    loading, 
    getUserRewards,
    isConnected,
    walletAddress 
  } = useBlockchainRewards();
  
  const { project, characters } = useHoneycomb();
  const [selectedReward, setSelectedReward] = useState<any>(null);

  useEffect(() => {
    if (isConnected) {
      getUserRewards();
    }
  }, [isConnected, getUserRewards]);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'nft':
        return <Trophy className="w-4 h-4" />;
      case 'token':
        return <Coins className="w-4 h-4" />;
      case 'achievement':
        return <Award className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'nft':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'token':
        return 'bg-gold-100 text-gold-800 border-gold-300';
      case 'achievement':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Rare':
        return 'bg-gradient-to-r from-blue-400 to-purple-500 text-white';
      case 'Common':
        return 'bg-gradient-to-r from-green-400 to-blue-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Connect your Solana wallet to view your blockchain rewards and assets
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Blockchain Rewards & Assets
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your on-chain rewards, NFTs, and achievements
          </p>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total NFTs</p>
                <p className="text-2xl font-bold">
                  {userRewards.filter(r => r.type === 'nft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-gold-500" />
              <div>
                <p className="text-sm font-medium">XP Tokens</p>
                <p className="text-2xl font-bold">
                  {userRewards
                    .filter(r => r.type === 'token')
                    .reduce((sum, r) => sum + (r.metadata?.amount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Achievements</p>
                <p className="text-2xl font-bold">
                  {userRewards.filter(r => r.type === 'achievement').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Tabs */}
      <Tabs defaultValue="nfts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nfts">NFT Rewards</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="nfts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRewards.filter(r => r.type === 'nft').map((reward) => (
              <Card key={reward.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getRewardIcon(reward.type)}
                      <Badge className={getRewardColor(reward.type)}>
                        NFT
                      </Badge>
                    </div>
                    {reward.metadata?.rarity && (
                      <Badge className={getRarityColor(reward.metadata.rarity)}>
                        {reward.metadata.rarity}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-1">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {reward.xp_value} XP
                    </span>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {userRewards.filter(r => r.type === 'nft').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No NFT rewards yet. Complete missions to earn your first NFT!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRewards.filter(r => r.type === 'token').map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-gold-500" />
                      <div>
                        <p className="font-semibold">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getRewardColor(reward.type)}>
                      {reward.metadata?.amount || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {userRewards.filter(r => r.type === 'token').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No tokens yet. Complete missions to earn XP tokens!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRewards.filter(r => r.type === 'achievement').map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-6 h-6 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Unlocked: {new Date(reward.earned_date).toLocaleDateString()}
                        </span>
                        <Badge variant="secondary">
                          +{reward.xp_value} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {userRewards.filter(r => r.type === 'achievement').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No achievements yet. Complete missions to unlock achievements!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {completionRecords.map((record) => (
              <Card key={record.mission_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Mission Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.completion_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">+{record.xp_earned} XP</p>
                      <p className="text-xs text-muted-foreground">
                        {record.rewards.length} rewards
                      </p>
                    </div>
                  </div>
                  
                  {record.verified && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        ⛓️ Verified On-Chain
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {record.transaction_signature.slice(0, 8)}...
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {completionRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ExternalLink className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No completion history yet. Complete missions to see your blockchain history!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};