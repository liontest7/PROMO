import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Send, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

interface IdentitySyncProps {
  user: any;
  walletAddress: string;
}

export const IdentitySync = ({ user, walletAddress }: IdentitySyncProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: async (data: { walletAddress: string, twitterHandle: string, profileImageUrl?: string }) => {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users", walletAddress], data);
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      toast({ 
        title: "X Identity Synced", 
        description: `Your X account @${data.twitterHandle} has been verified.` 
      });
    }
  });

  const unlinkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/user/unlink-x', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      if (!res.ok) throw new Error('Failed to unlink');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/users", walletAddress], data);
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      toast({ title: "X Identity Removed", description: "Your X account has been successfully unlinked." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unlink account", variant: "destructive" });
    }
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'TWITTER_AUTH_SUCCESS') {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
        toast({
          title: "X Connected",
          description: "Your X account has been successfully linked.",
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient, walletAddress, toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified_twitter") === "true";
    const handle = params.get("handle");
    const profileImage = params.get("profile_image");

    if (verified && walletAddress && !user?.twitterHandle) {
      syncMutation.mutate({
        walletAddress,
        twitterHandle: handle || "DropySentinel",
        profileImageUrl: profileImage || ""
      });
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [walletAddress, syncMutation, user?.twitterHandle]);

  const handleConnect = () => {
    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      `/api/auth/twitter?walletAddress=${walletAddress}`,
      'Twitter Auth',
      `width=${width},height=${height},left=${left},top=${top},status=no,location=no,toolbar=no,menubar=no`
    );
  };

  const handleTGConnect = () => {
    // Open Telegram Bot with Deep Link
    // Format: t.me/bot_username?start=connect_<walletAddress>
    const botUsername = "Dropy_VerifyBot"; // Updated to match user's actual bot
    const deepLink = `https://t.me/${botUsername}?start=connect_${walletAddress}`;
    window.open(deepLink, '_blank');
    
    toast({
      title: "Telegram Bot Opened",
      description: "Please click 'Start' in the Telegram bot to complete the verification.",
    });
  };

  const handleUnlink = () => {
    unlinkMutation.mutate();
  };

  return (
    <Card className="glass-card border border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden p-1 shadow-xl lg:max-w-md ml-auto">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-2xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Identity Sync</CardTitle>
        <div className="h-0.5 w-12 bg-white/20 mt-3 rounded-full" />
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        {!user?.twitterHandle ? (
          <div className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
              <Twitter className="w-14 h-14" />
            </div>
            <div className="relative z-10 text-left space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Twitter className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[13px] font-black uppercase tracking-widest text-white italic">X Identity Sync</span>
              </div>
              <p className="text-[12px] text-white/50 font-bold uppercase tracking-widest leading-relaxed max-w-[90%]">
                Verify your X account to unlock high-yield engagement campaigns.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={handleConnect}
                  disabled={syncMutation.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-3 font-black text-[11px] h-11 rounded-lg shadow-md transition-all active-elevate-2 uppercase tracking-widest relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">{syncMutation.isPending ? 'Syncing...' : 'Connect Protocol Node'}</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4 relative overflow-hidden group shadow-lg">
            <Avatar className="h-12 w-12 border-2 border-background shadow-[0_0_20px_rgba(34,197,94,0.2)] relative z-10">
              <AvatarImage src={user?.profileImageUrl || ""} className="object-cover" />
              <AvatarFallback className="bg-primary/20"><UserIcon className="w-6 h-6 text-primary" /></AvatarFallback>
            </Avatar>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <Twitter className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Identity</span>
              </div>
              <p className="text-base font-black font-display tracking-tight text-white uppercase italic">@{user.twitterHandle}</p>
              <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black mt-1 uppercase tracking-widest">Node Synced</Badge>
            </div>
            <Button
              size="icon"
              variant="ghost"
              disabled={unlinkMutation.isPending}
              className="h-8 w-8 rounded-lg text-white/30 hover:text-destructive hover:bg-destructive/10 relative z-[100] transition-all"
              onClick={handleUnlink}
            >
              <LogOut className={`w-4 h-4 ${unlinkMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
            <div className="absolute bottom-0 right-0 p-2 opacity-5">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
          </div>
        )}

        {!user?.telegramHandle ? (
          <div className="p-5 rounded-xl bg-blue-600/5 border border-blue-600/10 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
              <Send className="w-14 h-14" />
            </div>
            <div className="relative z-10 text-left space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-600/30">
                  <Send className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-[13px] font-black uppercase tracking-widest text-white italic">TG Identity</span>
              </div>
              <p className="text-[12px] text-white/50 font-bold uppercase tracking-widest leading-relaxed max-w-[90%]">
                Link your Telegram account to verify community group membership.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={handleTGConnect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-3 font-black text-[11px] h-11 rounded-lg shadow-md transition-all active-elevate-2 uppercase tracking-widest relative overflow-hidden group/btn"
                >
                  <span className="relative z-10">Initiate Secure Link</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 flex items-center gap-4 relative overflow-hidden group shadow-lg">
            <div className="h-12 w-12 rounded-full bg-[#0088cc]/20 flex items-center justify-center border-2 border-background shadow-[0_0_20px_rgba(0,136,204,0.2)] relative z-10">
              <Send className="w-6 h-6 text-[#0088cc] fill-[#0088cc]/20" />
            </div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <Send className="w-3 h-3 text-[#0088cc]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Telegram</span>
              </div>
              <p className="text-base font-black font-display tracking-tight text-white uppercase italic">@{user.telegramHandle}</p>
              <Badge className="bg-[#0088cc]/20 text-[#0088cc] border-none text-[8px] font-black mt-1 uppercase tracking-widest">Link Active</Badge>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg text-white/30 hover:text-destructive hover:bg-destructive/10 relative z-[100] transition-all"
              onClick={() => {
                syncMutation.mutate({
                  walletAddress,
                  twitterHandle: user?.twitterHandle || "",
                  // @ts-ignore
                  telegramHandle: null
                });
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};