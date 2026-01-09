import { useWallet } from "@/hooks/use-wallet";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Navigation } from "@/components/Navigation";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { CampaignCard } from "@/components/CampaignCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function AdvertiserDashboard() {
  const { walletAddress, userId } = useWallet();
  // Fetch campaigns for the current connected advertiser
  const { data: campaigns, isLoading } = useCampaigns(userId?.toString()); 

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>Advertiser Dashboard | MemeDrop</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold">Advertiser Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your active campaigns and track performance.</p>
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
