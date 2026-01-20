import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserStats } from "@/hooks/use-user-stats";
import { useQuery } from "@tanstack/react-query";
import { type User as UserType } from "@shared/schema";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { TokenPortfolios } from "@/components/dashboard/TokenPortfolios";
import { EcosystemContribution } from "@/components/dashboard/EcosystemContribution";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PLATFORM_CONFIG } from "@shared/config";

interface UserProfileDialogProps {
  walletAddress: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ walletAddress, isOpen, onOpenChange }: UserProfileDialogProps) {
  const { data: stats, isLoading: statsLoading } = useUserStats(walletAddress || "");
  
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/users", walletAddress],
    enabled: !!walletAddress && isOpen,
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: isOpen,
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    }
  });

  const leaderboard = leaderboardData?.ranking || [];
  const rankIndex = Array.isArray(leaderboard) 
    ? [...leaderboard]
        .sort((a, b) => (Number(b.reputationScore) || 0) - (Number(a.reputationScore) || 0))
        .findIndex((u: any) => u.walletAddress === walletAddress) 
    : -1;
  const rank = rankIndex !== -1 ? rankIndex + 1 : 100;

  const isLoading = statsLoading || userLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 border-white/10 bg-[#050505] overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">
            USER <span className="text-primary">PROFILE</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-3 pb-6 overflow-visible flex flex-col h-full">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full bg-white/5 rounded-[2rem]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Skeleton className="h-52 bg-white/5 rounded-3xl" />
                <Skeleton className="h-52 bg-white/5 rounded-3xl" />
              </div>
            </div>
          ) : walletAddress && user ? (
            <>
              <div className="shrink-0">
                <ProfileHeader 
                  walletAddress={walletAddress}
                  username={user.username || undefined}
                  avatarUrl={user.profileImageUrl || undefined}
                  level={Math.floor((user.reputationScore || 0) / 100) + 1}
                  reputationScore={user.reputationScore || 0}
                  rank={rank}
                  rankChange="stable"
                  isPublicView={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch flex-1 min-h-0">
                <TokenPortfolios tokenBalances={stats?.tokenBalances || []} />
                <EcosystemContribution 
                  reputationScore={user.reputationScore || 0}
                  level={Math.floor((user.reputationScore || 0) / 100) + 1}
                  progress={(user.reputationScore || 0) % 100}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white/40">User data not available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
