import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Megaphone, CheckCircle, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
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
  walletInfo?: {
    address: string;
    balanceSol: number;
    balanceDropy: number;
  };
}

export function AdminStats({ stats, campaignsCount }: AdminStatsProps) {
  const { toast } = useToast();
  const totalRewardsPaid = stats?.totalRewardsPaid || 0;
  const activeCampaignsCount = stats?.activeCampaigns || 0;
  const totalUsersCount = stats?.totalUsers || 0;
  const totalExecutionsCount = stats?.totalExecutions || 0;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase italic leading-none text-white">
            Admin <span className="text-primary">Terminal</span>
          </h1>
          <p className="text-white font-bold mt-3 text-base">Real-time ecosystem management and protocol oversight.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-white">Admin Stats</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/20">
              <ShieldAlert className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black font-display text-white">{totalUsersCount}</div>
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center justify-between text-sm font-black">
                <span className="text-white uppercase">Users</span>
                <span className="text-white">{totalUsersCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black">
                <span className="text-white uppercase">Campaigns</span>
                <span className="text-white">{campaignsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-white">Campaigns</CardTitle>
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Megaphone className="h-5 w-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black font-display text-white">{campaignsCount}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-white font-black uppercase tracking-widest">{activeCampaignsCount} ACTIVE MANAGED</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-white/[0.02] hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-white">Total Task Load</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black font-display text-white">{totalExecutionsCount}</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-white font-black uppercase tracking-widest">REAL-TIME VERIFIED</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/30 bg-primary/5 hover-elevate transition-all rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-black uppercase tracking-widest text-primary">Protocol Payouts</CardTitle>
            <div className="p-2 rounded-lg bg-primary/20">
              <ArrowUpRight className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black font-display text-primary">{totalRewardsPaid.toLocaleString()}</div>
            <p className="text-sm text-primary mt-1.5 uppercase font-black tracking-widest italic underline decoration-primary/30">Distributed Tokens</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}