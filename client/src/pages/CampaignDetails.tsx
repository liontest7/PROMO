import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useParams, Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Twitter, 
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
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { CONFIG } from "@shared/config";
import { SuccessCard } from "@/components/SuccessCard";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Action, type Campaign, type Execution, type CampaignWithActions } from "@shared/schema";
import { VerifyActionDialog } from "@/components/VerifyActionDialog";

export default function CampaignDetails() {
  const { id, symbol } = useParams();
  const { isConnected, walletAddress, connect } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: campaign, isLoading: campaignLoading } = useQuery<CampaignWithActions | undefined>({
    queryKey: symbol ? [`/api/campaigns/symbol/${symbol}`] : [`/api/campaigns/${id}`],
    enabled: !!(id || symbol),
  });

  const [currentMC, setCurrentMC] = useState<number | null>(null);

  useEffect(() => {
    if (!campaign?.tokenAddress) return;
    const fetchCurrentMC = async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${campaign.tokenAddress}`);
        const data = await res.json();
        if (data.pairs && data.pairs.length > 0) {
          const bestPair = data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
          const mc = bestPair.marketCap || bestPair.fdv;
          if (mc) setCurrentMC(Number(mc));
        }
      } catch (e) {
        console.error("Failed to fetch MC:", e);
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

  const { data: participants, isLoading: participantsLoading, refetch: refetchExecutions } = useQuery<(Execution & { user: { walletAddress: string } })[]>({
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
        type: 'website', // Temporary type for holder
        title: 'Holder Verification', 
        rewardAmount: campaign.rewardPerWallet || '0',
        url: '',
        maxExecutions: 1
      } as any, 
      campaign 
    });
  };

  const onVerificationSuccess = (actionId: number) => {
    queryClient.invalidateQueries({ queryKey: [`/api/executions/campaign/${campaign?.id}`] });
    refetchExecutions();
    
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
                    const shareUrl = `${window.location.origin}/c/${campaign.tokenName}`;
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                  }}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 w-10"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/c/${campaign.tokenName}`;
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

              <div className="grid gap-4">
                {campaign.campaignType === 'holder_qualification' ? (
                  <Card className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/20 transition-all rounded-2xl">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:px-8 md:py-6 w-full min-h-[100px]">
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/10">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-base font-black uppercase tracking-tight text-white">Holder Verification</h3>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                              Hold {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName} for {campaign.minHoldingDuration} days
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 flex items-center justify-between md:px-6 gap-6 w-full border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0">
                          {isConnected ? (
                            <>
                              <div className="space-y-2.5 flex-1 min-w-0">
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="flex justify-between w-full items-center text-[11px] font-black uppercase tracking-widest text-white/90">
                                    <span>Progress</span>
                                    <span className="text-primary">0%</span>
                                  </div>
                                  <div className="relative h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                    <div className="absolute inset-y-0 left-0 bg-primary w-[5%] transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0 flex flex-col items-center gap-1 min-w-[100px]">
                                <p className="text-[11px] font-black text-white/90 uppercase tracking-widest leading-none">Your Balance</p>
                                <p className="text-lg font-black text-white font-mono leading-none mt-1">
                                  0 <span className="text-[10px] text-primary font-bold uppercase ml-0.5 tracking-tighter">${campaign.tokenName}</span>
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 text-center py-1">
                              <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] italic">Connect wallet to view status</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="shrink-0">
                          <Button 
                            className="font-black h-10 px-5 rounded-xl text-[10px] shadow-2xl transition-all min-w-[130px] uppercase tracking-widest group/btn bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-primary/30"
                            onClick={handleHolderClick}
                          >
                            <div className="flex items-center gap-1.5">
                              {isConnected ? "Check Status" : "Verify & Start"}
                              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </div>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  campaign.actions?.map((action: any) => (
                    <Card key={action.id} className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/30 transition-all rounded-2xl">
                      <CardContent className="p-0">
                        <Button 
                          className="w-full h-20 justify-between px-8 bg-transparent hover:bg-primary/5 transition-all border-0 rounded-none"
                          onClick={() => handleActionClick(action)}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-primary group-hover:text-white transition-all border border-white/5">
                              {action.type === 'twitter' ? <Twitter className="w-5 h-5" /> : action.type === 'telegram' ? <Send className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-base text-white uppercase tracking-tight">{action.title}</p>
                              <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{action.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Reward</p>
                              <p className="text-sm font-black text-primary">+{action.rewardAmount}</p>
                            </div>
                            <div className="bg-white/5 text-white font-black px-5 py-2.5 rounded-lg text-xs group-hover:bg-primary group-hover:text-white transition-all border border-white/10">
                              COMPLETE
                            </div>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <SuccessCard 
              isOpen={celebrationData.isOpen}
              onClose={() => setCelebrationData(prev => ({ ...prev, isOpen: false }))}
              campaignTitle={celebrationData.campaignTitle}
              rewardAmount={celebrationData.rewardAmount}
              tokenName={celebrationData.tokenName}
              actionTitle={celebrationData.actionTitle}
            />

            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Market Overview</h2>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="h-10 text-xs font-black border-white/10 bg-white/5 hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all gap-2 text-white rounded-lg group" asChild>
                    <a href={`https://pump.fun/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.pumpfun} className="w-4 h-4 rounded" />
                      PUMP.FUN
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 text-xs font-black border-white/10 bg-white/5 hover:bg-[#08D6F1]/20 hover:border-[#08D6F1]/40 transition-all gap-2 text-white rounded-lg group" asChild>
                    <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.dexscreener} className="w-4 h-4 rounded grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                      DEXSCREENER
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 text-xs font-black border-white/10 bg-white/5 hover:bg-[#BEF32C]/20 hover:border-[#BEF32C]/40 transition-all gap-2 text-white rounded-lg group" asChild>
                    <a href={`${CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER}${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.jupiter} className="w-4 h-4" />
                      JUPITER
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

            <section className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Recent Rewards</h2>
                <Badge variant="secondary" className="gap-2 px-4 py-1.5 bg-white/5 text-white border-white/10 rounded-lg text-xs font-black">
                  <CheckCircle className="w-4 h-4 text-primary" /> {participants?.filter(p => p.status === 'paid').length || 0} PAID
                </Badge>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {participantsLoading ? (
                  <div className="col-span-full py-10 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : participants && participants.length > 0 ? (
                  participants.slice(0, 6).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-mono text-xs text-primary border border-primary/10">
                          {p.user.walletAddress.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white font-mono">
                            {p.user.walletAddress.substring(0, 4)}...{p.user.walletAddress.substring(p.user.walletAddress.length - 4)}
                          </p>
                          <p className="text-[10px] text-white/40 uppercase font-black">
                            {formatDistanceToNow(new Date(p.createdAt || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {p.status === 'paid' ? (
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20" asChild>
                          <a href={`https://solscan.io/tx/${p.transactionSignature || '#'}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      ) : (
                        <Badge className="font-black px-2.5 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest text-[9px] rounded">
                          VERIFIED
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-white/20 py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 italic text-sm">
                    No winners yet. Be the first!
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-primary/10 border-b border-primary/10 py-5">
                <CardTitle className="text-xs uppercase tracking-[0.2em] text-primary flex items-center justify-between font-black">
                  Campaign Stats
                  <Badge className="bg-primary text-primary-foreground font-black px-3 py-0.5 h-6 text-[10px]">ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {initialMC && currentMC && (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Performance</span>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black",
                        mcChange! >= 0 ? "text-primary bg-primary/10" : "text-red-400 bg-red-400/10"
                      )}>
                        {mcChange! >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {mcChange! >= 0 ? "+" : ""}{mcChange?.toFixed(1)}%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-tighter mb-1">MC at Launch</p>
                        <p className="text-sm font-black text-white">{formatMC(initialMC)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-tighter mb-1">Current MC</p>
                        <p className="text-sm font-black text-primary">{formatMC(currentMC)}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs font-black uppercase tracking-wider">Network</span>
                    <span className="font-black text-white text-sm flex items-center gap-2">
                      <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" alt="Solana" className="w-4 h-4" />
                      SOLANA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs font-black uppercase tracking-wider">Participants</span>
                    <span className="font-black text-white text-base">{participants?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs font-black uppercase tracking-wider">Created</span>
                    <span className="font-black text-white text-xs">{formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/5 space-y-3">
                  <Button variant="outline" className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl text-xs uppercase transition-all" asChild>
                    <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                      Website <Globe className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-xl text-xs uppercase transition-all" asChild>
                    <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                      Twitter <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
