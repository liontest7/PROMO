import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { type InsertCampaign, type InsertAction } from "@shared/schema";

// Types derived from schema via routes
type CreateCampaignInput = InsertCampaign & { actions: Omit<InsertAction, "campaignId">[] };

// GET /api/campaigns
export function useCampaigns(creatorId?: string) {
  const queryKey = creatorId 
    ? [api.campaigns.list.path, { creatorId }] 
    : [api.campaigns.list.path];

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build URL with optional query params
      const url = creatorId 
        ? `${api.campaigns.list.path}?creatorId=${creatorId}`
        : api.campaigns.list.path;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return api.campaigns.list.responses[200].parse(await res.json());
    },
    refetchInterval: 1000, // Sync every second for immediate updates
  });
}

// GET /api/campaigns/:id
export function useCampaign(id: number) {
  return useQuery({
    queryKey: [api.campaigns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch campaign");
      return api.campaigns.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: 15000, // Refresh individual campaign more frequently
  });
}

// POST /api/campaigns
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      const res = await fetch(api.campaigns.create.path, {
        method: api.campaigns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create campaign");
      }
      
      return api.campaigns.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({
        title: "Campaign Created",
        description: "Your campaign is now live on the platform.",
        className: "bg-background border-primary/50",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
