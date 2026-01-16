import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG } from "@shared/config";
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
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Earn() {
  const { isConnected, walletAddress } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<{ action: Action; campaign: Campaign } | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true') {
      setIsCreateOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const { data: user } = useQuery<any>({
    queryKey: ["/api/users", walletAddress],
    enabled: !!walletAddress,
    refetchInterval: 10000,
  });

  const { data: campaigns, isLoading } = useCampaigns();

  // Add global settings query to handle real-time feature toggling
  const { data: settings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 500,
    staleTime: 0,
  });

  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");

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

  const [minReward, setMinReward] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "reward_high" | "reward_low">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredCampaigns = campaigns?.filter(c => {
    const matchesTab = activeTab === "active" ? c.status === "active" : (c.status === "completed" || c.status === "paused");
    if (!matchesTab) return false;

    // Reputation Filter (Simulated for Phase 2 readiness)
    const userReputation = user?.reputationScore || 0;
    const reputationRequirement = (c as any).minReputation || 0;
    if (userReputation < reputationRequirement) return false;

    const matchesSearch = 
      ((c.title || "").toLowerCase()).includes(searchTerm.toLowerCase()) || 
      ((c.tokenName || "").toLowerCase()).includes(searchTerm.toLowerCase()) ||
      ((c.description || "").toLowerCase()).includes(searchTerm.toLowerCase());
    
    const rewardValue = parseFloat(c.rewardPerWallet || "0");
    const minRewardValue = parseFloat(minReward || "0");
    const matchesReward = isNaN(minRewardValue) || rewardValue >= minRewardValue;

    if (!matchesSearch || !matchesReward) return false;
    
    if (activeFilters.length === 0) return true;
    
    const matchesFilter = 
      (c.campaignType === 'holder_qualification' && activeFilters.includes('holder')) ||
      (c.actions && c.actions.some(a => activeFilters.includes(a.type)));
    return matchesFilter;
  }).sort((a, b) => {
    if (sortBy === "reward_high") return parseFloat(b.totalBudget || "0") - parseFloat(a.totalBudget || "0");
    if (sortBy === "reward_low") return parseFloat(a.totalBudget || "0") - parseFloat(b.totalBudget || "0");
    return b.id - a.id; // Newest first
  });

  const totalPages = Math.ceil((filteredCampaigns?.length || 0) / ITEMS_PER_PAGE);
  const paginatedCampaigns = filteredCampaigns?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>Explore Campaigns - Earn Crypto | {PLATFORM_CONFIG.TOKEN_SYMBOL}</title>
        <meta name="description" content="Discover active marketing campaigns on Solana. Complete Twitter, Telegram, and website tasks to earn project tokens." />
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl font-display font-bold mb-2">Explore Campaigns</h1>
            <p className="text-xl text-white/80 font-medium">Complete tasks and earn crypto rewards instantly.</p>
            
            <div className="flex gap-4 mt-8">
              <Button 
                variant={activeTab === "active" ? "default" : "outline"}
                onClick={() => setActiveTab("active")}
                className="rounded-xl font-black text-base px-8 h-12 shadow-xl transition-all"
              >
                Active
              </Button>
              <Button 
                variant={activeTab === "closed" ? "default" : "outline"}
                onClick={() => setActiveTab("closed")}
                className="rounded-xl font-black text-base px-8 h-12 shadow-xl transition-all"
              >
                Closed
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
            <CreateCampaignDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input 
                  placeholder="Search projects..." 
                  className="pl-12 h-12 bg-white/5 border-white/10 focus:border-primary/50 text-base rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl p-0">
                    <Filter className="w-5 h-5" />
                    {activeFilters.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-black border-2 border-background">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 glass-card border-white/10 bg-background/95 backdrop-blur-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Advanced Filters</h4>
                      {(activeFilters.length > 0 || minReward) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => {
                            setActiveFilters([]);
                            setMinReward("");
                          }}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-black tracking-wider">Min Reward Amount</Label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="h-9 bg-white/5 border-white/10 text-sm"
                        value={minReward}
                        onChange={(e) => setMinReward(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-black tracking-wider">Sort By</Label>
                      <select 
                        className="w-full h-9 bg-white/5 border border-white/10 rounded-md px-2 text-sm text-white focus:outline-none focus:border-primary/50"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                      >
                        <option value="newest" className="bg-background">Newest First</option>
                        <option value="reward_high" className="bg-background">Highest Reward</option>
                        <option value="reward_low" className="bg-background">Lowest Reward</option>
                      </select>
                    </div>

                    <div className="space-y-3.5">
                      <Label className="text-[11px] text-muted-foreground uppercase font-black tracking-wider">Task Types</Label>
                      {[
                        { id: 'holder', label: 'Holder Qualification' },
                        { id: 'twitter', label: 'Twitter Follow' },
                        { id: 'telegram', label: 'Join Telegram' },
                        { id: 'website', label: 'Visit Website' }
                      ].map((filter) => (
                        <div key={filter.id} className="flex items-center space-x-2.5">
                          <Checkbox 
                            id={filter.id} 
                            checked={activeFilters.includes(filter.id)}
                            onCheckedChange={() => toggleFilter(filter.id)}
                            className="w-5 h-5 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label htmlFor={filter.id} className="text-[13px] font-bold capitalize cursor-pointer">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[400px] rounded-2xl border border-white/5 bg-white/5 p-6">
                <Skeleton className="h-8 w-3/4 mb-4 bg-white/10" />
                <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                <Skeleton className="h-4 w-2/3 mb-8 bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedCampaigns?.map((campaign: CampaignType & { actions: ActionType[] }) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onActionClick={(action: ActionType) => handleActionClick(action, campaign)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-16">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-white/10 px-6 font-bold h-11"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="default"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "w-11 h-11 rounded-xl font-bold text-base transition-all",
                        currentPage === page 
                          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-white/10 px-6 font-bold h-11"
                >
                  Next
                </Button>
              </div>
            )}
          </>
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
