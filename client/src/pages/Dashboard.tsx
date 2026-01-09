import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Trophy, TrendingUp, Activity, CheckCircle, Twitter, Send, Loader2, Wallet } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { formatDistanceToNow, format } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type User as UserType } from "@shared/schema";

export default function Dashboard() {
  const { walletAddress, userId, solBalance } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useUserStats(walletAddress);
  
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/users", walletAddress],
    enabled: !!walletAddress,
  });

  useEffect(() => {
    if (user) {
      setTwitter(user.twitterHandle || "");
      setTelegram(user.telegramHandle || "");
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      queryClient.invalidateQueries({ queryKey: [api.users.stats.path, walletAddress] }); // Added this
      toast({ title: "Profile Updated", description: "Your social handles have been saved." });
    },
  });

  const { data: executions, refetch: refetchExecutions } = useQuery({
    queryKey: [api.users.executions.path, walletAddress],
    enabled: !!walletAddress,
    queryFn: async () => {
      const res = await fetch(api.users.executions.path.replace(':walletAddress', walletAddress!));
      if (!res.ok) throw new Error('Failed to fetch executions');
      return res.json();
    }
  });

  const claimAllMutation = useMutation({
    mutationFn: async () => {
      if (!executions) return;
      const pendingIds = executions
        .filter((e: any) => e.status === 'verified')
        .map((e: any) => e.id);
      
      if (pendingIds.length === 0) throw new Error("No rewards to claim");

      const res = await fetch(api.executions.claim.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          walletAddress, 
          executionIds: pendingIds 
        }),
      });
      if (!res.ok) throw new Error("Claim failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, walletAddress] });
      queryClient.invalidateQueries({ queryKey: [api.users.stats.path, walletAddress] });
      refetchExecutions();
      toast({ 
        title: "Rewards Claimed!", 
        description: `Successfully claimed rewards for ${data.claimedIds.length} tasks in one transaction.` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Claim Failed", description: error.message, variant: "destructive" });
    }
  });

  const chartData = [
    { name: 'Total Earned', earnings: stats ? Number(stats.totalEarned) : 0 },
  ];

  if (statsLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-48 mb-8 bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 bg-white/10" />
            <Skeleton className="h-32 bg-white/10" />
            <Skeleton className="h-32 bg-white/10" />
          </div>
        </main>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>User Dashboard | MemeDrop</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">My Profile & Dashboard</h1>
            <p className="text-muted-foreground">Manage your social accounts and track your performance.</p>
          </div>
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Wallet</p>
            <p className="font-mono text-sm font-bold flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" />
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-6)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Stats Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-[11px] font-bold text-primary uppercase tracking-widest">Available Rewards</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.tokenBalances && stats.tokenBalances.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {stats.tokenBalances.map((tb: any) => (
                          <div key={tb.symbol} className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{tb.symbol}</span>
                              {Number(tb.pending) > 0 && (
                                <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">PENDING: {tb.pending}</span>
                              )}
                            </div>
                            <div className="text-xl font-bold font-display">{tb.balance}</div>
                            <div className="text-[10px] text-muted-foreground">Total Earned: {tb.earned}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold font-display tracking-tight text-muted-foreground opacity-50 italic">No rewards yet</div>
                    )}
                    
                    {stats?.tokenBalances?.some((tb: any) => Number(tb.pending) > 0) && (
                      <Button 
                        size="sm" 
                        variant="default"
                        className="w-full mt-2 h-10 font-bold bg-primary hover:bg-primary/90"
                        onClick={() => claimAllMutation.mutate()}
                        disabled={claimAllMutation.isPending}
                      >
                        {claimAllMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
                        CLAIM ALL PENDING REWARDS
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
                  <Activity className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{stats?.tasksCompleted || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1 text-primary font-bold">{stats?.reputation || 100} REP POINTS</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">SOL Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-display">{solBalance !== null ? solBalance.toFixed(4) : "0.0000"}</div>
                  <p className="text-xs text-muted-foreground mt-1">Wallet Funds</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Earnings History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="earnings" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Profile Column */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Social Connections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Twitter className="w-3.5 h-3.5 text-blue-400" /> Twitter Handle
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    className="bg-black/40 border-white/10"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Send className="w-3.5 h-3.5 text-blue-500" /> Telegram Username
                  </Label>
                  <Input
                    id="telegram"
                    placeholder="@username"
                    className="bg-black/40 border-white/10"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => updateProfile.mutate({ twitterHandle: twitter, telegramHandle: telegram })}
                  disabled={updateProfile.isPending}
                  className="w-full font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/20"
                >
                  {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profiles
                </Button>
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Linking accounts enables automated task verification.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 rounded-2xl bg-white/[0.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                {executions?.some((e: any) => e.status === 'verified') && (
                  <Button 
                    size="sm" 
                    variant="default"
                    className="h-7 text-[10px] font-bold bg-primary hover:bg-primary/90"
                    onClick={() => claimAllMutation.mutate()}
                    disabled={claimAllMutation.isPending}
                  >
                    {claimAllMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Coins className="h-3 w-3 mr-1" />}
                    CLAIM ALL PENDING
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions && executions.length > 0 ? (
                    executions.slice(0, 10).map((execution: any) => (
                      <div key={execution.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-1.5 rounded-full ${execution.status === 'paid' ? 'bg-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="text-sm font-bold">{execution.action?.title || 'Action Completed'}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {execution.campaign?.title} • {execution.action?.rewardAmount} {execution.campaign?.tokenName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">
                            {execution.createdAt ? format(new Date(execution.createdAt), 'MMM d, HH:mm') : 'Recently'}
                          </p>
                          <p className={`text-[9px] font-bold uppercase tracking-wider ${execution.status === 'paid' ? 'text-primary' : execution.status === 'rejected' ? 'text-destructive' : 'text-yellow-500'}`}>
                            {execution.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No activity yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
