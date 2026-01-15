import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Megaphone, CheckCircle, ArrowUpRight, TrendingUp, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    activeCampaigns: number;
    totalExecutions: number;
    totalRewardsPaid: number;
    blockedUsers: number;
  };
  campaignsCount: number;
}

export function AdminStats({ stats, campaignsCount }: AdminStatsProps) {
  const { toast } = useToast();
  const totalRewardsPaid = stats?.totalRewardsPaid || 0;
  const activeCampaignsCount = stats?.activeCampaigns || 0;
  const totalUsersCount = stats?.totalUsers || 0;
  const totalExecutionsCount = stats?.totalExecutions || 0;

  const handleManualPayout = async () => {
    try {
      await apiRequest("POST", "/api/admin/trigger-week-reset", {});
      toast({
        title: "Success",
        description: "Weekly reset and payout triggered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/history"] });
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to trigger manual payout.",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none text-white">
            Admin <span className="text-primary">Terminal</span>
          </h1>
          <p className="text-white font-bold mt-3 text-base">Real-time ecosystem management and protocol oversight.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Total Protocol Value</span>
              <span className="text-2xl font-black font-display text-primary">{(totalRewardsPaid * 0.42).toFixed(2)} SOL</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Admin Stats</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <ShieldAlert className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-display text-white">{totalUsersCount}</div>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white uppercase">Users</span>
                <span className="text-white">{totalUsersCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white uppercase">Campaigns</span>
                <span className="text-white">{campaignsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Campaigns</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Megaphone className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-display text-white">{campaignsCount}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-white font-black uppercase tracking-widest">{activeCampaignsCount} ACTIVE MANAGED</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white">Total Task Load</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-display text-white">{totalExecutionsCount}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white font-black uppercase tracking-widest">REAL-TIME VERIFIED</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 bg-primary/5 hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Protocol Payouts</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20">
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-display text-primary">{totalRewardsPaid.toLocaleString()}</div>
            <p className="text-xs text-primary/60 mt-1 uppercase font-black tracking-widest">Distributed Tokens</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}