import { useState, useEffect } from "react";
import { type Action, type Campaign } from "@shared/schema";
import { useVerifyAction } from "@/hooks/use-executions";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
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
  const { walletAddress } = useWallet();
  const { toast } = useToast();
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
            proof: JSON.stringify({ type: 'holder_verification' }) 
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
            <div className="space-y-4">
              {holdingStatus ? (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-center space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Your Balance</p>
                      <p className={cn(
                        "text-lg font-bold",
                        (holdingStatus.currentBalance || 0) >= (holdingStatus.requiredBalance || 0) ? "text-primary" : "text-destructive"
                      )}>
                        {holdingStatus.currentBalance?.toLocaleString()} {campaign.tokenName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Required</p>
                      <p className="text-lg font-bold">
                        {holdingStatus.requiredBalance?.toLocaleString()} {campaign.tokenName}
                      </p>
                    </div>
                  </div>

                  {holdingStatus.status === 'insufficient' ? (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-xs text-destructive font-bold">Ineligible: Insufficient Tokens</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                          You need to acquire at least {(holdingStatus.requiredBalance || 0) - (holdingStatus.currentBalance || 0)} more {campaign.tokenName} to qualify.
                        </p>
                      </div>
                      <Button variant="default" className="w-full h-12 bg-primary hover:bg-primary/90 font-black gap-2" asChild>
                        <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-4 h-4" /> BUY {campaign.tokenName} NOW
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-xs text-primary font-bold">
                          {holdingStatus.status === 'holding' ? "Holding Started!" : "Still Holding..."}
                        </p>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground uppercase font-bold">Duration</span>
                            <span className="text-primary font-black">
                              {holdingStatus.holdDuration !== undefined ? formatDuration(holdingStatus.holdDuration) : "0s"} / {campaign.minHoldingDuration} DAYS
                            </span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, (holdingStatus.holdDuration || 0) / (campaign.minHoldingDuration || 1) * 100)}%` }}
                            />
                          </div>
                          {holdingStatus.remaining !== undefined && (
                            <p className="text-[9px] text-muted-foreground text-center font-bold uppercase tracking-wider">
                              {formatDuration(holdingStatus.remaining)} remaining for rewards
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">
                        Rewards will be available for claiming once the 24h holding period is complete.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">Holder Requirements</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Minimum Hold:</span>
                        <span className="font-bold">{campaign.minHoldingAmount} {campaign.tokenName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Holding Period:</span>
                        <span className="font-bold">{campaign.minHoldingDuration} Days</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed border-t border-white/5 pt-2 italic">
                      Verifying your balance will record a snapshot of your wallet and start the reward timer.
                    </p>
                  </div>
                  <Button onClick={handleVerify} disabled={verifyMutation.isPending} className="w-full h-12 bg-primary hover:bg-primary/90 font-black">
                    {verifyMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SCANNING WALLET...</> : "VERIFY & START HOLDING"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-[10px] text-muted-foreground font-bold hover:text-primary transition-colors"
                    asChild
                  >
                    <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      VIEW PROJECT ON DEXSCREENER
                    </a>
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
