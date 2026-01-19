import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, ExternalLink, Clock, User, LayoutGrid, List, Search } from "lucide-react";
import { PLATFORM_CONFIG } from "@shared/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Activity {
  id: string;
  user: {
    walletAddress: string;
    username?: string;
    profileImageUrl?: string;
  };
  action: {
    type: string;
    rewardAmount: string;
  };
  campaign: {
    id: number;
    tokenName: string;
    tokenAddress: string;
    tokenImageUrl?: string;
  };
  status: string;
  transactionSignature?: string;
  createdAt: string;
}

export function LiveActivityFeed() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: allExecutions, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/executions/recent"],
    queryFn: async () => {
      const res = await fetch("/api/admin/executions?limit=12");
      if (!res.ok) throw new Error("Failed to fetch executions");
      return res.json();
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  if (isLoading) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-black/60 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Live Network Pulse</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter italic uppercase text-white leading-none">
              Recent <span className="text-primary neon-text">Activity</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-xl">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("grid")}
                className={`rounded-lg h-9 w-9 p-0 ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("list")}
                className={`rounded-lg h-9 w-9 p-0 ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-white/40 hover:text-white"}`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Link href="/explorer">
              <Button variant="outline" size="sm" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-11 rounded-xl px-6">
                Explore All <Search className="ml-2 w-3 h-3" />
              </Button>
            </Link>
          </div>
        </div>

        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
          <AnimatePresence mode="popLayout" initial={false}>
            {allExecutions?.slice(0, viewMode === "grid" ? 8 : 10).map((activity) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 backdrop-blur-xl transition-all overflow-hidden ${
                  viewMode === "grid" 
                  ? "p-6 rounded-[2rem] flex flex-col items-center text-center" 
                  : "p-3 px-6 rounded-xl flex flex-col md:flex-row items-center gap-4"
                }`}
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* User Profile */}
                <div className={`flex items-center gap-3 ${viewMode === "grid" ? "mb-4 w-full justify-center" : "min-w-[180px]"}`}>
                  <Avatar className="h-10 w-10 border-2 border-background shadow-lg">
                    <AvatarImage src={activity.user.profileImageUrl} />
                    <AvatarFallback className="bg-primary/20 text-[10px] font-black">{activity.user.username?.slice(0,2).toUpperCase() || "US"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-[12px] font-black text-white uppercase italic truncate max-w-[120px]">
                      {activity.user.username || `${activity.user.walletAddress.slice(0,4)}...${activity.user.walletAddress.slice(-4)}`}
                    </span>
                    <div className="flex items-center gap-1 text-white/20">
                      <Clock className="w-2 h-2" />
                      <span className="text-[9px] font-mono">{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Campaign & Action */}
                <div className={`flex-1 flex items-center ${viewMode === "grid" ? "flex-col mb-6" : "gap-6"}`}>
                  <div className={`flex items-center gap-3 ${viewMode === "grid" ? "mb-2" : ""}`}>
                    <img src={activity.campaign.tokenImageUrl} alt="" className="w-6 h-6 rounded-lg object-contain" />
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Campaign</span>
                      <span className="text-[13px] font-black text-white uppercase italic">{activity.campaign.tokenName}</span>
                    </div>
                  </div>
                  
                  {viewMode === "list" && <div className="hidden md:block h-8 w-px bg-white/5" />}
                  
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Operation</span>
                    <span className="text-[13px] font-black text-primary uppercase italic tracking-tight">{activity.action.type.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Reward & Link */}
                <div className={`flex items-center gap-6 ${viewMode === "grid" ? "w-full justify-between mt-auto" : "min-w-[220px] justify-end"}`}>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Reward</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-white tracking-tighter">+{activity.action.rewardAmount}</span>
                      <span className="text-[10px] font-black text-white/40 uppercase italic">${activity.campaign.tokenName}</span>
                    </div>
                  </div>
                  
                  {activity.transactionSignature && (
                    <a 
                      href={`https://solscan.io/tx/${activity.transactionSignature}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all text-white/40 hover:text-white shadow-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
