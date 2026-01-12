import { motion } from "framer-motion";
import { LogOut, ShieldAlert, Send } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { CONFIG } from "@shared/config";

interface StatusAlertProps {
  status: "suspended" | "blocked";
}

export function StatusAlert({ status }: StatusAlertProps) {
  const { disconnect } = useWallet();

  const content = {
    suspended: {
      image: "https://i.ibb.co/r24LwPDx/20260112-1330-Image-Generation-remix-01kerzg1xjevqtg0nx7xm479me.png",
      title: "SECURITY REVIEW",
      description: "Verification in Progress",
      explanation: "Our systems have flagged your recent activities for manual validation. This is a standard procedure to ensure community quality and platform security.",
      timeframe: "ESTIMATED REVIEW: 24H - 3 BUSINESS DAYS",
      accent: "text-primary",
      borderColor: "border-primary/20",
      statusText: "SUSPENDED"
    },
    blocked: {
      image: "https://i.ibb.co/77Cx4NQ/20260112-1333-Image-Generation-remix-01kerzkqj6f8z9rdnw442j7tte.png",
      title: "ACCESS REVOKED",
      description: "Permanent System Ban",
      explanation: "Fatal violation detected. Our multi-layer fraud detection has confirmed activities that compromise our ecosystem. This decision is final and non-negotiable.",
      timeframe: "STATUS: PERMANENTLY RESTRICTED",
      accent: "text-destructive",
      borderColor: "border-destructive/20",
      statusText: "BLOCKED"
    },
  }[status];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg z-10"
      >
        <div className={`relative bg-card/40 border ${content.borderColor} rounded-[32px] p-12 flex flex-col items-center text-center space-y-10 shadow-2xl backdrop-blur-sm`}>
          
          {/* Header Image Section */}
          <div className="relative">
            <div className="w-36 h-36 rounded-3xl overflow-hidden border border-white/10 bg-muted/20 shadow-2xl">
              <img 
                src={content.image} 
                alt={status}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-background border border-white/10 rounded-full shadow-xl">
               <p className="text-[11px] font-black tracking-[0.2em] text-primary uppercase">
                 {content.statusText}
               </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className={`text-4xl font-display font-black tracking-tighter uppercase italic leading-none text-white`}>
              {content.title}
            </h2>
            <p className="text-2xl font-bold text-white/90 tracking-tight">
              {content.description}
            </p>
          </div>

          <div className="space-y-6 max-w-sm">
            <p className="text-lg text-white/70 leading-relaxed font-medium">
              {content.explanation}
            </p>
            
            <div className="flex justify-center">
              <div className="px-6 py-2.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <span className="text-xs font-mono font-bold tracking-wider text-primary uppercase">
                  {content.timeframe}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-center gap-12 w-full max-w-md">
            <button 
              onClick={() => disconnect()}
              className="flex items-center gap-3 text-base font-black text-white hover:text-primary transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="tracking-tighter uppercase italic">Disconnect</span>
            </button>
            <a 
              href={CONFIG.SOCIAL_LINKS.TELEGRAM}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-base font-black text-white/60 hover:text-white transition-all group"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span className="tracking-tighter uppercase italic">Telegram Support</span>
            </a>
          </div>

          <div className="pt-4 opacity-50 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full animate-pulse bg-primary" />
             <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-primary/80">
               MemeDrop Secure Protocol Active
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
