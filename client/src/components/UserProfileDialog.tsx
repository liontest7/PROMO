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

  const isLoading = statsLoading || userLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 border-white/10 bg-[#050505] overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <DialogHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
          <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">
            USER <span className="text-primary">PROFILE</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full max-h-[calc(95vh-100px)]">
          <div className="p-8 space-y-10 pb-20">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-48 w-full bg-white/5 rounded-[2.5rem]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Skeleton className="h-64 bg-white/5 rounded-3xl" />
                  <Skeleton className="h-64 bg-white/5 rounded-3xl" />
                </div>
              </div>
            ) : walletAddress && user ? (
              <>
                <ProfileHeader 
                  walletAddress={walletAddress}
                  username={user.username || undefined}
                  avatarUrl={user.profileImageUrl || undefined}
                  level={Math.floor((user.reputationScore || 0) / 100) + 1}
                  reputationScore={user.reputationScore || 0}
                  rank={100} // Simplified for preview
                  rankChange="stable"
                  isPublicView={true}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
