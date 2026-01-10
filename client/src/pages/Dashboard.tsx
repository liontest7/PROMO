import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, Trophy, TrendingUp, Activity, CheckCircle, Twitter, Send, Loader2, Wallet, LogOut, Megaphone, ShieldAlert, ShieldCheck, User as UserIcon, HelpCircle, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
import { PLATFORM_CONFIG } from "@shared/config";
import { cn } from "@/lib/utils";

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
  const level = Math.floor(tasksCompleted / 10);
  const nextMilestone = (level + 1) * 10;
  const progress = (tasksCompleted % 10) * 10;
  
  // Rank change simulation for visual requirement
  const rankChange = tasksCompleted > 0 ? "up" : "stable";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>User Dashboard | Dropy</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Profile Header - Enhanced Contrast and Size */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 p-12 rounded-[3.5rem] bg-white/[0.04] border-2 border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-60" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative">
              <div className="w-40 h-42 rounded-full bg-gradient-to-tr from-primary via-primary/60 to-primary/20 p-2 shadow-[0_0_60px_rgba(34,197,94,0.5)]">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
                  <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} className="w-24 h-24 object-contain hover:scale-125 transition-transform duration-700" alt="Level Avatar" />
                </div>
              </div>
              <Badge className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 bg-primary text-primary-foreground font-black text-base rounded-full border-4 border-background shadow-2xl uppercase tracking-[0.2em]">
                LVL {level}
              </Badge>
            </div>
            
            <div className="text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-6xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
                  {walletAddress?.slice(0, 8)}<span className="text-primary">...</span>{walletAddress?.slice(-8)}
                </h1>
                <Badge className="bg-primary/20 text-primary border-2 border-primary/40 text-xs font-black uppercase px-4 py-1 tracking-widest rounded-lg">PLATINUM NODE</Badge>
              </div>
              <p className="text-white/70 font-black uppercase tracking-[0.3em] text-sm bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/10">Protocol Status: Active & Verified</p>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 gap-8 lg:min-w-[450px]">
            <div className="flex flex-col p-8 rounded-[2.5rem] bg-black/40 border-2 border-white/10 hover:border-primary/50 transition-all group/card shadow-xl backdrop-blur-md">
              <span className="text-xs font-black text-white/50 uppercase tracking-[0.4em] mb-3">Protocol Reputation</span>
              <div className="flex items-center gap-4">
                <span className="text-6xl font-black font-display text-primary drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]">{stats?.reputation || 100}</span>
                <Trophy className="w-8 h-8 text-primary opacity-50 group-hover/card:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex flex-col p-8 rounded-[2.5rem] bg-black/40 border-2 border-white/10 hover:border-primary/50 transition-all group/card shadow-xl backdrop-blur-md">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-black text-white/50 uppercase tracking-[0.4em]">Network Rank</span>
                {rankChange === "up" && <ArrowUpRight className="w-6 h-6 text-primary animate-bounce-slow" />}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-6xl font-black font-display text-white">#{Math.max(1, 100 - (stats?.reputation || 0))}</span>
                {rankChange === "up" && <span className="text-base font-black text-primary font-display border-2 border-primary/30 bg-primary/20 px-3 py-1 rounded-xl">+3</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {/* Token Portfolios */}
            <section>
              <div className="flex items-center gap-8 mb-12">
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <Coins className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-5xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Token Portfolios</h2>
                  <div className="h-1.5 w-32 bg-primary mt-4 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
              </div>
              
              {stats?.tokenBalances && stats.tokenBalances.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {stats.tokenBalances.map((tb: any) => (
                    <Card key={tb.symbol} className="glass-card border-2 border-white/10 bg-white/[0.03] hover-elevate transition-all rounded-[3rem] overflow-hidden group shadow-2xl">
                      <div className="p-12 relative">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-25 transition-all duration-1000 rotate-12">
                          <Coins className="w-40 h-40" />
                        </div>
                        <div className="flex justify-between items-start mb-12">
                          <div>
                            <span className="text-sm font-black text-white/50 uppercase tracking-[0.4em] mb-4 block italic">{tb.symbol} PROTOCOL</span>
                            <div className="text-7xl font-black font-display text-primary tracking-tighter drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]">{tb.balance}</div>
                          </div>
                          {Number(tb.pending) > 0 && (
                            <div className="flex flex-col items-end">
                              <Badge className="text-xs font-black text-yellow-500 bg-yellow-500/10 border-2 border-yellow-500/30 px-5 py-2.5 rounded-2xl uppercase tracking-[0.2em] shadow-lg">
                                PENDING
                              </Badge>
                              <span className="text-lg font-black text-yellow-500 mt-4 font-mono">+{tb.pending}</span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-10 pt-12 border-t-2 border-white/10">
                          <div>
                            <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] block mb-3">Historical Yield</span>
                            <span className="text-3xl font-black font-display text-white italic tracking-tight">{tb.earned}</span>
                          </div>
                          {tb.price && (
                            <div className="text-right">
                              <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] block mb-3">Valuation (USD)</span>
                              <span className="text-3xl font-black text-primary font-mono tracking-tighter">${(Number(tb.balance) * Number(tb.price)).toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-32 rounded-[5rem] bg-white/[0.02] border-4 border-dashed border-white/10 group hover:border-primary/40 transition-all duration-700 shadow-inner">
                  <div className="p-12 rounded-[3rem] bg-white/5 mb-10 group-hover:bg-primary/20 transition-all duration-700 shadow-2xl border-2 border-white/5">
                    <Activity className="w-24 h-24 text-muted-foreground opacity-30 group-hover:text-primary group-hover:opacity-100 transition-all duration-700" />
                  </div>
                  <p className="text-3xl font-display font-black uppercase tracking-[0.4em] text-white/30 italic mb-10">Data Pipeline Empty</p>
                  <Button variant="default" className="bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-lg px-12 py-9 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.5)] transition-all transform hover:-translate-y-1" asChild>
                    <Link href="/earn">Engage Network Tasks</Link>
                  </Button>
                </div>
              )}
            </section>

            {/* Recent Activity */}
            <section>
              <div className="flex items-center gap-8 mb-12">
                <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <Activity className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-5xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Verification Logs</h2>
                  <div className="h-1.5 w-32 bg-primary mt-4 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
              </div>
              <Card className="glass-card border-2 border-white/10 bg-white/[0.02] rounded-[4rem] overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  {executions && executions.length > 0 ? (
                    <div className="divide-y-2 divide-white/5">
                      {executions.slice(0, 10).map((execution: any) => (
                        <div key={execution.id} className="flex items-center justify-between p-10 hover:bg-white/[0.03] transition-all group">
                          <div className="flex items-center gap-10">
                            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border-2 border-white/15 group-hover:border-primary/50 transition-all duration-700 shadow-lg">
                              <CheckCircle className="w-11 h-11 text-primary opacity-40 group-hover:opacity-100 transition-all duration-700 shadow-[0_0_30px_rgba(34,197,94,0.5)]" />
                            </div>
                            <div>
                              <p className="font-black text-3xl font-display tracking-tight uppercase italic leading-none mb-4 text-white group-hover:text-primary transition-colors">{execution.action?.title || 'System Verification'}</p>
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-xs font-black uppercase border-white/20 px-4 py-1.5 bg-white/10 rounded-lg tracking-widest">{execution.campaign?.title}</Badge>
                                <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">+ {execution.action?.rewardAmount} REWARD CREDITED</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-5">
                            <Badge 
                              className={cn(
                                "text-xs font-black uppercase px-8 py-2.5 rounded-full tracking-[0.2em] border-2 shadow-xl",
                                execution.status === 'paid' 
                                  ? 'bg-primary/30 text-primary border-primary/40 shadow-[0_0_25px_rgba(34,197,94,0.4)]' 
                                  : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40'
                              )}
                            >
                              {execution.status}
                            </Badge>
                            <span className="text-xs font-black font-mono text-white/40 uppercase tracking-[0.2em]">
                              LOGGED: {execution.createdAt ? format(new Date(execution.createdAt), 'MMM d, HH:mm') : 'REAL-TIME'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-32 text-center">
                      <p className="text-2xl font-black font-display uppercase tracking-[0.5em] text-white/15 italic">Protocol Inactivity Detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-16">
            {/* Ecosystem Contribution */}
            <Card className="glass-card border-2 border-primary/40 bg-primary/5 rounded-[4rem] overflow-hidden relative group p-1.5 shadow-[0_0_80px_rgba(34,197,94,0.15)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.4),transparent_70%)] opacity-70" />
              <CardHeader className="relative z-10 p-12 pb-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-primary flex items-center justify-center mb-10 shadow-[0_0_60px_rgba(34,197,94,0.7)] border-4 border-white/20 animate-bounce-slow">
                  <Star className="w-12 h-12 text-primary-foreground fill-primary-foreground" />
                </div>
                <CardTitle className="text-6xl font-black font-display uppercase leading-none italic tracking-tighter text-white">Ecosystem<br/><span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">Impact</span></CardTitle>
                <div className="h-1.5 w-24 bg-primary mt-8 rounded-full shadow-lg" />
              </CardHeader>
              <CardContent className="relative z-10 p-12 pt-0 space-y-12">
                <div className="flex items-baseline gap-5">
                  <span className="text-[9rem] font-black font-display text-primary tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]">{tasksCompleted}</span>
                  <span className="text-3xl font-black text-primary/60 uppercase italic tracking-[0.2em]">Actions</span>
                </div>
                
                <div className="space-y-10">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-white/50 uppercase tracking-[0.4em]">Evolution Progress</span>
                    <span className="text-4xl font-black font-display text-primary italic tracking-tight drop-shadow-md">{progress}%</span>
                  </div>
                  <div className="w-full h-10 rounded-full bg-black/90 overflow-hidden p-2.5 border-2 border-white/15 shadow-2xl">
                    <div 
                      className="h-full bg-primary shadow-[0_0_40px_rgba(34,197,94,1)] rounded-full transition-all duration-1500 relative overflow-hidden" 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] animate-shimmer" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-white/50">
                    <span className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10"><Badge className="h-6 px-4 bg-white/10 text-white border-white/20">LVL {level}</Badge> INITIATE</span>
                    <span className="text-primary font-display italic text-base">TARGET: {nextMilestone}</span>
                    <span className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">SENTINEL <Badge className="h-6 px-4 bg-primary text-primary-foreground border-none">LVL {level + 1}</Badge></span>
                  </div>
                </div>
                
                <div className="p-10 rounded-[3rem] bg-black/70 border-2 border-white/10 backdrop-blur-3xl shadow-2xl ring-1 ring-white/5">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="p-4 rounded-2xl bg-primary/20 border border-primary/40 shadow-inner">
                      <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-base font-black uppercase tracking-[0.4em] text-white italic">Sentinel Tier Benefits</span>
                  </div>
                  <ul className="space-y-6">
                    {[
                      "Priority Action Verification Queue",
                      "Exclusive Ecosystem Airdrop Pool",
                      "High-Yield Project Access Slots",
                      "Governance Voting Multipliers"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-5 text-sm font-black text-white/70 uppercase tracking-widest group/item leading-tight">
                        <div className="w-3 h-3 rounded-full bg-primary/50 group-hover/item:bg-primary transition-all duration-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] mt-1 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Social Verification */}
            <Card className="glass-card border-2 border-white/10 bg-white/[0.02] rounded-[4rem] overflow-hidden p-2 shadow-2xl">
              <CardHeader className="p-12 pb-10">
                <CardTitle className="text-4xl font-black font-display uppercase italic tracking-tighter leading-none text-white">Identity Sync</CardTitle>
                <div className="h-1.5 w-20 bg-white/30 mt-6 rounded-full" />
              </CardHeader>
              <CardContent className="p-12 pt-0 space-y-10">
                {!isAuthenticated ? (
                  <div className="p-10 rounded-[3rem] bg-blue-500/10 border-2 border-blue-500/20 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-25 transition-all duration-700 scale-125">
                      <Twitter className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-5 mb-8">
                        <div className="p-4 rounded-[1.5rem] bg-blue-500/20 border-2 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                          <Twitter className="w-8 h-8 text-blue-400" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-[0.4em] text-white italic">X IDENTITY</span>
                      </div>
                      <Button 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-5 font-black text-base h-20 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all active-elevate-2 uppercase tracking-[0.2em] transform hover:scale-[1.02]"
                      >
                        SYNC PROTOCOL NODE
                      </Button>
                      <p className="text-xs text-white/40 mt-8 italic text-center font-black uppercase tracking-[0.3em]">
                        SECURE OAUTH 2.0 ENCRYPTED
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 rounded-[3rem] bg-primary/10 border-2 border-primary/30 flex items-center gap-10 relative overflow-hidden group shadow-2xl">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-[0_0_40px_rgba(34,197,94,0.3)] relative z-10">
                      <AvatarImage src={replitUser?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-primary/20"><UserIcon className="w-12 h-12 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative z-10">
                      <p className="text-3xl font-black font-display uppercase italic tracking-tight text-white mb-3 leading-none">{replitUser?.firstName || 'Dropy Sentinel'}</p>
                      <Badge className="bg-primary/30 text-primary border-none text-xs font-black uppercase px-5 py-1.5 tracking-[0.3em] rounded-xl shadow-lg">NODE VERIFIED</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl text-white/30 hover:text-destructive hover:bg-destructive/10 relative z-10 transition-all" onClick={() => logout()}>
                      <LogOut className="w-8 h-8" />
                    </Button>
                  </div>
                )}
                
                <div className="p-10 rounded-[3rem] bg-white/[0.05] border-2 border-white/10 opacity-60 grayscale group hover:grayscale-0 transition-all duration-1000 shadow-xl">
                  <div className="flex items-center gap-8 mb-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-400/10 flex items-center justify-center border-2 border-blue-400/20 shadow-inner">
                      <Send className="w-9 h-9 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <span className="text-2xl font-black uppercase tracking-[0.4em] block italic text-white/70 group-hover:text-white transition-colors leading-none mb-3">Telegram</span>
                      <span className="text-xs text-white/30 font-black uppercase tracking-[0.2em]">OFFLINE ENCRYPTION</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-black h-16 rounded-[1.5rem] border-white/20 uppercase tracking-[0.3em] hover:bg-white/10 transition-all transform hover:scale-[1.01]" disabled>
                    INITIATE SECURE LINK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}