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

export function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("dropy_terms_accepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setHasReadToBottom(true);
    }
  };

  const handleAccept = () => {
    if (hasReadToBottom && hasAccepted) {
      localStorage.setItem("dropy_terms_accepted", "true");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] glass-card border-white/10 flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-white/5">
          <DialogTitle className="font-display font-black text-2xl uppercase tracking-tighter italic text-primary text-center">
            Welcome to Dropy
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Please read and accept our Terms of Service to continue.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea 
            className="h-[400px] w-full p-6" 
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 text-sm text-muted-foreground">
              <section>
                <h3 className="text-white font-bold mb-2">1. Terms of Service</h3>
                <p>Welcome to Dropy. By using this platform, you agree to our decentralized marketing terms. We bridge the gap between Solana projects and engagement through verifiable rewards.</p>
              </section>
              
              <section>
                <h3 className="text-white font-bold mb-2">2. User Conduct</h3>
                <p>You agree to use only one wallet and one social account per platform. Any attempt to use bots, automated scripts, or multiple accounts to farm rewards will result in immediate disqualification and blacklisting.</p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">3. Reward Distribution</h3>
                <p>Rewards are distributed directly to your Solana wallet upon verification of the required action. Dropy is not responsible for the value, liquidity, or future performance of the earned tokens.</p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">4. Privacy & Verification</h3>
                <p>We only collect your public wallet address and social handles for task verification. We do not store private keys. Verification is handled through API integrations with social platforms.</p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">5. Disclaimer</h3>
                <p>Digital assets are highly volatile. Use at your own risk. This is not financial advice. We are a marketing technology provider, not a financial services firm.</p>
              </section>

              <section>
                <h3 className="text-white font-bold mb-2">6. Final Acceptance</h3>
                <p>By scrolling to the bottom and clicking accept, you confirm you have read, understood, and agree to be legally bound by these terms.</p>
              </section>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 border-t border-white/5 flex-col gap-4">
          <div className="flex items-center space-x-2 w-full mb-2">
            <Checkbox 
              id="terms" 
              checked={hasAccepted} 
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={!hasReadToBottom}
            />
            <Label 
              htmlFor="terms" 
              className={`text-xs font-bold uppercase tracking-widest leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${!hasReadToBottom ? 'text-muted-foreground' : 'text-white'}`}
            >
              {!hasReadToBottom ? "Please scroll to read everything" : "I have read and accept the terms"}
            </Label>
          </div>
          <Button 
            className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
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
