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
    staleTime: 10000
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
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center relative py-10">
              <div className="text-center space-y-6">
                <h1 className="text-7xl md:text-9xl font-display font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Hall <span className="text-primary">of Fame</span>
                </h1>
                <p className="text-white uppercase tracking-[0.5em] text-sm md:text-xl font-black italic">Top Ecosystem Contributors • Real-time Sync</p>
              </div>
              
              {/* Character Trophy positioned to the right and lower */}
              <div className="absolute -bottom-16 right-0 md:right-[-120px] transform translate-y-1/2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                  <img 
                    src="https://i.ibb.co/5Xd708DM/20260110-2035-Dropy-Wins-Trophy-remix-01kemjzex0f9xvh2emrc9tk4jy.png" 
                    alt="Dropy Trophy" 
                    className="w-56 h-56 md:w-80 md:h-80 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:scale-110 transition-transform duration-500 scale-x-[-1]"
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
                  "rounded-2xl font-black uppercase tracking-[0.2em] text-sm h-12 px-10 transition-all",
                  timeframe === t.id 
                    ? "bg-primary text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] border-primary" 
                    : "bg-white/5 border-white/10 text-white hover:text-white hover:bg-white/10"
                )}
              >
                <t.icon className="w-5 h-5 mr-2" />
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Podium - Always Top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end px-4">
          {/* Rank 2 */}
          <Card className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden order-2 md:order-1 hover-elevate transition-all duration-500 min-h-[300px]">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-[#111] border-2 border-white/10 p-1">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-emerald-500/20 text-emerald-500 font-black text-xl">{leaders?.[1]?.avatar || '?'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-black text-xs shadow-xl border-4 border-[#050505]">#2</div>
              </div>
              <h3 className="text-2xl font-black font-display uppercase italic tracking-tight text-white/90 truncate w-full px-2">{leaders?.[1]?.name || '---'}</h3>
              <div className="flex items-center gap-2 mt-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                <Star className="w-4 h-4 text-emerald-500" />
                <span className="text-xl font-black font-display text-emerald-500">{leaders?.[1]?.points?.toLocaleString() || 0}</span>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mt-4 italic leading-tight">{leaders?.[1]?.tasks || 0} TASKS COMPLETED</p>
            </CardContent>
          </Card>

          {/* Rank 1 */}
          <Card className="glass-card border-yellow-500/30 bg-yellow-500/5 rounded-[3rem] overflow-hidden order-1 md:order-2 scale-110 relative z-20 shadow-[0_0_50px_rgba(234,179,8,0.15)] hover-elevate transition-all duration-500 min-h-[350px]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
            <CardContent className="p-12 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-[#111] border-4 border-yellow-500/40 p-1 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-primary/20 text-primary font-black text-3xl">{leaders?.[0]?.avatar || '?'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-yellow-500 text-black flex items-center justify-center font-black text-sm shadow-xl border-4 border-[#050505]">#1</div>
                <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              </div>
              <h3 className="text-3xl font-black font-display uppercase italic tracking-tighter text-white truncate w-full px-2">
                {leaders?.[0]?.name || '---'}
              </h3>
              <div className="flex items-center gap-2 mt-4 bg-primary/20 px-6 py-2 rounded-full border border-primary/30 shadow-lg">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-3xl font-black font-display text-primary">{leaders?.[0]?.points?.toLocaleString() || 0}</span>
              </div>
              <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] mt-6 italic leading-tight">{leaders?.[0]?.tasks || 0} TASKS COMPLETED</p>
            </CardContent>
          </Card>

          {/* Rank 3 */}
          <Card className="glass-card border-white/5 bg-white/[0.02] rounded-[2.5rem] overflow-hidden order-3 hover-elevate transition-all duration-500 min-h-[300px]">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-[#111] border-2 border-white/10 p-1">
                  <Avatar className="h-full w-full">
                    <AvatarFallback className="bg-amber-600/20 text-amber-600 font-black text-xl">{leaders?.[2]?.avatar || '?'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xl border-4 border-[#050505]">#3</div>
              </div>
              <h3 className="text-2xl font-black font-display uppercase italic tracking-tight text-white/90 truncate w-full px-2">{leaders?.[2]?.name || '---'}</h3>
              <div className="flex items-center gap-2 mt-3 bg-amber-600/10 px-4 py-1.5 rounded-full border border-amber-600/20">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-xl font-black font-display text-amber-600">{leaders?.[2]?.points?.toLocaleString() || 0}</span>
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mt-4 italic leading-tight">{leaders?.[2]?.tasks || 0} TASKS COMPLETED</p>
            </CardContent>
          </Card>
        </div>

        {/* List Section */}
        <div className="space-y-6">
          <Card className="glass-card border-white/5 bg-white/[0.01] rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="bg-white/[0.03] px-10 py-5 border-b border-white/5 flex items-center text-[10px] font-black text-white uppercase tracking-[0.4em] italic">
              <span className="w-16">Rank</span>
              <span className="flex-1">Contributor</span>
              <span className="w-32 text-right">Score</span>
              <span className="w-32 text-right">Tasks</span>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {paginatedLeaders?.map((user) => (
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
                      <div className="flex flex-col">
                        <span className="font-black text-xl font-display uppercase italic tracking-tight">{user.name}</span>
                        <span className="text-[10px] font-mono text-white/30 truncate max-w-[200px]">{user.fullWallet}</span>
                      </div>
                    </div>
                    <div className="w-32 text-right">
                      <p className="text-2xl font-black font-display text-primary drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">{user.points.toLocaleString()}</p>
                    </div>
                    <div className="w-32 text-right">
                      <p className="text-xl font-black font-display text-white/40">{user.tasks}</p>
                    </div>
                  </div>
                ))}
                
                {(!leaders || leaders.length === 0) && (
                  <div className="p-20 text-center">
                    <p className="text-white/20 uppercase font-black tracking-[0.3em] italic">Neural Ranking Data Missing</p>
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
