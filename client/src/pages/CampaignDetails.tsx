import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useParams, Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Globe, 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle, 
  Send,
  Loader2,
  Share2,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CONFIG } from "@shared/config";
import { UnifiedSuccessCard } from "@/components/UnifiedSuccessCard";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Action, type Campaign, type Execution, type CampaignWithActions } from "@shared/schema";
import { VerifyActionDialog } from "@/components/VerifyActionDialog";
import { ClaimRewards } from "@/components/dashboard/ClaimRewards";

export default function CampaignDetails() {
  const { id, symbol } = useParams();
  const { isConnected, walletAddress, connect } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading: campaignLoading } = useQuery<CampaignWithActions | undefined>({
    queryKey: id ? [`/api/campaigns/${id}`] : symbol ? [`/api/campaigns/${encodeURIComponent(symbol)}`] : [],
    enabled: !!(id || symbol),
    retry: 1,
    staleTime: 60000,
  });

  const [selectedAction, setSelectedAction] = useState<{ action: Action; campaign: Campaign } | null>(null);
  const [currentMC, setCurrentMC] = useState<number | null>(null);
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

  useEffect(() => {
    if (!campaign?.tokenAddress) return;
    const fetchCurrentMC = async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${campaign.tokenAddress}`);
        const data = await res.json();
        if (data.pairs?.length > 0) {
          const bestPair = data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
          const mc = bestPair.marketCap || bestPair.fdv;
          if (mc) {
            setCurrentMC(Number(mc));
            return;
          }
        }
      } catch (e) {
        console.warn("Market data fetch failed:", e);
      }
    };
    fetchCurrentMC();
    const interval = setInterval(fetchCurrentMC, 60000);
    return () => clearInterval(interval);
  }, [campaign?.tokenAddress]);

  const initialMC = campaign?.initialMarketCap ? Number(campaign.initialMarketCap) : null;
  const mcChange = (initialMC && currentMC) ? ((currentMC - initialMC) / initialMC) * 100 : null;

  const formatMC = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  // Auto-refresh holding status
  useEffect(() => {
    if (!isConnected || !campaign) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: [`/api/executions/campaign/${campaign.id}`] });
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, campaign?.id, queryClient]);

  const campaignId = campaign?.id;

  const { data: executions, isLoading: executionsLoading } = useQuery<Execution[]>({
    queryKey: [`/api/executions/user/${walletAddress}/campaign/${campaign?.id}`],
    enabled: !!(isConnected && walletAddress && campaign?.id),
  });

  const { data: participants } = useQuery<(Execution & { user: { walletAddress: string } })[]>({
    queryKey: [`/api/executions/campaign/${campaignId}`],
    enabled: !!campaignId,
  });

  const handleActionClick = (action: Action) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to participate in campaigns.",
        variant: "destructive"
      });
      connect('user');
      return;
    }
    if (campaign) {
      setSelectedAction({ action, campaign });
    }
  };

  const handleHolderClick = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to verify holdings.",
        variant: "destructive"
      });
      connect('user');
      return;
    }
    if (!campaign) return;

    setSelectedAction({ 
      action: { 
        id: 0, 
        campaignId: campaign.id, 
        type: 'holder_verification', // Use specific type
        title: 'Holder Verification', 
        rewardAmount: campaign.rewardPerWallet || '0',
        url: '',
        maxExecutions: 1
      } as any, 
      campaign 
    });
  };

  const { mutate: verifyAction, isPending: isVerifying } = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/executions/verify", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.status === "verified") {
        onVerificationSuccess(selectedAction?.action.id || 0);
        setSelectedAction(null);
      } else if (data.status === "tracking") {
        toast({ title: "Follow Detected", description: data.message });
        setSelectedAction(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onVerificationSuccess = (actionId: number) => {
    queryClient.invalidateQueries({ queryKey: [`/api/executions/campaign/${campaign?.id}`] });
    
    // Find action for celebration
    let action = campaign?.actions.find((a: any) => a.id === actionId);
    if (!action && actionId === 0) {
      // Special case for holder verification
      action = { 
        title: "Holder Verification", 
        rewardAmount: campaign?.rewardPerWallet || "0" 
      } as any;
    }
    
    if (action) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#ffffff', '#10b981']
      });

      setCelebrationData({
        isOpen: true,
        campaignTitle: campaign?.title || "",
        rewardAmount: action.rewardAmount.toString(),
        tokenName: campaign?.tokenName || "",
        actionTitle: action.title
      });
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest">Campaign Not Found</h2>
      <Link href="/earn">
        <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
          <ArrowLeft className="w-4 h-4" /> Return to Earn Rewards
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      <div className="relative w-full h-[240px] border-b border-white/5 overflow-hidden">
        <img 
          src={campaign.bannerUrl || ""} 
          alt={campaign.title}
          className="w-full h-full object-cover opacity-40 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="container max-w-6xl mx-auto px-4">
            <Link href="/earn">
              <Button variant="ghost" className="mb-4 -ml-4 gap-2 hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </Link>
            
            <div className="flex flex-row items-center gap-6">
              <div className="relative shrink-0">
                <img 
                  src={campaign.logoUrl || ""} 
                  alt="Logo" 
                  className="w-24 h-24 rounded-2xl border-2 border-white/10 bg-card object-cover shadow-2xl"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background shadow-lg">
                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap gap-2 mb-1">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black text-xs px-3 py-1">
                    ${campaign.tokenName}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-3 py-1 font-black">
                    ACTIVE
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-white tracking-tight drop-shadow-xl">
                  {campaign.title}
                </h1>
              </div>
              
              <div className="hidden md:flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 w-10"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${campaign.title} on Dropy! #Solana #Dropy`);
                    const shareUrl = `${window.location.origin}/c/${campaign.slug || campaign.tokenName.toLowerCase()}`;
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                >
                  <FaXTwitter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 w-10"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/c/${campaign.slug || campaign.tokenName.toLowerCase()}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Campaign Tasks</h2>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Rewards</span>
                    <span className="text-lg font-black text-primary">{campaign.rewardPerWallet || '0'} ${campaign.tokenName}</span>
                  </div>
                </div>
              </div>

              <ClaimRewards 
                walletAddress={walletAddress!} 
                campaignId={campaign.id} 
                campaignTitle={campaign.title}
              />

              <div className="grid gap-4">
                {campaign.campaignType === 'holder_qualification' ? (
                  <div className="space-y-4">
                    {/* Simplified Holder Task UI to match Social Missions style */}
                    <Card className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/30 transition-all rounded-2xl">
                      <CardContent className="p-0">
                        <div className="flex items-center justify-between px-8 py-5 h-20">
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center transition-all border",
                              executions?.some(e => e.status === 'verified' || e.status === 'paid') 
                                ? "bg-primary text-white border-primary" 
                                : "bg-white/5 text-white/50 border-white/5 group-hover:bg-primary group-hover:text-white"
                            )}>
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="font-black text-base text-white uppercase tracking-tight">Holder Verification</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                                  Hold {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName}
                                </p>
                                {campaign.requirements?.minSolBalance && (
                                  <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest leading-none">
                                    Min SOL: {campaign.requirements.minSolBalance}
                                  </p>
                                )}
                                {campaign.requirements?.minWalletAgeDays && (
                                  <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest leading-none">
                                    Age: {campaign.requirements.minWalletAgeDays}d
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Reward</p>
                              <p className="text-sm font-black text-primary">+{campaign.rewardPerWallet}</p>
                            </div>
                            {(() => {
                              const execution = executions?.[0]; // For holder, usually one execution
                              const isCompleted = execution?.status === 'verified' || execution?.status === 'paid';
                              const isWithdrawn = execution?.withdrawn === true || execution?.status === 'paid';

                              return (
                                <Button 
                                  size="sm"
                                  variant={isCompleted ? "outline" : "default"}
                                  disabled={(isCompleted && !isWithdrawn) || isVerifying}
                                  className={cn(
                                    "font-black px-5 h-9 rounded-lg text-xs uppercase tracking-widest transition-all",
                                    isCompleted && "border-primary/50 text-primary bg-primary/5 no-default-hover-elevate",
                                    isWithdrawn && "bg-muted text-muted-foreground border-muted cursor-default opacity-70"
                                  )}
                                  onClick={handleHolderClick}
                                >
                                  {isVerifying ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : isWithdrawn ? "CLAIMED" : isCompleted ? `+${campaign.rewardPerWallet}` : "COMPLETE"}
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaign.actions?.map((action: any) => {
                      const execution = executions?.find(e => e.actionId === action.id);
                      const isCompleted = execution?.status === 'verified' || execution?.status === 'paid';
                      const isWithdrawn = execution?.withdrawn === true || execution?.status === 'paid';

                      return (
                        <Card key={action.id} className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/30 transition-all rounded-2xl">
                          <CardContent className="p-0">
                            <div className="flex items-center justify-between px-8 py-5 h-20">
                              <div className="flex items-center gap-5">
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all border",
                                  isCompleted ? "bg-primary text-white border-primary" : "bg-white/5 text-white/50 border-white/5 group-hover:bg-primary group-hover:text-white"
                                )}>
                                  {action.type === 'twitter' || action.type.startsWith('twitter_') ? <FaXTwitter className="w-4 h-4" /> : action.type === 'telegram' ? <Send className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                  <p className="font-black text-base text-white uppercase tracking-tight">{action.title}</p>
                                  <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{action.type.replace('_', ' ')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Reward</p>
                                  <p className="text-sm font-black text-primary">+{action.rewardAmount}</p>
                                </div>
                                <Button 
                                  size="sm"
                                  variant={isCompleted ? "outline" : "default"}
                                  disabled={(isCompleted && !isWithdrawn) || isVerifying}
                                  className={cn(
                                    "font-black px-5 h-9 rounded-lg text-xs uppercase tracking-widest transition-all",
                                    isCompleted && "border-primary/50 text-primary bg-primary/5 no-default-hover-elevate",
                                    isWithdrawn && "bg-muted text-muted-foreground border-muted cursor-default opacity-70"
                                  )}
                                  onClick={() => !isCompleted && handleActionClick(action)}
                                >
                                  {isVerifying && selectedAction?.action.id === action.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : isWithdrawn ? "CLAIMED" : isCompleted ? `+${action.rewardAmount}` : "COMPLETE"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

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

            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Market Overview</h2>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="h-10 text-xs font-black border-white/10 bg-white/5 hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all gap-2 text-white rounded-lg group" asChild>
                    <a href={`https://pump.fun/coin/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={(CONFIG.ui.walletIcons as any)?.pumpfun || ""} className="w-4 h-4 rounded" alt="Pump.fun" />
                      PUMP.FUN
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 text-xs font-black border-white/10 bg-white/5 hover:bg-[#08D6F1]/20 hover:border-[#08D6F1]/40 transition-all gap-2 text-white rounded-lg group" asChild>
                    <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.dexscreener} className="w-4 h-4 rounded grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                      DEXSCREENER
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 text-xs font-black border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 transition-all gap-2 text-white rounded-lg group" asChild>
                    <a href={`https://solscan.io/token/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <Globe className="w-4 h-4 text-primary" />
                      SOLSCAN
                    </a>
                  </Button>
                </div>
              </div>
              <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md relative">
                <iframe 
                  src={`https://dexscreener.com/solana/${campaign.tokenAddress}?embed=1&theme=dark&trades=0&info=0`}
                  className="w-full h-full border-0"
                  title="DexScreener Chart"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">About the Project</h2>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="text-white/80 leading-relaxed text-base whitespace-pre-wrap font-medium">
                  {campaign.description}
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-black text-white tracking-tight uppercase flex items-center gap-2">
                    Payment Proofs
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </h2>
                  <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Live reward distribution from Solana</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="gap-2 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 rounded-lg text-sm font-black">
                    <CheckCircle className="w-4 h-4" /> {participants?.filter(p => p.status === 'paid').length || 0} REWARDS SENT
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3">
                {participants === undefined ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Verifying Blockchain Data...</p>
                  </div>
                ) : participants && participants.length > 0 ? (
                  participants.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-primary/30 transition-all group gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 shadow-lg shadow-primary/5">
                          <span className="text-primary font-black font-mono text-sm">{p.user.walletAddress.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white font-mono truncate">
                            {p.user.walletAddress.substring(0, 6)}...{p.user.walletAddress.substring(p.user.walletAddress.length - 6)}
                          </p>
                          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest flex items-center gap-2">
                            {formatDistanceToNow(new Date(p.createdAt || Date.now()), { addSuffix: true })}
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            SOLANA MAINNET
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-2 sm:justify-end mb-0.5">
                            <span className="text-base font-black text-primary">+{campaign.rewardPerWallet} ${campaign.tokenName}</span>
                            <Badge className="bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0 font-black border-0">PAID</Badge>
                          </div>
                          {p.transactionSignature && (
                            <a 
                              href={`https://solscan.io/tx/${p.transactionSignature}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] font-black text-white/20 hover:text-primary transition-colors uppercase flex items-center gap-1.5 sm:justify-end tracking-wider"
                            >
                              Verify Transaction <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-white/20 py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 italic text-sm flex flex-col items-center gap-3">
                    <ShieldCheck className="w-8 h-8 opacity-10" />
                    No rewards distributed yet. Be the first to claim!
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-primary/10 border-b border-primary/10 py-5">
                <CardTitle className="text-xs uppercase tracking-[0.2em] text-primary flex items-center justify-between font-black">
                  Campaign Stats
                  <Badge className="bg-primary text-primary-foreground font-black px-3 py-0.5 h-6 text-[10px]">ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {initialMC !== null && currentMC !== null && (
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white/40 uppercase tracking-widest">Performance</span>
                      <div className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black",
                        mcChange! >= 0 ? "text-primary bg-primary/10" : "text-red-400 bg-red-400/10"
                      )}>
                        {mcChange! >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {mcChange! >= 0 ? "+" : ""}{mcChange?.toFixed(1)}%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-tight">MC Air-drop Launch</p>
                        <p className="text-lg font-black text-white">{formatMC(initialMC)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-black text-primary/40 uppercase tracking-tight">Current Real MC</p>
                        <p className="text-lg font-black text-primary">{formatMC(currentMC)}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Network</span>
                    <span className="font-black text-white text-base flex items-center gap-2">
                      <img src={CONFIG.ui.walletIcons.solana} alt="Solana" className="w-4 h-4 rounded-full" />
                      SOLANA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Participants</span>
                    <span className="font-black text-white text-lg">{participants?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Created</span>
                    <span className="font-black text-white text-sm">{formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <Button variant="outline" className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl text-xs uppercase transition-all" asChild>
                    <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                      Website <Globe className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl text-xs uppercase transition-all" asChild>
                    <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                      X <FaXTwitter className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="bg-white/5 border-b border-white/5 py-4">
                <CardTitle className="text-xs uppercase tracking-[0.2em] text-primary font-black flex items-center justify-between">
                  <span>Blockchain Proofs</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-5">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Escrow Wallet</span>
                    <a 
                      href={`https://solscan.io/account/${campaign.escrowWallet || campaign.tokenAddress}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-mono text-base font-black text-primary hover:underline flex items-center gap-2"
                    >
                      {campaign.escrowWallet ? `${campaign.escrowWallet.substring(0, 4)}...${campaign.escrowWallet.substring(campaign.escrowWallet.length - 4)}` : "Generating..."}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Locked Rewards</span>
                    <span className="font-black text-white text-base uppercase">{Number(campaign.totalBudget).toLocaleString()} ${campaign.tokenName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Gas Reserve</span>
                    <span className="font-black text-primary text-base uppercase">{campaign.gasBudgetSol || "0.00"} SOL</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-white/40 text-sm font-black uppercase tracking-wider">Contract Status</span>
                    <Badge variant="outline" className={cn(
                      "text-xs font-black h-7 px-4 uppercase tracking-widest",
                      campaign.creationFeePaid ? "border-green-500/20 bg-green-500/10 text-green-400" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
                    )}>
                      {campaign.creationFeePaid ? "VERIFIED" : "PENDING FUNDING"}
                    </Badge>
                  </div>
                  {campaign.fundingTxSignature && (
                    <Button variant="ghost" className="w-full h-12 text-xs font-black text-primary hover:bg-primary/5 gap-2.5 uppercase tracking-widest" asChild>
                      <a href={`https://solscan.io/tx/${campaign.fundingTxSignature}`} target="_blank" rel="noreferrer">
                        View Funding Transaction <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center justify-center gap-2 shadow-lg shadow-green-500/5">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
                Verified by Dropy Anti-Fraud System
              </span>
            </div>
          </div>
        </div>
      </div>

      <VerifyActionDialog 
        action={selectedAction?.action || null}
        campaign={selectedAction?.campaign || null}
        open={!!selectedAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAction(null);
          }
        }}
        onSuccess={onVerificationSuccess}
      />
    </div>
  );
}
