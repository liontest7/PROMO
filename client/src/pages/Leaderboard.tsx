import { Navigation } from "@/components/Navigation";
import { Trophy, Star, Medal, Crown, Calendar, Globe, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PLATFORM_CONFIG } from "@shared/config";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"all_time" | "monthly" | "weekly">("all_time");
  const { data: leaders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", timeframe]
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-48 mx-auto mb-12 bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2.5rem] bg-white/5" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="relative z-10">
            <div className="inline-flex p-4 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-6xl font-display font-black uppercase italic tracking-tighter mb-4 leading-none text-white">
              Hall <span className="text-primary">of Fame</span>
            </h1>
            <p className="text-white uppercase tracking-[0.4em] text-[10px] font-black italic">Top Ecosystem Contributors • Real-time Sync</p>
          </div>

          <div className="flex justify-center gap-3 mt-10 relative z-10">
            {[
              { id: "weekly", label: "Weekly", icon: Clock },
              { id: "monthly", label: "Monthly", icon: Calendar },
              { id: "all_time", label: "All-time", icon: Globe },
            ].map((t) => (
              <Button
                key={t.id}
                variant={timeframe === t.id ? "default" : "outline"}
                onClick={() => setTimeframe(t.id as any)}
                className={cn(
                  "rounded-2xl font-black uppercase tracking-widest text-[10px] h-10 px-6 transition-all",
                  timeframe === t.id 
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                    : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <t.icon className="w-3.5 h-3.5 mr-2" />
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
          {/* Rank 2 */}
          <Card className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden order-2 md:order-1 hover-elevate transition-all duration-500">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-[#111] border-2 border-white/10 p-1">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-500 font-black text-xl">{leaders?.[1].avatar}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-black text-xs shadow-xl border-4 border-[#050505]">#2</div>
              </div>
              <h3 className="text-2xl font-black font-display uppercase italic tracking-tight text-white/90">{leaders?.[1].name}</h3>
              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                <Star className="w-4 h-4 text-emerald-500" />
                <span className="text-xl font-black font-display text-emerald-500">{leaders?.[1].points.toLocaleString()}</span>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mt-4 italic">{leaders?.[1].tasks} TASKS COMPLETED</p>
            </CardContent>
          </Card>

          {/* Rank 1 */}
          <Card className="glass-card border-yellow-500/30 bg-yellow-500/5 rounded-[3rem] overflow-hidden order-1 md:order-2 scale-110 relative z-20 shadow-[0_0_50px_rgba(234,179,8,0.15)] hover-elevate transition-all duration-500">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-[#111] border-4 border-yellow-500/40 p-1 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-primary/20 text-primary font-black text-3xl">{leaders?.[0].avatar}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-sm shadow-xl border-4 border-[#050505]">#1</div>
                <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              </div>
              <h3 className="text-3xl font-black font-display uppercase italic tracking-tighter text-white">
                {leaders?.[0].name}
              </h3>
              <div className="flex items-center gap-2 mt-4 bg-primary/20 px-6 py-2 rounded-full border border-primary/30 shadow-lg">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-3xl font-black font-display text-primary">{leaders?.[0].points.toLocaleString()}</span>
              </div>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] mt-6 italic">{leaders?.[0].tasks} TASKS COMPLETED</p>
            </CardContent>
          </Card>

          {/* Rank 3 */}
          <Card className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden order-3 hover-elevate transition-all duration-500">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-[#111] border-2 border-white/10 p-1">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-amber-600/20 text-amber-600 font-black text-xl">{leaders?.[2].avatar}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xl border-4 border-[#050505]">#3</div>
              </div>
              <h3 className="text-2xl font-black font-display uppercase italic tracking-tight text-white/90">{leaders?.[2].name}</h3>
              <div className="flex items-center gap-2 mt-3 bg-amber-600/10 px-4 py-1.5 rounded-full border border-amber-600/20">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-xl font-black font-display text-amber-600">{leaders?.[2].points.toLocaleString()}</span>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mt-4 italic">{leaders?.[2].tasks} TASKS COMPLETED</p>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card className="glass-card border-white/5 bg-white/[0.01] rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="bg-white/[0.03] px-10 py-5 border-b border-white/5 flex items-center text-[10px] font-black text-white uppercase tracking-[0.4em] italic">
            <span className="w-16">Rank</span>
            <span className="flex-1">Contributor</span>
            <span className="w-32 text-right">Score</span>
            <span className="w-32 text-right">Tasks</span>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {leaders?.map((user) => (
                <div key={user.rank} className="flex items-center px-10 py-8 hover:bg-white/[0.03] transition-all group relative">
                  <div className="absolute left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300" />
                  <span className={cn(
                    "w-16 text-2xl font-black font-display transition-colors",
                    user.rank === 1 ? "text-yellow-500" :
                    user.rank === 2 ? "text-gray-300" :
                    user.rank === 3 ? "text-amber-600" :
                    "text-white"
                  )}>#{user.rank}</span>
                  <div className="flex-1 flex items-center gap-6">
                    <Avatar className="h-12 w-12 border border-white/10 group-hover:border-primary/50 transition-all">
                      <AvatarFallback className="text-xs font-black bg-white/5">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="font-black text-xl font-display uppercase italic tracking-tight">{user.name}</span>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-2xl font-black font-display text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{user.points.toLocaleString()}</p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-xl font-black font-display text-white/40">{user.tasks}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
