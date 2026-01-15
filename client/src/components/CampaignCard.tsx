import { Link } from "wouter";
import { type Campaign, type Action, type Execution } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Twitter, MessageCircle, ExternalLink, ShieldCheck, Globe, Send, Share2, Copy, Check, ArrowRight, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useUserStats } from "@/hooks/use-user-stats";
import { useWallet } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Campaign & { actions: Action[] };
  onActionClick?: (action: Action) => void;
  isOwner?: boolean;
}

export function CampaignCard({ campaign, onActionClick, isOwner }: CampaignCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { walletAddress } = useWallet();
  const { data: stats } = useUserStats(walletAddress || "");
  const [currentMC, setCurrentMC] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentMC = async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${campaign.tokenAddress}`);
        const data = await res.json();
        // DexScreener returns an array of pairs
        if (data.pairs && data.pairs.length > 0) {
          // Sort by liquidity to get the most reliable pair
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
  }, [campaign.tokenAddress]);

  const initialMC = campaign.initialMarketCap ? Number(campaign.initialMarketCap) : null;
  const currentMCVal = campaign.currentMarketCap ? Number(campaign.currentMarketCap) : currentMC;
  const mcChange = (initialMC && currentMCVal) ? ((currentMCVal - initialMC) / initialMC) * 100 : null;

  const formatMC = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };
  
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

  const shareUrl = `${window.location.origin}/c/${campaign.tokenName}`;
  const shareText = `Check out this airdrop on Dropy: ${campaign.title}! Earn ${campaign.tokenName} by completing simple tasks.`;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link Copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to check if an action is completed
  const isActionCompleted = (actionId: number) => {
    if (!stats?.tokenBalances) return false;
    // This is a bit simplified, ideally stats would include raw executions
    // For now, let's assume if it's in history, it's done.
    return false; // Placeholder until we have better execution tracking in stats
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="glass-card h-full flex flex-col hover:border-primary/30 transition-all duration-300 group overflow-hidden relative border-white/5 bg-background/40 backdrop-blur-md rounded-3xl">
        <div className="relative h-40 w-full overflow-hidden">
          {campaign.bannerUrl ? (
            <img 
              src={campaign.bannerUrl} 
              alt={campaign.title} 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
    <Link href={`/c/${campaign.slug || campaign.tokenName.toLowerCase()}`} className="absolute inset-0 cursor-pointer">
      <div className="w-full h-full bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
    </Link>

          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-widest font-black shadow-2xl">
              {campaign.status}
            </Badge>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
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

        <CardHeader className="pb-1 relative pt-10 px-6">
          <div className="absolute -top-10 left-6 w-20 h-24 flex flex-col gap-2">
            <Link href={`/c/${campaign.slug || campaign.tokenName.toLowerCase()}`}>
              <div className="w-20 h-20 rounded-2xl border-4 border-background bg-card overflow-hidden shadow-2xl hover:scale-105 transition-transform cursor-pointer">
                {campaign.logoUrl ? (
                  <img src={campaign.logoUrl} alt="Logo" loading="lazy" className="w-full h-full object-cover" />
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
              <Link href={`/c/${campaign.slug || campaign.tokenName.toLowerCase()}`} className="block">
                <CardTitle className="text-xl font-display font-black leading-tight hover:text-primary transition-colors cursor-pointer line-clamp-1">
                  {campaign.title}
                </CardTitle>
              </Link>
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-xs py-1 px-3 font-bold tracking-widest mt-1">
                ${campaign.tokenName}
              </Badge>
            </div>
          </div>
          <p className="text-base text-white/80 line-clamp-1 min-h-[20px] mt-2 leading-relaxed font-medium">
            {campaign.description}
          </p>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 px-6 pt-2">
          {campaign.campaignType === 'holder_qualification' ? (
            <div className="space-y-2 bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-inner">
              <div className="flex items-center gap-2 text-[12px] font-black text-primary uppercase tracking-tighter">
                <ShieldCheck className="w-4 h-4" />
                <span>HOLD {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName} FOR {campaign.minHoldingDuration} DAYS</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-inner">
              <div className="flex items-center gap-2 text-[12px] font-black text-primary uppercase tracking-tighter">
                <Zap className="w-4 h-4" />
                <span>{campaign.actions?.length || 0} TASKS AVAILABLE • EARN UP TO {campaign.actions?.reduce((acc, a) => acc + Number(a.rewardAmount), 0)} ${campaign.tokenName}</span>
              </div>
            </div>
          )}

          <div className="bg-secondary/20 p-3 rounded-2xl border border-secondary/10 flex items-center justify-between">
            <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">REWARD PER USER</span>
            <span className="text-base font-black text-white">{campaign.rewardPerWallet || '0'} ${campaign.tokenName}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1">
              <span className="text-white/80">PROGRESS ({percentComplete.toFixed(0)}%)</span>
              <span className="text-primary">{remainingBudgetNum.toLocaleString()} / {totalBudgetNum.toLocaleString()} ${campaign.tokenName}</span>
            </div>
            <Progress value={percentComplete} className="h-2 bg-white/5 rounded-full" />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/c/${campaign.slug || campaign.tokenName.toLowerCase()}`} className="w-full">
              <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-black h-11 rounded-2xl border border-primary/20 group/btn transition-all">
                VIEW DETAILS
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-6 border-t border-white/5 bg-white/[0.01] px-6 flex flex-col gap-3">
          {initialMC && currentMC && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-none">Growth</span>
                  <span className="text-sm font-black text-white mt-0.5">{formatMC(currentMC)}</span>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black shadow-lg transition-all",
                mcChange! >= 0 ? "text-primary bg-primary/10 border border-primary/20" : "text-red-400 bg-red-400/10 border border-red-400/20"
              )}>
                {mcChange! >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {mcChange! >= 0 ? "+" : ""}{mcChange?.toFixed(1)}%
              </div>
            </div>
          )}
          <div className="flex items-center justify-center w-full gap-2 opacity-80">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/60" />
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
              {formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}
            </p>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/60" />
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
