import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EcosystemContributionProps {
  reputationScore: number;
  level: number;
  progress: number;
}

export function EcosystemContribution({ reputationScore, level, progress }: EcosystemContributionProps) {
  const getLevelLabel = (lvl: number) => {
    if (lvl >= 10) return "LEGEND";
    if (lvl >= 5) return "ELITE";
    if (lvl >= 2) return "SENTINEL";
    return "INITIATE";
  };

  const getLabelColor = (lvl: number) => {
    if (lvl >= 10) return "bg-purple-500/20 text-purple-500 border-purple-500/30";
    if (lvl >= 5) return "bg-red-500/20 text-red-500 border-red-500/30";
    if (lvl >= 2) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    return "bg-primary/20 text-primary border-primary/30";
  };

  const prevLevel = level;
  const nextLevel = level + 1;
  const prevLabel = getLevelLabel(prevLevel);
  const nextLabel = getLevelLabel(nextLevel);

  return (
    <Card className="glass-card border border-primary/30 bg-primary/5 rounded-[2rem] overflow-visible relative group p-0.5 shadow-xl lg:max-w-md ml-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.3),transparent_70%)] opacity-70 rounded-[2rem]" />
      <CardHeader className="relative z-10 p-6 pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-2xl font-black font-display uppercase leading-none italic tracking-tighter text-white">Reputation <span className="text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">PROTOCOL</span></CardTitle>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-help">
                  <HelpCircle className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                align="center"
                sideOffset={10}
                className="border border-white/20 bg-black text-white p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,1)] w-64 z-[99999] backdrop-blur-3xl"
              >
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">{getLevelLabel(level)} Tier Benefits</p>
                  <ul className="space-y-2">
                    {[
                      "Priority Action Verification",
                      "Exclusive Ecosystem Airdrops",
                      "High-Yield Project Access",
                      "Governance Voting Multipliers"
                    ].map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 text-[10px] font-black text-white uppercase tracking-widest leading-tight">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5 shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 p-6 pt-0 space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[4rem] font-black font-display text-primary tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{reputationScore}</span>
          <span className="text-lg font-black text-primary/60 uppercase italic tracking-widest">Score</span>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center w-full gap-4">
              <span className="text-[13px] font-black text-white uppercase tracking-widest whitespace-nowrap shrink-0">Reputation</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-black text-primary uppercase tracking-widest whitespace-nowrap">{100 - (reputationScore % 100)} XP TO LEVEL UP</span>
                <span className="text-xl font-black font-display text-primary italic tracking-tight drop-shadow-md">{progress}%</span>
              </div>
            </div>
          </div>
          <div className="w-full h-8 rounded-full bg-black/90 overflow-hidden p-1.5 border border-white/10 shadow-inner relative">
            <div 
              className="h-full bg-primary shadow-[0_0_20px_rgba(34,197,94,0.8)] rounded-full transition-all duration-1000 relative overflow-hidden" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-shimmer" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                {reputationScore % 100} / 100 XP
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-white">
            <span className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/10">
              <Badge className={cn("h-4 px-2 text-[10px] border-none", getLabelColor(prevLevel))}>LVL {prevLevel}</Badge> 
              {prevLabel}
            </span>
            <ArrowUpRight className="w-5 h-5 text-primary/40" />
            <span className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              {nextLabel} 
              <Badge className={cn("h-4 px-2 text-primary-foreground border-none text-[10px]", getLabelColor(nextLevel))}>LVL {nextLevel}</Badge>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}