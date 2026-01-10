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

  const shareUrl = `${window.location.origin}/campaign/${campaign.tokenName}`;
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
        <div className="relative h-40 w-full overflow-hidden">
          {campaign.bannerUrl ? (
            <img 
              src={campaign.bannerUrl} 
              alt={campaign.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <Link href={`/campaign/${campaign.tokenName}`} className="absolute inset-0 cursor-pointer">
            <div className="w-full h-full bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </Link>
          {/* ... */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-widest font-black shadow-2xl">
              {campaign.status}
            </Badge>
          </div>
          {/* ... */}
        </div>

        <CardHeader className="pb-1 relative pt-10 px-6">
          <div className="absolute -top-10 left-6 w-20 h-24 flex flex-col gap-2">
            <Link href={`/campaign/${campaign.tokenName}`}>
              <div className="w-20 h-20 rounded-2xl border-4 border-background bg-card overflow-hidden shadow-2xl hover:scale-105 transition-transform cursor-pointer">
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
              <Link href={`/campaign/${campaign.tokenName}`} className="block">
                <CardTitle className="text-xl font-display font-black leading-tight hover:text-primary transition-colors cursor-pointer line-clamp-1">
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
          {/* ... content remains same ... */}
          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/campaign/${campaign.tokenName}`} className="w-full">
              <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-black h-11 rounded-2xl border border-primary/20 group/btn transition-all">
                VIEW DETAILS
                <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
