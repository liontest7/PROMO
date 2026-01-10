import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2 } from "lucide-react";
import { CONFIG } from "@shared/config";

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
          icon: CONFIG.ui.walletIcons.phantom,
          installUrl: "https://phantom.app/",
          detected: !!phantomProvider
        },
        { 
          name: 'Solflare', 
          provider: solflareProvider,
          icon: CONFIG.ui.walletIcons.solflare,
          installUrl: "https://solflare.com/",
          detected: !!solflareProvider
        },
        { 
          name: 'Bybit Wallet', 
          provider: bybitProvider,
          icon: CONFIG.ui.walletIcons.bybit,
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
      <DialogContent className="sm:max-w-[420px] border-white/20 bg-background/60 backdrop-blur-3xl p-0 overflow-hidden rounded-3xl shadow-2xl shadow-black/70">
        <div 
          className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${CONFIG.ui.walletSelectorBg})` }}
        />

        <div className="relative z-10 p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-display font-black text-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Connect Wallet
            </DialogTitle>
            <p className="text-center text-white text-sm font-bold mt-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Choose your preferred Solana wallet to securely connect to Dropy.
            </p>
          </DialogHeader>
          
          <div className="grid gap-4">
            {providers.map((p) => (
              <Button
                key={p.name}
                variant="outline"
                className="w-full h-20 justify-between items-center bg-black/60 border-white/30 hover:bg-black/80 hover:border-primary/60 transition-all duration-300 rounded-2xl group px-6 relative overflow-hidden no-default-hover-elevate no-default-active-elevate shadow-xl"
                onClick={() => p.detected ? onSelect(p.provider) : window.open(p.installUrl, '_blank')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden p-2 group-hover:scale-110 transition-transform duration-300 border border-white/40 shadow-inner">
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
                    <span className="text-xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{p.name}</span>
                    <span className="text-[10px] text-white font-black uppercase tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Solana Network</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                  {p.detected ? (
                    <div className="flex items-center gap-2 bg-primary/40 px-3 py-1.5 rounded-full border border-primary/60 shadow-lg shadow-primary/30 backdrop-blur-md">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
                        Detected
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/30 px-3 py-1.5 rounded-full border border-white/40 backdrop-blur-md">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        Install
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-[11px] text-white font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] opacity-70 hover:opacity-100 transition-opacity">
              By connecting, you agree to Dropy's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
