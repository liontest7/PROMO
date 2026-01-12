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

interface CampaignSuccessCardProps {
  campaign: any;
  open: boolean;
  onClose: () => void;
}

export function CampaignSuccessCard({ campaign, open, onClose }: CampaignSuccessCardProps) {
  const [, setLocation] = useLocation();
  const [isExporting, setIsExporting] = useState(false);

  if (!campaign) return null;

  const handleDownload = async () => {
    const element = document.getElementById("campaign-card-capture-area");
    if (!element) return;
    
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a",
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("campaign-card-capture-area");
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.borderRadius = "0";
            clonedElement.style.width = "440px";
            clonedElement.style.margin = "0";
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-transparent border-none p-0 shadow-none overflow-visible [&>button]:hidden">
        {/* Custom Close Button */}
        <div className="absolute -top-12 right-0 z-[200]">
           <Button 
             variant="ghost" 
             size="icon" 
             className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
             onClick={onClose}
           >
             <X className="h-6 w-6" />
           </Button>
        </div>

        <AnimatePresence>
          <motion.div
            initial={ { scale: 0.9, opacity: 0, y: 20 } }
            animate={ { scale: 1, opacity: 1, y: 0 } }
            className="relative flex flex-col items-center"
          >
            {/* 1. CAPTURE AREA (Only this part is exported) */}
            <div 
              id="campaign-card-capture-area"
              className="relative bg-[#0a0a0a] border border-white/20 rounded-[32px] overflow-hidden shadow-2xl w-full max-w-[440px]"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
              
              <div className="relative z-10 p-8 flex flex-col items-center">
                {/* Header Section */}
                <div className="w-36 h-36 mb-4 overflow-hidden flex items-center justify-center">
                  <img 
                    src="https://i.ibb.co/xtwDPsFy/20260112-1450-Image-Generation-remix-01kes42kp5ft5r4tfh6znvs9c0-1.png" 
                    className="w-full h-full object-contain" 
                    alt="Success Icon" 
                  />
                </div>
                
                <h2 className="text-4xl font-black font-display text-white mb-1 uppercase tracking-tighter italic">
                  CAMPAIGN <span className="text-primary">LIVE!</span>
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-[1px] w-8 bg-white/40" />
                  <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-white">Broadcasted to Solana</span>
                  <div className="h-[1px] w-8 bg-white/40" />
                </div>

                {/* Project Identity Card */}
                <div className="w-full bg-white/[0.05] border border-white/20 rounded-3xl p-6 mb-6 backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-1000" />
                      <div className="relative w-20 h-20 rounded-xl bg-black border border-white/20 overflow-hidden shadow-2xl flex items-center justify-center z-[100]">
                        {campaign.logoUrl ? (
                          <img 
                            key={campaign.logoUrl}
                            crossOrigin="anonymous" 
                            src={campaign.logoUrl} 
                            className="w-full h-full object-cover relative z-[110]" 
                            alt="Logo" 
                            style={ { display: 'block', minWidth: '100%', minHeight: '100%', opacity: 1 } }
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${campaign.tokenName}.png?size=80`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 relative z-[110]">
                            <Coins className="w-10 h-10 text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg leading-tight text-white uppercase tracking-tight break-words">{campaign.title}</h3>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-primary/20 border-primary/40 text-primary text-[12px] font-black py-0.5 px-3 h-6">
                          ${campaign.tokenName}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Total Reward</span>
                      </div>
                      <p className="text-xl font-black text-white">
                        {Number(campaign.totalBudget).toLocaleString()} <span className="text-primary text-sm tracking-normal">${campaign.tokenName}</span>
                      </p>
                    </div>
                    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest">Participants</span>
                      </div>
                      <p className="text-xl font-black text-white">
                        {campaign.maxClaims || (campaign.actions?.reduce((acc: number, a: any) => acc + (a.maxExecutions || 0), 0)) || 0}
                        <span className="text-white/60 text-xs ml-1 font-black uppercase">Slots</span>
                      </p>
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  {campaign.campaignType === 'holder_qualification' ? (
                    <div className="mt-4 p-5 bg-primary/10 border border-primary/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary">Requirement</span>
                      </div>
                      <p className="text-[13px] text-white font-black leading-tight">
                        Hold {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName} for {campaign.minHoldingDuration} days to qualify.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                       <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/60">Missions</span>
                        <div className="h-[1px] flex-1 bg-white/20" />
                      </div>
                      {(campaign.actions || []).slice(0, 2).map((action: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-[12px] font-black text-white bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                          <span>{action.title}</span>
                          <span className="text-primary">+{action.rewardAmount} ${campaign.tokenName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Message */}
                <p className="text-[11px] text-white/70 font-bold mb-4 max-w-[300px] text-center">
                  Join the movement. Earn rewards. Support <span className="text-white font-black">${campaign.tokenName}</span>.
                </p>
              </div>

              {/* Copyright Section */}
              <div className="p-4 flex justify-center opacity-80 pointer-events-none border-t border-white/5 bg-white/[0.02]">
                <p className="text-[9px] font-black tracking-[0.4em] uppercase text-primary">Dropy © 2026</p>
              </div>
            </div>

            {/* 2. EXTERNAL BUTTONS AREA (Not exported) */}
            <div className="w-full max-w-[440px] mt-6 space-y-4">
              <div className="flex items-center justify-center gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/20 hover:bg-white/10 font-black h-12 rounded-2xl text-white text-sm"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-white/20 hover:bg-white/10 font-black h-12 rounded-2xl text-white text-sm"
                  onClick={handleDownload}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" /> {isExporting ? "Saving..." : "Export"}
                </Button>
              </div>
              
              <div className="w-full flex justify-center">
                <Button 
                  className="w-full h-12 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.4)] transition-all group"
                  onClick={() => {
                    onClose();
                    setLocation(`/c/${campaign.tokenName.toLowerCase()}`);
                  }}
                >
                  ENTER PROJECT HUB <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function Badge({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: "outline" }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "outline" ? "text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      className
    )}>
      {children}
    </div>
  );
}
