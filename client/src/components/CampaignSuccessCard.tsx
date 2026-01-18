import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Rocket, Users, Coins, CheckCircle2, Trophy, ArrowRight, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { SiX, SiTelegram, SiWhatsapp } from "react-icons/si";

interface CampaignSuccessCardProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignSuccessCard({ campaign, open, onOpenChange }: CampaignSuccessCardProps) {
  const [, setLocation] = useLocation();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#10b981', '#ffffff']
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#22c55e', '#10b981', '#ffffff']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open]);

  if (!campaign) return null;

  const getShareConfig = () => {
    const ticker = campaign.tokenName;
    const url = `${window.location.origin}/c/${campaign.slug || ticker.toLowerCase()}`;
    const text = `🚀 NEW MISSION LIVE on @Dropy_Sol!\n\nJoin the $${ticker} Growth Campaign and earn rewards from the ${Number(campaign.totalBudget).toLocaleString()} $${ticker} pool!\n\n✅ Verified Project\n💰 Instant Rewards\n🚀 Community Driven\n\nJoin here: ${url}\n\n#Dropy #Solana #Airdrop #$${ticker}`;
    
    return { url, text };
  };

  const shareOnX = () => {
    const { text } = getShareConfig();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnTelegram = () => {
    const { text, url } = getShareConfig();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const { text } = getShareConfig();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownload = async () => {
    const element = document.getElementById("campaign-card-capture-area");
    if (!element) return;
    
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a",
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 30000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("campaign-card-capture-area");
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.borderRadius = "0";
            clonedElement.style.width = "440px";
            clonedElement.style.margin = "0";
            clonedElement.style.display = "block";

            // Fix images in the clone for capture
            const images = clonedElement.getElementsByTagName('img');
            for (let i = 0; i < images.length; i++) {
              const img = images[i];
              const originalSrc = img.getAttribute('data-original-src') || img.src;
              
              if (originalSrc.startsWith('http') && !originalSrc.includes(window.location.host)) {
                if (
                  originalSrc.includes('moralis.io') || 
                  originalSrc.includes('dexscreener.com') || 
                  originalSrc.includes('cdn.dexscreener.com') ||
                  originalSrc.includes('jup.ag') ||
                  originalSrc.includes('birdeye.so')
                ) {
                   img.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalSrc)}`;
                   img.crossOrigin = "anonymous";
                }
              }
            }

            const ticker = clonedElement.querySelector(".campaign-ticker-badge");
            if (ticker) {
              (ticker as HTMLElement).style.display = "inline-flex";
              (ticker as HTMLElement).style.alignItems = "center";
              (ticker as HTMLElement).style.justifyContent = "center";
              (ticker as HTMLElement).style.marginTop = "0px";
              (ticker as HTMLElement).style.transform = "translateY(-1px)";
            }
          }
        }
      });
      
      const link = document.createElement("a");
      link.download = `${campaign.title.replace(/\s+/g, "-").toLowerCase()}-campaign.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-transparent border-none p-0 shadow-none overflow-visible [&>button]:hidden flex items-center justify-center my-4 scale-90">
        <div className="absolute top-0 right-0 z-[200]">
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
             onClick={() => onOpenChange(false)}
           >
             <X className="h-6 w-6" />
           </Button>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative flex flex-col items-center w-full"
          >
            <div 
              id="campaign-card-capture-area"
              className="relative bg-[#0a0a0a] border border-white/20 rounded-[40px] overflow-hidden shadow-2xl w-full max-w-[460px]"
            >
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/30 to-transparent opacity-60" />
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
              
              <div className="relative z-10 p-8 flex flex-col items-center">
                <div className="w-36 h-36 mb-4 overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://i.ibb.co/xtwDPsFy/20260112-1450-Image-Generation-remix-01kes42kp5ft5r4tfh6znvs9c0-1.png" 
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain no-fade-in" 
                    alt="Success Icon" 
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                <h2 className="text-3xl font-black font-display text-white mb-1 uppercase tracking-tighter italic text-center">
                  CAMPAIGN <span className="text-primary">LIVE!</span>
                </h2>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] w-8 bg-white/40" />
                  <span className="text-[11px] uppercase font-bold tracking-[0.25em] text-white">Broadcasted to Solana</span>
                  <div className="h-[1px] w-8 bg-white/40" />
                </div>

                <div className="w-full bg-[#111111] border border-white/20 rounded-[32px] p-6 mb-2 backdrop-blur-xl">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative group">
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-1000" />
                      <div className="relative w-20 h-20 rounded-2xl bg-black border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center z-[100]">
                        <img 
                          key={campaign.logoUrl}
                          src={campaign.logoUrl} 
                          data-original-src={campaign.logoUrl}
                          className="w-full h-full object-cover relative z-[110] no-fade-in" 
                          alt="Logo" 
                          style={{ display: 'block', minWidth: '100%', minHeight: '100%', opacity: 1 }}
                          loading="eager"
                          decoding="async"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const currentSrc = img.src;
                            if (!currentSrc.includes('imagedelivery.net')) {
                               img.src = `https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image/${campaign.tokenAddress}/86x86?alpha=true`;
                               return;
                            }
                            if (!currentSrc.includes('cdn.dexscreener.com')) {
                               img.src = `https://cdn.dexscreener.com/token-images/solana/${campaign.tokenAddress}.png`;
                               return;
                            }
                            if (!currentSrc.includes('tokens.jup.ag')) {
                               img.src = `https://tokens.jup.ag/token/${campaign.tokenAddress}`;
                               return;
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg leading-tight text-white uppercase tracking-tight break-words mb-1">{campaign.title}</h3>
                      <div className="flex items-center">
                        <Badge variant="outline" className="campaign-ticker-badge bg-primary/20 border-primary/40 text-primary text-[12px] font-black py-0.5 px-3 h-6">
                          ${campaign.tokenName}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 mb-5">
                    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Total Pool</span>
                      </div>
                      <p className="text-xl font-black text-white leading-none">
                        {Number(campaign.totalBudget).toLocaleString()}
                      </p>
                      <span className="text-primary text-[10px] font-black uppercase tracking-wider">${campaign.tokenName}</span>
                    </div>
                    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Participants</span>
                      </div>
                      <p className="text-xl font-black text-white leading-none">
                        {campaign.maxClaims || (campaign.actions?.reduce((acc: number, a: any) => acc + (a.maxExecutions || 0), 0)) || 0}
                      </p>
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-wider">Available Slots</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {campaign.campaignType === 'holder_qualification' ? (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-primary">Requirement</span>
                        </div>
                        <p className="text-[12px] text-white font-bold leading-tight">
                          Hold {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName} for {campaign.minHoldingDuration} days to qualify.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Rocket className="w-4 h-4 text-primary" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-primary">Active Mission</span>
                        </div>
                        <p className="text-[12px] text-white font-bold leading-tight">
                          {campaign.actions?.length || 0} tasks configured. Complete them to earn shared rewards from the pool.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[460px] mt-6 flex flex-col gap-4 px-4 pb-8">
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="h-14 rounded-[20px] bg-white text-black hover:bg-white/90 border-none font-black uppercase tracking-[0.15em] text-sm shadow-xl transition-all"
                >
                  <Download className="w-5 h-5 mr-3" />
                  {isExporting ? "Capturing..." : "Save Mission Card"}
                </Button>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    onClick={shareOnX}
                    className="h-14 rounded-[20px] bg-[#000000] hover:bg-[#000000]/90 text-white border border-white/20 font-black"
                  >
                    <SiX className="w-6 h-6" />
                  </Button>
                  <Button 
                    onClick={shareOnTelegram}
                    className="h-14 rounded-[20px] bg-[#229ED9] hover:bg-[#229ED9]/90 text-white border border-white/20 font-black"
                  >
                    <SiTelegram className="w-6 h-6" />
                  </Button>
                  <Button 
                    onClick={shareOnWhatsApp}
                    className="h-14 rounded-[20px] bg-[#25D366] hover:bg-[#25D366]/90 text-white border border-white/20 font-black"
                  >
                    <SiWhatsapp className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-white font-black uppercase tracking-[0.2em] text-sm py-4 hover:bg-white/5 transition-colors mt-2"
                onClick={() => {
                  onOpenChange(false);
                  setLocation(`/campaigns/${campaign.id}`);
                }}
              >
                GO TO DASHBOARD <ArrowRight className="w-4 h-4 ml-3" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
