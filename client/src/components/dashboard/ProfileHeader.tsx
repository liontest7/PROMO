import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, Trophy, ArrowUpRight, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_CONFIG } from "@shared/config";

interface ProfileHeaderProps {
  walletAddress: string;
  username?: string;
  avatarUrl?: string;
  level: number;
  reputationScore: number;
  rank: number;
  rankChange: "up" | "stable";
  isPublicView?: boolean;
}

export function ProfileHeader({ 
  walletAddress, 
  username,
  avatarUrl,
  level, 
  reputationScore, 
  rank, 
  rankChange,
  isPublicView = false
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(username || "");
  const [newAvatarUrl, setNewAvatarUrl] = useState(avatarUrl || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: { username?: string, profileImageUrl?: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${walletAddress}/profile`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    const data: { username?: string, profileImageUrl?: string } = {};
    if (newName.trim() !== (username || "")) data.username = newName.trim();
    if (newAvatarUrl.trim() !== (avatarUrl || "")) data.profileImageUrl = newAvatarUrl.trim();
    
    if (Object.keys(data).length > 0) {
      mutation.mutate(data);
    } else {
      setIsEditing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const formatWallet = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const calculateLevel = (score: number) => {
    return Math.floor(score / 100) + 1;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary via-primary/60 to-primary/20 p-1.5 shadow-[0_0_40px_rgba(34,197,94,0.4)] relative">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
              <Avatar className="h-full w-full">
                <AvatarImage 
                  src={avatarUrl || PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                />
                <AvatarFallback className="bg-primary/20 text-primary font-black text-4xl">
                  {username ? username[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-primary text-primary-foreground font-black text-xs rounded-full border-4 border-background shadow-xl uppercase tracking-widest">
            LVL {calculateLevel(reputationScore)}
          </Badge>
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {isEditing ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="New Username"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/5 border-white/10 text-xl font-display font-black italic uppercase tracking-tighter w-64 h-10"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-10 w-10" onClick={handleSave} disabled={mutation.isPending}>
                    <Check className="w-5 h-5 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10" onClick={() => setIsEditing(false)}>
                    <X className="w-5 h-5 text-red-500" />
                  </Button>
                </div>
                <Input 
                  placeholder="Avatar Image URL"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="bg-white/5 border-white/10 h-8 text-xs w-64"
                />
                <p className="text-[10px] text-white/40 italic uppercase tracking-widest">
                  Note: Changes allowed once every 24h. No profanity.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
                  {username || `USER ${formatWallet(walletAddress)}`}
                </h1>
                {!isPublicView && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-50 hover:opacity-100" onClick={() => {
                    setNewName(username || "");
                    setNewAvatarUrl(avatarUrl || "");
                    setIsEditing(true);
                  }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[11px] font-black uppercase px-3 py-1 tracking-[0.2em] rounded-full italic shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              SENTINEL RANK
            </Badge>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2">
            <p className="text-white font-mono text-sm uppercase font-bold tracking-wider opacity-90">
              {isPublicView ? formatWallet(walletAddress) : walletAddress}
            </p>
            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-30 hover:opacity-100" onClick={copyToClipboard}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 gap-4 lg:min-w-[360px]">
        <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-primary/50 transition-all group/card shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Protocol Reputation</span>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black font-display text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">{reputationScore}</span>
            <Trophy className="w-5 h-5 text-primary opacity-50 group-hover/card:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-primary/50 transition-all group/card shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Network Rank</span>
            {rankChange === "up" && <ArrowUpRight className="w-5 h-5 text-primary animate-bounce-slow" />}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black font-display text-white">#{rank}</span>
            {rankChange === "up" && <span className="text-sm font-black text-primary font-display border border-primary/30 bg-primary/20 px-2 rounded-lg">+3</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
