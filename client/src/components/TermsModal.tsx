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
              <img 
                src={PLATFORM_CONFIG.ASSETS.LEGAL_BANNER} 
                alt="Legal mascot"
                className="w-44 h-44 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
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
                <p>By connecting your Solana wallet and accessing the Dropy Platform (“Platform”), you confirm that you have read, understood, and agree to be bound by these Terms of Service. The Platform provides a decentralized interface for Pay-Per-Action marketing, on-chain verification, and reward distribution.</p>
              </section>
              
              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">2. Eligibility, Risk & No Advice</h3>
                <p>You must be of legal age in your jurisdiction to access or use the Platform. You acknowledge that participation in blockchain-based systems involves inherent risks, including but not limited to smart contract vulnerabilities, third-party failures, and extreme price volatility. The Platform is a technology interface only and does not provide financial, investment, legal, or tax advice.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">3. No Guarantee of Rewards</h3>
                <p>Rewards are not guaranteed. The Platform reserves the right to modify, delay, reduce, or cancel reward distributions at any time due to technical issues, abuse prevention, verification failure, liquidity limitations, or protocol updates.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">4. Prohibited Conduct & Enforcement</h3>
                <p>The following activities are strictly prohibited: Sybil attacks or multi-wallet abuse; Use of bots, scripts, or automated tools; Spoofing identities or falsifying social actions; Exploiting bugs or attempting protocol manipulation. Any violation may result in immediate suspension, permanent blacklisting, and forfeiture of all pending or future rewards, without prior notice.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">5. Verification & Third-Party Dependencies</h3>
                <p>Action verification (e.g. Twitter, Telegram, on-chain events) relies on third-party APIs and external services. The Platform is not responsible for verification errors, data inaccuracies, service outages, delays, or Solana network congestion.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">6. Privacy & On-Chain Transparency</h3>
                <p>The Platform only processes public wallet addresses and social identifiers required for action verification. Private keys, seed phrases, or sensitive credentials are never requested or stored. All blockchain interactions are publicly visible and immutable on the Solana network.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">7. Jurisdiction & Legal Compliance</h3>
                <p>You are solely responsible for ensuring that your use of the Platform complies with all applicable laws and regulations in your jurisdiction. Access to the Platform may be restricted or unavailable in certain regions.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">8. Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, the Platform and its contributors shall not be liable for any loss of digital assets, data, rewards, or profits arising from the use of the Platform, smart contracts, or third-party services.</p>
              </section>

              <section>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2">9. Platform Access</h3>
                <p>Access to core Platform functionality requires connecting a compatible Solana wallet and accepting these Terms. Users who do not agree may not access the Platform engine.</p>
              </section>

              <div className="pt-2 border-t border-white/5 italic text-[11px] font-medium text-white/40 text-center">
                By connecting your wallet, you acknowledge and accept these Terms of Service.
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
