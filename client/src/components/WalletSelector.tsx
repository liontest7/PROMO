import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2 } from "lucide-react";

interface WalletProvider {
  name: string;
  icon: string;
  provider: any;
  detected: boolean;
}

interface WalletSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (provider: any) => void;
}

export function WalletSelector({ open, onOpenChange, onSelect }: WalletSelectorProps) {
  const [providers, setProviders] = useState<WalletProvider[]>([]);

  useEffect(() => {
    const checkProviders = () => {
      // Direct detection of injected providers with deeper checks
      const solana = (window as any).solana;
      const phantom = (window as any).phantom;
      const solflare = (window as any).solflare;
      const bybit = (window as any).bybitWallet;
      
      const phantomProvider = phantom?.solana || (solana?.isPhantom ? solana : null);
      const solflareProvider = solflare?.solana || solflare || (solana?.isSolflare ? solana : null);
      const bybitProvider = bybit?.solana || (solana?.isBybit ? solana : null);

      const detected = [
        { 
          name: 'Phantom', 
          provider: phantomProvider,
          icon: "https://www.phantom.app/favicon.ico",
          installUrl: "https://phantom.app/",
          detected: !!phantomProvider
        },
        { 
          name: 'Solflare', 
          provider: solflareProvider,
          icon: "https://solflare.com/favicon.ico",
          installUrl: "https://solflare.com/",
          detected: !!solflareProvider
        },
        { 
          name: 'Bybit Wallet', 
          provider: bybitProvider,
          icon: "https://www.bybit.com/favicon.ico",
          installUrl: "https://www.bybit.com/en/web3/",
          detected: !!bybitProvider
        }
      ];
      setProviders(detected);
    };

    checkProviders();
    // Re-check more frequently and over a longer period to ensure all extensions are detected
    const timers = [50, 100, 250, 500, 1000, 2000, 5000].map(ms => setTimeout(checkProviders, ms));
    
    // Also listen for a custom event if wallets emit one when they're ready
    window.addEventListener('load', checkProviders);
    
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', checkProviders);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] glass-card border-white/10 bg-background/95 backdrop-blur-xl p-6">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-display font-black text-center">
            Connect a wallet on Solana to continue
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3">
          {providers.map((p) => (
            <Button
              key={p.name}
              variant="outline"
              className="w-full h-16 justify-between items-center bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group px-4"
              onClick={() => p.detected ? onSelect(p.provider) : window.open(p.installUrl, '_blank')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform">
                  <img 
                    src={p.icon} 
                    alt={p.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://solana.com/favicon.ico";
                    }}
                  />
                </div>
                <span className="text-lg font-bold">{p.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {p.detected ? (
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    Detected <CheckCircle2 className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Install
                  </span>
                )}
              </div>
            </Button>
          ))}
          
          <p className="text-[11px] text-center text-muted-foreground mt-4 italic">
            Choose your preferred wallet to securely connect to Dropy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
