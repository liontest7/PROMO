import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Twitter, X, CheckCircle2, Trophy, Rocket, ArrowRight, Coins } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { PLATFORM_CONFIG } from "@shared/config";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { SiX, SiTelegram, SiWhatsapp } from "react-icons/si";
import { useLocation } from "wouter";

interface UnifiedSuccessCardProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'action' | 'campaign';
  data: {
    title: string;
    tokenName: string;
    rewardAmount?: string;
    actionTitle?: string;
    totalBudget?: string;
    maxClaims?: number;
    logoUrl?: string;
    tokenAddress?: string;
    slug?: string;
  };
}

export function UnifiedSuccessCard({
  isOpen,
  onClose,
  type,
  data
}: UnifiedSuccessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        confetti({ ...defaults, particleCount: 50, origin: { x: Math.random(), y: Math.random() - 0.2 } });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isOpen, type]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `Dropy-${type}-${data.tokenName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const shareOnX = () => {
    const text = type === 'action' 
      ? `I just earned ${data.rewardAmount} $${data.tokenName} on @Dropy_Sol! 🚀`
      : `🚀 NEW MISSION LIVE on @Dropy_Sol! Join the $${data.tokenName} Campaign!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="relative p-6 pt-12 flex flex-col items-center">
          <div 
            ref={cardRef}
            className="relative overflow-hidden rounded-[32px] bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl w-full"
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-6">
                <img src={PLATFORM_CONFIG.ASSETS.CHARACTER_SUCCESS} alt="Success" className="w-full h-full object-contain" />
              </div>

              <h2 className="text-3xl font-display font-black text-white mb-2 uppercase italic tracking-tighter">
                {type === 'action' ? 'Reward' : 'Campaign'} <span className="text-primary">{type === 'action' ? 'Claimed!' : 'Live!'}</span>
              </h2>

              <div className="w-full h-px bg-white/10 my-4" />

              {type === 'action' ? (
                <div className="space-y-4 mb-6">
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <p className="text-4xl font-display font-black text-primary">
                      +{data.rewardAmount} <span className="text-lg">${data.tokenName}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4 text-primary animate-bounce" />
                    <p className="text-sm font-bold text-white uppercase tracking-wider">{data.title}</p>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest italic">
                    You can find your tokens in the dashboard
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-4 mb-6">
                   <div className="flex items-center gap-4 justify-center mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
                     <div className="w-16 h-16 rounded-2xl bg-black border-2 border-primary/40 overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                       <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                     </div>
                     <div className="text-left">
                       <p className="font-black text-xl text-white uppercase italic leading-none">{data.title}</p>
                       <Badge className="mt-2 bg-primary text-primary-foreground border-none font-black tracking-widest">${data.tokenName}</Badge>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                       <p className="text-[10px] uppercase font-black text-primary/60 tracking-widest mb-1">Total Pool</p>
                       <div className="flex items-center gap-2">
                         <Coins className="w-3 h-3 text-primary" />
                         <p className="font-black text-white text-lg">{data.totalBudget}</p>
                       </div>
                     </div>
                     <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                       <p className="text-[10px] uppercase font-black text-primary/60 tracking-widest mb-1">Available Slots</p>
                       <div className="flex items-center gap-2">
                         <Rocket className="w-3 h-3 text-primary" />
                         <p className="font-black text-white text-lg">{data.maxClaims}</p>
                       </div>
                     </div>
                   </div>
                   <p className="text-[10px] text-primary/60 uppercase font-black tracking-widest animate-pulse mt-2">
                     Mission initialized successfully
                   </p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} alt="Dropy" className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase text-primary/80">Verified by Dropy</span>
              </div>
            </div>
          </div>

          <div className="mt-6 w-full flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownload} disabled={isExporting} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 h-12 rounded-2xl">
                {isExporting ? "Saving..." : <><Download className="w-4 h-4 mr-2" /> Save</>}
              </Button>
              <Button onClick={shareOnX} className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white h-12 rounded-2xl">
                <Twitter className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
            {type === 'campaign' && (
              <Button 
                variant="ghost" 
                className="text-white font-black uppercase tracking-widest text-xs h-12"
                onClick={() => { onClose(); setLocation(`/c/${data.slug || data.tokenName.toLowerCase()}`); }}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button onClick={onClose} variant="ghost" className="text-white/40 hover:text-white h-12">Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
