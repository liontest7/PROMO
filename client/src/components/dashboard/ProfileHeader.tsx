import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X, Trophy, Copy, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_CONFIG } from "@shared/config";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const xpInLevel = reputationScore % 100;

  const getLabelColor = (label: string) => {
    if (label === "LEGEND") return "bg-purple-500/20 text-purple-500 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]";
    if (label === "ELITE") return "bg-red-500/20 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]";
    if (label === "SENTINEL") return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]";
    return "bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]";
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[2rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 flex-1">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary via-primary/60 to-primary/20 p-1 shadow-[0_0_30px_rgba(34,197,94,0.3)] relative">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-2 border-background">
              <Avatar className="h-full w-full">
                <AvatarImage 
                  src={avatarUrl || PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                />
                <AvatarFallback className="bg-primary/20 text-primary font-black text-3xl">
                  {username ? username[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground font-black text-[10px] rounded-full border-2 border-background shadow-xl uppercase tracking-widest">
            LVL {levelInfo.lvl}
          </Badge>
        </div>
        
        <div className="text-center md:text-left space-y-3 flex-1">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="New Username"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/5 border-white/10 text-lg font-display font-black italic uppercase tracking-tighter w-48 h-8"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave} disabled={mutation.isPending}>
                    <Check className="w-4 h-4 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <Input 
                  placeholder="Avatar Image URL"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="bg-white/5 border-white/10 h-7 text-[10px] w-48"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
                  {username && !username.startsWith('USER ') ? username : (walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'U')}
                </h1>
                {!isPublicView && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 opacity-50 hover:opacity-100" onClick={() => {
                    setNewName(username || "");
                    setNewAvatarUrl(avatarUrl || "");
                    setIsEditing(true);
                  }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            )}
            <Badge className={cn(
              "text-[10px] font-black uppercase px-2 py-0.5 tracking-[0.1em] rounded-full italic border",
              getLabelColor(levelInfo.label)
            )}>
              {levelInfo.label}
            </Badge>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-1.5">
            <p className="text-white/70 font-mono text-xs uppercase font-bold tracking-wider">
              {isPublicView ? formatWallet(walletAddress) : walletAddress}
            </p>
            <Button size="icon" variant="ghost" className="h-5 w-5 opacity-30 hover:opacity-100" onClick={copyToClipboard}>
              <Copy className="w-2.5 h-2.5" />
            </Button>
          </div>

          <div className="max-w-md w-full space-y-2 mt-4 mx-auto md:mx-0">
            <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white">
              <span>REPUTATION PROGRESS</span>
              <span>{xpInLevel} / 100 XP</span>
            </div>
            <Progress value={xpInLevel} className="h-2.5 bg-white/10" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-row items-center justify-center gap-12 px-2">
        <div className="flex flex-col items-center lg:items-start">
          <div className="text-white font-black text-sm tracking-widest mb-1 opacity-90">
            REP SCORE
          </div>
          <div className="text-5xl font-display font-black tracking-tighter italic uppercase text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            {reputationScore}
          </div>
        </div>

        <div className="w-px h-16 bg-white/10" />

        <div className="flex flex-col items-center lg:items-start">
          <div className="flex items-center gap-2 text-white font-black text-sm tracking-widest mb-1 opacity-90">
            <Trophy className="w-5 h-5 text-yellow-500" />
            WEEKLY RANK
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 opacity-80 hover:opacity-100">
                    <Info className="w-4 h-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-background border-white/20 text-[10px] font-bold p-2 text-white">
                  Rank based on weekly task completion points
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-5xl font-display font-black tracking-tighter italic uppercase text-white">
            #{rank}
          </div>
        </div>
      </div>
    </div>
  );
}
