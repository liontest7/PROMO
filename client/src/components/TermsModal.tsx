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
    // We use a larger buffer (20px) to be more reliable across different browsers/resolutions
    const buffer = 20;
    const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - buffer);
    
    // Set to true if they've scrolled enough and reached near the bottom
    if (isAtBottom && scrollTop > 100) {
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
          <div 
            className="h-[450px] overflow-y-auto w-full px-10 py-6 custom-scrollbar" 
            onScroll={handleScroll}
          >
            <div className="space-y-8 text-[14px] text-white/90 leading-relaxed pb-12">
              <section className="bg-primary/5 p-5 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
                <h3 className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  1. DECENTRALIZED PROTOCOL & NON-CUSTODIAL SCOPE
                </h3>
                <p>By connecting your Solana wallet, you acknowledge that Dropy is a decentralized technology interface. We do not act as an intermediary, custodian, or broker. You maintain 100% control over your digital assets and private keys at all times. Dropy does not have the technical capability to reverse transactions or recover lost funds due to wallet mismanagement.</p>
              </section>
              
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">2. X (TWITTER) & THIRD-PARTY VERIFICATION</h3>
                <p>Our verification engine utilizes the X API to confirm social marketing tasks. You grant the platform permission to verify your public social engagement status (follows, likes, retweets). Dropy is not responsible for X platform outages, API rate limits, or account restrictions that may prevent reward distribution. We never store your social credentials or post content on your behalf.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">3. ANTI-FRAUD, SYBIL PROTECTION & BLACKLISTING</h3>
                <p>To ensure fairness, we implement strict anti-Sybil measures. This includes monitoring IP addresses, wallet-social identity mapping, and on-chain behavior. Prohibited activities include using multiple wallets, automated scripts (bots), or falsifying engagement. Dropy reserves the right to permanently blacklist any wallet and forfeit all accumulated rewards if fraudulent activity is detected.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">4. REWARD VOLATILITY & MARKET RISK</h3>
                <p>Project tokens earned through Dropy are high-risk digital assets subject to extreme price volatility. Dropy makes no guarantees regarding the future value, liquidity, or utility of any reward. You acknowledge that some project tokens may lose all value and that Dropy is not responsible for any financial losses incurred from holding or trading these assets.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">5. INDEMNIFICATION & LEGAL PROTECTION</h3>
                <p>You agree to indemnify, defend, and hold harmless Dropy and its contributors from any claims, losses, or legal fees arising from your use of the platform, violation of these terms, or infringement of any third-party rights. This platform is provided "AS IS" without warranties of any kind.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">6. TERMINATION & PROTOCOL ACCESS</h3>
                <p>We reserve the right to suspend or terminate your access to the platform interface at our sole discretion, without notice, for any conduct that violates these Terms or is deemed harmful to the protocol's integrity or the decentralized community.</p>
              </section>

              <section className="border-t border-white/10 pt-6">
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-3">7. GOVERNING LAW & SEVERABILITY</h3>
                <p>These terms are governed by international digital asset standards. If any provision is found to be unenforceable, it shall be limited to the minimum extent necessary so that the remainder of the terms remain in full force. You are responsible for local regulatory compliance.</p>
              </section>

              <div className="pt-8 italic text-[11px] font-bold text-white/30 text-center uppercase tracking-widest">
                Last Updated: January 13, 2026 • Version 2.3 (Legal Shield Plus)
              </div>
            </div>
          </div>
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
