import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Share2, Download, ExternalLink, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { useLocation } from "wouter";

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
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${campaign.title.replace(/\s+/g, "-").toLowerCase()}-campaign.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/campaign/${campaign.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Check out our new campaign on MemeDrop!`,
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
      <DialogContent className="sm:max-w-md bg-transparent border-none p-0 shadow-none overflow-visible">
        <AnimatePresence>
          <motion.div
            initial={ { scale: 0.9, opacity: 0, y: 20 } }
            animate={ { scale: 1, opacity: 1, y: 0 } }
            className="relative"
          >
            <div 
              id="campaign-card-export"
              className="glass-card border-primary/30 bg-background/80 backdrop-blur-xl rounded-3xl p-8 overflow-hidden relative"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <Rocket className="w-10 h-10 text-primary" />
                </div>

                <h2 className="text-3xl font-black font-display text-primary mb-2 uppercase tracking-tighter">
                  Campaign Live!
                </h2>
                <p className="text-muted-foreground text-sm mb-8 max-w-[280px]">
                  Your project is now broadcasted to the Solana ecosystem.
                </p>

                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                      {campaign.logoUrl && <img src={campaign.logoUrl} className="w-full h-full object-cover" alt="Logo" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{campaign.title}</h3>
                      <p className="text-primary text-xs font-black uppercase tracking-widest">${campaign.tokenName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Budget</p>
                      <p className="text-sm font-bold">{campaign.totalBudget} {campaign.tokenName}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Network</p>
                      <p className="text-sm font-bold">Solana</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5 font-bold h-12 rounded-xl"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/10 hover:bg-white/5 font-bold h-12 rounded-xl"
                    onClick={handleDownload}
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" /> {isExporting ? "Saving..." : "Export"}
                  </Button>
                  <Button 
                    className="col-span-2 h-12 rounded-xl font-bold text-md shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    onClick={() => {
                      onClose();
                      setLocation(`/campaign/${campaign.id}`);
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> View Public Page
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
