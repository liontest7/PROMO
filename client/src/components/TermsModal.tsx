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
    // Using a more robust threshold and Math.ceil to handle subpixel issues
    const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5;
    if (isAtBottom) {
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
            <div className="space-y-6 text-[15px] text-white/90 leading-relaxed pb-6">
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">1. Acceptance of Terms</h3>
                <p>By connecting your Solana wallet and accessing the Dropy Platform (“Platform”), you confirm that you have read, understood, and agree to be bound by these Terms of Service. The Platform provides a decentralized interface for Pay-Per-Action marketing, on-chain verification (including Twitter/X API integration), and reward distribution.</p>
              </section>
              
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">2. Eligibility & Risk</h3>
                <p>You must be of legal age in your jurisdiction to use the Platform. Participation involves inherent risks of blockchain technology, including smart contract vulnerabilities and price volatility. The Platform does not provide financial or legal advice.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">3. X (Twitter) Integration & Data</h3>
                <p>To verify tasks, the Platform uses the X API. By participating in X-based campaigns, you authorize the Platform to verify follows, likes, or retweets. We only access public profile data required for verification; we never post on your behalf without explicit action.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">4. Prohibited Conduct & Sybil Protection</h3>
                <p>The following are strictly prohibited: Multi-wallet abuse (Sybil attacks); Use of bots/automation; Falsifying social actions; Exploiting bugs. We implement advanced IP tracking and reputation scoring to detect fraud. Violations result in permanent blacklisting and reward forfeiture.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">5. Verification & Third-Party APIs</h3>
                <p>Verification relies on X (Twitter), Telegram, and Solana network APIs. The Platform is not responsible for outages or delays caused by these third-party services or network congestion.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">6. Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, the Platform and its contributors are not liable for any loss of digital assets or rewards arising from the use of the Platform or third-party services.</p>
              </section>

              <div className="pt-2 border-t border-white/5 italic text-[11px] font-medium text-white/40 text-center">
                By connecting your wallet, you acknowledge and accept these updated Terms of Service.
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
