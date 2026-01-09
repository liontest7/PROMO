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
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Social Account Verification
            </Label>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-black/40 border-white/10 hover:bg-white/5 h-12"
                onClick={() => window.location.href = "/api/login"}
              >
                <div className="w-8 h-8 rounded bg-blue-400/10 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold">Connect Twitter (X)</span>
                  <span className="text-[10px] text-muted-foreground">Required for X tasks</span>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 bg-black/40 border-white/10 hover:bg-white/5 h-12"
                disabled
              >
                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center">
                  <Send className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-bold">Connect Telegram</span>
                  <span className="text-[10px] text-muted-foreground">Coming Soon</span>
                </div>
              </Button>
            </div>
          </div>

          <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-[11px] leading-relaxed text-muted-foreground italic">
              Linking these accounts allows our system to automatically verify your actions, ensuring you get paid instantly without manual reviews.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => {
              localStorage.setItem(`onboarded_${walletAddress}`, "true");
              setOpen(false);
            }}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            I'll connect later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
