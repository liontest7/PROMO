import { Navigation } from "@/components/Navigation";
import { Trophy, Star, Medal, Crown, Calendar, Globe, Clock, Loader2 } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: leaders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", timeframe],
    refetchInterval: 300000,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground uppercase font-black tracking-widest text-xs">Accessing Neural Ranking...</p>
        </main>
      </div>
    );
  }

  const paginatedLeaders = leaders?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil((leaders?.length || 0) / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center relative py-12">
              <div className="text-center space-y-6">
                <h1 className="text-7xl md:text-9xl font-display font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Hall <span className="text-primary">of Fame</span>
                </h1>
                <p className="text-white uppercase tracking-[0.5em] text-sm md:text-base font-black italic">Top Ecosystem Contributors • Real-time Sync</p>
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="bg-primary/10 border border-primary/20 px-10 py-6 rounded-3xl backdrop-blur-md">
                    <p className="text-xs text-primary font-black uppercase tracking-[0.25em] mb-2">Weekly Prize Pool</p>
                    <p className="text-4xl md:text-5xl font-black text-white flex items-baseline gap-3">
                      {(PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE * 0.4).toLocaleString()} <span className="text-xl text-primary font-black">$DROP</span>
                    </p>
                  </div>
                  <p className="text-sm md:text-base text-white/90 uppercase tracking-[0.15em] font-black italic">
                    40% of all campaign fees distributed weekly to Top 3
                  </p>
                </div>
              </div>
              
              {/* Character Trophy positioned to the right and lower */}
              <div className="absolute -bottom-20 right-0 md:right-[-120px] transform translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <img 
                    src="https://i.ibb.co/5Xd708DM/20260110-2035-Dropy-Wins-Trophy-remix-01kemjzex0f9xvh2emrc9tk4jy.png" 
                    alt="Dropy Trophy" 
                    className="w-56 h-56 md:w-72 md:h-72 object-contain relative z-10 drop-shadow-[0_0_50px_rgba(34,197,94,0.5)] scale-x-[-1]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-20 relative z-10">
            {[
              { id: "weekly", label: "Weekly", icon: Clock },
              { id: "monthly", label: "Monthly", icon: Calendar },
              { id: "all_time", label: "All-time", icon: Globe },
            ].map((t) => (
              <Button
                key={t.id}
                variant={timeframe === t.id ? "default" : "outline"}
                onClick={() => {
                  setTimeframe(t.id as any);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-2xl font-black uppercase tracking-[0.2em] text-xs md:text-sm h-14 px-10 transition-all",
                  timeframe === t.id 
                    ? "bg-primary text-white shadow-[0_0_30px_rgba(34,197,94,0.5)] border-primary scale-105" 
                    : "bg-white/5 border-white/10 text-white hover:text-white hover:bg-white/10"
                )}
              >
                <t.icon className="w-5 h-5 mr-3" />
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Podium - Always Top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-28 items-end px-4">
          {/* Rank 2 */}
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
              <h3 className="text-3xl font-black font-display uppercase italic tracking-tight text-white truncate w-full px-2">{leaders?.[1]?.name || '---'}</h3>
              <div className="flex items-center gap-3 mt-4 bg-emerald-500/15 px-6 py-2 rounded-full border border-emerald-500/30">
                <Star className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl font-black font-display text-emerald-500">{leaders?.[1]?.points?.toLocaleString() || 0}</span>
              </div>
              <p className="text-xs font-black text-white/90 uppercase tracking-[0.25em] mt-6 italic leading-tight">{leaders?.[1]?.tasks || 0} TASKS COMPLETED</p>
            </CardContent>
          </Card>

          {/* Rank 1 */}
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
                {leaders?.[0]?.name || '---'}
              </h3>
              <div className="flex items-center gap-3 mt-5 bg-primary/25 px-8 py-3 rounded-full border border-primary/40 shadow-xl">
                <Star className="w-6 h-6 text-primary" />
                <span className="text-4xl font-black font-display text-primary">{leaders?.[0]?.points?.toLocaleString() || 0}</span>
              </div>
              <p className="text-[13px] font-black text-white uppercase tracking-[0.35em] mt-8 italic leading-tight">{leaders?.[0]?.tasks || 0} TASKS COMPLETED</p>
            </CardContent>
          </Card>

          {/* Rank 3 */}
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
              <h3 className="text-3xl font-black font-display uppercase italic tracking-tight text-white truncate w-full px-2">{leaders?.[2]?.name || '---'}</h3>
              <div className="flex items-center gap-3 mt-4 bg-amber-600/15 px-6 py-2 rounded-full border border-amber-600/30">
                <Star className="w-5 h-5 text-amber-600" />
                <span className="text-2xl font-black font-display text-amber-600">{leaders?.[2]?.points?.toLocaleString() || 0}</span>
              </div>
              <p className="text-xs font-black text-white/90 uppercase tracking-[0.25em] mt-6 italic leading-tight">{leaders?.[2]?.tasks || 0} TASKS COMPLETED</p>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="space-y-8">
          <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="bg-white/[0.05] px-12 py-8 border-b border-white/10 flex items-center text-sm font-black text-white uppercase tracking-[0.5em] italic">
              <span className="w-20">Rank</span>
              <span className="flex-1">Contributor</span>
              <span className="w-40 text-right">Score</span>
              <span className="w-40 text-right">Tasks</span>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {paginatedLeaders?.map((user) => (
                  <div key={user.rank} className="flex items-center px-12 py-10 hover:bg-white/[0.05] transition-all group relative">
                    <div className="absolute left-0 w-1.5 h-0 bg-primary group-hover:h-full transition-all duration-300" />
                    <span className={cn(
                      "w-20 text-3xl font-black font-display transition-colors",
                      user.rank === 1 ? "text-yellow-500" :
                      user.rank === 2 ? "text-gray-300" :
                      user.rank === 3 ? "text-amber-600" :
                      "text-white/80"
                    )}>#{user.rank}</span>
                    <div className="flex-1 flex items-center gap-8">
                      <Avatar className="h-16 w-16 border-2 border-white/10 group-hover:border-primary/60 transition-all shadow-xl">
                        <AvatarFallback className="text-base font-black bg-white/10">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-2xl font-display uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{user.name}</span>
                        <span className="text-xs font-mono text-white/40 truncate max-w-[250px]">{user.fullWallet}</span>
                      </div>
                    </div>
                    <div className="w-40 text-right">
                      <p className="text-3xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">{user.points.toLocaleString()}</p>
                    </div>
                    <div className="w-40 text-right">
                      <p className="text-2xl font-black font-display text-white/50">{user.tasks}</p>
                    </div>
                  </div>
                ))}
                
                {(!leaders || leaders.length === 0) && (
                  <div className="p-32 text-center">
                    <p className="text-white/30 text-xl uppercase font-black tracking-[0.4em] italic animate-pulse">Neural Ranking Data Missing</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
              >
                Previous
              </Button>
              <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
