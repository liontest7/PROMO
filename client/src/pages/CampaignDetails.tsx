import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Campaign, Action } from "@shared/schema";
import { Loader2, ArrowLeft, ExternalLink, ShieldCheck, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function CampaignDetails() {
  const [, params] = useRoute("/campaign/:id");
  const campaignId = params?.id;

  const { data: campaign, isLoading } = useQuery<Campaign & { actions: Action[] }>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: !!campaignId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/earn">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Button>
        </Link>

        <div className="grid gap-8">
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden h-64 border border-primary/20">
            <img 
              src={campaign.bannerUrl || ""} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-end gap-4">
              <img 
                src={campaign.logoUrl || ""} 
                alt="Logo" 
                className="w-20 h-20 rounded-xl border-2 border-primary/40 bg-background object-cover"
              />
              <div className="mb-1">
                <h1 className="text-3xl font-black text-white">{campaign.title}</h1>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20">
                    {campaign.tokenName}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">About Project</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {campaign.description}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">Available Tasks</h2>
                <div className="grid gap-4">
                  {campaign.actions?.map((action) => (
                    <Card key={action.id} className="glass-card border-primary/10 overflow-hidden hover-elevate">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Coins className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold">{action.title}</p>
                            <p className="text-xs text-primary font-black">+{action.rewardAmount} {campaign.tokenName}</p>
                          </div>
                        </div>
                        <Button size="sm">Complete</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Campaign Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Budget</span>
                    <span className="font-bold">{campaign.totalBudget} {campaign.tokenName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant="outline">Verified</Badge>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={campaign.websiteUrl || "#"} target="_blank" rel="noreferrer">
                        Website <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={campaign.twitterUrl || "#"} target="_blank" rel="noreferrer">
                        Twitter <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-primary">On-Chain Verified</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      This project has deposited rewards into the MemeDrop smart contract.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
