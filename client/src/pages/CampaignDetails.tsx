import { useRoute, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Action, Execution, CampaignWithActions } from "@shared/schema";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck, Coins, Users, CheckCircle, ArrowRight, Twitter, Send, Zap, Globe, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { VerifyActionDialog } from "@/components/VerifyActionDialog";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { CONFIG } from "@shared/config";

export default function CampaignDetails() {
  const { id, symbol } = useParams();
  const { isConnected, walletAddress, connect } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedAction, setSelectedAction] = useState<{ action: Action; campaign: Campaign } | null>(null);

  const { data: campaign, isLoading: campaignLoading } = useQuery<CampaignWithActions | undefined>({
    queryKey: symbol ? [`/api/campaigns/symbol/${symbol}`] : [`/api/campaigns/${id}`],
    enabled: !!(id || symbol),
  });

  const campaignId = campaign?.id;

  const { data: participants, isLoading: participantsLoading } = useQuery<(Execution & { user: { walletAddress: string } })[]>({
    queryKey: [`/api/executions/campaign/${campaignId}`],
    enabled: !!campaignId,
  });

  const handleActionClick = (action: Action) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to participate in campaigns and verify tasks.",
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
        description: "Please connect your wallet to verify your holdings.",
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
        type: 'holder', 
        title: 'Holder Verification', 
        rewardAmount: campaign.rewardPerWallet || '0',
        url: '',
        maxExecutions: 1
      } as any, 
      campaign 
    });
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) return <div className="min-h-screen bg-background flex items-center justify-center text-white font-black tracking-widest uppercase">Campaign not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      {/* Reduced Hero Header Section */}
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
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black text-[9px] px-2 py-0">
                    {campaign.tokenName}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] px-2 py-0 font-black">
                    ACTIVE
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight drop-shadow-xl">
                  {campaign.title}
                </h1>
              </div>
              
              <div className="hidden md:flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-10 w-10"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${campaign.title} on MemeDrop! #Solana`);
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
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Campaign Tasks Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Campaign Tasks</h2>
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">Rewards</span>
                  <span className="text-sm font-black text-primary">{campaign.rewardPerWallet || '0'} {campaign.tokenName}</span>
                </div>
              </div>

              <div className="grid gap-3">
                {campaign.campaignType === 'holder_qualification' ? (
                  <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden group hover:border-primary/40 transition-all rounded-2xl">
                    <CardContent className="p-0">
                      <Button 
                        className="w-full h-20 justify-between px-6 bg-transparent hover:bg-primary/5 text-primary transition-all border-0 rounded-none"
                        onClick={handleHolderClick}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-black uppercase tracking-tight text-white">Holder Verification</p>
                            <p className="text-xs font-bold text-white/40">Hold {campaign.minHoldingAmount} tokens for {campaign.minHoldingDuration} days</p>
                          </div>
                        </div>
                        <div className="bg-primary text-primary-foreground font-black px-5 py-2 rounded-xl text-xs shadow-lg shadow-primary/10 transition-all">
                          VERIFY NOW
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  campaign.actions?.map((action) => (
                    <Card key={action.id} className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/30 transition-all rounded-2xl">
                      <CardContent className="p-0">
                        <Button 
                          className="w-full h-16 justify-between px-6 bg-transparent hover:bg-primary/5 transition-all border-0 rounded-none"
                          onClick={() => handleActionClick(action)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-primary group-hover:text-white transition-all border border-white/5">
                              {action.type === 'twitter' ? <Twitter className="w-4 h-4" /> : action.type === 'telegram' ? <Send className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-sm text-white uppercase tracking-tight">{action.title}</p>
                              <p className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{action.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Reward</p>
                              <p className="text-xs font-black text-primary">+{action.rewardAmount}</p>
                            </div>
                            <div className="bg-white/5 text-white font-black px-4 py-2 rounded-lg text-[10px] group-hover:bg-primary group-hover:text-white transition-all border border-white/10">
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

            {/* Market Overview Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Market Overview</h2>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[9px] font-black border-white/10 bg-white/5 hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all gap-1.5 text-white rounded-lg group" asChild>
                    <a href={`https://pump.fun/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.pumpfun} className="w-3.5 h-3.5 rounded" />
                      PUMP.FUN
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-[9px] font-black border-white/10 bg-white/5 hover:bg-[#08D6F1]/20 hover:border-[#08D6F1]/40 transition-all gap-1.5 text-white rounded-lg group" asChild>
                    <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.bybit} className="w-3.5 h-3.5 rounded grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                      DEXSCREENER
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-[9px] font-black border-white/10 bg-white/5 hover:bg-[#BEF32C]/20 hover:border-[#BEF32C]/40 transition-all gap-1.5 text-white rounded-lg group" asChild>
                    <a href={`https://jup.ag/swap/SOL-${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.jupiter} className="w-3.5 h-3.5" />
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

            {/* About Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">About the Project</h2>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="text-white/80 leading-relaxed text-base whitespace-pre-wrap font-medium">
                  {campaign.description || `The ${campaign.tokenName} project is building a community-driven ecosystem on Solana. Join the campaign to earn rewards and participate in our growth.`}
                </div>
              </div>
            </section>

            {/* Winners section moved here for full width bottom */}
            <section className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-black text-white tracking-tight uppercase">Recent Rewards</h2>
                <Badge variant="secondary" className="gap-2 px-3 py-1 bg-white/5 text-white border-white/10 rounded-lg text-[9px] font-black">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" /> {participants?.filter(p => p.status === 'paid').length || 0} PAID
                </Badge>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {participantsLoading ? (
                  <div className="col-span-full py-10 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : participants && participants.length > 0 ? (
                  participants.slice(0, 6).map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-mono text-[10px] text-primary border border-primary/10">
                          {p.user.walletAddress.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white font-mono">
                            {p.user.walletAddress.substring(0, 4)}...{p.user.walletAddress.substring(p.user.walletAddress.length - 4)}
                          </p>
                          <p className="text-[8px] text-white/30 uppercase font-black">
                            {formatDistanceToNow(new Date(p.createdAt || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      {p.status === 'paid' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary/10 text-primary border border-primary/20" asChild>
                          <a href={`https://solscan.io/tx/${p.transactionSignature || '#'}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      ) : (
                        <Badge className="font-black px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest text-[7px] rounded">
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

          {/* Sidebar Area - Fixed position */}
          <div className="space-y-4">
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="bg-primary/10 border-b border-primary/10 py-4">
                <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-primary flex items-center justify-between font-black">
                  Campaign Stats
                  <Badge className="bg-primary text-primary-foreground font-black px-2 py-0 h-5 text-[8px]">ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">Network</span>
                    <span className="font-black text-white text-xs flex items-center gap-1.5">
                      <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" alt="Solana" className="w-3.5 h-3.5" />
                      SOLANA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">Participants</span>
                    <span className="font-black text-white text-sm">{participants?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">Created</span>
                    <span className="font-black text-white text-[10px]">{formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <Button variant="outline" className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-10 rounded-xl text-[10px] uppercase transition-all" asChild>
                    <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                      Website <Globe className="w-3 h-3" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-10 rounded-xl text-[10px] uppercase transition-all" asChild>
                    <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                      Twitter <Twitter className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Proofs moved here below stats */}
            <Card className="glass-card border-white/5 bg-white/5 rounded-2xl overflow-hidden p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Deposit Proof
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-primary/20 text-primary" asChild>
                    <a href={`https://solscan.io/token/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] font-mono text-white/30 truncate">{campaign.tokenAddress}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
                    <Coins className="w-3 h-3" /> Allocation
                  </span>
                  <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/5 text-[8px] font-black py-0 h-4">LOCKED</Badge>
                </div>
                <p className="text-sm font-black text-white">{campaign.totalBudget} {campaign.tokenName}</p>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Verified</p>
                <p className="text-[9px] text-white/40 leading-tight font-medium">
                  Project verified by MemeDrop. Rewards are on-chain.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <VerifyActionDialog 
        open={!!selectedAction} 
        onOpenChange={(open) => !open && setSelectedAction(null)}
        action={selectedAction?.action ?? null}
        campaign={selectedAction?.campaign ?? null}
      />
    </div>
  );
}
