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
import { cn } from "@/lib/utils";

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
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats", walletAddress] });
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

  const getLevelInfo = (score: number) => {
    const lvl = Math.floor(Number(score) / 100) + 1;
    let label = "INITIATE";
    if (lvl >= 2) label = "SENTINEL";
    if (lvl >= 5) label = "ELITE";
    if (lvl >= 10) label = "LEGEND";
    return { lvl, label };
  };

  const levelInfo = getLevelInfo(reputationScore);

  const getLabelColor = (label: string) => {
    if (label === "LEGEND") return "bg-purple-500/20 text-purple-500 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]";
    if (label === "ELITE") return "bg-red-500/20 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    if (label === "SENTINEL") return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
    return "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-[2rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-primary/60 to-primary/20 p-1 shadow-[0_0_30px_rgba(34,197,94,0.3)] relative">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-2 border-background">
              <Avatar className="h-full w-full">
                <AvatarImage 
                  src={avatarUrl || PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                />
                <AvatarFallback className="bg-primary/20 text-primary font-black text-xl">
                  {username ? username[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground font-black text-[8px] rounded-full border-2 border-background shadow-xl uppercase tracking-widest">
            LVL {levelInfo.lvl}
          </Badge>
        </div>
        
        <div className="text-center md:text-left space-y-0.5">
          <div className="flex flex-col md:flex-row items-center gap-2">
            {isEditing ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="New Username"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/5 border-white/10 text-base font-display font-black italic uppercase tracking-tighter w-40 h-7"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={mutation.isPending}>
                    <Check className="w-3 h-3 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditing(false)}>
                    <X className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
                <Input 
                  placeholder="Avatar Image URL"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="bg-white/5 border-white/10 h-6 text-[9px] w-40"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
                  {username && !username.startsWith('USER ') ? username : (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'U')}
                </h1>
                {!isPublicView && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => {
                    setNewName(username || "");
                    setNewAvatarUrl(avatarUrl || "");
                    setIsEditing(true);
                  }}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
            <Badge className={cn(
              "text-[9px] font-black uppercase px-2 py-0.5 tracking-[0.1em] rounded-full italic border",
              getLabelColor(levelInfo.label)
            )}>
              {levelInfo.label}
            </Badge>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-1.5">
            <p className="text-white/70 font-mono text-[10px] uppercase font-bold tracking-wider">
              {isPublicView ? formatWallet(walletAddress) : walletAddress}
            </p>
            <Button size="icon" variant="ghost" className="h-4 w-4 opacity-30 hover:opacity-100" onClick={copyToClipboard}>
              <Copy className="w-2 h-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
