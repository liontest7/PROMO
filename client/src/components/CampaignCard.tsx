import { Link } from "wouter";
import { type Campaign, type Action } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Twitter, MessageCircle, ExternalLink, ShieldCheck, Globe, Send, Share2, Copy, Check, ArrowRight, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface CampaignCardProps {
  campaign: Campaign & { actions: Action[] };
  onActionClick?: (action: Action) => void;
  isOwner?: boolean;
}

export function CampaignCard({ campaign, onActionClick, isOwner }: CampaignCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const totalBudgetNum = Number(campaign.totalBudget);
  const remainingBudgetNum = Number(campaign.remainingBudget);
  const distributedNum = totalBudgetNum - remainingBudgetNum;
  const percentComplete = totalBudgetNum > 0 ? (distributedNum / totalBudgetNum) * 100 : 0;

  const getIcon = (type: string) => {
    switch(type) {
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'telegram': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default: return <ExternalLink className="w-4 h-4 text-gray-400" />;
    }
  };

  const shareUrl = `${window.location.origin}/campaign/${campaign.id}`;
  const shareText = `Check out this airdrop on MemeDrop: ${campaign.title}! Earn ${campaign.tokenName} by completing simple tasks.`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link Copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="glass-card h-full flex flex-col hover:border-primary/30 transition-all duration-300 group overflow-hidden relative border-white/5 bg-background/40 backdrop-blur-md rounded-3xl">
        <Link href={`/campaign/${campaign.id}`}>
          <div className="relative h-40 w-full overflow-hidden cursor-pointer">
            {campaign.bannerUrl ? (
              <img 
                src={campaign.bannerUrl} 
                alt={campaign.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-widest font-black shadow-2xl">
                {campaign.status}
              </Badge>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {campaign.websiteUrl && (
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-white/10" asChild>
                  <a href={campaign.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
              {campaign.twitterUrl && (
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-white/10" asChild>
                  <a href={campaign.twitterUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Twitter className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
              {campaign.telegramUrl && (
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-white/10" asChild>
                  <a href={campaign.telegramUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border border-white/10" onClick={handleCopyLink}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </Link>

        <CardHeader className="pb-1 relative pt-10 px-6">
          <div className="absolute -top-10 left-6 w-20 h-24 flex flex-col gap-2">
            <Link href={`/campaign/${campaign.id}`}>
              <div className="w-20 h-20 rounded-2xl border-4 border-background bg-card overflow-hidden shadow-2xl hover:scale-105 transition-transform">
                {campaign.logoUrl ? (
                  <img src={campaign.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                    <Coins className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>
            </Link>
          </div>

          <div className="flex justify-between items-start pt-1">
            <div className="space-y-0.5 w-full">
              <Link href={`/campaign/${campaign.id}`}>
                <CardTitle className="text-xl font-display font-black leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1">
                  {campaign.title}
                </CardTitle>
              </Link>
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[10px] py-0 font-bold tracking-widest">
                {campaign.tokenName}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 min-h-[20px] mt-2 leading-relaxed">
            {campaign.description}
          </p>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 px-6 pt-2">
          {campaign.campaignType === 'holder_qualification' ? (
            <div className="space-y-2 bg-primary/5 p-3 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-tighter">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HOLD {campaign.minHoldingAmount} {campaign.tokenName} FOR {campaign.minHoldingDuration} DAYS</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-primary/5 p-3 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-tighter">
                <Zap className="w-3.5 h-3.5" />
                <span>{campaign.actions?.length || 0} TASKS AVAILABLE • EARN UP TO {campaign.actions?.reduce((acc, a) => acc + Number(a.rewardAmount), 0)} {campaign.tokenName}</span>
              </div>
            </div>
          )}

          <div className="bg-secondary/20 p-3 rounded-2xl border border-secondary/10 flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">REWARD PER USER</span>
            <span className="text-sm font-black text-secondary-foreground">{campaign.rewardPerWallet || '0'} {campaign.tokenName}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
              <span className="text-muted-foreground">PROGRESS ({percentComplete.toFixed(0)}%)</span>
              <span className="text-primary">{remainingBudgetNum.toLocaleString()} / {totalBudgetNum.toLocaleString()} {campaign.tokenName}</span>
            </div>
            <Progress value={percentComplete} className="h-2 bg-white/5 rounded-full" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/campaign/${campaign.id}`}>
              <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-black h-11 rounded-2xl border border-primary/20 group/btn transition-all">
                VIEW DETAILS
                <ArrowRight className="ml-2 w-4 h-4 group-btn-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-6 border-t border-white/5 bg-white/[0.01] px-6">
          <p className="text-[9px] font-black text-muted-foreground/40 w-full text-center uppercase tracking-[0.2em]">
            LAUNCHED {formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
