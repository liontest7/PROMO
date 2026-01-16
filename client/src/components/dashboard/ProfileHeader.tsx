import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_CONFIG } from "@shared/config";

interface ProfileHeaderProps {
  walletAddress: string;
  username?: string;
  level: number;
  reputationScore: number;
  rank: number;
  rankChange: "up" | "stable";
  isPublicView?: boolean;
}

export function ProfileHeader({ 
  walletAddress, 
  username,
  level, 
  reputationScore, 
  rank, 
  rankChange,
  isPublicView = false
}: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(username || "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("PATCH", `/api/users/${walletAddress}/username`, { username: name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", walletAddress] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update username",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (newName.trim()) {
      mutation.mutate(newName.trim());
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-60" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-500/60 to-emerald-500/20 p-1.5 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden border-4 border-background">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-emerald-500/20 text-emerald-500 font-black text-4xl">
                  {username ? username[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-emerald-500 text-black font-black text-xs rounded-full border-4 border-background shadow-xl uppercase tracking-widest">
            LVL {level}
          </Badge>
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-white/5 border-white/10 text-xl font-black italic uppercase tracking-tighter w-48 h-8"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave} disabled={mutation.isPending}>
                  <Check className="w-4 h-4 text-emerald-500" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-sm">
                  {username || `USER ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
                </h1>
                {!isPublicView && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-50 hover:opacity-100" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            <Badge className="bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500/40 text-[10px] font-black uppercase px-3 py-0.5 tracking-widest rounded-lg">PLATINUM NODE</Badge>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[11px] bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">Protocol Status: Active & Verified</p>
            <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-[9px] font-black uppercase px-2 py-0.5 tracking-[0.2em] rounded-full italic shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              SENTINEL RANK
            </Badge>
          </div>
          {username && (
            <p className="text-white/20 font-mono text-[10px] uppercase">
              {walletAddress}
            </p>
          )}
        </div>
      </div>
      
      <div className="relative z-10 grid grid-cols-2 gap-4 lg:min-w-[360px]">
        <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-emerald-500/50 transition-all group/card shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Protocol Reputation</span>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black font-display text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">{reputationScore}</span>
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex flex-col p-6 rounded-[2rem] bg-black/40 border border-white/10 hover:border-emerald-500/50 transition-all group/card shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Network Rank</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black font-display text-white">#{rank}</span>
            {rankChange === "up" && <span className="text-emerald-500 text-xs font-black">▲</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
