import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, Shield, Wallet, AlertTriangle, ExternalLink } from "lucide-react";

export const WalletSetupGuide = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Wallet Setup for Trait Wars
        </CardTitle>
        <CardDescription>
          Configure your wallet for the best experience with our blockchain features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Setup */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            1. Network Configuration
          </h3>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Add Honeycomb Testnet to Phantom:</strong></p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <p><strong>Network Name:</strong> Honeycomb Testnet</p>
                  <p><strong>RPC URL:</strong> https://rpc.test.honeycombprotocol.com</p>
                  <p><strong>Chain ID:</strong> Leave default</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Security Settings */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            2. Security Settings
          </h3>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>In Phantom Settings:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Go to Settings → Security → Transaction Simulation</li>
                    <li>Enable "Simulation" for better transaction preview</li>
                    <li>Consider disabling "Block Unknown Programs" temporarily for testnet</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <Separator />

        {/* Testnet SOL */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            3. Get Testnet SOL
          </h3>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>You need testnet SOL for transactions:</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Honeycomb provides unlimited testnet SOL</Badge>
                  <Badge variant="outline">No real money required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  The Honeycomb testnet automatically provides SOL for testing purposes.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Common Issues */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Common Issues & Solutions</h3>
          <div className="space-y-2">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p><strong>Transaction Blocked?</strong></p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Switch to Honeycomb testnet in Phantom</li>
                  <li>Make sure you have testnet SOL</li>
                  <li>Temporarily disable "Block Unknown Programs"</li>
                  <li>Clear Phantom cache and reconnect wallet</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};