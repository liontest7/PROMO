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
      accent: "shadow-[0_0_50px_rgba(234,179,8,0.2)]",
      borderColor: "border-yellow-500/50",
      glowColor: "rgba(234, 179, 8, 0.5)"
    },
    blocked: {
      image: "https://i.ibb.co/77Cx4NQ/20260112-1333-Image-Generation-remix-01kerzkqj6f8z9rdnw442j7tte.png",
      title: "ACCESS REVOKED",
      description: "Permanent System Ban",
      explanation: "Fatal violation detected. Our multi-layer fraud detection has confirmed activities that compromise our ecosystem. This decision is final and non-negotiable.",
      timeframe: "STATUS: PERMANENTLY RESTRICTED",
      accent: "shadow-[0_0_50px_rgba(239,68,68,0.3)]",
      borderColor: "border-red-500/50",
      glowColor: "rgba(239, 68, 68, 0.5)"
    },
  }[status];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-background/98 backdrop-blur-2xl"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl z-10"
      >
        {/* Animated Glow Backlight */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 blur-[100px] rounded-full"
          style={{ backgroundColor: content.glowColor }}
        />
        
        <div className={`relative glass-card border-2 ${content.borderColor} rounded-3xl p-10 flex flex-col items-center text-center space-y-8 ${content.accent}`}>
          {/* Custom Visual Asset */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <img 
                src={content.image} 
                alt={status}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Status Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-background border-2 border-white/10 rounded-full shadow-xl">
               <p className={`text-xs font-black tracking-[0.2em] uppercase ${status === 'blocked' ? 'text-red-500' : 'text-yellow-500'}`}>
                 {status}
               </p>
            </div>
          </motion.div>

          <div className="space-y-3 pt-4">
            <h2 className="text-4xl font-display font-black tracking-tighter uppercase italic neon-text leading-none">
              {content.title}
            </h2>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {content.description}
            </p>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="space-y-6 max-w-md">
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              {content.explanation}
            </p>
            
            <div className="flex flex-col items-center gap-3">
              <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <ShieldAlert className={`w-5 h-5 ${status === 'blocked' ? 'text-red-500' : 'text-yellow-500'}`} />
                <span className="text-sm font-mono font-bold tracking-tight text-foreground/80 italic">
                  {content.timeframe}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button 
              size="lg"
              variant="outline" 
              onClick={() => disconnect()}
              className="flex-1 gap-3 hover-elevate bg-white/5 border-white/10 text-lg font-bold uppercase tracking-tighter italic"
            >
              <LogOut className="w-5 h-5" />
              Disconnect
            </Button>
            <Button 
              size="lg"
              variant="ghost"
              className="flex-1 gap-3 text-muted-foreground hover:text-foreground text-lg font-bold uppercase tracking-tighter italic"
              asChild
            >
              <a href="/support" target="_blank" rel="noreferrer">
                <HelpCircle className="w-5 h-5" />
                Support
              </a>
            </Button>
          </div>

          <div className="pt-4 opacity-30 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full animate-pulse bg-primary" />
             <p className="text-[10px] font-mono tracking-[0.3em] uppercase">
               MemeDrop Secure Protocol Active
             </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
