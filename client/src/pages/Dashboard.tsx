import { useWallet } from "@/hooks/use-wallet";
import { useUserStats } from "@/hooks/use-user-stats";
import { Navigation } from "@/components/Navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { type User as UserType } from "@shared/schema";
import { IdentitySync } from "@/components/dashboard/IdentitySync";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { TokenPortfolios } from "@/components/dashboard/TokenPortfolios";
import { VerificationLogs } from "@/components/dashboard/VerificationLogs";
import { EcosystemContribution } from "@/components/dashboard/EcosystemContribution";

export default function Dashboard() {
  const { walletAddress } = useWallet();
  const { data: stats, isLoading: statsLoading } = useUserStats(walletAddress);
  
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/users", walletAddress],
    enabled: !!walletAddress,
    retry: false,
    staleTime: 0,
    refetchInterval: 5000,
  });

  const { data: executions } = useQuery({
    queryKey: [api.users.executions.path, walletAddress],
    enabled: !!walletAddress,
    queryFn: async () => {
      const res = await fetch(api.users.executions.path.replace(':walletAddress', walletAddress!));
      if (!res.ok) throw new Error('Failed to fetch executions');
      return res.json();
    }
  });

  if (statsLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-48 mb-8 bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 bg-white/10" />
            <Skeleton className="h-32 bg-white/10" />
            <Skeleton className="h-32 bg-white/10" />
          </div>
        </main>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[80vh]">
          <p className="text-muted-foreground">Please connect your wallet to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const tasksCompleted = stats?.tasksCompleted || 0;
  const reputationScore = user?.reputationScore || 0;
  const level = Math.floor(reputationScore / 100) + 1;
  const progress = reputationScore % 100;
  const rank = Math.max(1, (stats as any)?.totalUsers || 100) - reputationScore;
  const rankChange = tasksCompleted > 0 ? "up" : "stable";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>User Dashboard | Dropy</title>
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <ProfileHeader 
          walletAddress={walletAddress}
          level={level}
          reputationScore={reputationScore}
          rank={rank}
          rankChange={rankChange as "up" | "stable"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TokenPortfolios tokenBalances={stats?.tokenBalances || []} />
            <VerificationLogs executions={executions || []} />
          </div>

          <div className="space-y-8">
            <EcosystemContribution 
              reputationScore={reputationScore}
              level={level}
              progress={progress}
            />
            <IdentitySync user={user} walletAddress={walletAddress} />
          </div>
        </div>
      </main>
    </div>
  );
}