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
      const detected = [
        { 
          name: 'Phantom', 
          provider: (window as any).phantom?.solana || (window as any).solana?.isPhantom ? (window as any).solana : null,
          icon: "https://www.phantom.app/favicon.ico",
          installUrl: "https://phantom.app/"
        },
        { 
          name: 'Solflare', 
          provider: (window as any).solflare?.solana || (window as any).solana?.isSolflare ? (window as any).solana : null,
          icon: "https://solflare.com/favicon.ico",
          installUrl: "https://solflare.com/"
        },
        { 
          name: 'Bybit Wallet', 
          provider: (window as any).bybitWallet?.solana || (window as any).solana?.isBybit ? (window as any).solana : null,
          icon: "https://www.bybit.com/favicon.ico",
          installUrl: "https://www.bybit.com/en/web3/"
        }
      ].map(p => ({
        ...p,
        detected: !!(p.provider && (p.provider.connect || p.provider.isPrimary || p.provider.publicKey))
      }));
      setProviders(detected);
    };

    checkProviders();
    // Re-check after a short delay in case of late injection
    const timer = setTimeout(checkProviders, 1000);
    return () => clearTimeout(timer);
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
                  <img src={p.icon} alt={p.name} className="w-full h-full object-contain" />
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
