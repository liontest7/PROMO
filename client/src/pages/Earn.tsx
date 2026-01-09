import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { VerifyActionDialog } from "@/components/VerifyActionDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, X, Plus, Coins } from "lucide-react";
import { type Action, type Campaign } from "@shared/schema";
import { type Action as ActionType, type Campaign as CampaignType } from "@shared/schema";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Earn() {
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<{ action: Action; campaign: Campaign } | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useCampaigns();

  const handleActionClick = (action: Action, campaign: Campaign) => {
    if (!isConnected) {
      toast({
        title: "Connection Required",
        description: "Please connect your wallet to participate in campaigns.",
        variant: "destructive",
      });
      return;
    }
    setSelectedAction({ action, campaign });
  };

  const filteredCampaigns = campaigns?.filter(c => {
    const matchesSearch = 
      ((c.title || "").toLowerCase()).includes(searchTerm.toLowerCase()) || 
      ((c.tokenName || "").toLowerCase()).includes(searchTerm.toLowerCase()) ||
      ((c.description || "").toLowerCase()).includes(searchTerm.toLowerCase());
    
    if (activeFilters.length === 0) return matchesSearch;
    
    const matchesFilter = activeFilters.length === 0 || 
      (c.campaignType === 'holder_qualification' && activeFilters.includes('holder')) ||
      c.actions.some(a => activeFilters.includes(a.type));
    return matchesSearch && matchesFilter;
  });

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>Explore Campaigns - Earn Crypto | MemeDrop</title>
        <meta name="description" content="Discover active marketing campaigns on Solana. Complete Twitter, Telegram, and website tasks to earn project tokens." />
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-display font-bold mb-2">Explore Campaigns</h1>
            <p className="text-muted-foreground">Complete tasks and earn crypto rewards instantly.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <CreateCampaignDialog />

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects..." 
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 border-white/10 bg-white/5 hover:bg-white/10">
                    <Filter className="w-4 h-4" />
                    {activeFilters.length > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 glass-card border-white/10 bg-background/95 backdrop-blur-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Filter by Type</h4>
                      {activeFilters.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => setActiveFilters([])}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 'holder', label: 'Holder Qualification' },
                        { id: 'twitter', label: 'Twitter Follow' },
                        { id: 'telegram', label: 'Join Telegram' },
                        { id: 'website', label: 'Visit Website' }
                      ].map((filter) => (
                        <div key={filter.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={filter.id} 
                            checked={activeFilters.includes(filter.id)}
                            onCheckedChange={() => toggleFilter(filter.id)}
                          />
                          <Label htmlFor={filter.id} className="text-sm font-medium capitalize cursor-pointer">
                            {filter.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[300px] rounded-2xl border border-white/5 bg-white/5 p-6">
                <Skeleton className="h-8 w-3/4 mb-4 bg-white/10" />
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-4 w-2/3 mb-8 bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCampaigns?.map((campaign: CampaignType & { actions: ActionType[] }) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onActionClick={(action: ActionType) => handleActionClick(action, campaign)}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredCampaigns?.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </motion.div>
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
