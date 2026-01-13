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
    // Strict bottom detection: 
    // scrollTop + clientHeight must be very close to scrollHeight
    // AND scrollTop must be greater than 0 to ensure scrolling started
    // AND we use a very small tolerance (1px)
    const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 1;
    
    if (isAtBottom && scrollTop > 100) { // Require at least 100px of scrolling
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
              <section className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h3 className="text-primary font-black text-xs uppercase tracking-[0.2em] mb-2">1. Acceptance & Decentralized Scope</h3>
                <p>By connecting your Solana wallet, you agree to these Terms. Dropy is a decentralized technology interface. We do not hold user funds; all rewards are distributed via smart contracts or automated on-chain events. You are responsible for your own private keys and wallet security.</p>
              </section>
              
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">2. X (Twitter) & Social Verification</h3>
                <p>Verification of marketing tasks (Follow, Like, Retweet) is performed through the X API. By participating, you authorize the Platform to read your public social engagement status. We do not store your credentials or post content on your behalf. Failure of the X API or social platform outages may delay or invalidate reward claims.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">3. Anti-Fraud & Sybil Protection</h3>
                <p>To maintain a fair ecosystem, we implement strict anti-Sybil measures. This includes monitoring IP addresses, wallet associations, and social profile age/activity. Using multiple wallets to claim the same reward, using bots, or falsifying engagement will result in an immediate and permanent ban of your wallet address and forfeiture of all accumulated rewards.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">4. Reward Distribution & Volatility</h3>
                <p>Project tokens earned through Dropy are subject to extreme market volatility. The Platform does not guarantee the future value of any reward. We reserve the right to pause or cancel campaign distributions if fraudulent activity is detected or if a project project fails to maintain its token liquidity.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">5. Protocol Reputation (XP)</h3>
                <p>Your "Reputation" and "XP" are internal platform metrics used to gate high-value rewards. These points have no monetary value and are non-transferable. Attempting to manipulate these scores via artificial activity is a violation of these terms.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">6. Intellectual Property & Brand</h3>
                <p>All logos, mascots, and platform code are the property of Dropy. Users may not scrape platform data, reverse engineer the engine, or use Dropy branding for unauthorized promotional activities.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">7. Disclaimer of Warranties</h3>
                <p>The platform is provided "AS IS" without warranties of any kind. We are not responsible for Solana network congestion, "failed" transactions, or lost assets due to user error.</p>
              </section>

              <section className="border-t border-white/10 pt-4">
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">8. Governing Law & Jurisdiction</h3>
                <p>Users are responsible for compliance with local regulations. Access is prohibited in jurisdictions where crypto-assets or decentralized marketing platforms are restricted by law.</p>
              </section>

              <div className="pt-2 italic text-[11px] font-medium text-white/40 text-center">
                Last Updated: January 13, 2026. Version 2.1 (Phase 2 Alpha)
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
