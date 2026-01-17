import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Rocket, Share2, Twitter } from "lucide-react";
import { PLATFORM_CONFIG } from "@shared/config";

interface CampaignSuccessCardProps {
  campaign: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignSuccessCard({
  campaign,
  open,
  onOpenChange,
}: CampaignSuccessCardProps) {
  const handleShare = () => {
    const text = `I just launched a new growth campaign for $${campaign.tokenName} on @Dropy_Sol! 🚀\n\nCheck it out here: ${window.location.origin}/campaigns/${campaign.id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0a0a0a] border-primary/20 text-white">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <CheckCircle2 className="h-16 w-16 text-primary relative z-10" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-display font-black text-center uppercase italic tracking-tighter">
            Campaign <span className="text-primary">Launched!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-white/60">
            Your campaign is now live and visible to all users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10">
                <img src={campaign.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Project</p>
                <p className="font-bold text-lg leading-none">{campaign.title}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Budget</p>
              <p className="font-mono font-bold text-primary">{campaign.totalBudget} {campaign.tokenName}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Status</p>
              <p className="font-bold text-primary uppercase text-xs">Active</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleShare} className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-black uppercase tracking-widest text-xs h-12 rounded-2xl">
            <Twitter className="w-4 h-4 mr-2" /> Share on X
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="ghost" className="text-muted-foreground hover:text-white font-black uppercase tracking-widest text-xs h-12">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
