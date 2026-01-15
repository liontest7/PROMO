import { Trophy, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PLATFORM_CONFIG } from "@shared/config";

interface LeaderboardHeaderProps {
  view: "ranking" | "history";
  setView: (view: "ranking" | "history") => void;
}

export function LeaderboardHeader({ view, setView }: LeaderboardHeaderProps) {
  return (
    <div className="text-center mb-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center relative py-6">
          <div className="text-center space-y-4">
            <h1 className="text-7xl md:text-9xl font-display font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Hall <span className="text-primary">of Fame</span>
            </h1>
            <p className="text-white uppercase tracking-[0.5em] text-sm md:text-base font-black italic">Top Ecosystem Contributors • Real-time Sync</p>
            
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <Button 
                  variant="ghost" 
                  onClick={() => setView("ranking")}
                  className={cn(
                    "rounded-xl font-black uppercase tracking-widest text-xs px-6 h-10 transition-all",
                    view === "ranking" ? "bg-primary text-white shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Live Ranking
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setView("history")}
                  className={cn(
                    "rounded-xl font-black uppercase tracking-widest text-xs px-6 h-10 transition-all",
                    view === "history" ? "bg-primary text-white shadow-lg" : "text-white/60 hover:text-white"
                  )}
                >
                  <History className="w-4 h-4 mr-2" />
                  Prize History
                </Button>
              </div>
            </div>

            {view === "ranking" && (
              <div className="mt-2 flex flex-col items-center gap-1">
                <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-2xl backdrop-blur-md">
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-0.5">Weekly Prize Pool</p>
                  <p className="text-2xl md:text-3xl font-black text-white flex items-baseline gap-2">
                    {(PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE * 0.4).toLocaleString()} <span className="text-sm text-primary font-black">$DROP</span>
                  </p>
                </div>
                <p className="text-[10px] md:text-xs text-white/80 uppercase tracking-[0.1em] font-black italic">
                  40% of all campaign fees distributed weekly to Top 3
                </p>
              </div>
            )}
          </div>
          
          <div className={cn(
            "absolute right-0 md:right-[-100px] transform transition-all duration-500",
            view === "ranking" ? "-bottom-48 md:-bottom-64" : "-bottom-20 md:-bottom-24 scale-75 opacity-50 pointer-events-none"
          )}>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
              <img 
                src="https://i.ibb.co/5Xd708DM/20260110-2035-Dropy-Wins-Trophy-remix-01kemjzex0f9xvh2emrc9tk4jy.png" 
                alt="Dropy Trophy" 
                className="w-64 h-64 md:w-96 md:h-96 object-contain relative z-10 drop-shadow-[0_0_60px_rgba(34,197,94,0.6)] scale-x-[-1]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
