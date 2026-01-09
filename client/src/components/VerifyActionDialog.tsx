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
  const [holdingStatus, setHoldingStatus] = useState<{ status: string; remaining?: number } | null>(null);

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
              if (data.status === 'ready' || data.status === 'verified') {
                setStep("success");
                toast({
                  title: "Eligibility Verified!",
                  description: "You are eligible to claim your reward.",
                });
              } else if (data.status === 'holding') {
                setHoldingStatus({ status: 'holding' });
                toast({
                  title: "Holding Started",
                  description: "Your holding period has begun. Stay tuned!",
                });
              } else if (data.status === 'waiting') {
                setHoldingStatus({ status: 'waiting', remaining: data.remaining });
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
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 text-center space-y-3">
                  {holdingStatus.status === 'holding' ? (
                    <p className="text-sm">Holding period started! Check back later.</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-yellow-500">Not Eligible Yet</p>
                      <p className="text-xs text-muted-foreground">
                        You need to hold {campaign.minHoldingAmount} {campaign.tokenName} for {campaign.minHoldingDuration} days.
                      </p>
                      {holdingStatus.remaining !== undefined && (
                        <p className="text-[10px] uppercase tracking-widest font-black text-primary">
                          {holdingStatus.remaining.toFixed(1)} Days Remaining
                        </p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 gap-2 border-primary/20 hover:bg-primary/10"
                        asChild
                      >
                        <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="w-3 h-3" /> Buy {campaign.tokenName}
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">Holder Verification</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Hold {campaign.minHoldingAmount} {campaign.tokenName} for {campaign.minHoldingDuration} days. 
                      Click below to verify your balance.
                    </p>
                  </div>
                  <Button onClick={handleVerify} disabled={verifyMutation.isPending} className="w-full">
                    {verifyMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & Start Holding"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-[10px] text-muted-foreground"
                    asChild
                  >
                    <a href={`https://dexscreener.com/solana/${campaign.tokenAddress}`} target="_blank" rel="noreferrer">
                      View on DEXScreener
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
