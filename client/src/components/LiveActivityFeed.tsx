import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, TrendingUp, Users } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  amount: string;
  token: string;
  timestamp: number;
}

const MOCK_ACTIONS = ["verified holder", "completed task", "joined telegram", "followed twitter", "visited website"];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      user: `User...${Math.random().toString(36).substr(2, 4)}`,
      action: MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)],
      amount: (Math.random() * 100).toFixed(1),
      token: "DROPY",
      timestamp: Date.now() - i * 15000,
    }));
    setActivities(initial);

    const interval = setInterval(() => {
      const newActivity = {
        id: Math.random().toString(36).substr(2, 9),
        user: `User...${Math.random().toString(36).substr(2, 4)}`,
        action: MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)],
        amount: (Math.random() * 100).toFixed(1),
        token: "DROPY",
        timestamp: Date.now(),
      };
      setActivities(prev => [newActivity, ...prev].slice(0, 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-black/40">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">Live Protocol Stream</span>
            </div>
            <h2 className="text-5xl font-display font-black tracking-tighter italic uppercase text-white leading-none">
              Network <span className="text-primary neon-text">Activity</span>
            </h2>
          </div>
          <div className="flex items-center gap-8 bg-white/[0.03] border border-white/5 p-4 px-6 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Status</span>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-sm font-black italic uppercase">Synchronized</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Latency</span>
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm font-black italic uppercase">12ms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group relative"
              >
                <div className="relative bg-white/[0.02] border border-white/5 p-5 rounded-[2rem] backdrop-blur-md overflow-hidden transition-all hover:border-primary/20 hover:bg-white/[0.04]">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-all">
                    <Zap className="w-16 h-16" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
                      <Zap className="w-6 h-6 text-primary fill-primary/20" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{activity.user}</span>
                        <span className="text-[10px] font-bold text-white/20 uppercase">Recently</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-black text-primary uppercase italic tracking-tight">{activity.action}</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-white tracking-tighter">+{activity.amount}</span>
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em] italic">${activity.token}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
