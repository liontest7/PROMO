import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardTopThreeProps {
  leaders: any[];
}

export function LeaderboardTopThree({ leaders }: LeaderboardTopThreeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end px-4 relative">
      {/* Second Place */}
      <Card className="glass-card border-white/10 bg-white/[0.03] rounded-[3rem] overflow-hidden order-2 md:order-1 hover-elevate transition-all duration-500 min-h-[340px]">
        <CardContent className="p-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-[#111] border-2 border-white/20 p-1.5">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-emerald-500/20 text-emerald-500 font-black text-2xl">{leaders?.[1]?.avatar || '?'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black text-sm shadow-2xl border-4 border-[#050505]">#2</div>
          </div>
          <h3 className="text-3xl font-black font-display uppercase italic tracking-tight text-white truncate w-full px-2">
            {leaders?.[1]?.name?.startsWith('USER ') 
              ? leaders[1].fullWallet.slice(0, 4) + '...' + leaders[1].fullWallet.slice(-4) 
              : leaders?.[1]?.name || '---'}
          </h3>
          <div className="flex items-center gap-3 mt-4 bg-emerald-500/15 px-6 py-2 rounded-full border border-emerald-500/30">
            <Star className="w-5 h-5 text-emerald-500" />
            <span className="text-2xl font-black font-display text-emerald-500">{leaders?.[1]?.points?.toLocaleString() || 0}</span>
          </div>
          <p className="text-xs font-black text-white/90 uppercase tracking-[0.25em] mt-6 italic leading-tight">{leaders?.[1]?.tasks || 0} TASKS COMPLETED</p>
        </CardContent>
      </Card>

      {/* First Place */}
      <Card className="glass-card border-yellow-500/40 bg-yellow-500/10 rounded-[3.5rem] overflow-hidden order-1 md:order-2 scale-110 relative z-20 shadow-[0_0_60px_rgba(234,179,8,0.25)] hover-elevate transition-all duration-500 min-h-[400px]">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-36 h-36 rounded-full bg-[#111] border-4 border-yellow-500/50 p-1.5 shadow-[0_0_40px_rgba(234,179,8,0.4)]">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-primary/20 text-primary font-black text-4xl">{leaders?.[0]?.avatar || '?'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-base shadow-2xl border-4 border-[#050505]">#1</div>
            <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
          </div>
          <h3 className="text-4xl font-black font-display uppercase italic tracking-tighter text-white truncate w-full px-2">
            {leaders?.[0]?.name?.startsWith('USER ') 
              ? leaders[0].fullWallet.slice(0, 4) + '...' + leaders[0].fullWallet.slice(-4) 
              : leaders?.[0]?.name || '---'}
          </h3>
          <div className="flex items-center gap-3 mt-5 bg-primary/25 px-8 py-3 rounded-full border border-primary/40 shadow-xl">
            <Star className="w-6 h-6 text-primary" />
            <span className="text-4xl font-black font-display text-primary">{leaders?.[0]?.points?.toLocaleString() || 0}</span>
          </div>
          <p className="text-[13px] font-black text-white uppercase tracking-[0.35em] mt-8 italic leading-tight">{leaders?.[0]?.tasks || 0} TASKS COMPLETED</p>
        </CardContent>
      </Card>

      {/* Third Place */}
      <Card className="glass-card border-white/10 bg-white/[0.03] rounded-[3rem] overflow-hidden order-3 hover-elevate transition-all duration-500 min-h-[340px]">
        <CardContent className="p-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-[#111] border-2 border-white/20 p-1.5">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-amber-600/20 text-amber-600 font-black text-2xl">{leaders?.[2]?.avatar || '?'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-sm shadow-2xl border-4 border-[#050505]">#3</div>
          </div>
          <h3 className="text-3xl font-black font-display uppercase italic tracking-tight text-white truncate w-full px-2">
            {leaders?.[2]?.name?.startsWith('USER ') 
              ? leaders[2].fullWallet.slice(0, 4) + '...' + leaders[2].fullWallet.slice(-4) 
              : leaders?.[2]?.name || '---'}
          </h3>
          <div className="flex items-center gap-3 mt-4 bg-amber-600/15 px-6 py-2 rounded-full border border-amber-600/30">
            <Star className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-black font-display text-amber-600">{leaders?.[2]?.points?.toLocaleString() || 0}</span>
          </div>
          <p className="text-xs font-black text-white/90 uppercase tracking-[0.25em] mt-6 italic leading-tight">{leaders?.[2]?.tasks || 0} TASKS COMPLETED</p>
        </CardContent>
      </Card>
    </div>
  );
}
