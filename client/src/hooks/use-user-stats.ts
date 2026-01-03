import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useUserStats(walletAddress: string | null) {
  return useQuery({
    queryKey: [api.users.stats.path, walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const url = buildUrl(api.users.stats.path, { walletAddress });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.users.stats.responses[200].parse(await res.json());
    },
    enabled: !!walletAddress,
  });
}
