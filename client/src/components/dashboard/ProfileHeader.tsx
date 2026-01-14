import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowUpRight } from "lucide-react";
import { PLATFORM_CONFIG } from "@shared/config";

interface ProfileHeaderProps {
  walletAddress: string;
  level: number;
  reputationScore: number;
  rank: number;
  rankChange: "up" | "stable";
}

export const ProfileHeader = ({ walletAddress, level, reputationScore, rank, rankChange }: ProfileHeaderProps) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary via-primary/60 to-primary/20 p-1.5 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
            <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-500" alt="Level Avatar" />
          </div>
        </div>
        <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-primary text-primary-foreground font-black text-xs rounded-full border-4 border-background shadow-xl uppercase tracking-widest">
          LVL {level}
        </Badge>
      </div>
      
      <div className="text-center md:text-left space-y-2">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
            {walletAddress?.slice(0, 8)}<span className="text-primary">...</span>{walletAddress?.slice(-8)}
          </h1>
          <Badge className="bg-primary/20 text-primary border-2 border-primary/40 text-[10px] font-black uppercase px-3 py-0.5 tracking-widest rounded-lg">PLATINUM NODE</Badge>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[11px] bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">Protocol Status: Active & Verified</p>
          <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[9px] font-black uppercase px-2 py-0.5 tracking-[0.2em] rounded-full italic shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            SENTINEL RANK
          </Badge>
        </div>
      </div>
    </div>
    
    <div className="relative z-10 grid grid-cols-2 gap-4 lg:min-w-[360px]">
      <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-primary/50 transition-all group/card shadow-lg backdrop-blur-md">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Protocol Reputation</span>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{reputationScore}</span>
          <Trophy className="w-5 h-5 text-primary opacity-50 group-hover/card:opacity-100 transition-opacity" />
        </div>
      </div>
      <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-primary/50 transition-all group/card shadow-lg backdrop-blur-md">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Network Rank</span>
          {rankChange === "up" && <ArrowUpRight className="w-5 h-5 text-primary animate-bounce-slow" />}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-black font-display text-white">#{rank}</span>
          {rankChange === "up" && <span className="text-sm font-black text-primary font-display border border-primary/30 bg-primary/20 px-2 rounded-lg">+3</span>}
        </div>
      </div>
    </div>
  </div>
);