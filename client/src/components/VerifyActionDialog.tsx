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
import { Loader2, CheckCircle, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";

interface VerifyActionDialogProps {
  action: Action | null;
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (actionId: number) => void;
}

export function VerifyActionDialog({ action, campaign, open, onOpenChange, onSuccess }: VerifyActionDialogProps) {
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
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (d > 0) return `${d}d ${h}h ${m}m`;
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
                if (onSuccess) onSuccess(0);
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
            if (onSuccess) onSuccess(action.id);
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
      <DialogContent 
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden p-0"
      >
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white">
            {isHolderCampaign ? "Eligibility Check" : <>Complete Task <span className="text-primary text-sm font-mono bg-primary/10 px-2 py-0.5 rounded">+{action.rewardAmount} {campaign.tokenName}</span></>}
          </DialogTitle>
          <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            {isHolderCampaign 
              ? `Verification for ${campaign.tokenName} rewards`
              : (isWebsiteAction 
                ? "Visit project website" 
                : "Social task verification")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-6">
          {isHolderCampaign ? (
            <div className="space-y-6">
              {holdingStatus ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Your Wallet</p>
                      <p className={cn(
                        "text-xl font-black font-mono leading-none",
                        (holdingStatus.currentBalance || 0) >= (holdingStatus.requiredBalance || 0) ? "text-primary" : "text-destructive"
                      )}>
                        {holdingStatus.currentBalance?.toLocaleString()} <span className="text-[10px] opacity-40 font-sans">${campaign.tokenName}</span>
                      </p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 shadow-inner">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Required</p>
                      <p className="text-xl font-black font-mono text-white leading-none">
                        {holdingStatus.requiredBalance?.toLocaleString()} <span className="text-[10px] opacity-40 font-sans">${campaign.tokenName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Holding Progress</p>
                        <p className="text-2xl font-black text-white">
                          {holdingStatus.holdDuration !== undefined ? Math.floor((holdingStatus.holdDuration || 0) / (campaign.minHoldingDuration || 1) * 100) : 0}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Hold Time</p>
                        <p className="text-sm font-black text-primary">
                          {holdingStatus.holdDuration !== undefined ? formatDuration(holdingStatus.holdDuration) : "0s"} / {campaign.minHoldingDuration} {Number(campaign.minHoldingDuration) === 1 ? 'DAY' : 'DAYS'}
                        </p>
                      </div>
                    </div>
                    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary transition-all duration-1000 shadow-[0_0_20px_rgba(var(--primary),0.6)]" 
                        style={{ width: `${Math.min(100, (holdingStatus.holdDuration || 0) / (campaign.minHoldingDuration || 1) * 100)}%` }}
                      />
                    </div>
                    {holdingStatus.remaining !== undefined && holdingStatus.status === 'holding' && (
                      <div className="flex items-center gap-2 justify-center py-2 bg-primary/5 rounded-xl border border-primary/10">
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                          {formatDuration(holdingStatus.remaining)} UNTIL ELIGIBLE
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-widest">
                      <div className="h-[1px] flex-1 bg-white/5" />
                      Buy ${campaign.tokenName}
                      <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div className="flex justify-center gap-6">
                      <a href={`https://pump.fun/${campaign.tokenAddress}`} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#FF8C00]/20 hover:border-[#FF8C00]/40 transition-all shadow-xl group">
                        <img src={CONFIG.ui.walletIcons.pumpfun} className="w-7 h-7 rounded-sm transition-transform group-hover:scale-110" />
                      </a>
                      <a href={`${CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER}${campaign.tokenAddress}`} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#BEF32C]/20 hover:border-[#BEF32C]/40 transition-all shadow-xl group">
                        <img src={CONFIG.ui.walletIcons.jupiter} className="w-7 h-7 transition-transform group-hover:scale-110" />
                      </a>
                      <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all shadow-xl group">
                        <img src={CONFIG.ui.walletIcons.dexscreener} className="w-7 h-7 rounded-sm transition-transform group-hover:scale-110" />
                      </a>
                    </div>
                  </div>

                  <Button 
                    onClick={handleVerify} 
                    disabled={verifyMutation.isPending} 
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/20 transition-all active:scale-95"
                  >
                    {verifyMutation.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> SCANNING...</>
                    ) : (
                      holdingStatus.status === 'ready' ? "CLAIM REWARDS" : "REFRESH STATUS"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="w-32 h-32" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">Requirement</p>
                        <p className="text-lg font-black text-white font-mono">{Number(campaign.minHoldingAmount).toLocaleString()} ${campaign.tokenName}</p>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">Hold Duration</p>
                        <p className="text-lg font-black text-white font-mono">{campaign.minHoldingDuration} Days</p>
                      </div>
                      <p className="text-[11px] text-white/30 italic leading-relaxed text-center font-bold uppercase tracking-widest pt-2">
                        Proof of holding is verified <br/> directly on the blockchain
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleVerify} 
                    disabled={verifyMutation.isPending} 
                    className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/40 transition-all active:scale-95"
                  >
                    {verifyMutation.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> AUTHENTICATING...</>
                    ) : "START VERIFICATION"}
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
