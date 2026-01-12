import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, ExternalLink, Rocket, Users, Coins, CheckCircle2, Trophy, ArrowRight } from "lucide-react";
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
    const element = document.getElementById("campaign-card-export");
    if (!element) return;
    
    setIsExporting(true);
    try {
      // Small delay to ensure images are loaded and DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a", // solid background to avoid transparency issues
        scale: 3, // higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("campaign-card-export");
          if (clonedElement) {
            clonedElement.style.transform = "none";
            clonedElement.style.borderRadius = "0"; // sharp corners for export looks better sometimes
            clonedElement.style.width = "400px"; // fixed width for consistent export
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
          text: `Check out our new ${campaign.tokenName} campaign on MemeDrop!`,
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
      <DialogContent className="sm:max-w-lg bg-transparent border-none p-0 shadow-none overflow-visible">
        <AnimatePresence>
          <motion.div
            initial={ { scale: 0.9, opacity: 0, y: 20 } }
            animate={ { scale: 1, opacity: 1, y: 0 } }
            className="relative"
          >
            {/* Main Exportable Container */}
            <div 
              id="campaign-card-export"
              className="relative bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
              style={ { width: '100%', maxWidth: '440px', margin: '0 auto' } }
            >
              {/* Decorative Header Background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent opacity-50" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
              
              <div className="relative z-10 p-8 flex flex-col items-center">
                {/* Header Section */}
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-inner overflow-hidden">
                  <img 
                    src="https://i.ibb.co/xtwDPsFy/20260112-1450-Image-Generation-remix-01kes42kp5ft5r4tfh6znvs9c0-1.png" 
                    className="w-full h-full object-cover" 
                    alt="Success Icon" 
                  />
                </div>
                
                <h2 className="text-4xl font-black font-display text-white mb-1 uppercase tracking-tighter italic">
                  CAMPAIGN <span className="text-primary">LIVE!</span>
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-[1px] w-8 bg-white/20" />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">Broadcasted to Solana</span>
                  <div className="h-[1px] w-8 bg-white/20" />
                </div>

                {/* Project Identity Card */}
                <div className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                      <div className="relative w-16 h-16 rounded-xl bg-black border border-white/10 overflow-hidden shadow-2xl">
                        {campaign.logoUrl ? (
                          <img 
                            crossOrigin="anonymous" 
                            src={campaign.logoUrl} 
                            className="w-full h-full object-cover relative z-10" 
                            alt="Logo" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <Coins className="w-8 h-8 text-primary/40" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-xl leading-tight text-white truncate uppercase tracking-tight">{campaign.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-black py-0 px-2 h-5">
                          ${campaign.tokenName}
                        </Badge>
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">SOLANA NETWORK</span>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Trophy className="w-3 h-3 text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-widest">Total Reward</span>
                      </div>
                      <p className="text-lg font-black text-white">
                        {Number(campaign.totalBudget).toLocaleString()} <span className="text-primary text-xs tracking-normal">${campaign.tokenName}</span>
                      </p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-widest">Participants</span>
                      </div>
                      <p className="text-lg font-black text-white">
                        {campaign.maxClaims || (campaign.actions?.reduce((acc: number, a: any) => acc + (a.maxExecutions || 0), 0)) || 0}
                        <span className="text-muted-foreground text-xs ml-1 font-bold">SLOTS</span>
                      </p>
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  {campaign.campaignType === 'holder_qualification' ? (
                    <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-widest text-primary">Requirement</span>
                      </div>
                      <p className="text-xs text-white/90 font-bold leading-tight">
                        Hold {Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName} for {campaign.minHoldingDuration} days to qualify.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                       <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Missions</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                      {(campaign.actions || []).slice(0, 2).map((action: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-[11px] font-bold text-white/70 bg-white/5 rounded-lg px-3 py-2">
                          <span>{action.title}</span>
                          <span className="text-primary">+{action.rewardAmount} ${campaign.tokenName}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Message */}
                <p className="text-[10px] text-muted-foreground font-medium mb-8 max-w-[280px]">
                  Join the movement. Earn rewards. Support <span className="text-white font-bold">{campaign.tokenName}</span>.
                </p>

                {/* Interactive Controls (Hidden in Export via onclone) */}
                <div className="grid grid-cols-2 gap-3 w-full data-no-export mb-4">
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5 font-bold h-12 rounded-2xl text-white"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5 font-bold h-12 rounded-2xl text-white"
                    onClick={handleDownload}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" /> {isExporting ? "Saving..." : "Export"}
                  </Button>
                </div>
                
                <div className="w-full data-no-export">
                  <Button 
                    className="col-span-2 h-12 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.3)] transition-all group"
                    onClick={() => {
                      onClose();
                      setLocation(`/c/${campaign.tokenName.toLowerCase()}`);
                    }}
                  >
                    ENTER PROJECT HUB <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute bottom-0 right-0 p-4 opacity-20 pointer-events-none">
                <p className="text-[8px] font-black tracking-[0.3em] uppercase">MemeDrop © 2026</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
      
      {/* CSS to hide buttons in export */}
      <style>{`
        #campaign-card-export .data-no-export {
          display: flex !important;
        }
        canvas + #campaign-card-export .data-no-export {
          display: none !important;
        }
      `}</style>
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
