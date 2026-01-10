import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Action, Execution } from "@shared/schema";
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
  const [, params] = useRoute("/campaign/:id");
  const campaignId = params?.id;
  const [selectedAction, setSelectedAction] = useState<{ action: Action; campaign: Campaign } | null>(null);
  const { toast } = useToast();
  const { isConnected, connect } = useWallet();

  const { data: campaign, isLoading: campaignLoading } = useQuery<(Campaign & { actions: Action[] }) | undefined>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !!campaignId,
  });

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

  if (!campaign) return <div className="min-h-screen bg-background flex items-center justify-center text-white">Campaign not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      
      {/* Hero Header Section */}
      <div className="relative w-full h-[400px] border-b border-white/5 overflow-hidden">
        <img 
          src={campaign.bannerUrl || ""} 
          alt={campaign.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="container max-w-6xl mx-auto px-4 pb-12">
            <Link href="/earn">
              <Button variant="ghost" className="mb-6 gap-2 hover:bg-white/5 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Explore
              </Button>
            </Link>
            
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <div className="relative group">
                <img 
                  src={campaign.logoUrl || ""} 
                  alt="Logo" 
                  className="w-32 h-32 rounded-3xl border-4 border-background bg-card object-cover shadow-2xl transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1.5 border-4 border-background shadow-lg">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold px-3 py-1">
                    {campaign.tokenName}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 font-bold">
                    ACTIVE
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight drop-shadow-xl">
                  {campaign.title}
                </h1>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all h-12 w-12"
                  onClick={() => {
                    const text = encodeURIComponent(`Check out ${campaign.title} on MemeDrop! #Solana`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                  }}
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all h-12 w-12"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Campaign Tasks Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-black text-white tracking-tight">Available Tasks</h2>
                <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Potential Earning</span>
                  <span className="text-lg font-black text-primary">{campaign.rewardPerWallet || '0'} {campaign.tokenName}</span>
                </div>
              </div>

              <div className="grid gap-4">
                {campaign.campaignType === 'holder_qualification' ? (
                  <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden group hover:border-primary/40 transition-all rounded-3xl">
                    <CardContent className="p-0">
                      <Button 
                        className="w-full h-24 justify-between px-8 bg-transparent hover:bg-primary/5 text-primary transition-all border-0 rounded-none"
                        onClick={handleHolderClick}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-inner">
                            <ShieldCheck className="w-8 h-8" />
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-black uppercase tracking-tight text-white">Holder Verification</p>
                            <p className="text-sm font-bold text-white/50">Hold {campaign.minHoldingAmount} {campaign.tokenName} for {campaign.minHoldingDuration} days</p>
                          </div>
                        </div>
                        <div className="bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 group-hover:shadow-primary/40 group-hover:-translate-y-0.5 transition-all">
                          START VERIFICATION
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  campaign.actions?.map((action) => (
                    <Card key={action.id} className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/30 transition-all rounded-3xl">
                      <CardContent className="p-0">
                        <Button 
                          className="w-full h-20 justify-between px-8 bg-transparent hover:bg-primary/5 transition-all border-0 rounded-none"
                          onClick={() => handleActionClick(action)}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/70 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-white/5">
                              {action.type === 'twitter' ? <Twitter className="w-5 h-5" /> : action.type === 'telegram' ? <Send className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-white uppercase tracking-tight">{action.title}</p>
                              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{action.type} task</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Reward</p>
                              <p className="text-lg font-black text-primary">+{action.rewardAmount} {campaign.tokenName}</p>
                            </div>
                            <div className="bg-white/5 text-white font-black px-6 py-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-all border border-white/10">
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
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-display font-black text-white tracking-tight">Market Overview</h2>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="h-9 text-[10px] font-black border-white/10 bg-white/5 hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all gap-2 text-white rounded-xl group" asChild>
                    <a href={`https://pump.fun/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.pumpfun} className="w-4 h-4 rounded-md" />
                      PUMP.FUN
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 text-[10px] font-black border-white/10 bg-white/5 hover:bg-[#08D6F1]/20 hover:border-[#08D6F1]/40 transition-all gap-2 text-white rounded-xl group" asChild>
                    <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.bybit} className="w-4 h-4 rounded-md grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100" />
                      DEXSCREENER
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 text-[10px] font-black border-white/10 bg-white/5 hover:bg-[#BEF32C]/20 hover:border-[#BEF32C]/40 transition-all gap-2 text-white rounded-xl group" asChild>
                    <a href={`https://jup.ag/swap/SOL-${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      <img src={CONFIG.ui.walletIcons.jupiter} className="w-4 h-4" />
                      JUPITER
                    </a>
                  </Button>
                </div>
              </div>
              <div className="w-full h-[500px] rounded-[32px] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md relative shadow-2xl">
                <iframe 
                  src={`https://dexscreener.com/solana/${campaign.tokenAddress}?embed=1&theme=dark&trades=0&info=0`}
                  className="w-full h-full border-0"
                  title="DexScreener Chart"
                />
              </div>
            </section>

            {/* About Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-display font-black text-white tracking-tight">About the Project</h2>
              <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                <div className="text-white/70 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                  {campaign.description}
                </div>
              </div>
            </section>

            {/* Proofs Section */}
            <section className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-white/5 bg-white/5 rounded-[32px] overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2 font-black">
                    <ShieldCheck className="w-4 h-4" /> Deposit Proof
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-xs text-white/50 mb-4">On-chain verification of the rewards budget deposit.</p>
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                    <span className="text-[11px] font-mono text-white/40 truncate mr-4">{campaign.tokenAddress}</span>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/20 text-primary" asChild>
                      <a href={`https://solscan.io/token/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 bg-white/5 rounded-[32px] overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-4">
                  <CardTitle className="text-sm uppercase tracking-widest text-secondary flex items-center gap-2 font-black">
                    <Coins className="w-4 h-4" /> Reward Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-xs text-white/50 mb-4">Total tokens currently locked for distributions.</p>
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-lg font-black text-white">{campaign.totalBudget} {campaign.tokenName}</span>
                    <Badge variant="outline" className="border-secondary/30 text-secondary bg-secondary/5 px-3 py-1 rounded-lg">LOCKED</Badge>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20 bg-primary/5 rounded-[32px] overflow-hidden shadow-2xl sticky top-24">
              <CardHeader className="bg-primary/10 border-b border-primary/10 py-6">
                <CardTitle className="text-xs uppercase tracking-[0.2em] text-primary flex items-center justify-between font-black">
                  Campaign Stats
                  <Badge className="bg-primary text-primary-foreground font-black px-3">ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm font-bold uppercase tracking-wider">Network</span>
                    <span className="font-black text-white flex items-center gap-2">
                      <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" alt="Solana" className="w-5 h-5" />
                      SOLANA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm font-bold uppercase tracking-wider">Verified Participants</span>
                    <span className="font-black text-white text-lg">{participants?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm font-bold uppercase tracking-wider">Rewards Distributed</span>
                    <span className="font-black text-primary text-lg">
                      {participants?.filter(p => p.status === 'paid').length * Number(campaign.rewardPerWallet || 0)} {campaign.tokenName}
                    </span>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-4">
                  <Button variant="outline" className="w-full gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-2xl transition-all" asChild>
                    <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                      PROJECT WEBSITE <Globe className="w-4 h-4" />
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full gap-3 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black h-12 rounded-2xl transition-all" asChild>
                    <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                      FOLLOW TWITTER <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-[32px] p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-primary uppercase tracking-widest">MemeDrop Verified</p>
                <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                  Project verified by our core team. Rewards are locked in on-chain vaults for guaranteed distribution.
                </p>
              </div>
            </Card>
          </div>

          {/* Full Width Participants Section */}
          <div className="lg:col-span-3 space-y-8 mt-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-2xl font-display font-black text-white tracking-tight">Recent Winners & Proofs</h2>
              <Badge variant="secondary" className="gap-2 px-4 py-2 bg-white/5 text-white border-white/10 rounded-xl">
                <CheckCircle className="w-4 h-4 text-primary" /> {participants?.filter(p => p.status === 'paid').length || 0} Distributions Complete
              </Badge>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participantsLoading ? (
                <div className="col-span-full py-20 flex justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : participants && participants.length > 0 ? (
                participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-[24px] border border-white/5 hover:border-primary/20 transition-all group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-mono text-xs text-primary border border-primary/10 shadow-inner">
                        {p.user.walletAddress.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white font-mono" data-testid={`participant-address-${i}`}>
                          {p.user.walletAddress.substring(0, 6)}...{p.user.walletAddress.substring(p.user.walletAddress.length - 4)}
                        </p>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">
                          {formatDistanceToNow(new Date(p.createdAt || Date.now()), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {p.status === 'paid' ? (
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20" asChild>
                        <a href={`https://solscan.io/tx/${p.transactionSignature || '#'}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : (
                      <Badge className="font-black px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest text-[8px] rounded-lg">
                        VERIFIED
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-white/30 py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10 italic font-medium">
                  Be the first project supporter to claim rewards!
                </div>
              )}
            </div>
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
