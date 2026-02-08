import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralSystemProps {
  walletAddress: string;
  referralCount: number;
}

export function ReferralSystem({ walletAddress, referralCount }: ReferralSystemProps) {
  const { toast } = useToast();
  const referralLink = `${window.location.origin}?ref=${walletAddress}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied!",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  return (
    <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[2rem] shadow-xl overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xl font-black font-display uppercase italic tracking-tight text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Referral <span className="text-primary">System</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-6">
        <div className="space-y-2">
          <p className="text-[12px] text-white font-black uppercase tracking-widest">Your Referral Link</p>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="bg-black/40 border-white/10 text-white font-mono text-[10px] h-12 rounded-xl focus-visible:ring-primary/50"
            />
            <Button size="icon" onClick={copyToClipboard} className="shrink-0 h-12 w-12 rounded-xl bg-primary hover:bg-primary/80 text-black">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5 text-center group hover:border-white/10 transition-all">
            <p className="text-[10px] text-white font-black uppercase tracking-widest mb-2 opacity-60 group-hover:opacity-100 transition-opacity">Total Referrals</p>
            <p className="text-3xl font-black font-display text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{referralCount}</p>
          </div>
          <div className="bg-primary/5 p-5 rounded-[1.5rem] border border-primary/10 text-center group hover:border-primary/20 transition-all shadow-[inset_0_0_20px_rgba(34,197,94,0.05)]">
            <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2 opacity-80 group-hover:opacity-100 transition-opacity">Weekly Share</p>
            <p className="text-3xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">0%</p>
          </div>
        </div>

        <p className="text-[11px] text-white font-bold uppercase tracking-tight italic opacity-60 leading-relaxed text-center">
          Earn $DROPY weekly by inviting others. A referral counts when they complete their first task and claim rewards.
        </p>
      </CardContent>
    </Card>
  );
}