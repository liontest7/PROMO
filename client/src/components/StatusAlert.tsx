import { motion } from "framer-motion";
import { LogOut, ShieldAlert, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

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
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg z-10"
      >
        <div className={`relative bg-[#0a0a0a]/80 border ${content.borderColor} rounded-[32px] p-10 flex flex-col items-center text-center space-y-8 shadow-2xl`}>
          
          {/* Header Image Section */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border border-white/10 bg-muted/20">
              <img 
                src={content.image} 
                alt={status}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black rounded-full border border-white/10">
               <p className="text-[10px] font-black tracking-widest text-yellow-500 uppercase">
                 {content.statusText}
               </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className={`text-2xl font-display font-black tracking-tight ${content.accent} leading-tight`}>
              {content.title}
            </h2>
            <p className="text-lg font-bold text-foreground">
              {content.description}
            </p>
          </div>

          <div className="space-y-6 max-w-xs">
            <p className="text-sm text-muted-foreground/80 leading-relaxed font-medium">
              {content.explanation}
            </p>
            
            <div className="flex justify-center">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-mono font-bold tracking-tight text-muted-foreground uppercase">
                  {content.timeframe}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-8 w-full max-w-xs">
            <button 
              onClick={() => disconnect()}
              className="flex items-center gap-2 text-sm font-bold text-white/90 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="border-b border-white/20 pb-0.5">DISCONNECT</span>
            </button>
            <button 
              className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="pb-0.5">SUPPORT</span>
            </button>
          </div>

          <div className="pt-2 opacity-20">
             <p className="text-[9px] font-mono tracking-[0.2em] uppercase">
               © MEMEDROP SECURE PROTOCOL ACTIVE
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
