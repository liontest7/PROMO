import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Twitter, Send, ShieldCheck, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function OnboardingSocials() {
  const { walletAddress, isConnected } = useWallet();
  const [open, setOpen] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isConnected && walletAddress) {
      const hasOnboarded = localStorage.getItem(`onboarded_${walletAddress}`);
      if (!hasOnboarded) {
        setOpen(true);
      }
    }
  }, [isConnected, walletAddress]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      localStorage.setItem(`onboarded_${walletAddress}`, "true");
      setOpen(false);
      toast({ 
        title: "Welcome aboard!", 
        description: "Your social accounts are now linked for easier verification." 
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-display">Welcome to Promotion</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your social accounts now to make task verification faster and earn rewards more easily.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="onboard-twitter" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Twitter className="w-3.5 h-3.5 text-blue-400" /> Twitter Handle
            </Label>
            <Input
              id="onboard-twitter"
              placeholder="@username"
              className="bg-black/40 border-white/10"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboard-telegram" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Send className="w-3.5 h-3.5 text-blue-500" /> Telegram Username
            </Label>
            <Input
              id="onboard-telegram"
              placeholder="@username"
              className="bg-black/40 border-white/10"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-[11px] leading-relaxed text-muted-foreground italic">
              Linking these accounts allows our system to automatically verify your actions, ensuring you get paid instantly without manual reviews.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            onClick={() => {
              localStorage.setItem(`onboarded_${walletAddress}`, "true");
              setOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
          <Button 
            onClick={() => updateProfile.mutate({ twitterHandle: twitter, telegramHandle: telegram })}
            disabled={updateProfile.isPending}
            className="flex-1 bg-primary text-primary-foreground font-bold"
          >
            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
