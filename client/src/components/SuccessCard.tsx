import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, X, Twitter, Check } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { PLATFORM_CONFIG } from "@shared/config";

interface SuccessCardProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  rewardAmount: string;
  tokenName: string;
  actionTitle: string;
}

export function SuccessCard({
  isOpen,
  onClose,
  campaignTitle,
  rewardAmount,
  tokenName,
  actionTitle
}: SuccessCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      // Ensure all images are loaded
      const images = cardRef.current.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      }));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.querySelector('[ref="cardRef"]') as HTMLElement;
          if (el) {
            el.style.boxShadow = 'none';
          }
        }
      });
      const link = document.createElement("a");
      link.download = `Dropy-Success-${tokenName}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (err) {
      console.error("Failed to download card:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareTwitter = () => {
    const text = `I just earned ${rewardAmount} $${tokenName} on @Dropy_Sol by completing "${actionTitle}" for ${campaignTitle}! 🚀\n\nJoin the revolution: ${window.location.origin}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none sm:rounded-3xl">
        <div className="relative p-6 pt-12">
          {/* Main Card to Capture */}
          <div 
            ref={cardRef}
            className="relative overflow-hidden rounded-[32px] bg-[#0a0a0a] border border-white/10 p-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 100%)',
              backgroundSize: 'cover'
            }}
          >
            {/* Background Glows */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[60px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 blur-[60px] rounded-full" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <img 
                  src={PLATFORM_CONFIG.ASSETS.CHARACTER_SUCCESS} 
                  alt="Success"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              <h2 className="text-3xl font-display font-black text-white mb-2 uppercase italic tracking-tighter">
                Reward <span className="text-primary">Claimed!</span>
              </h2>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Campaign</p>
                  <p className="text-xl font-bold text-white">{campaignTitle}</p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 shadow-inner shadow-primary/5">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Earnings</p>
                  <p className="text-4xl font-display font-black text-primary">
                    +{rewardAmount} <span className="text-lg">${tokenName}</span>
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Action Verified</p>
                  <p className="text-sm font-medium text-white/80">{actionTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} alt="Dropy Logo" className="w-6 h-6 object-contain" />
                <span className="text-[12px] font-black uppercase tracking-widest text-primary/80">Verified by Dropy</span>
              </div>
            </div>
          </div>

          {/* Action Buttons (Not Captured) */}
          <div className="mt-6 flex flex-col gap-3 relative z-20">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest text-xs h-12 rounded-2xl"
              >
                {isDownloading ? "Saving..." : <><Download className="w-4 h-4 mr-2" /> Save Image</>}
              </Button>
              <Button 
                onClick={handleShareTwitter}
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-black uppercase tracking-widest text-xs h-12 rounded-2xl"
              >
                <Twitter className="w-4 h-4 mr-2" /> Share on X
              </Button>
            </div>
            <Button 
              onClick={onClose}
              variant="ghost"
              className="text-muted-foreground hover:text-white font-black uppercase tracking-widest text-xs h-12"
            >
              Close
            </Button>
          </div>

          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors z-30"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
