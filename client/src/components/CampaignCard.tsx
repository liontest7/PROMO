import { type Campaign, type Action } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Twitter, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
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
    <Card className="glass-card hover:border-primary/30 transition-all duration-300 group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Coins className="w-24 h-24 text-primary" />
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">
              {campaign.tokenName}
            </Badge>
            <CardTitle className="text-xl font-display">{campaign.title}</CardTitle>
          </div>
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wider">
            {campaign.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {campaign.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Requirements */}
        {campaign.requirements && (
          <div className="flex gap-2 text-xs text-muted-foreground bg-black/20 p-2 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            {(campaign.requirements as any).minSolBalance && 
              <span>Min {(campaign.requirements as any).minSolBalance} SOL</span>
            }
          </div>
        )}

        {/* Budget Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Budget Used</span>
            <span className="text-primary">{Math.round(percentComplete)}%</span>
          </div>
          <Progress value={percentComplete} className="h-1.5 bg-white/5" indicatorClassName="bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>

        {/* Actions List */}
        <div className="space-y-2 mt-4">
          {campaign.actions.map((action) => (
            <div 
              key={action.id}
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-black/30">
                  {getIcon(action.type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.type.toUpperCase()}</p>
                </div>
              </div>
              
              {!isOwner && (
                <Button 
                  size="sm" 
                  onClick={() => onActionClick?.(action)}
                  className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                >
                  +{action.rewardAmount} {campaign.tokenName}
                </Button>
              )}
              {isOwner && (
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{action.rewardAmount}</p>
                  <p className="text-[10px] text-muted-foreground">PER ACTION</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-white/5">
        <p className="text-xs text-muted-foreground w-full text-center">
          Posted {formatDistanceToNow(new Date(campaign.createdAt || Date.now()), { addSuffix: true })}
        </p>
      </CardFooter>
    </Card>
  );
}
