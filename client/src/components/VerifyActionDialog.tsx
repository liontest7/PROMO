import { useState, useEffect } from "react";
import { type Action, type Campaign } from "@shared/schema";
import { useVerifyAction } from "@/hooks/use-executions";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { CONFIG } from "@shared/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";

interface VerifyActionDialogProps {
  action: Action | null;
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyActionDialog({ action, campaign, open, onOpenChange }: VerifyActionDialogProps) {
  const verifyMutation = useVerifyAction();
  const { walletAddress, isConnected, connect } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (open && !isConnected) {
      onOpenChange(false);
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to verify tasks.",
        variant: "destructive"
      });
      connect('user');
    }
  }, [open, isConnected]);
  const [proof, setProof] = useState("");
  const [step, setStep] = useState<"perform" | "verify" | "success">("perform");
  const [holdingStatus, setHoldingStatus] = useState<{ 
    status: string; 
    remaining?: number;
    currentBalance?: number;
    requiredBalance?: number;
    holdDuration?: number;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("perform");
      setProof("");
      setHoldingStatus(null);
    }
  }, [open]);

  if (!action || !campaign) return null;

  const isWebsiteAction = action.type === "website";
  const isHolderCampaign = campaign.campaignType === 'holder_qualification';

  const formatDuration = (days: number) => {
    if (days < 0) return "0s";
    const totalSeconds = Math.floor(days * 24 * 60 * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleVerify = async () => {
    if (!walletAddress) return;

    try {
      let proofData: any = { proofText: proof };

      if (isHolderCampaign) {
        verifyMutation.mutate(
          { 
            actionId: campaign.id,
            userWallet: walletAddress, 
            proof: JSON.stringify({ type: 'holder_verification', wallet: walletAddress }) 
          },
          {
            onSuccess: (data: any) => {
              setHoldingStatus({
                status: data.status,
                remaining: data.remaining,
                currentBalance: data.currentBalance,
                requiredBalance: data.requiredBalance,
                holdDuration: data.holdDuration
              });

              if (data.status === 'ready' || data.status === 'verified') {
                setStep("success");
                toast({
                  title: "Eligibility Verified!",
                  description: "You are eligible to claim your reward.",
                });
                setTimeout(() => {
                  onOpenChange(false);
                }, 2000);
              } else if (data.status === 'holding') {
                toast({
                  title: "Holding Started",
                  description: "Your holding period has begun. Stay tuned!",
                });
              } else if (data.status === 'insufficient') {
                toast({
                  title: "Insufficient Balance",
                  description: `You need at least ${data.requiredBalance} ${campaign.tokenName}.`,
                  variant: "destructive"
                });
              }
            }
          }
        );
        return;
      }

      if (!isWebsiteAction) {
        if (!proof || proof.length < 3) {
          throw new Error("Please provide a valid social handle or proof URL for verification.");
        }
        
        console.log("Requesting signature for social action...");
        const message = `Confirm completion of task ${action.id}\nHandle: ${proof}\nVerification Proof: ${proof}`;
        const encodedMessage = new TextEncoder().encode(message);
        
        const solanaInstance = (window as any).phantom?.solana || (window as any).solana;
        if (solanaInstance && solanaInstance.signMessage) {
          const signedMessage = await solanaInstance.signMessage(encodedMessage, "utf8");
          proofData.signature = signedMessage.signature;
          proofData.publicKey = signedMessage.publicKey.toString();
        } else {
          throw new Error("Wallet does not support message signing");
        }
      } else {
        proofData.isWebsiteClick = true;
        proofData.signature = "click-verified"; 
      }
      
      verifyMutation.mutate(
        { 
          actionId: action.id, 
          userWallet: walletAddress, 
          proof: JSON.stringify(proofData) 
        },
        {
          onSuccess: () => {
            setStep("success");
            toast({
              title: "Action Verified!",
              description: "Go to your dashboard to claim your rewards in one batch.",
            });
            setTimeout(() => {
              onOpenChange(false);
            }, 2000);
          }
        }
      );
    } catch (err: any) {
      console.error("Verification error:", err);
      toast({
        title: "Verification Failed",
        description: err.message || "You must sign the message to verify your action.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isHolderCampaign ? "Verify Eligibility" : <>Complete Task <span className="text-primary text-sm font-mono bg-primary/10 px-2 py-0.5 rounded">+{action.rewardAmount} {campaign.tokenName}</span></>}
          </DialogTitle>
          <DialogDescription>
            {isHolderCampaign 
              ? `Hold ${campaign.minHoldingAmount} ${campaign.tokenName} for ${campaign.minHoldingDuration} days to claim.`
              : (isWebsiteAction 
                ? "Visit the project website to earn rewards." 
                : "Follow the steps below to complete this action and earn rewards.")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {isHolderCampaign ? (
            <div className="space-y-6">
              {holdingStatus ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Your Balance</p>
                      <p className={cn(
                        "text-lg font-black font-mono",
                        (holdingStatus.currentBalance || 0) >= (holdingStatus.requiredBalance || 0) ? "text-primary" : "text-destructive"
                      )}>
                        {holdingStatus.currentBalance?.toLocaleString()} ${campaign.tokenName}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Required</p>
                      <p className="text-lg font-black font-mono text-white">
                        {holdingStatus.requiredBalance?.toLocaleString()} ${campaign.tokenName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-white/30">Holding Duration</span>
                      <span className="text-primary font-black">
                        {holdingStatus.holdDuration !== undefined ? formatDuration(holdingStatus.holdDuration) : "0s"} / {campaign.minHoldingDuration} DAYS
                      </span>
                    </div>
                    <div className="relative h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary),0.6)]" 
                        style={{ width: `${Math.min(100, (holdingStatus.holdDuration || 0) / (campaign.minHoldingDuration || 1) * 100)}%` }}
                      />
                    </div>
                    {holdingStatus.remaining !== undefined && holdingStatus.status === 'holding' && (
                      <p className="text-[10px] text-white/20 text-center font-black uppercase tracking-widest">
                        {formatDuration(holdingStatus.remaining)} remaining for rewards
                      </p>
                    )}
                  </div>

                  {holdingStatus.status === 'insufficient' && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        BUY FROM
                        <div className="h-[1px] flex-1 bg-white/5" />
                      </div>
                      <div className="flex justify-center gap-4">
                        <a href={`https://pump.fun/${campaign.tokenAddress}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all">
                          <img src={CONFIG.ui.walletIcons.pumpfun} className="w-6 h-6 rounded-sm" />
                        </a>
                        <a href={`https://jup.ag/swap/SOL-${campaign.tokenAddress}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#BEF32C]/20 hover:border-[#BEF32C]/40 transition-all">
                          <img src={CONFIG.ui.walletIcons.jupiter} className="w-6 h-6" />
                        </a>
                        <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                          <img src={CONFIG.ui.walletIcons.dexscreener} className="w-6 h-6 rounded-sm grayscale group-hover:grayscale-0" />
                        </a>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleVerify} 
                    disabled={verifyMutation.isPending} 
                    className="w-full h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest rounded-2xl"
                  >
                    {verifyMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    ) : (
                      holdingStatus.status === 'ready' ? "CLAIM REWARDS" : "REFRESH STATUS"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Min. Required</p>
                      <p className="text-sm font-black text-white font-mono">{campaign.minHoldingAmount} ${campaign.tokenName}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Hold Period</p>
                      <p className="text-sm font-black text-white font-mono">{campaign.minHoldingDuration} Days</p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-white/20 italic leading-relaxed text-center font-black uppercase tracking-widest">
                        Rewards are distributed after the holding <br/> period is successfully completed.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleVerify} 
                    disabled={verifyMutation.isPending} 
                    className="w-full h-14 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                  >
                    {verifyMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SCANNING WALLET...</>
                    ) : "VERIFY & START"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {step === "perform" && (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Step 1: Perform Action</p>
                      <p className="text-xs text-muted-foreground mt-1">{action.title}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        window.open(action.url, '_blank');
                        setStep("verify");
                      }}
                    >
                      Go <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {step === "verify" && (
                <div className="space-y-4 animate-in slide-in-from-right">
                  {!isWebsiteAction && (
                    <div className="space-y-2">
                      <Label>Verification Proof (Username or Screenshot Link)</Label>
                      <Input 
                        placeholder={action.type === "twitter" ? "e.g. @username or Link to screenshot" : "e.g. @username or Link to screenshot"} 
                        value={proof}
                        onChange={(e) => setProof(e.target.value)}
                      />
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-[11px] text-blue-400 leading-relaxed">
                          <strong>Verification Info:</strong> We use a community-driven verification system to keep fees low. Please provide your username or a link to a screenshot (via Imgur, etc.) as proof.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">Final Step: Confirm Completion</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {isWebsiteAction 
                        ? "Click the button below to confirm you have visited the website and claim your rewards."
                        : "Sign a secure message with your wallet to confirm you've completed the task."}
                    </p>
                  </div>

                  <Button onClick={handleVerify} disabled={verifyMutation.isPending} className="w-full">
                    {verifyMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    ) : (
                      isWebsiteAction ? "Confirm & Claim Rewards" : "Verify & Claim Rewards"
                    )}
                  </Button>
                </div>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-4 text-center animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Success!</h3>
                  <p className="text-muted-foreground text-sm">Action verified. Rewards will be credited shortly.</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
