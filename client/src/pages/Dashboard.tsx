import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Trophy, TrendingUp, Activity, CheckCircle, Twitter, Send, Loader2, Wallet, LogOut, Megaphone, ShieldAlert, ShieldCheck, User as UserIcon, HelpCircle } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

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

  const { user: replitUser, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (user) {
      setTwitter(user.twitterHandle || "");
      setTelegram(user.telegramHandle || "");
    }
  }, [user]);

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

  const tasksCompleted = stats?.tasksCompleted || 0;
  const nextMilestone = (Math.floor(tasksCompleted / 10) + 1) * 10;
  const progress = (tasksCompleted % 10) * 10;

  return (
    <div className="min-h-screen bg-background">
      <header>
        <title>User Dashboard | Dropy</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <div className="h-px w-8 bg-primary/50" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personal Console</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter uppercase italic leading-none">
              User <span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Stats</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg max-w-lg">Track your performance and protocol rewards in real-time.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col pr-6 border-r border-white/10">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Reputation</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black font-display text-primary">{stats?.reputation || 100}</span>
                <Trophy className="w-4 h-4 text-primary opacity-50" />
              </div>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rank</span>
              <span className="text-3xl font-black font-display text-white">#{Math.max(1, 100 - (stats?.reputation || 0))}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Coins className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-black font-display uppercase italic tracking-tight">Token Portfolios</h2>
              </div>
              
              {stats?.tokenBalances && stats.tokenBalances.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.tokenBalances.map((tb: any) => (
                    <Card key={tb.symbol} className="glass-card border-white/5 bg-white/[0.02] hover-elevate transition-all rounded-2xl overflow-hidden group">
                      <div className="p-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Coins className="w-16 h-16 rotate-12" />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 block">{tb.symbol} Network</span>
                            <div className="text-3xl font-black font-display text-primary">{tb.balance}</div>
                          </div>
                          {Number(tb.pending) > 0 && (
                            <div className="flex flex-col items-end">
                              <Badge variant="outline" className="text-[9px] font-black text-yellow-500 bg-yellow-500/10 border-yellow-500/20 px-2 py-1 rounded-lg uppercase">
                                PENDING
                              </Badge>
                              <span className="text-xs font-bold text-yellow-500/70 mt-1">{tb.pending}</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Total Earned</span>
                            <span className="text-sm font-bold">{tb.earned}</span>
                          </div>
                          {tb.price && (
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Value (USD)</span>
                              <span className="text-sm font-black text-primary/80 font-mono">${(Number(tb.balance) * Number(tb.price)).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white/[0.02] border-2 border-dashed border-white/5">
                  <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground font-display font-bold uppercase tracking-widest">No active rewards</p>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-black font-display uppercase italic tracking-tight">Recent Activity</h2>
              </div>
              <Card className="glass-card border-white/5 bg-white/[0.01] rounded-2xl">
                <CardContent className="p-0">
                  {executions && executions.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      {executions.slice(0, 10).map((execution: any) => (
                        <div key={execution.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-primary opacity-70" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{execution.action?.title || 'Action Completed'}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{execution.campaign?.title}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant="outline" 
                              className={execution.status === 'paid' 
                                ? 'bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase' 
                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[9px] font-black uppercase'}
                            >
                              {execution.status}
                            </Badge>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              {execution.createdAt ? format(new Date(execution.createdAt), 'MMM d, HH:mm') : 'RECENT'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No execution history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-8">
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl font-black font-display uppercase leading-tight italic">Ecosystem<br/>Contribution</CardTitle>
                <CardDescription className="text-primary-foreground/70 font-medium">Your global impact score within the Dropy network.</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black font-display text-primary">{tasksCompleted}</span>
                  <span className="text-sm font-bold text-primary/60 uppercase">Actions</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progress to Next Tier</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{progress}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/5">
                    <div 
                      className="h-full bg-primary shadow-[0_0_15px_rgba(34,197,94,0.8)] rounded-full transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Lvl {Math.floor(tasksCompleted / 10)}</span>
                    <span className="text-primary/70">Milestone: {nextMilestone} Actions</span>
                    <span>Lvl {Math.floor(tasksCompleted / 10) + 1}</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tier Benefits</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                    Level up to unlock exclusive airdrops, higher reward multipliers, and early access to premium projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black font-display uppercase italic">Social Verification</CardTitle>
                <CardDescription className="text-xs">Connect your social accounts to verify actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Twitter className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] text-blue-400 font-black mb-3 uppercase tracking-widest">Identity Sync</p>
                    <Button 
                      className="w-full bg-blue-500/50 cursor-not-allowed text-white gap-2 font-black text-xs relative z-10"
                      disabled
                    >
                      <Twitter className="w-4 h-4" /> LINK X PROFILE
                    </Button>
                    <p className="text-[9px] text-muted-foreground mt-3 italic text-center">
                      Twitter & Telegram OAuth integration in progress.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4 relative overflow-hidden group">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 relative z-10">
                      <AvatarImage src={replitUser?.profileImageUrl || ""} />
                      <AvatarFallback><UserIcon className="w-6 h-6" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative z-10">
                      <p className="text-sm font-bold leading-none mb-1">{replitUser?.firstName} {replitUser?.lastName}</p>
                      <Badge variant="outline" className="text-[9px] uppercase font-black bg-primary/20 text-primary border-primary/30">Verified X Account</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive relative z-10" onClick={() => logout()}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Send className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest block">Telegram</span>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase">Disconnected</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-[10px] h-9 border-white/10" disabled>
                    CONNECT BOT
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 bg-white/[0.01] rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl font-black font-display uppercase italic">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {[
                  { title: "Explore Campaigns", icon: Megaphone, href: "/earn" },
                  { title: "Network Status", icon: Activity, href: "/stats" },
                  { title: "Help Center", icon: ShieldAlert, href: "/about" }
                ].map((link) => (
                  <Button 
                    key={link.title}
                    variant="outline" 
                    asChild
                    className="justify-start h-14 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/20 transition-all group"
                  >
                    <Link href={link.href}>
                      <div className="flex items-center gap-4 w-full cursor-pointer">
                        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                          <link.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">{link.title}</span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}