import { useWallet } from "@/hooks/use-wallet";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Send, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type User as UserType } from "@shared/schema";

export default function Profile() {
  const { walletAddress, userId } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");

  const { data: user, isLoading: isLoadingUser } = useQuery<UserType>({
    queryKey: ["/api/users", walletAddress],
    enabled: !!walletAddress,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      toast({ title: "Profile Updated", description: "Your social handles have been saved." });
    },
  });

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Please connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-display font-bold mb-8">User Profile</h1>
        
        <div className="space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Wallet Address</Label>
                <p className="text-sm font-mono text-muted-foreground break-all">{walletAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Social Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4 text-blue-400" /> Twitter Handle
                </Label>
                <Input
                  id="twitter"
                  placeholder="@username"
                  value={twitter || user?.twitterHandle || ""}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram" className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-500" /> Telegram Username
                </Label>
                <Input
                  id="telegram"
                  placeholder="@username"
                  value={telegram || user?.telegramHandle || ""}
                  onChange={(e) => setTelegram(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => updateProfile.mutate({ twitterHandle: twitter, telegramHandle: telegram })}
                disabled={updateProfile.isPending}
                className="w-full"
              >
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
