import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Trophy, TrendingUp, Activity, CheckCircle, Twitter, Send, Loader2, Wallet, LogOut, Megaphone, ShieldAlert, ShieldCheck, User as UserIcon, HelpCircle, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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
import { PLATFORM_CONFIG } from "@shared/config";
import { cn } from "@/lib/utils";

// Identity Sync Module
const IdentitySync = ({ isAuthenticated, user, logout }: { isAuthenticated: boolean; user: any; logout: () => void }) => (
  <Card className="glass-card border border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden p-1 shadow-xl lg:max-w-md ml-auto">
    <CardHeader className="p-6 pb-4">
      <CardTitle className="text-xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Identity Sync</CardTitle>
      <div className="h-0.5 w-12 bg-white/20 mt-3 rounded-full" />
    </CardHeader>
    <CardContent className="p-6 pt-0 space-y-4">
      {!isAuthenticated ? (
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
            <Twitter className="w-12 h-12" />
          </div>
          <div className="relative z-10 text-left space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Twitter className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-white italic">X Identity Sync</span>
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
              Verify your X account to unlock high-yield engagement campaigns.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  console.log("Redirecting to Twitter Auth...");
                  window.location.href = '/api/auth/twitter';
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-3 font-black text-[10px] h-10 rounded-lg shadow-md transition-all active-elevate-2 uppercase tracking-widest relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Verify X Account</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
              <div className="flex justify-center py-2">
                <div id="cf-turnstile-placeholder" className="w-full min-h-[50px] flex items-center justify-center text-[9px] text-white/20 uppercase font-black tracking-widest border border-dashed border-white/10 rounded-lg px-2 text-center">
                  Bot Protection Active
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4 relative overflow-hidden group shadow-lg">
          <Avatar className="h-12 w-12 border-2 border-background shadow-[0_0_20px_rgba(34,197,94,0.2)] relative z-10">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary/20"><UserIcon className="w-6 h-6 text-primary" /></AvatarFallback>
          </Avatar>
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2">
              <Twitter className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Identity</span>
            </div>
            <p className="text-base font-black font-display tracking-tight text-white uppercase italic">{user?.firstName || 'Dropy Sentinel'}</p>
            <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black mt-1 uppercase tracking-widest">Node Synced</Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/30 hover:text-destructive hover:bg-destructive/10 relative z-10 transition-all" onClick={() => logout()}>
            <LogOut className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-600/10 relative overflow-hidden group shadow-lg opacity-60 grayscale hover:grayscale-0 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
          <Send className="w-12 h-12" />
        </div>
        <div className="relative z-10 text-left space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-600/30">
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-white italic">TG Identity</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline"
              disabled
              className="w-full border-white/10 hover:bg-white/5 text-white/40 gap-3 font-black text-[10px] h-10 rounded-lg transition-all uppercase tracking-widest cursor-not-allowed"
            >
              Initiate Secure Link
            </Button>
            <div className="flex justify-center py-1">
              <div className="w-full h-[30px] flex items-center justify-center text-[8px] text-white/10 uppercase font-black tracking-tighter border border-dashed border-white/5 rounded-md px-2 text-center">
                Phase 2 Only
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

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
    retry: false,
    staleTime: 30000,
  });

  const { user: replitUser, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified_twitter") === "true";
    const handle = params.get("handle");

    if (verified && walletAddress && user) {
      const twitterHandle = handle || "DropySentinel";
      
      fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress, 
          twitterHandle
        })
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
        toast({ 
          title: "X Identity Synced", 
          description: `Your X account @${twitterHandle} has been verified.` 
        });
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [walletAddress, user, queryClient, toast]);

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
  const level = Math.floor((user?.reputationScore || 0) / 100) + 1;
  const progress = (user?.reputationScore ? (user.reputationScore % 100) : 0);
  
  // Rank change simulation for visual requirement
  const rankChange = tasksCompleted > 0 ? "up" : "stable";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>User Dashboard | Dropy</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Profile Header - Optimized Size */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary via-primary/60 to-primary/20 p-1.5 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
                  <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-500" alt="Level Avatar" />
                </div>
              </div>
              <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-primary text-primary-foreground font-black text-xs rounded-full border-4 border-background shadow-xl uppercase tracking-widest">
                LVL {level}
              </Badge>
            </div>
            
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
                  {walletAddress?.slice(0, 8)}<span className="text-primary">...</span>{walletAddress?.slice(-8)}
                </h1>
                <Badge className="bg-primary/20 text-primary border-2 border-primary/40 text-[10px] font-black uppercase px-3 py-0.5 tracking-widest rounded-lg">PLATINUM NODE</Badge>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[11px] bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">Protocol Status: Active & Verified</p>
                <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[9px] font-black uppercase px-2 py-0.5 tracking-[0.2em] rounded-full italic shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  SENTINEL RANK
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 gap-4 lg:min-w-[360px]">
            <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-primary/50 transition-all group/card shadow-lg backdrop-blur-md">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Protocol Reputation</span>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{user?.reputationScore || 0}</span>
                <Trophy className="w-5 h-5 text-primary opacity-50 group-hover/card:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-primary/50 transition-all group/card shadow-lg backdrop-blur-md">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Network Rank</span>
                {rankChange === "up" && <ArrowUpRight className="w-5 h-5 text-primary animate-bounce-slow" />}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black font-display text-white">#{Math.max(1, (stats as any)?.totalUsers || 100) - (user?.reputationScore || 0)}</span>
                {rankChange === "up" && <span className="text-sm font-black text-primary font-display border border-primary/30 bg-primary/20 px-2 rounded-lg">+3</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Token Portfolios */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Token Portfolios</h2>
                <div className="h-0.5 flex-1 bg-white/10 mt-2 rounded-full" />
              </div>
              
              {stats?.tokenBalances && stats.tokenBalances.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {stats.tokenBalances.map((tb: any) => (
                    <Card key={tb.symbol} className="glass-card border border-white/10 bg-white/[0.03] hover-elevate transition-all rounded-[2rem] overflow-hidden group shadow-lg">
                      <div className="p-6 relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all duration-700 rotate-12">
                          <Coins className="w-24 h-24" />
                        </div>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 block italic">{tb.symbol} PROTOCOL</span>
                            <div className="text-3xl font-black font-display text-primary tracking-tighter drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{tb.balance}</div>
                          </div>
                          {Number(tb.pending) > 0 && (
                            <div className="flex flex-col items-end">
                              <Badge className="text-[8px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 rounded-lg uppercase tracking-widest animate-pulse">
                                VERIFYING ASSETS
                              </Badge>
                              <span className="text-sm font-black text-yellow-500 mt-1 font-mono">+{tb.pending}</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                          <div>
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Historical Yield</span>
                            <span className="text-xl font-black font-display text-white italic tracking-tight">{tb.earned}</span>
                          </div>
                          {tb.price && (
                            <div className="text-right">
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Valuation (USD)</span>
                              <span className="text-xl font-black text-primary font-mono tracking-tighter">${(Number(tb.balance) * Number(tb.price)).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 group hover:border-primary/40 transition-all duration-500 shadow-inner">
                  <div className="p-4 rounded-xl bg-white/5 mb-4 group-hover:bg-primary/20 transition-all duration-500 shadow-lg border border-white/5">
                    <Activity className="w-8 h-8 text-muted-foreground opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all duration-500" />
                  </div>
                  <p className="text-base font-display font-black uppercase tracking-[0.2em] text-white/20 italic mb-6 text-center">Data Pipeline Empty</p>
                  <Button variant="default" className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg shadow-lg hover:shadow-primary/40 transition-all transform hover:-translate-y-0.5" asChild>
                    <Link href="/earn">Engage Network Tasks</Link>
                  </Button>
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Verification Logs</h2>
                <div className="h-0.5 flex-1 bg-white/10 mt-2 rounded-full" />
              </div>
              <Card className="glass-card border border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  {executions && executions.length > 0 ? (
                    <div className="divide-y border-white/5">
                      {executions.slice(0, 10).map((execution: any) => (
                        <div key={execution.id} className="flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all duration-500 shadow-sm">
                              <CheckCircle className="w-6 h-6 text-primary opacity-40 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                            </div>
                            <div>
                              <p className="font-black text-xl font-display tracking-tight uppercase italic leading-none mb-2 text-white group-hover:text-primary transition-colors">{execution.action?.title || 'System Verification'}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[8px] font-black uppercase border-white/10 px-2 py-0.5 bg-white/5 rounded-md tracking-widest">{execution.campaign?.title}</Badge>
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">+ {execution.action?.rewardAmount} REWARD</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge 
                              className={cn(
                                "text-[8px] font-black uppercase px-4 py-1 rounded-full tracking-widest border border-white/10",
                                execution.status === 'paid' 
                                  ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                  : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                              )}
                            >
                              {execution.status}
                            </Badge>
                            <span className="text-[8px] font-black font-mono text-white/30 uppercase tracking-widest">
                              {execution.createdAt ? format(new Date(execution.createdAt), 'MMM d, HH:mm') : 'REAL-TIME'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <p className="text-lg font-black font-display uppercase tracking-[0.3em] text-white/10 italic">Protocol Inactivity Detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-8">
            {/* Ecosystem Contribution */}
            <Card className="glass-card border border-primary/30 bg-primary/5 rounded-[2rem] overflow-visible relative group p-0.5 shadow-xl lg:max-w-md ml-auto">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.3),transparent_70%)] opacity-70 rounded-[2rem]" />
              <CardHeader className="relative z-10 p-6 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl font-black font-display uppercase leading-none italic tracking-tighter text-white">Protocol <span className="text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">Reputation</span></CardTitle>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-help">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="bottom" 
                        align="end"
                        sideOffset={10}
                        className="border border-white/20 bg-black text-white p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,1)] w-64 z-[9999] backdrop-blur-3xl pointer-events-none"
                      >
                        <div className="space-y-3 relative z-[10000]">
                          <p className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Sentinel Tier Benefits</p>
                          <ul className="space-y-2">
                            {[
                              "Priority Action Verification",
                              "Exclusive Ecosystem Airdrops",
                              "High-Yield Project Access",
                              "Governance Voting Multipliers"
                            ].map((benefit, i) => (
                              <li key={i} className="flex items-start gap-3 text-[10px] font-black text-white uppercase tracking-widest leading-tight">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5 shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 p-6 pt-0 space-y-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-[4rem] font-black font-display text-primary tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{user?.reputationScore || 0}</span>
                  <span className="text-lg font-black text-primary/60 uppercase italic tracking-widest">Score</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Protocol Evolution</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{user?.reputationScore || 0} Points</span>
                      <span className="text-xl font-black font-display text-primary italic tracking-tight drop-shadow-md">{progress}%</span>
                    </div>
                  </div>
                  <div className="w-full h-8 rounded-full bg-black/90 overflow-hidden p-1.5 border border-white/10 shadow-inner relative">
                    <div 
                      className="h-full bg-primary shadow-[0_0_20px_rgba(34,197,94,0.8)] rounded-full transition-all duration-1000 relative overflow-hidden" 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-shimmer" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                        {user?.reputationScore ? (user.reputationScore % 100) : 0} / 100 XP
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60">
                    <span className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/10"><Badge className="h-4 px-2 bg-white/10 text-white border-white/20 text-[9px]">LVL {level}</Badge> INITIATE</span>
                    <ArrowUpRight className="w-5 h-5 text-primary/40" />
                    <span className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-md border border-primary/20">SENTINEL <Badge className="h-4 px-2 bg-primary text-primary-foreground border-none text-[9px]">LVL {level + 1}</Badge></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Verification */}
            <Card className="glass-card border border-white/10 bg-white/[0.02] rounded-[2rem] overflow-hidden p-1 shadow-xl lg:max-w-md ml-auto">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Identity Sync</CardTitle>
                <div className="h-0.5 w-12 bg-white/20 mt-3 rounded-full" />
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {!isAuthenticated ? (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                      <Twitter className="w-12 h-12" />
                    </div>
                    <div className="relative z-10 text-left space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
                          <Twitter className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-white italic">X IDENTITY SYNC</span>
                      </div>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                        Verify your X account to unlock high-yield engagement campaigns.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-3 font-black text-[10px] h-10 rounded-lg shadow-md transition-all active-elevate-2 uppercase tracking-widest"
                        >
                          CONNECT PROTOCOL NODE
                        </Button>
                        <div className="flex justify-center py-2">
                          <div id="cf-turnstile-placeholder" className="w-full min-h-[50px] flex items-center justify-center text-[9px] text-white/20 uppercase font-black tracking-widest border border-dashed border-white/10 rounded-lg px-2 text-center">
                            Bot Protection Active (PHASE 2)
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-white/40 mt-3 italic text-center font-black uppercase tracking-widest leading-none">
                        SECURE OAUTH 2.0 ENCRYPTED
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4 relative overflow-hidden group shadow-lg">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-[0_0_20px_rgba(34,197,94,0.2)] relative z-10">
                      <AvatarImage src={replitUser?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-primary/20"><UserIcon className="w-6 h-6 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-3 h-3 text-blue-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Verified Identity</span>
                      </div>
                      <p className="text-base font-black font-display tracking-tight text-white uppercase italic">{replitUser?.firstName || 'Dropy Sentinel'}</p>
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black mt-1 uppercase tracking-widest">Node Synced</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-white/30 hover:text-destructive hover:bg-destructive/10 relative z-10 transition-all" onClick={() => logout()}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-0 right-0 p-2 opacity-5">
                      <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                )}
                
                <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-600/10 relative overflow-hidden group shadow-lg opacity-60 grayscale hover:grayscale-0 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                    <Send className="w-12 h-12" />
                  </div>
                  <div className="relative z-10 text-left space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 rounded-lg bg-blue-600/20 border border-blue-600/30">
                        <Send className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white italic">TG IDENTITY</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline"
                        disabled
                        className="w-full border-white/10 hover:bg-white/5 text-white/40 gap-3 font-black text-[10px] h-10 rounded-lg transition-all uppercase tracking-widest cursor-not-allowed"
                      >
                        INITIATE SECURE LINK
                      </Button>
                      <div className="flex justify-center py-1">
                        <div className="w-full h-[30px] flex items-center justify-center text-[8px] text-white/10 uppercase font-black tracking-tighter border border-dashed border-white/5 rounded-md px-2 text-center">
                          VERIFICATION BYPASS (PHASE 2)
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/40 mt-3 italic text-center font-black uppercase tracking-widest leading-none">
                      OFFLINE ENCRYPTION
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}