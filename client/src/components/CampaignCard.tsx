import { type Campaign, type Action } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Twitter, MessageCircle, ExternalLink, ShieldCheck, Globe, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CampaignCardProps {
  campaign: Campaign & { actions: Action[] };
  onActionClick?: (action: Action) => void;
  isOwner?: boolean;
}

export function CampaignCard({ campaign, onActionClick, isOwner }: CampaignCardProps) {
  const percentComplete = 
    ((Number(campaign.totalBudget) - Number(campaign.remainingBudget)) / Number(campaign.totalBudget)) * 100;

  const getIcon = (type: string) => {
    switch(type) {
      case 'twitter': return <Twitter className="w-4 h-4 text-blue-400" />;
      case 'telegram': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default: return <ExternalLink className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="glass-card hover:border-primary/30 transition-all duration-300 group overflow-hidden relative border-white/5 bg-background/40 backdrop-blur-md rounded-2xl">
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
      </div>

      <CardHeader className="pb-3 relative pt-10">
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

      <CardContent className="space-y-5">
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
        {campaign.requirements && (campaign.requirements as any).minSolBalance && (
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground bg-primary/5 border border-primary/10 px-2 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>MIN {(campaign.requirements as any).minSolBalance} SOL BALANCE REQUIRED</span>
          </div>
        )}

        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold tracking-tight">
            <span className="text-muted-foreground uppercase">Budget Distribution</span>
            <span className="text-primary">{Math.round(percentComplete)}% DISTRIBUTED</span>
          </div>
          <Progress value={percentComplete} className="h-2 bg-white/5 rounded-full" indicatorClassName="bg-primary shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
        </div>

        {/* Actions List */}
        <div className="space-y-2 mt-4">
          {campaign.actions.map((action) => (
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
                  className="h-9 px-4 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 shadow-sm"
                >
                  {action.rewardAmount} {campaign.tokenName}
                </Button>
              )}
              {isOwner && (
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">{action.rewardAmount}</p>
                  <p className="text-[9px] text-muted-foreground font-bold">PER TASK</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-white/5 bg-white/[0.02]">
        <p className="text-[10px] font-medium text-muted-foreground w-full text-center uppercase tracking-widest">
          Created {formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}
        </p>
      </CardFooter>
    </Card>
  );
}
