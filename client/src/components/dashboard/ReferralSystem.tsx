import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Users, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLATFORM_CONFIG } from "@shared/config";
import { cn } from "@/lib/utils";

interface Invitee {
  id: number;
  username: string | null;
  walletAddress: string;
  profileImageUrl: string | null;
  reputationScore: number;
  hasCompletedTask: boolean;
  joinedAt: string;
}

interface ReferralSystemProps {
  walletAddress: string;
  referralCount: number;
}

export function ReferralSystem({ walletAddress, referralCount }: ReferralSystemProps) {
  const { toast } = useToast();
  const referralLink = `${window.location.origin}?ref=${walletAddress}`;

  const { data: invitees, isLoading } = useQuery<Invitee[]>({
    queryKey: ["/api/referrals/invitees", walletAddress],
    enabled: !!walletAddress,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  const formatWallet = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[2rem] shadow-xl overflow-hidden">
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg font-black font-display uppercase italic tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Referral <span className="text-primary">Protocol</span>
          </CardTitle>
          
          <div className="flex bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl items-center gap-3">
            <div className="text-right">
              <p className="text-[8px] text-primary font-black uppercase tracking-widest opacity-80 leading-none">Weekly</p>
              <p className="text-base font-black font-display text-primary leading-none mt-1">0%</p>
            </div>
            <div className="w-px h-5 bg-primary/20" />
            <div className="text-right">
              <p className="text-[8px] text-white font-black uppercase tracking-widest opacity-60 leading-none">Total</p>
              <p className="text-base font-black font-display text-white leading-none mt-1">{referralCount}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-1 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[9px] text-white font-black uppercase tracking-widest">Growth Link</p>
            <span className="text-[8px] text-primary font-bold uppercase italic tracking-tight">+10 Reputation per referral</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input 
                value={referralLink} 
                readOnly 
                className="bg-black/40 border-white/10 text-white font-mono text-[10px] h-9 rounded-xl pl-3 pr-10 focus-visible:ring-primary/50"
              />
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            </div>
            <Button size="icon" onClick={copyToClipboard} className="shrink-0 h-9 w-9 rounded-xl bg-primary hover:bg-primary/80 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all active:scale-95">
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Clock className="w-3 h-3 text-primary/60" />
              Recruitment Feed
            </h3>
            <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Live</span>
          </div>

          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar text-white">
            {isLoading ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Syncing Network...</p>
              </div>
            ) : invitees && invitees.length > 0 ? (
              invitees.map((invitee) => (
                <div key={invitee.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-primary/20 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border border-white/10 group-hover:border-primary/40 transition-colors">
                      <AvatarImage src={invitee.profileImageUrl || PLATFORM_CONFIG.ASSETS.MAIN_LOGO} className="object-cover" />
                      <AvatarFallback className="bg-white/10 text-white text-xs font-black uppercase">
                        {invitee.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white group-hover:text-primary transition-colors">
                          {invitee.username || formatWallet(invitee.walletAddress)}
                        </span>
                        {invitee.hasCompletedTask ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-white/60 uppercase tracking-tight">
                        Joined {new Date(invitee.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border italic inline-block mb-1",
                      invitee.hasCompletedTask 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-white/5 text-white/60 border-white/20"
                    )}>
                      {invitee.hasCompletedTask ? "Verified Agent" : "Verification Pending"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                <Users className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-xs text-white font-black uppercase tracking-widest mb-1">No Active Invitations</p>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-tight px-8 leading-relaxed">
                  Recruit agents to dominate the leaderboard.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 text-center">
          <p className="text-[10px] text-white font-bold uppercase tracking-tight italic leading-relaxed">
            Rewards are sent after verification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}