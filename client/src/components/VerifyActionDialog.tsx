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
import { Loader2, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

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

  const [proof, setProof] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [step, setStep] = useState<"perform" | "verify" | "success">("perform");
  const [holdingStatus, setHoldingStatus] = useState<{ 
    status: string; 
    remaining?: number;
    currentBalance?: number;
    requiredBalance?: number;
    holdDuration?: number;
  } | null>(null);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "0x4AAAAAACLuMcElS7ceqnxe";

  useEffect(() => {
    if (open && !isConnected) {
      onOpenChange(false);
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to verify tasks.",
        variant: "destructive"
      });
      setTimeout(() => connect('user'), 100);
    }
  }, [open, isConnected, onOpenChange, toast, connect]);

  useEffect(() => {
    if (!open) {
      setStep("perform");
      setProof("");
      setHoldingStatus(null);
      setTurnstileToken(null);
    }
  }, [open]);

  if (!action || !campaign) return null;

  const isWebsiteAction = action.type === "website";
  const isHolderCampaign = campaign.campaignType === 'holder_qualification';

  const handleVerify = async () => {
    if (!walletAddress) return;
    if (!turnstileToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the security check widget below.",
        variant: "destructive"
      });
      return;
    }

    try {
      let proofData: any = { proofText: proof };

      if (isHolderCampaign) {
        verifyMutation.mutate(
          { 
            actionId: campaign.id,
            userWallet: walletAddress, 
            proof: JSON.stringify({ type: 'holder_verification', wallet: walletAddress }),
            // @ts-ignore
            turnstileToken 
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
              }
            }
          }
        );
        return;
      }

      if (!isWebsiteAction) {
        if (!proof || proof.length < 3) {
          throw new Error("Please provide valid proof.");
        }
        
        const message = `Confirm task ${action.id}\nProof: ${proof}`;
        const encodedMessage = new TextEncoder().encode(message);
        const solanaInstance = (window as any).phantom?.solana || (window as any).solana;
        
        if (solanaInstance?.signMessage) {
          const signedMessage = await solanaInstance.signMessage(encodedMessage, "utf8");
          proofData.signature = Array.from(signedMessage.signature).map((b: any) => b.toString(16).padStart(2, '0')).join('');
          proofData.publicKey = signedMessage.publicKey.toString();
        } else {
          throw new Error("Wallet signing not supported");
        }
      } else {
        proofData.isWebsiteClick = true;
        proofData.signature = "click-verified"; 
      }
      
      verifyMutation.mutate(
        { 
          actionId: action.id, 
          userWallet: walletAddress, 
          proof: JSON.stringify(proofData),
          // @ts-ignore
          turnstileToken
        },
        {
          onSuccess: () => {
            setStep("success");
            toast({ title: "Action Verified!" });
            if (onSuccess) onSuccess(action.id);
            setTimeout(() => onOpenChange(false), 2000);
          }
        }
      );
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black uppercase text-white">
            {isHolderCampaign ? "Eligibility Check" : "Complete Task"}
          </DialogTitle>
          <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            Security verification required
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-6">
          {isHolderCampaign ? (
            <div className="space-y-6 text-center">
              {!holdingStatus && (
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <ShieldCheck className="w-12 h-12 text-primary mx-auto opacity-20 mb-4" />
                  <p className="text-sm font-medium text-white/60">Verify your $SPRM holdings on the blockchain</p>
                </div>
              )}
              
              <div className="flex flex-col items-center justify-center py-2 gap-4">
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Step 1: Anti-Bot Check</p>
                <div className="min-h-[65px] flex items-center justify-center w-full bg-white/5 rounded-xl border border-white/5 p-2">
                  <Turnstile
                    siteKey={siteKey}
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: "dark", size: "normal" }}
                  />
                </div>
              </div>

              <Button 
                onClick={handleVerify} 
                disabled={verifyMutation.isPending || !turnstileToken} 
                className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                {verifyMutation.isPending ? <Loader2 className="animate-spin" /> : "START VERIFICATION"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {step === "perform" && (
                <Button className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest gap-3" onClick={() => { window.open(action.url, '_blank'); setStep("verify"); }}>
                  Open Task <ExternalLink className="w-5 h-5" />
                </Button>
              )}
              {step === "verify" && (
                <div className="space-y-6">
                  {!isWebsiteAction && (
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-white/40">Proof (Username)</Label>
                      <Input placeholder="@username" value={proof} onChange={(e) => setProof(e.target.value)} className="bg-white/5 border-white/10 h-12" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Security Verification</p>
                    <div className="min-h-[65px] flex items-center justify-center w-full bg-white/5 rounded-xl border border-white/5 p-2">
                      <Turnstile
                        siteKey={siteKey}
                        onSuccess={(token) => setTurnstileToken(token)}
                        options={{ theme: "dark" }}
                      />
                    </div>
                  </div>

                  <Button onClick={handleVerify} disabled={verifyMutation.isPending || !turnstileToken} className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest">
                    {verifyMutation.isPending ? <Loader2 className="animate-spin" /> : "CONFIRM"}
                  </Button>
                </div>
              )}
              {step === "success" && (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-xl font-black text-white uppercase">Verified!</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
