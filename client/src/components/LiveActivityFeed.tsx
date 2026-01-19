import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, ExternalLink, Clock, User } from "lucide-react";
import { PLATFORM_CONFIG } from "@shared/config";

interface Activity {
  id: string;
  user: string;
  action: string;
  amount: string;
  token: string;
  campaign: string;
  campaignLogo: string;
  txHash: string;
  timestamp: string;
}

const MOCK_CAMPAIGNS = [
  { name: "Solana Mobile", logo: "https://cryptologos.cc/logos/solana-sol-logo.png" },
  { name: "Phantom", logo: "https://cryptologos.cc/logos/phantom-logo.png" },
  { name: "Jupiter", logo: "https://cryptologos.cc/logos/jupiter-ag-jup-logo.png" },
  { name: "Magic Eden", logo: "https://cryptologos.cc/logos/magic-eden-logo.png" },
];

const MOCK_ACTIONS = ["Verified Holder", "Twitter Engagement", "Telegram Sync", "Website Visit", "Task Completed"];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const generateActivity = (isInitial = false) => {
      const campaign = MOCK_CAMPAIGNS[Math.floor(Math.random() * MOCK_CAMPAIGNS.length)];
      return {
        id: Math.random().toString(36).substr(2, 9),
        user: `${Math.random().toString(36).substr(2, 4)}...${Math.random().toString(36).substr(2, 4)}`,
        action: MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)],
        amount: (Math.random() * 50 + 10).toFixed(1),
        token: PLATFORM_CONFIG.TOKEN_SYMBOL,
        campaign: campaign.name,
        campaignLogo: campaign.logo,
        txHash: Math.random().toString(36).substr(2, 12),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    };

    setActivities(Array.from({ length: 5 }).map(() => generateActivity(true)));

    const interval = setInterval(() => {
      setActivities(prev => [generateActivity(), ...prev].slice(0, 8));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-black/60 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Live Protocol Stream</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter italic uppercase text-white leading-none">
              On-Chain <span className="text-primary neon-text">Activity</span>
            </h2>
          </div>
          
          <div className="hidden md:flex items-center gap-8 bg-white/[0.02] border border-white/10 p-4 px-6 rounded-2xl backdrop-blur-xl">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Network Status</span>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-black italic uppercase">Verified</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Processing</span>
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-4 h-4 text-secondary fill-secondary" />
                <span className="text-sm font-black italic uppercase">Real-Time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.98, x: 20 }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col md:flex-row items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 p-3 px-6 rounded-xl backdrop-blur-md transition-all relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 w-1 h-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Time & User */}
                <div className="flex items-center gap-4 min-w-[180px]">
                  <div className="flex items-center gap-2 text-white/20">
                    <Clock className="w-3 h-3" />
                    <span className="text-[11px] font-mono">{activity.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <User className="w-3 h-3 text-white/40" />
                    </div>
                    <span className="text-[12px] font-black text-white/60 tracking-tight">{activity.user}</span>
                  </div>
                </div>

                {/* Action & Campaign */}
                <div className="flex-1 flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <img src={activity.campaignLogo} alt="" className="w-6 h-6 rounded-md object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Campaign</span>
                      <span className="text-[13px] font-black text-white uppercase italic">{activity.campaign}</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block h-8 w-px bg-white/5" />
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Operation</span>
                    <span className="text-[13px] font-black text-primary uppercase italic tracking-tight">{activity.action}</span>
                  </div>
                </div>

                {/* Reward & TX */}
                <div className="flex items-center gap-8 min-w-[200px] justify-end">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Reward</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-white tracking-tighter">+{activity.amount}</span>
                      <span className="text-[9px] font-black text-white/40 uppercase italic">${activity.token}</span>
                    </div>
                  </div>
                  
                  <a 
                    href={`https://solscan.io/tx/${activity.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 p-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all text-white/40 hover:text-white"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">TX PROOF</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
