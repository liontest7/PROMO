import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
    // Initial random activities
    const initial = Array.from({ length: 3 }).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      user: `User...${Math.random().toString(36).substr(2, 4)}`,
      action: MOCK_ACTIONS[Math.floor(Math.random() * MOCK_ACTIONS.length)],
      amount: (Math.random() * 100).toFixed(1),
      token: "DROPY",
      timestamp: Date.now() - i * 10000,
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
      setActivities(prev => [newActivity, ...prev].slice(0, 4));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-8 left-8 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence initial={false}>
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-3 pr-6 rounded-2xl shadow-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20">
              <Zap className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">{activity.user}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[11px] font-black text-primary uppercase tracking-widest">{activity.action}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-white">+{activity.amount}</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">${activity.token}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
