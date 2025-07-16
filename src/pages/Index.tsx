import { GameLayout } from "@/components/GameLayout";
import { useWalletFirstAuth } from "@/hooks/useWalletFirstAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletButton } from "@/components/WalletButton";
import { Wallet } from "lucide-react";
import Dashboard from "./Dashboard";

const Index = () => {
  const { isAuthenticated, loading } = useWalletFirstAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md text-center bg-gradient-cyber border-primary/20">
          <CardHeader>
            <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold bg-gradient-xp bg-clip-text text-transparent">
              Welcome to Trait Wars
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to start your Web3 gaming journey and earn NFT rewards!
            </p>
            <div className="w-full">
              <WalletButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <GameLayout>
      <Dashboard />
    </GameLayout>
  );
};

export default Index;
