import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Action, Execution } from "@shared/schema";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck, Coins, Users, CheckCircle, ArrowRight, Twitter, Send, Zap } from "lucide-react";
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

    console.log("Triggering holder verification from details...");
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

  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <Link href="/earn">
          <Button variant="ghost" className="mb-8 gap-2 hover:bg-white/5">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="relative rounded-3xl overflow-hidden h-[350px] border border-white/5 group shadow-2xl">
              <img 
                src={campaign.bannerUrl || ""} 
                alt={campaign.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-8 left-8 flex items-end gap-6">
                <div className="relative">
                  <img 
                    src={campaign.logoUrl || ""} 
                    alt="Logo" 
                    className="w-24 h-24 rounded-2xl border-4 border-background bg-card object-cover shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1 border-2 border-background">
                    <CheckCircle className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-bold">
                      {campaign.tokenName}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ACTIVE
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">{campaign.title}</h1>
                </div>
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex items-center justify-between bg-primary/5 p-4 rounded-2xl border border-primary/20">
                <div>
                  <h2 className="text-2xl font-display font-black text-primary">Campaign Tasks</h2>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Complete tasks to earn {campaign.tokenName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Total Reward</p>
                  <p className="text-xl font-black text-primary">{campaign.rewardPerWallet || '0'} {campaign.tokenName}</p>
                </div>
              </div>

              <div className="grid gap-4">
                {campaign.campaignType === 'holder_qualification' ? (
                  <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden group hover:border-primary/40 transition-all">
                    <CardContent className="p-0">
                      <Button 
                        className="w-full h-24 justify-between px-8 bg-transparent hover:bg-primary/5 text-primary transition-all border-0 rounded-none"
                        onClick={handleHolderClick}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <div className="text-left space-y-1">
                            <p className="text-xl font-black uppercase tracking-tight">Holder Verification</p>
                            <p className="text-sm font-bold opacity-70">Hold {campaign.minHoldingAmount} {campaign.tokenName} for {campaign.minHoldingDuration} days</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black opacity-50 uppercase">Reward</p>
                            <p className="text-lg font-black">{campaign.rewardPerWallet} {campaign.tokenName}</p>
                          </div>
                          <div className="bg-primary text-primary-foreground font-black px-6 py-3 rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                            START
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  campaign.actions?.map((action) => (
                    <Card key={action.id} className="glass-card border-white/5 bg-white/5 overflow-hidden group hover:border-primary/30 transition-all">
                      <CardContent className="p-0">
                        <Button 
                          className="w-full h-20 justify-between px-8 bg-transparent hover:bg-primary/5 transition-all border-0 rounded-none"
                          onClick={() => handleActionClick(action)}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              {action.type === 'twitter' ? <Twitter className="w-5 h-5" /> : action.type === 'telegram' ? <Send className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                            </div>
                            <div className="text-left">
                              <p className="font-black text-white uppercase tracking-tight">{action.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">{action.type} task</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black opacity-50 uppercase">Reward</p>
                              <p className="text-sm font-black text-primary">+{action.rewardAmount} {campaign.tokenName}</p>
                            </div>
                            <div className="bg-white/10 text-white font-black px-4 py-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                              VERIFY
                            </div>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-bold">About the Project</h2>
              <div className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                {campaign.description}
              </div>
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-primary/10 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Deposit Proof
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">Verification of token deposit for this campaign.</p>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-muted-foreground truncate mr-4">{campaign.tokenAddress}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={`https://solscan.io/token/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-secondary/10 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-secondary flex items-center gap-2">
                    <Coins className="w-4 h-4" /> Reward Proof
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">Total budget locked for distributions.</p>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-sm font-bold text-white">{campaign.totalBudget} {campaign.tokenName}</span>
                    <Badge variant="outline" className="border-secondary/20 text-secondary">LOCKED</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Reward Proofs & Winners</h2>
                <Badge variant="secondary" className="gap-1 px-3">
                  <CheckCircle className="w-3 h-3 text-primary" /> {participants?.filter(p => p.status === 'paid').length || 0} Claimed
                </Badge>
              </div>
              <div className="space-y-3">
                {participantsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                ) : participants && participants.length > 0 ? (
                  participants.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-mono text-xs text-primary border border-primary/10">
                          {p.user.walletAddress.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-mono" data-testid={`participant-address-${i}`}>
                            {p.user.walletAddress.substring(0, 6)}...{p.user.walletAddress.substring(p.user.walletAddress.length - 4)}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {p.status === 'paid' ? 'Rewards Claimed' : 'Verified'} {formatDistanceToNow(new Date(p.createdAt || Date.now()), { addSuffix: true })}
                            </p>
                            {p.status === 'paid' && (
                              <Badge variant="outline" className="h-4 text-[8px] bg-primary/10 text-primary border-primary/20 py-0">ON-CHAIN</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.status === 'paid' ? (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-black text-primary gap-2 bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 transition-all" asChild>
                              <a href={`https://solscan.io/tx/${p.transactionSignature || '#'}`} target="_blank" rel="noreferrer">
                                VIEW ON SOLSCAN <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </Button>
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                          </div>
                        ) : (
                          <Badge className="font-bold px-4 py-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-widest text-[10px]">
                            VERIFIED
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 italic">
                    Be the first to participate in this campaign!
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden">
              <CardHeader className="bg-primary/10 border-b border-primary/10">
                <CardTitle className="text-sm uppercase tracking-widest text-primary flex items-center justify-between">
                  Campaign Info
                  <Badge className="bg-primary text-primary-foreground font-black">ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Network</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" alt="Solana" className="w-4 h-4" />
                      Solana
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Reward</span>
                    <span className="font-bold text-primary">{campaign.rewardPerWallet || '0'} {campaign.tokenName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Created</span>
                    <span className="font-bold">{formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" asChild>
                      <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                        Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" asChild>
                      <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                        Twitter <Twitter className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full gap-2 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-black"
                    onClick={() => {
                      const text = encodeURIComponent(`Check out ${campaign.title} on MemeDrop! Complete tasks to earn ${campaign.tokenName} rewards. #Solana #MemeDrop`);
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                    }}
                  >
                    SHARE ON X <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-wider mb-1">Secured by MemeDrop</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This project has been verified. Rewards are managed by MemeDrop's smart contract to ensure fair distribution.
                  </p>
                </div>
              </CardContent>
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
