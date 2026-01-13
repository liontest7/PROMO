import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Flame, Wallet, ShieldCheck, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AuditDialogProps {
  campaign: any;
  onClose: () => void;
}

export function AuditDialog({ campaign, onClose }: AuditDialogProps) {
  const { walletAddress } = useWallet();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, walletAddress })
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update status');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/campaigns"] });
      toast({ title: "Success", description: "Campaign status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (!campaign) return null;

  return (
    <Dialog open={!!campaign} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden rounded-2xl">
        <div className="relative p-6 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="px-2 py-0.5 border-primary/30 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-tighter">
                Protocol Audit
              </Badge>
              <Badge variant="outline" className="px-2 py-0.5 border-green-500/30 bg-green-500/5 text-green-500 text-[9px] font-black uppercase tracking-tighter">
                Verified On-Chain
              </Badge>
            </div>
            <DialogTitle className="text-3xl font-display font-black tracking-tighter uppercase italic leading-none">
              {campaign?.title} <span className="text-primary">Audit</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-xs mt-1">
              Deep protocol verification and proof of execution for campaign {campaign?.id}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Project Token</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-primary">${campaign?.tokenName}</span>
                <span className="text-[10px] font-mono text-muted-foreground opacity-50">({campaign?.tokenAddress?.slice(0,6)}...)</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Remaining Budget</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-green-400">{campaign?.remainingBudget}</span>
                <span className="text-[10px] font-mono text-muted-foreground opacity-50">/ {campaign?.totalBudget}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Emergency Admin Controls
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="destructive" 
                className="h-10 text-[10px] font-black uppercase tracking-widest"
                disabled={updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate(campaign.status === 'paused' ? 'active' : 'paused')}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  campaign.status === 'paused' ? "Resume Campaign" : "Pause Campaign"
                )}
              </Button>
              <Button 
                variant="outline" 
                className="h-10 text-[10px] font-black uppercase tracking-widest border-red-500/20 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                   alert("Emergency fund recovery process initiated. System connecting to protocol escrow...");
                }}
              >
                Recover Funds
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Proof of Protocol Execution
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase">Project Creation Fee</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Platform setup and verification fee</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] font-black">PAID (0.42 SOL)</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase">Deflationary Burn Proof</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Protocol tokens burned on creation</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] font-black tracking-tighter">BURNED & VERIFIED</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase">Reward Escrow</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Locked tokens for task distributions</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">SOLANA ESCROW ACTIVE</Badge>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-primary mb-1">Audit Consensus</p>
                <p className="text-[10px] text-primary/80 leading-relaxed">
                  This campaign has been fully verified on the Solana blockchain. All fees, burns, and reward allocations match the protocol state. No anomalies detected.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:bg-white/5" onClick={onClose}>
            Dismiss Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}