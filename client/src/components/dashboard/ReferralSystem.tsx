import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Users } from "lucide-react";
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
    <Card className="glass-card border-white/10 bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="text-xl font-display font-black uppercase italic tracking-tight text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Referral System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-white/60 uppercase tracking-widest font-black">Your Referral Link</p>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="bg-white/5 border-white/10 text-white font-mono text-xs"
            />
            <Button size="icon" onClick={copyToClipboard} className="shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Total Referrals</p>
            <p className="text-2xl font-black font-display text-white">{referralCount}</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
            <p className="text-[10px] text-primary/60 uppercase tracking-widest font-black mb-1">Weekly Share</p>
            <p className="text-2xl font-black font-display text-primary">0%</p>
          </div>
        </div>

        <p className="text-[10px] text-white/40 leading-relaxed italic">
          Earn $DROPY weekly by inviting others. A referral counts when they complete their first task and claim rewards.
        </p>
      </CardContent>
    </Card>
  );
}