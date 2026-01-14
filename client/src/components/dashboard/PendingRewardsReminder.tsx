import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ArrowRight, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface PendingReward {
  campaignId: number;
  amount: string;
  tokenName: string;
  tokenAddress: string;
}

export function PendingRewardsReminder({ walletAddress }: { walletAddress: string }) {
  const { data: pendingRewards, isLoading } = useQuery<PendingReward[]>({
    queryKey: ["/api/rewards/pending", walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/rewards/pending?wallet=${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch pending rewards");
      return res.json();
    },
    enabled: !!walletAddress,
  });

  if (isLoading || !pendingRewards || pendingRewards.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Unclaimed Rewards</h3>
      </div>
      <div className="grid gap-3">
        {pendingRewards.map((reward) => (
          <Card key={reward.campaignId} className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors rounded-xl overflow-hidden group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Pending in Campaign</p>
                  <p className="text-sm font-black text-white leading-none">
                    {reward.amount} <span className="text-primary">${reward.tokenName}</span>
                  </p>
                </div>
              </div>
              <Link href={`/campaign/${reward.campaignId}`}>
                <Button size="sm" variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-primary hover:text-primary-foreground transition-all">
                  Go to Claim
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
