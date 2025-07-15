import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "@/components/WalletButton";
import { Loader2, Shield, Wallet, UserPlus } from "lucide-react";
import { z } from "zod";

// Validation schema for profile creation
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  displayName: z.string().min(2, "Display name must be at least 2 characters long")
    .max(50, "Display name must be less than 50 characters"),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional()
});

export default function WalletAuth() {
  const navigate = useNavigate();
  const { 
    connected, 
    isAuthenticated, 
    needsProfileSetup, 
    loading, 
    signInWithWallet, 
    createProfile,
    profile
  } = useWalletAuth();
  
  const [profileData, setProfileData] = useState({
    username: "",
    displayName: "",
    bio: ""
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Redirect to main app when fully authenticated with profile
  useEffect(() => {
    if (isAuthenticated && profile && !needsProfileSetup) {
      navigate("/");
    }
  }, [isAuthenticated, profile, needsProfileSetup, navigate]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsCreatingProfile(true);

    try {
      const validatedData = profileSchema.parse(profileData);
      await createProfile({
        username: validatedData.username,
        displayName: validatedData.displayName,
        bio: validatedData.bio
      });
      
      // Reset form
      setProfileData({ username: "", displayName: "", bio: "" });
      
      // Navigation will happen automatically via useEffect
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
      }
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  // If authenticated but needs profile setup
  if (isAuthenticated && needsProfileSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your warrior profile to start your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Choose a unique username"
                  className={validationErrors.username ? 'border-destructive' : ''}
                  required
                  disabled={isCreatingProfile}
                />
                {validationErrors.username && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-sm">{validationErrors.username}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Your display name"
                  className={validationErrors.displayName ? 'border-destructive' : ''}
                  required
                  disabled={isCreatingProfile}
                />
                {validationErrors.displayName && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-sm">{validationErrors.displayName}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Input
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  className={validationErrors.bio ? 'border-destructive' : ''}
                  disabled={isCreatingProfile}
                />
                {validationErrors.bio && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-sm">{validationErrors.bio}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isCreatingProfile}>
                {isCreatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main wallet connection screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Trait Wars</CardTitle>
          <CardDescription>
            Connect your wallet to access the blockchain warrior arena
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connected ? (
            <div className="text-center space-y-4">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Please connect your Solana wallet to continue
              </p>
              <WalletButton />
              <p className="text-xs text-muted-foreground">
                Make sure you have a Solana wallet extension installed (like Phantom)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <Wallet className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Wallet connected! Sign a message to authenticate securely.
                </p>
              </div>
              
              <Button 
                onClick={signInWithWallet} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign Message to Continue
                  </>
                )}
              </Button>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  We'll ask you to sign a message to prove wallet ownership. This is secure and free.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}