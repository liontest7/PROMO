import { useWallet } from "@/hooks/use-wallet";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Navigation } from "@/components/Navigation";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { PLATFORM_CONFIG } from "@shared/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdvertiserDashboard() {
  const { walletAddress, userId } = useWallet();
  // Fetch campaigns for the current connected advertiser
  const { data: campaigns, isLoading } = useCampaigns(userId?.toString()); 

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>Advertiser Dashboard | Dropy</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold italic uppercase tracking-tighter"><span className="text-primary">Dropy</span> Admin</h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-background border-white/10 p-4 rounded-xl shadow-2xl">
                    <div className="space-y-2">
                      <p className="font-bold text-primary uppercase tracking-widest text-[10px]">Reputation System</p>
                      <p className="text-xs leading-relaxed">
                        Our Reputation Score measures user quality based on task accuracy and activity. 
                        Since we are in early launch phase, scores are evolving. In the future, you'll be 
                        able to filter participants by their reputation tier to ensure maximum campaign ROI.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground mt-1">Manage your active campaigns and track performance.</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl">
                <p className="text-[8px] text-orange-500 font-black uppercase tracking-widest">Permanent Burn</p>
                <p className="text-sm font-black text-white">{PLATFORM_CONFIG.TOKENOMICS.BURN_PERCENT}% per Launch</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                <p className="text-[8px] text-primary font-black uppercase tracking-widest">Reward Pool Contribution</p>
                <p className="text-sm font-black text-white">{PLATFORM_CONFIG.TOKENOMICS.REWARDS_PERCENT}% per Launch</p>
              </div>
            </div>
          </div>
          <CreateCampaignDialog />
        </div>

        {!isLoading && campaigns && campaigns.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/5"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Campaigns</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              You haven't launched any campaigns yet. Start promoting your project today.
            </p>
            <CreateCampaignDialog />
          </motion.div>
        )}
        {!isLoading && campaigns && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} isOwner />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
