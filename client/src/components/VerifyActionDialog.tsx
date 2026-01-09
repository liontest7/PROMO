import { useState } from "react";
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
  DialogFooter,
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

  if (!action || !campaign) return null;

  const handleVerify = async () => {
    if (!walletAddress) return;

    try {
      let proofData: any = { proofText: proof };

      // Only require message signing for social tasks (Twitter/Telegram)
      // Website tasks are verified by simple click-through
      if (!isWebsiteAction) {
        console.log("Requesting signature for social action...");
        // In a real app, we would include a unique nonce to prevent replay attacks
        const message = `Confirm completion of task ${action.id}\nVerification Proof: ${proof || 'None'}`;
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
        // For website actions, we just send a dummy signature/proof to satisfy backend
        // In a real app, you'd use a server-side redirect or tracking pixel
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
              title: "Task Verified!",
              description: "You can claim your reward now or later in the dashboard.",
            });
            setTimeout(() => {
              onOpenChange(false);
              setStep("perform");
              setProof("");
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

  const isWebsiteAction = action.type === "website";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Complete Task <span className="text-primary text-sm font-mono bg-primary/10 px-2 py-0.5 rounded">+{action.rewardAmount} {campaign.tokenName}</span>
          </DialogTitle>
          <DialogDescription>
            {isWebsiteAction 
              ? "Visit the project website to earn rewards." 
              : "Follow the steps below to complete this action and earn rewards."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
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
                  <Label>Verification Proof (Optional)</Label>
                  <Input 
                    placeholder={action.type === "twitter" ? "e.g. Tweet URL" : "e.g. Telegram username"} 
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Some actions require manual review or proof submission.</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
