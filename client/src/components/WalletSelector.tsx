import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2 } from "lucide-react";

interface WalletProvider {
  name: string;
  icon: string;
  provider: any;
  detected: boolean;
  installUrl: string;
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
    const timers = [50, 100, 250, 500, 1000, 2000, 5000].map(ms => setTimeout(checkProviders, ms));
    window.addEventListener('load', checkProviders);
    
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('load', checkProviders);
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] border-white/10 bg-background/40 backdrop-blur-2xl p-0 overflow-hidden rounded-3xl shadow-2xl shadow-black/50">
        <div 
          className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: 'url(https://i.ibb.co/xq2jkksm/20260109-2047-Image-Generation-remix-01kej1a44aer6vxak4n8tx8e6j.png)' }}
        />

        <div className="relative z-10 p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-black text-center bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              Connect Wallet
            </DialogTitle>
            <p className="text-center text-muted-foreground text-sm font-medium mt-2">
              Choose your preferred Solana wallet to securely connect to Dropy.
            </p>
          </DialogHeader>
          
          <div className="grid gap-4">
            {providers.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                className="w-full h-20 justify-between items-center bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 rounded-2xl group px-6 relative overflow-hidden no-default-hover-elevate no-default-active-elevate"
                onClick={() => p.detected ? onSelect(p.provider) : window.open(p.installUrl, '_blank')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                    <img 
                      src={p.icon} 
                      alt={p.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://solana.com/favicon.ico";
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl font-bold tracking-tight text-white">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Solana Network</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  {p.detected ? (
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Detected
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Install
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-muted-foreground/60 font-medium">
              By connecting, you agree to Dropy's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
