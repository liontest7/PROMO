import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UnifiedSuccessCard } from "@/components/UnifiedSuccessCard";
import confetti from "canvas-confetti";

interface PendingReward {
  campaignId: number;
  amount: string;
  tokenName: string;
  tokenAddress: string;
  campaignTitle?: string;
}

export function ClaimRewards({ walletAddress, campaignId, campaignTitle }: { walletAddress: string, campaignId?: number, campaignTitle?: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    campaignTitle: string;
    rewardAmount: string;
    tokenName: string;
    actionTitle: string;
  }>({
    isOpen: false,
    campaignTitle: "",
    rewardAmount: "",
    tokenName: "",
    actionTitle: ""
  });

  const { data: pendingRewards, isLoading } = useQuery<PendingReward[]>({
    queryKey: ["/api/rewards/pending", walletAddress, campaignId],
    queryFn: async () => {
      const url = campaignId 
        ? `/api/rewards/pending?wallet=${walletAddress}&campaignId=${campaignId}`
        : `/api/rewards/pending?wallet=${walletAddress}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch pending rewards");
      return res.json();
    },
    enabled: !!walletAddress,
  });

  const claimMutation = useMutation({
    mutationFn: async (campaignIds: number[]) => {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, campaignIds }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to claim rewards");
      }
      return res.json();
    },
    onSuccess: (data, campaignIds) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/pending", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/executions", walletAddress] }); // Invalidate executions for campaign page
      
      // Trigger celebration if it was a single or multiple claim
      const rewardsToCelebrate = pendingRewards?.filter(r => campaignIds.includes(r.campaignId)) || [];
      if (rewardsToCelebrate.length > 0) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#ffffff', '#10b981']
        });

        // Use the first one for the display or a summary
        const first = rewardsToCelebrate[0];
        const totalAmount = rewardsToCelebrate.reduce((acc, r) => acc + parseFloat(r.amount), 0).toFixed(2);
        
        setCelebrationData({
          isOpen: true,
          campaignTitle: rewardsToCelebrate.length === 1 ? (campaignTitle || first.tokenName + " Campaign") : `${rewardsToCelebrate.length} Campaigns`,
          rewardAmount: totalAmount,
          tokenName: first.tokenName,
          actionTitle: "Batch Claim Rewards"
        });
      }

      toast({
        title: "Success!",
        description: "Your rewards have been claimed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Claim Failed",
        description: error.message || "There was an error claiming your rewards. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return null;
  if (!pendingRewards || pendingRewards.length === 0) return null;

  const totalTokens = pendingRewards.length;

  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <CardHeader className="bg-primary/10 border-b border-primary/10 py-4">
        <CardTitle className="text-xs uppercase tracking-[0.2em] text-primary flex items-center justify-between font-black">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Pending Rewards
          </div>
          <Badge className="bg-primary text-primary-foreground font-black px-3 py-0.5 h-6 text-[10px]">
            {pendingRewards.reduce((acc, r) => acc + parseFloat(r.amount), 0).toFixed(2)} ${pendingRewards[0]?.tokenName} AVAILABLE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {pendingRewards.map((reward) => (
            <div key={reward.campaignId} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Available to Claim</span>
                <span className="text-sm font-black text-white">
                  {reward.amount} <span className="text-primary">${reward.tokenName}</span>
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 text-[10px] font-black border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary uppercase"
                onClick={() => claimMutation.mutate([reward.campaignId])}
                disabled={claimMutation.isPending}
              >
                {claimMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Claim"}
              </Button>
            </div>
          ))}

          {pendingRewards.length > 1 && (
            <Button 
              className="w-full h-12 font-black text-xs uppercase tracking-widest gap-2 bg-primary text-primary-foreground hover:scale-[1.01] active:scale-[0.99] transition-all"
              onClick={() => claimMutation.mutate(pendingRewards.map(r => r.campaignId))}
              disabled={claimMutation.isPending}
            >
              {claimMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Withdraw {pendingRewards.reduce((acc, r) => acc + parseFloat(r.amount), 0).toFixed(2)} ${pendingRewards[0]?.tokenName} <Send className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-[9px] text-center text-white/30 uppercase font-bold tracking-tighter mt-4 italic">
          Tip: Claiming multiple rewards at once saves on network transaction fees.
        </p>
      </CardContent>
      <UnifiedSuccessCard 
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData(prev => ({ ...prev, isOpen: false }))}
        type="action"
        data={{
          title: celebrationData.actionTitle,
          campaignTitle: celebrationData.campaignTitle,
          rewardAmount: celebrationData.rewardAmount,
          tokenName: celebrationData.tokenName,
          actionTitle: celebrationData.actionTitle
        } as any}
      />
    </Card>
  );
}
