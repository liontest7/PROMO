import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { VerifyActionDialog } from "@/components/VerifyActionDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { type Action, type Campaign } from "@shared/schema";

export default function Earn() {
  const { data: campaigns, isLoading } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<{ action: Action; campaign: Campaign } | null>(null);

  const filteredCampaigns = campaigns?.filter(c => 
    ((c.title || "").toLowerCase()).includes(searchTerm.toLowerCase()) || 
    ((c.tokenName || "").toLowerCase()).includes(searchTerm.toLowerCase()) ||
    ((c.description || "").toLowerCase()).includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Explore Campaigns</h1>
            <p className="text-muted-foreground">Complete tasks and earn crypto rewards instantly.</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[300px] rounded-2xl border border-white/5 bg-white/5 p-6">
                <Skeleton className="h-8 w-3/4 mb-4 bg-white/10" />
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-4 w-2/3 mb-8 bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns?.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onActionClick={(action) => setSelectedAction({ action, campaign })}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredCampaigns?.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </main>

      <VerifyActionDialog 
        open={!!selectedAction} 
        onOpenChange={(open) => !open && setSelectedAction(null)}
        action={selectedAction?.action ?? null}
        campaign={selectedAction?.campaign ?? null}
      />
    </div>
  );
}
