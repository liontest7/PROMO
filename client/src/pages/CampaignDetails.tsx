import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Action, Execution } from "@shared/schema";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck, Coins, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function CampaignDetails() {
  const [, params] = useRoute("/campaign/:id");
  const campaignId = params?.id;

  const { data: campaign, isLoading: campaignLoading } = useQuery<Campaign & { actions: Action[] }>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !!campaignId,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery<(Execution & { user: { walletAddress: string } })[]>({
    queryKey: [`/api/executions/campaign/${campaignId}`],
    enabled: !!campaignId,
  });

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

            <section className="space-y-4">
              <h2 className="text-2xl font-display font-bold">About the Project</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {campaign.description}
              </p>
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
                  <Users className="w-3 h-3" /> {participants?.length || 0} Joined
                </Badge>
              </div>
              <div className="space-y-3">
                {participantsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                ) : participants && participants.length > 0 ? (
                  participants.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-mono text-xs text-primary">
                          {p.user.walletAddress.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white font-mono" data-testid={`participant-address-${i}`}>
                            {p.user.walletAddress.substring(0, 6)}...{p.user.walletAddress.substring(p.user.walletAddress.length - 4)}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                            Verified {formatDistanceToNow(new Date(p.createdAt || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.status === 'paid' && (
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-primary gap-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10" asChild>
                            <a href={`https://solscan.io/tx/${p.transactionHash || '#'}`} target="_blank" rel="noreferrer">
                              Proof <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        <Badge className={cn(
                          "font-bold px-3 py-1",
                          p.status === 'paid' ? "bg-primary/20 text-primary border-primary/30" : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                        )}>
                          {p.status === 'paid' ? 'PAID' : 'VERIFIED'}
                        </Badge>
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
            <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden sticky top-8">
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
                      <img src="https://solscan.io/static/media/solana-sol-logo.9388df29.svg" alt="Solana" className="w-3 h-3" />
                      Solana
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Reward</span>
                    <span className="font-bold text-primary">{campaign.rewardPerWallet || campaign.totalBudget} {campaign.tokenName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Created</span>
                    <span className="font-bold">{formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <Button variant="default" className="w-full h-12 bg-primary hover:bg-primary/90 font-black text-lg shadow-lg shadow-primary/20 group" asChild>
                    <Link href="/earn">
                      JOIN CAMPAIGN <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" asChild>
                      <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                        Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                    <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5" asChild>
                      <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                        Twitter <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
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
    </div>
  );
}
