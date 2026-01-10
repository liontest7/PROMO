import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { PLATFORM_CONFIG } from "@shared/config";
import { ShieldCheck, X } from "lucide-react";

export function TermsModal() {
  const { isConnected, walletAddress, disconnect } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected && walletAddress) {
      const storageKey = `dropy_terms_accepted_${walletAddress}`;
      const accepted = localStorage.getItem(storageKey);
      if (!accepted) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  }, [isConnected, walletAddress]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 40) {
      setHasReadToBottom(true);
    }
  };

  const handleAccept = () => {
    if (hasReadToBottom && hasAccepted && walletAddress) {
      const storageKey = `dropy_terms_accepted_${walletAddress}`;
      localStorage.setItem(storageKey, "true");
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    const storageKey = `dropy_terms_accepted_${walletAddress}`;
    const accepted = localStorage.getItem(storageKey);
    if (!accepted) {
      disconnect();
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] glass-card border-white/20 flex flex-col p-0 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] ring-1 ring-white/10">
        <DialogHeader className="p-10 border-b border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 text-left">
              <DialogTitle className="font-display font-black text-4xl uppercase tracking-tighter italic text-white">
                Legal Agreement
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-3 font-bold uppercase tracking-widest leading-relaxed max-w-[280px]">
                Please read and accept our Terms to continue.
              </p>
            </div>
            <div className="shrink-0 relative mr-4">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
              <img 
                src={PLATFORM_CONFIG.ASSETS.LEGAL_BANNER} 
                alt="Legal mascot"
                className="w-40 h-40 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-0 relative bg-black/40">
          <ScrollArea 
            className="h-[400px] w-full px-10 py-8" 
            onScrollCapture={handleScroll}
          >
            <div className="space-y-10 text-[15px] text-muted-foreground/90 leading-relaxed pb-10">
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">1. Acceptance of Terms</h3>
                <p>By connecting your Solana wallet and accessing the {PLATFORM_CONFIG.TOKEN_SYMBOL} Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. This Platform provides a decentralized interface for Pay-Per-Action marketing and reward distribution.</p>
              </section>
              
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">2. Eligibility & Risk</h3>
                <p>You must be of legal age in your jurisdiction to use this Platform. You acknowledge that participating in crypto-asset ecosystems involves significant risk, including technical vulnerabilities and extreme price volatility. {PLATFORM_CONFIG.TOKEN_SYMBOL} INC. is a technology provider and does not offer financial or investment advice.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">3. Prohibited Conduct</h3>
                <p>We strictly prohibit any form of fraudulent activity, including but not limited to: Sybil attacks, use of automated scripts/bots, or manipulation of verification protocols. Any user found violating these integrity standards will be permanently blacklisted and all pending rewards will be forfeited.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">4. Reward Verification</h3>
                <p>Rewards are distributed upon successful verification of social actions (Twitter, Telegram, etc.) via third-party APIs. We are not responsible for any failures, delays, or inaccuracies in third-party verification systems or Solana network congestion.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">5. Privacy & Data</h3>
                <p>We only collect public wallet addresses and social handles necessary for action verification. We never store private keys or seed phrases. Your interactions with the Platform are recorded on the public Solana blockchain.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">6. Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, Dropy INC. and its affiliates shall not be liable for any loss of assets, data, or profits resulting from your use of the Platform or interactions with decentralized smart contracts.</p>
              </section>

              <div className="pt-6 border-t border-white/5 italic text-xs font-medium text-muted-foreground/50">
                Finalizing your acceptance will grant you full access to the Platform engine.
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-10 border-t border-white/5 bg-black/60 flex-col gap-6">
          <div 
            className={`flex items-start space-x-4 w-full p-5 rounded-2xl transition-all duration-500 ${hasReadToBottom ? 'bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]' : 'bg-white/5 border border-white/5 opacity-50'}`}
          >
            <Checkbox 
              id="terms" 
              checked={hasAccepted} 
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={!hasReadToBottom}
              className="mt-1 border-primary data-[state=checked]:bg-primary w-5 h-5 rounded-md"
            />
            <Label 
              htmlFor="terms" 
              className={`text-sm font-black uppercase tracking-widest leading-tight cursor-pointer transition-colors ${!hasReadToBottom ? 'text-muted-foreground' : 'text-white hover:text-primary'}`}
            >
              {!hasReadToBottom ? "Scroll to review complete terms" : "I have read and accept the terms of service"}
            </Label>
          </div>
          <Button 
            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-16 text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all disabled:opacity-30 rounded-2xl border-none"
            disabled={!hasReadToBottom || !hasAccepted}
            onClick={handleAccept}
          >
            Enter Platform
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
