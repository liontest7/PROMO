import { Navigation } from "@/components/Navigation";
import { Trophy, Star, Medal, Crown, Calendar, Globe, Clock, Loader2, History, ExternalLink as ExternalLinkIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PLATFORM_CONFIG } from "@shared/config";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Leaderboard() {
  const [view, setView] = useState<"ranking" | "history">("ranking");
  const [timeframe, setTimeframe] = useState<"all_time" | "monthly" | "weekly">("weekly");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: leaders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", timeframe],
    refetchInterval: 300000,
    staleTime: 60000,
  });

  const { data: history } = useQuery<any[]>({
    queryKey: ["/api/leaderboard/history"],
  });

  const { data: allUsers } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", "all_time"],
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

  const activeLeaders = (timeframe === "all_time" ? allUsers : leaders) || [];
  const paginatedLeaders = activeLeaders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Prize history pagination (5 weeks per page)
  const historyItemsPerPage = 5;
  const historyData = history || [];
  const paginatedHistory = historyData.slice((currentPage - 1) * historyItemsPerPage, currentPage * historyItemsPerPage);
  const totalHistoryPages = Math.ceil(historyData.length / historyItemsPerPage);
  const totalPages = view === "ranking" ? Math.ceil(activeLeaders.length / itemsPerPage) : totalHistoryPages;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 pt-4 pb-24">
        <div className="text-center mb-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center relative py-6">
              <div className="text-center space-y-4">
                <h1 className="text-7xl md:text-9xl font-display font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Hall <span className="text-primary">of Fame</span>
                </h1>
                <p className="text-white uppercase tracking-[0.5em] text-sm md:text-base font-black italic">Top Ecosystem Contributors • Real-time Sync</p>
                
                <div className="pt-10 pb-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                      <Button 
                        variant="ghost" 
                        onClick={() => setView("ranking")}
                        className={cn(
                          "rounded-xl font-black uppercase tracking-widest text-sm px-10 h-12 transition-all",
                          view === "ranking" ? "bg-primary text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "text-white/90 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Trophy className="w-5 h-5 mr-2" />
                        Live Ranking
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setView("history")}
                        className={cn(
                          "rounded-xl font-black uppercase tracking-widest text-sm px-10 h-12 transition-all",
                          view === "history" ? "bg-primary text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "text-white/90 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <History className="w-5 h-5 mr-2" />
                        Prize History
                      </Button>
                    </div>
                  </div>
                </div>

                {view === "ranking" && (
                  <div className="mt-8 flex flex-col items-center gap-1">
                    <div className="bg-primary/10 border border-primary/20 px-10 py-6 rounded-[2.5rem] backdrop-blur-md shadow-[0_0_50px_rgba(34,197,94,0.2)] group hover:border-primary/40 transition-all duration-500 min-w-[320px]">
                      <p className="text-xs text-primary font-black uppercase tracking-[0.4em] mb-3 opacity-100 text-center drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">Weekly Prize Pool</p>
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-5xl md:text-6xl font-black text-white leading-none">
                          {(PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE * 0.4).toLocaleString()}
                        </span>
                        <span className="text-xl text-primary font-black uppercase tracking-widest">$DROPY</span>
                      </div>
                    </div>
                    <p className="text-[11px] md:text-xs text-white/50 uppercase tracking-[0.15em] font-black italic mt-6">
                      40% of all campaign fees distributed weekly to Top 3
                    </p>
                  </div>
                )}
              </div>
              
              {/* Floating Character - Static positioning for Ranking vs History */}
              <div className={cn(
                "absolute transform z-50 pointer-events-none",
                view === "ranking" 
                  ? "top-[40%] md:top-[42%] right-[-60px] md:right-[-120px] scale-110" 
                  : "top-[45%] md:top-[50%] right-[-10px] md:right-[-40px]"
              )}>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
                  <img 
                    src="https://i.ibb.co/5Xd708DM/20260110-2035-Dropy-Wins-Trophy-remix-01kemjzex0f9xvh2emrc9tk4jy.png" 
                    alt="Dropy Trophy" 
                    className={cn(
                      "object-contain relative z-10 drop-shadow-[0_0_50px_rgba(34,197,94,0.6)] scale-x-[-1]",
                      view === "ranking" ? "w-56 h-56 md:w-[380px] md:h-[380px]" : "w-40 h-40 md:w-[280px] md:h-[280px]"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {view === "ranking" && (
            <div className="flex justify-center gap-6 mt-2 mb-2 relative z-10">
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
                    "rounded-2xl font-black uppercase tracking-[0.2em] text-xs h-12 px-8 transition-all",
                    timeframe === t.id 
                      ? "bg-primary text-white shadow-[0_0_30px_rgba(34,197,94,0.5)] border-primary scale-105" 
                      : "bg-white/5 border-white/10 text-white hover:text-white hover:bg-white/10"
                  )}
                >
                  <t.icon className="w-4 h-4 mr-2" />
                  {t.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {view === "ranking" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 pt-12 items-end px-4 overflow-visible">
              <Card className="glass-card border-white/10 bg-white/[0.03] rounded-[3rem] overflow-hidden order-2 md:order-1 hover-elevate transition-all duration-500 min-h-[340px]">
                <CardContent className="p-10 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 rounded-full bg-[#111] border-2 border-white/20 p-1.5 relative">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-500 font-black text-2xl">{leaders?.[1]?.avatar || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-lg border-2 border-[#050505] shadow-2xl transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0">#2</div>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black font-display uppercase italic tracking-tight text-white truncate w-full px-2">{leaders?.[1]?.name || '---'}</h3>
                  <div className="flex items-center gap-3 mt-4 bg-emerald-500/15 px-6 py-2 rounded-full border border-emerald-500/30">
                    <Star className="w-5 h-5 text-emerald-500" />
                    <span className="text-2xl font-black font-display text-emerald-500">{leaders?.[1]?.points?.toLocaleString() || 0}</span>
                  </div>
                  <p className="text-xs font-black text-white/90 uppercase tracking-[0.25em] mt-6 italic leading-tight">{leaders?.[1]?.tasks || 0} TASKS COMPLETED</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-yellow-500/40 bg-yellow-500/10 rounded-[3.5rem] overflow-visible order-1 md:order-2 scale-110 relative z-20 shadow-[0_0_60px_rgba(234,179,8,0.25)] hover-elevate transition-all duration-500 min-h-[400px]">
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-36 h-36 rounded-full bg-[#111] border-4 border-yellow-500/50 p-1.5 shadow-[0_0_40px_rgba(234,179,8,0.4)] relative">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-primary/20 text-primary font-black text-4xl">{leaders?.[0]?.avatar || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl bg-yellow-500 text-black flex items-center justify-center font-black text-xl border-2 border-[#050505] shadow-2xl transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0">#1</div>
                      <Crown className="absolute -top-12 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
                    </div>
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

              <Card className="glass-card border-white/10 bg-white/[0.03] rounded-[3rem] overflow-hidden order-3 hover-elevate transition-all duration-500 min-h-[340px]">
                <CardContent className="p-10 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-28 h-28 rounded-full bg-[#111] border-2 border-white/20 p-1.5 relative">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className="bg-amber-600/20 text-amber-600 font-black text-2xl">{leaders?.[2]?.avatar || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-lg border-2 border-[#050505] shadow-2xl transform rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0">#3</div>
                    </div>
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
                    {paginatedLeaders?.length > 0 ? paginatedLeaders.map((user, idx) => (
                      <div key={user.rank || idx} className="flex items-center px-12 py-10 hover:bg-white/[0.05] transition-all group relative">
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
                            <AvatarFallback className="text-base font-black bg-white/10">{user.avatar || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                          <span className="font-black text-2xl font-display uppercase italic tracking-tight text-white group-hover:text-primary transition-colors">{user.name}</span>
                          <span className="text-xs font-mono text-white/40 truncate max-w-[250px]">{user.fullWallet}</span>
                        </div>
                      </div>
                      <div className="w-40 text-right">
                        <p className="text-3xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">{(user.points || 0).toLocaleString()}</p>
                      </div>
                      <div className="w-40 text-right">
                        <p className="text-2xl font-black font-display text-white/50">{user.tasks || 0}</p>
                      </div>
                    </div>
                  )) : (
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
        </>
      ) : (
        <div className="space-y-6 relative">
          <Card className="glass-card border-white/10 bg-white/[0.02] rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="bg-white/[0.05] px-12 py-10 border-b border-white/10 flex items-center text-lg font-black text-white uppercase tracking-[0.5em] italic">
              <span className="w-40">Period</span>
              <span className="flex-1">Winners Summary</span>
              <span className="w-32 text-right">Prize Pool</span>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {paginatedHistory?.map((week, idx) => (
                  <div key={idx} className="flex items-center px-12 py-10 hover:bg-white/[0.03] transition-all group">
                    <div className="w-40">
                      <p className="text-3xl font-black font-display text-white italic uppercase leading-none">#WEEK {idx + 1}</p>
                      <p className="text-[11px] font-black text-white/90 tracking-widest mt-3 whitespace-nowrap">{week.dates}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-between gap-6 overflow-visible py-6 px-4">
                      {week.winners.map((winner: any, i: number) => (
                        <div key={i} className={cn(
                          "flex flex-col gap-4 flex-1 min-w-0 p-6 pt-10 rounded-3xl relative group/winner transition-all duration-300",
                          i === 0 ? "bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)]" :
                          i === 1 ? "bg-white/10 border border-white/20" :
                          "bg-amber-600/10 border border-amber-600/30 shadow-[0_0_30px_rgba(217,119,6,0.15)]"
                        )}>
                          {/* Overlapping Badge */}
                          <div className={cn(
                            "absolute -top-4 -left-4 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-2xl z-10 transform -rotate-12 transition-transform group-hover/winner:scale-110 group-hover/winner:rotate-0",
                            i === 0 ? "bg-yellow-500 text-black border-yellow-400" :
                            i === 1 ? "bg-gray-300 text-black border-white" :
                            "bg-amber-600 text-white border-amber-500"
                          )}>
                            #{i + 1}
                          </div>

                          <div className="flex flex-col items-center text-center min-w-0">
                            <p className="text-xl font-black text-white uppercase italic truncate tracking-tight w-full">{winner.name}</p>
                            <div className="flex items-baseline justify-center gap-1.5 mt-1.5">
                              <span className={cn(
                                "text-2xl font-black uppercase leading-none",
                                i === 0 ? "text-yellow-500" : i === 1 ? "text-white" : "text-amber-500"
                              )}>
                                {winner.prizeAmount.toLocaleString()}
                              </span>
                              <span className="text-xs font-black text-white">$DROPY</span>
                            </div>
                          </div>

                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "h-10 w-full font-black uppercase tracking-widest text-[10px] rounded-xl transition-all",
                              i === 0 ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500" :
                              i === 1 ? "bg-white/10 hover:bg-white/20 text-white" :
                              "bg-amber-600/20 hover:bg-amber-600/30 text-amber-500"
                            )} 
                            asChild
                          >
                            <a href={winner.proofUrl} target="_blank" rel="noreferrer">
                              <ExternalLinkIcon className="w-4 h-4 mr-2" />
                              Blockchain Proof
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="w-32 text-right flex flex-col items-end shrink-0 ml-4">
                      <p className="text-5xl font-black font-display text-primary italic leading-none">{(week.prize || 0).toLocaleString()}</p>
                      <p className="text-xs font-black text-primary tracking-[0.2em] uppercase mt-3">$DROPY POOL</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {(!history || history.length === 0) && (
                <div className="p-32 text-center">
                  <p className="text-white/30 text-xl uppercase font-black tracking-[0.4em] italic animate-pulse">Neural History Data Pending First Reward Cycle</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  </div>
);
}