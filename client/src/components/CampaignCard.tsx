import { Link } from "wouter";
import { type Campaign, type Action } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Twitter, MessageCircle, ExternalLink, ShieldCheck, Globe, Send, Share2, Copy, Check, ArrowRight } from "lucide-react";
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

  const shareUrl = `${window.location.origin}/earn?campaign=${campaign.id}`;
  const shareText = `Check out this airdrop on PPA Solana: ${campaign.title}! Earn ${campaign.tokenName} by completing simple tasks.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Campaign link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="glass-card h-full flex flex-col hover:border-primary/30 transition-all duration-300 group overflow-hidden relative border-white/5 bg-background/40 backdrop-blur-md rounded-2xl">
        {/* Banner */}
        <div className="relative h-32 w-full overflow-hidden">
          {campaign.bannerUrl ? (
            <img 
              src={campaign.bannerUrl} 
              alt={campaign.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wider font-bold shadow-lg">
              {campaign.status}
            </Badge>
          </div>

          {/* Share Buttons overlay on banner */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md border border-white/10 hover:bg-primary hover:text-white transition-all"
              onClick={shareOnTwitter}
              title="Share on Twitter"
            >
              <Twitter className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md border border-white/10 hover:bg-primary hover:text-white transition-all"
              onClick={shareOnTelegram}
              title="Share on Telegram"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-md border border-white/10 hover:bg-primary hover:text-white transition-all"
              onClick={handleCopyLink}
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        <CardHeader className="pb-3 relative pt-10 px-5">
          {/* Logo overlapping banner */}
          <div className="absolute -top-8 left-6 w-16 h-16 rounded-xl border-4 border-background bg-card overflow-hidden shadow-xl">
            {campaign.logoUrl ? (
              <img src={campaign.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Coins className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[10px] py-0">
                {campaign.tokenName}
              </Badge>
              <CardTitle className="text-xl font-display font-bold leading-tight flex items-center gap-2">
                {campaign.title}
              </CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mt-2 leading-relaxed">
            {campaign.description}
          </p>
        </CardHeader>

        <CardContent className="flex-1 space-y-5 px-5">
          {/* Project Links */}
          <div className="flex gap-3">
            {campaign.websiteUrl && (
              <a href={campaign.websiteUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                <Globe className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
            {campaign.twitterUrl && (
              <a href={campaign.twitterUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                <Twitter className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
            {campaign.telegramUrl && (
              <a href={campaign.telegramUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
                <Send className="w-4 h-4 text-muted-foreground" />
              </a>
            )}
          </div>

          {/* Requirements */}
          {campaign.campaignType === 'holder_qualification' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground bg-primary/5 border border-primary/10 px-2 py-1.5 rounded-lg w-full">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>HOLD {campaign.minHoldingAmount} {campaign.tokenName} FOR {campaign.minHoldingDuration} DAYS</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground bg-secondary/5 border border-secondary/10 px-2 py-1.5 rounded-lg w-full">
                <Coins className="w-3.5 h-3.5 text-secondary" />
                <span>REWARD: {campaign.rewardPerWallet} {campaign.tokenName} PER WALLET</span>
              </div>
            </div>
          ) : (
            campaign.requirements && (campaign.requirements as any).minSolBalance && (
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground bg-primary/5 border border-primary/10 px-2 py-1.5 rounded-lg w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>MIN {(campaign.requirements as any).minSolBalance} SOL BALANCE REQUIRED</span>
              </div>
            )
          )}

          {/* Budget Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold tracking-tight mb-1">
              <div className="flex flex-col">
                <span className="text-muted-foreground uppercase tracking-tighter">Remaining</span>
                <span className="text-foreground">{remainingBudgetNum.toLocaleString()} {campaign.tokenName}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-muted-foreground uppercase tracking-tighter">Distributed</span>
                <span className="text-primary">{distributedNum.toLocaleString()} {campaign.tokenName}</span>
              </div>
            </div>
            <Progress value={percentComplete} className="h-1.5 bg-white/5 rounded-full" />
          </div>

          <div className="space-y-2 mt-4">
            {campaign.campaignType === 'holder_qualification' ? (
              <Button 
                className="w-full bg-primary text-primary-foreground font-bold h-11"
                onClick={() => onActionClick?.({ 
                  id: campaign.id, 
                  campaignId: campaign.id, 
                  type: 'website', 
                  title: 'Verify Holding', 
                  rewardAmount: campaign.rewardPerWallet || "0", 
                  url: "", 
                  maxExecutions: campaign.maxClaims || 0,
                  currentExecutions: 0
                })}
              >
                Check Eligibility
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              campaign.actions.map((action) => (
                <div 
                  key={action.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 hover:border-primary/20 transition-all group/action"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background/50 border border-white/5 group-hover/action:border-primary/30 transition-all">
                      {getIcon(action.type)}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none mb-1">{action.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">{action.type}</p>
                    </div>
                  </div>
                  
                  {!isOwner && (
                    <Button 
                      size="sm" 
                      onClick={() => onActionClick?.(action)}
                      className="h-9 px-4 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-sm transition-all"
                    >
                      {action.rewardAmount} {campaign.tokenName}
                      <ArrowRight className="ml-2 w-3 h-3" />
                    </Button>
                  )}
                  {isOwner && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary">{action.rewardAmount}</p>
                      <p className="text-[9px] text-muted-foreground font-bold">PER TASK</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 pb-4 border-t border-white/5 bg-white/[0.02] px-5">
          <p className="text-[10px] font-medium text-muted-foreground w-full text-center uppercase tracking-widest">
            Created {formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
