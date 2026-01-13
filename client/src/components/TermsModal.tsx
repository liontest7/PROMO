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
        setHasReadToBottom(false);
        setHasAccepted(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [isConnected, walletAddress]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    // Calculate how close to the bottom we are
    // We use a 10px buffer to be user-friendly while ensuring they reached the end
    const buffer = 10;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - buffer;
    
    // Only set to true if they've actually scrolled (scrollTop > 0)
    // and reached the bottom.
    if (isAtBottom && scrollTop > 50) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] glass-card border-white flex flex-col p-0 overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.2)] ring-2 ring-white/50">
        <DialogHeader className="p-3 border-b border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-left pl-4">
              <DialogTitle className="font-display font-black text-4xl uppercase tracking-tighter italic text-white">
                Legal Agreement
              </DialogTitle>
              <p className="text-xs text-white/90 mt-0.5 font-bold uppercase tracking-widest leading-relaxed max-w-[280px]">
                Please read and accept our Terms to continue.
              </p>
            </div>
            <div className="shrink-0 relative pr-12">
              <div className="absolute inset-0 bg-primary/10 blur-[20px] rounded-full scale-110" />
              <link rel="preload" as="image" href={PLATFORM_CONFIG.ASSETS.LEGAL_BANNER} />
              <img 
                src={PLATFORM_CONFIG.ASSETS.LEGAL_BANNER} 
                alt="Legal mascot"
                className="w-44 h-44 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-0 relative bg-black/40">
          <ScrollArea 
            className="h-[450px] w-full px-10 py-4" 
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 text-[14px] text-white/90 leading-relaxed pb-6">
              <section className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <h3 className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-2">1. ACCEPTANCE & DECENTRALIZED PROTOCOL</h3>
                <p>By accessing the Dropy Platform, you acknowledge that you are using a decentralized technology interface. Dropy does not act as a custodian of your assets. You maintain full control over your Solana wallet and private keys at all times. Your use of the platform constitutes a legally binding agreement to these Terms of Service.</p>
              </section>
              
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">2. X (TWITTER) & API VERIFICATION</h3>
                <p>The platform utilizes the X API to verify marketing task completion (Follow, Like, Retweet). By participating, you grant the platform permission to verify your social engagement status. We do not store login credentials or post on your behalf. You acknowledge that third-party API failures may affect reward distribution.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">3. ANTI-FRAUD & SYBIL PROTECTION</h3>
                <p>To ensure ecosystem integrity, we implement rigorous anti-fraud measures. Prohibited activities include: use of multiple wallets by a single user (Sybil attacks), automated scripts/bots, and falsifying social engagement. Any detected violation will result in an immediate, permanent ban of your wallet and forfeiture of all rewards.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">4. RISK DISCLOSURE & VOLATILITY</h3>
                <p>Digital assets and project tokens are subject to extreme market volatility. Dropy makes no guarantees regarding the financial value, liquidity, or future utility of any rewards earned. Participation is at your own risk. We are not responsible for losses due to market fluctuations or Solana network congestion.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">5. INDEMNIFICATION</h3>
                <p>You agree to indemnify and hold harmless Dropy, its contributors, and affiliates from any claims, damages, or losses arising from your use of the platform, violation of these terms, or infringement of third-party rights. This includes any legal fees incurred during dispute resolution.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">6. TERMINATION OF ACCESS</h3>
                <p>We reserve the right to suspend or terminate your access to the platform at our sole discretion, without prior notice, for any conduct that we believe violates these Terms or is harmful to other users or the platform's integrity.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">7. INTELLECTUAL PROPERTY</h3>
                <p>All platform content, including logos, mascots, code, and UI elements, is the exclusive property of Dropy. Unauthorized reproduction, modification, or distribution of platform assets is strictly prohibited.</p>
              </section>

              <section className="border-t border-white/10 pt-4">
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">8. GOVERNING LAW</h3>
                <p>These Terms shall be governed by and construed in accordance with international digital asset regulations. You are responsible for ensuring compliance with the laws of your local jurisdiction.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">9. SEVERABILITY</h3>
                <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remainder of the Terms shall otherwise remain in full force and effect.</p>
              </section>

              <div className="pt-4 border-t border-white/5 italic text-[11px] font-medium text-white/40 text-center">
                Last Updated: January 13, 2026. Version 2.2 (Phase 2 Full Compliance)
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 border-t border-white/5 bg-black/60 flex-col gap-4">
          <div 
            className={`flex items-start space-x-3 w-full p-3 rounded-xl transition-all duration-500 ${hasReadToBottom ? 'bg-primary/5 border border-primary/20 shadow-[0_0_20px_rgba(34,197,94,0.05)]' : 'bg-white/5 border border-white/5 opacity-50'}`}
          >
            <Checkbox 
              id="terms" 
              checked={hasAccepted} 
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={!hasReadToBottom}
              className="mt-0.5 border-primary data-[state=checked]:bg-primary w-4 h-4 rounded"
            />
            <Label 
              htmlFor="terms" 
              className={`text-xs font-black uppercase tracking-widest leading-tight cursor-pointer transition-colors ${!hasReadToBottom ? 'text-white/50' : 'text-white hover:text-primary'}`}
            >
              {!hasReadToBottom ? "Scroll to review complete terms" : "I have read and accept the terms of service"}
            </Label>
          </div>
          <Button 
            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-12 text-sm shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all disabled:opacity-30 rounded-xl border-none"
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
