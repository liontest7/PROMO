import { useState } from "react";
import { type Action, type Campaign } from "@shared/schema";
import { useVerifyAction } from "@/hooks/use-executions";
import { useWallet } from "@/hooks/use-wallet";
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
  const { verify, isPending } = useVerifyAction();
  const { walletAddress } = useWallet();
  const [proof, setProof] = useState("");
  const [step, setStep] = useState<"perform" | "verify" | "success">("perform");

  if (!action || !campaign) return null;

  const handleVerify = () => {
    if (!walletAddress) return;

    // Simulate verification delay
    verify(
      { actionId: action.id, userWallet: walletAddress, proof },
      {
        onSuccess: () => {
          setStep("success");
          setTimeout(() => {
            onOpenChange(false);
            setStep("perform");
            setProof("");
          }, 2000);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Complete Task <span className="text-primary text-sm font-mono bg-primary/10 px-2 py-0.5 rounded">+{action.rewardAmount} {campaign.tokenName}</span>
          </DialogTitle>
          <DialogDescription>
            Follow the steps below to complete this action and earn rewards.
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
              <div className="space-y-2">
                <Label>Verification Proof (Optional)</Label>
                <Input 
                  placeholder="e.g. Tweet URL or Telegram username" 
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Some actions require manual review or proof submission.</p>
              </div>
              <Button onClick={handleVerify} disabled={isPending} className="w-full">
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                ) : (
                  "Submit for Verification"
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
