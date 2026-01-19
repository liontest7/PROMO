import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { Clock, User, Zap, ExternalLink, ShieldCheck } from "lucide-react";
import { PLATFORM_CONFIG } from "@shared/config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Explorer() {
  const { data: executions, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/admin/executions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/executions?limit=50");
      if (!res.ok) throw new Error("Failed to fetch executions");
      return res.json();
    },
    refetchInterval: 15000,
  });

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navigation />
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <header className="mb-16 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic">Real-Time Protocol Explorer</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter italic uppercase text-white mb-6">
            Live Network <span className="text-primary neon-text">Analytics</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl font-medium leading-relaxed">
            Monitor every task verification and reward distribution across the Dropy ecosystem in real-time. Full transparency on the Solana blockchain.
          </p>
        </header>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />
            ))
          ) : (
            executions?.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex flex-col md:flex-row items-center gap-6 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 p-4 px-8 rounded-2xl backdrop-blur-xl transition-all relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 w-1.5 h-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center gap-4 min-w-[220px]">
                  <div className="flex items-center gap-2 text-white/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-mono">{new Date(activity.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-lg">
                      <AvatarImage src={activity.user.profileImageUrl} />
                      <AvatarFallback className="bg-primary/20 text-[10px] font-black uppercase">
                        {activity.user.username?.slice(0,2) || "US"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[14px] font-black text-white/80 tracking-tight">
                      {activity.user.username || `${activity.user.walletAddress.slice(0,6)}...${activity.user.walletAddress.slice(-4)}`}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                      <img src={activity.campaign.tokenImageUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Campaign</span>
                      <span className="text-[15px] font-black text-white uppercase italic">{activity.campaign.tokenName}</span>
                    </div>
                  </div>
                  
                  <div className="h-10 w-px bg-white/5 hidden md:block" />
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Operation</span>
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-primary fill-primary/20" />
                      <span className="text-[15px] font-black text-primary uppercase italic tracking-tight">{activity.action.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 min-w-[280px] justify-end">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Reward Distribution</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white tracking-tighter">+{activity.action.rewardAmount}</span>
                      <span className="text-[12px] font-black text-white/40 uppercase italic tracking-widest">${activity.campaign.tokenName}</span>
                    </div>
                  </div>
                  
                  {activity.transactionSignature && (
                    <a 
                      href={`https://solscan.io/tx/${activity.transactionSignature}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-primary text-white/40 hover:text-primary-foreground transition-all shadow-xl hover:shadow-primary/20"
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest">Verify</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
