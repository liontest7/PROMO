import { motion, AnimatePresence } from "framer-motion";
import { Ban, Clock, LogOut, ShieldAlert, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";

interface StatusAlertProps {
  status: "suspended" | "blocked";
}

export function StatusAlert({ status }: StatusAlertProps) {
  const { disconnect } = useWallet();

  const content = {
    suspended: {
      icon: <Clock className="w-12 h-12 text-yellow-400" />,
      title: "Account Under Review",
      description: "Safety First. Your account is temporarily suspended for verification.",
      explanation: "Our automated security system detected activity that requires manual validation. We value quality engagement above all.",
      timeframe: "Review timeframe: 24h - 3 business days",
      action: "You'll receive a notification once the review is complete.",
      accent: "from-yellow-500/20 to-transparent",
      borderColor: "border-yellow-500/30"
    },
    blocked: {
      icon: <Ban className="w-12 h-12 text-red-500" />,
      title: "Access Revoked",
      description: "Permanent Restriction. Violation of Community Standards detected.",
      explanation: "Multiple security protocols confirmed activities that bypass our anti-fraud systems. This decision is irreversible to protect the ecosystem.",
      timeframe: "Status: Permanently Blocked",
      action: "Wallet access to MemeDrop has been terminated.",
      accent: "from-red-500/20 to-transparent",
      borderColor: "border-red-500/30"
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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Glow Effect */}
        <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-b ${content.accent} blur-xl opacity-50`} />
        
        <div className={`relative bg-card/40 border ${content.borderColor} rounded-2xl p-8 shadow-2xl backdrop-blur-sm overflow-hidden`}>
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="relative flex flex-col items-center text-center space-y-6">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full" />
              <div className="relative p-5 rounded-2xl bg-muted/30 border border-white/5 shadow-inner">
                {content.icon}
              </div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-3xl font-display font-black tracking-tight uppercase italic neon-text">
                {content.title}
              </h2>
              <p className="text-xl font-medium text-foreground/90">
                {content.description}
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="space-y-4 max-w-sm">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.explanation}
              </p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-white/5 text-xs font-mono text-primary/80">
                <ShieldAlert className="w-3 h-3" />
                {content.timeframe}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <Button 
                variant="outline" 
                onClick={() => disconnect()}
                className="flex-1 gap-2 hover-elevate bg-background/50 border-white/10"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </Button>
              <Button 
                variant="ghost"
                className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
                asChild
              >
                <a href="/support" target="_blank" rel="noreferrer">
                  <HelpCircle className="w-4 h-4" />
                  Support
                </a>
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-mono">
              System ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
