import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, Rocket, Users, Coins, CheckCircle2, Trophy, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CampaignSuccessCardProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignSuccessCard({ campaign, open, onOpenChange }: CampaignSuccessCardProps) {
  const [, setLocation] = useLocation();
  const [isExporting, setIsExporting] = useState(false);

  if (!campaign) return null;

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

  const handleShare = async () => {
    const url = `${window.location.origin}/c/${campaign.tokenName.toLowerCase()}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Check out our new ${campaign.tokenName} campaign on Dropy!`,
          url: url,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-transparent border-none p-0 shadow-none overflow-visible [&>button]:hidden">
        <div className="absolute -top-12 right-0 z-[200]">
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
             onClick={() => onOpenChange(false)}
           >
             <X className="h-6 w-6" />
           </Button>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative flex flex-col items-center"
          >
            <div 
              id="campaign-card-capture-area"
              className="relative bg-[#0a0a0a] border border-white/20 rounded-[32px] overflow-hidden shadow-2xl w-full max-w-[440px]"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
              
              <div className="relative z-10 p-6 flex flex-col items-center">
                <div className="w-32 h-32 mb-3 overflow-hidden flex items-center justify-center">
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
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-[1px] w-6 bg-white/40" />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white">Broadcasted to Solana</span>
                  <div className="h-[1px] w-6 bg-white/40" />
                </div>

                <div className="w-full bg-white/[0.05] border border-white/20 rounded-3xl p-5 mb-4 backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                      <div className="relative w-20 h-20 rounded-xl bg-black border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center z-[100]">
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
                      <h3 className="font-black text-base leading-tight text-white uppercase tracking-tight break-words">{campaign.title}</h3>
                      <div className="mt-1 flex items-center">
                        <Badge variant="outline" className="campaign-ticker-badge bg-primary/20 border-primary/40 text-primary text-[11px] font-black py-0 px-2.5 h-5">
                          ${campaign.tokenName}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-white/90">
                        <Trophy className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10.5px] uppercase font-black tracking-widest whitespace-nowrap">Total Reward</span>
                      </div>
                      <p className="text-xl font-black text-white">
                        {Number(campaign.totalBudget).toLocaleString()} <span className="text-primary text-xs tracking-normal">${campaign.tokenName}</span>
                      </p>
                    </div>
                    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-white/90">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10.5px] uppercase font-black tracking-widest whitespace-nowrap">Participants</span>
                      </div>
                      <p className="text-xl font-black text-white">
                        {campaign.maxClaims || (campaign.actions?.reduce((acc: number, a: any) => acc + (a.maxExecutions || 0), 0)) || 0}
                        <span className="text-white/60 text-[10px] ml-1 font-black uppercase">Slots</span>
                      </p>
                    </div>
                  </div>

                  {campaign.campaignType === 'holder_qualification' ? (
                    <div className="mt-3.5 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-widest text-primary">Requirement</span>
                      </div>
                      <p className="text-[12px] text-white font-black leading-tight">
                        Hold {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName} for {campaign.minHoldingDuration} days to qualify.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="w-full max-w-[440px] mt-6 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-black uppercase tracking-widest text-xs"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Capturing..." : "Save Card"}
                </Button>
                <Button 
                  onClick={handleShare}
                  className="h-12 rounded-2xl bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-black uppercase tracking-widest text-xs"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
              <Button 
                variant="ghost" 
                className="text-white/40 hover:text-white font-black uppercase tracking-widest text-xs"
                onClick={() => onOpenChange(false)}
              >
                GO TO DASHBOARD <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
