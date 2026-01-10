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
import { ShieldCheck, AlertCircle, Scale, Lock, RefreshCw } from "lucide-react";

export function TermsModal() {
  const { isConnected, walletAddress } = useWallet();
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
    if (scrollHeight - scrollTop <= clientHeight + 50) {
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[85vh] glass-card border-white/10 flex flex-col p-0 overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <DialogHeader className="p-8 border-b border-white/5 bg-gradient-to-b from-primary/10 to-transparent text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="font-display font-black text-3xl uppercase tracking-tighter italic text-white">
            Legal Agreement
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Please review and accept the {PLATFORM_CONFIG.TOKEN_SYMBOL} terms to continue.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-0 relative bg-black/20">
          <ScrollArea 
            className="h-[350px] w-full px-8 py-6" 
            onScrollCapture={handleScroll}
          >
            <div className="space-y-8 text-[14px] text-muted-foreground/80 leading-relaxed pb-8">
              <section className="bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3 mb-3 text-white">
                  <Scale className="w-5 h-5 text-primary" />
                  <h3 className="font-black uppercase tracking-widest text-xs">1. Binding Agreement</h3>
                </div>
                <p>By connecting your wallet and participating in {PLATFORM_CONFIG.TOKEN_SYMBOL} campaigns, you enter into a legally binding contract with Dropy INC. This Platform facilitates decentralized marketing actions rewarded with crypto-assets on the Solana blockchain.</p>
              </section>
              
              <section>
                <div className="flex items-center gap-3 mb-3 text-white">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-black uppercase tracking-widest text-xs">2. Prohibited Activities</h3>
                </div>
                <p>To maintain ecosystem integrity, we strictly prohibit:
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-muted-foreground/60">
                    <li>Sybil attacks (using multiple wallets or social accounts).</li>
                    <li>Automated engagement via bots or scripts.</li>
                    <li>Manipulation of verification protocols.</li>
                  </ul>
                  Violation results in immediate blacklisting and forfeiture of all pending rewards without notice.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-3 text-white">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <h3 className="font-black uppercase tracking-widest text-xs">3. Reward Dynamics</h3>
                </div>
                <p>Rewards are provided "As-Is" by advertisers. {PLATFORM_CONFIG.TOKEN_SYMBOL} does not guarantee liquidity, market value, or the legal status of project tokens in your jurisdiction. All transactions on Solana are final and irreversible.</p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-3 text-white">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="font-black uppercase tracking-widest text-xs">4. Risk Disclosure</h3>
                </div>
                <p>Participation involves significant financial risk. Smart contracts may contain vulnerabilities. You are solely responsible for securing your private keys. We never ask for, or store, your seed phrase.</p>
              </section>

              <section className="border-t border-white/5 pt-6 italic text-xs">
                <p>By clicking "Enter Platform", you represent that you are of legal age and are not a resident of any sanctioned jurisdiction.</p>
              </section>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-8 border-t border-white/5 bg-black/40 flex-col gap-6">
          <div 
            className={`flex items-start space-x-3 w-full p-4 rounded-xl transition-all duration-300 ${hasReadToBottom ? 'bg-primary/5 border border-primary/20' : 'bg-white/5 border border-white/5 opacity-50'}`}
          >
            <Checkbox 
              id="terms" 
              checked={hasAccepted} 
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={!hasReadToBottom}
              className="mt-1 border-primary data-[state=checked]:bg-primary"
            />
            <Label 
              htmlFor="terms" 
              className={`text-xs font-bold uppercase tracking-widest leading-normal cursor-pointer transition-colors ${!hasReadToBottom ? 'text-muted-foreground' : 'text-white'}`}
            >
              {!hasReadToBottom ? "Please scroll to the bottom to unlock" : "I have read and accept the terms of service"}
            </Label>
          </div>
          <Button 
            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-14 text-md shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all disabled:opacity-30 rounded-xl"
            disabled={!hasReadToBottom || !hasAccepted}
            onClick={handleAccept}
          >
            Activate Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
