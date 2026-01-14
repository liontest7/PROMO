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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, ExternalLink, Info } from "lucide-react";
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
  const [isVerifying, setIsVerifying] = useState(false);
  const [holdingStatus, setHoldingStatus] = useState<{ 
    status: string; 
    remaining?: number;
    currentBalance?: number;
    requiredBalance?: number;
    holdDuration?: number;
    error?: string;
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
      setIsVerifying(false);
    }
  }, [open]);

  const isHolderCampaign = campaign?.campaignType === 'holder_qualification';

  const handleVerify = async (isAutoFetch: boolean = false) => {
    if (!walletAddress || !campaign) return;
    
    if (!isAutoFetch && !turnstileToken && (isHolderCampaign || step === "verify")) {
      toast({
        title: "Verification Required",
        description: "Please complete the security check.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isHolderCampaign) {
        verifyMutation.mutate(
          { 
            actionId: campaign.id,
            userWallet: walletAddress, 
            proof: JSON.stringify({ type: 'holder_verification', wallet: walletAddress, isAutoFetch: !!isAutoFetch }),
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
                holdDuration: data.holdDuration,
                error: data.error
              });

              if (data.error) {
                toast({
                  title: "Protection Check Failed",
                  description: data.error,
                  variant: "destructive"
                });
              }

              if (!isAutoFetch && (data.status === 'ready' || data.status === 'verified')) {
                setStep("success");
                toast({
                  title: "Eligibility Verified!",
                  description: "You are eligible to claim your reward.",
                });
                if (onSuccess) onSuccess(0);
                setTimeout(() => onOpenChange(false), 2000);
              }
            }
          }
        );
        return;
      }

      if (!action) return;
      
      // Twitter API Verification
      if (action.type === 'twitter') {
        setIsVerifying(true);
        try {
          const verifyRes = await fetch("/api/twitter/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              actionId: action.id,
              userWallet: walletAddress,
              handle: proof
            })
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            throw new Error(verifyData.message || "Twitter verification failed. Make sure you followed/retweeted.");
          }
        } finally {
          setIsVerifying(false);
        }
      }

      const isWebsiteAction = action.type === "website";
      let proofData: any = { proofText: proof, socialVerified: action.type === 'twitter' };

      if (!isWebsiteAction) {
        if (!proof || proof.length < 3) {
          throw new Error("Please provide valid proof.");
        }
        
        const message = `Confirm task ${action.id}\nProof: ${proof}`;
        const encodedMessage = new TextEncoder().encode(message);
        const solanaInstance = (window as any).phantom?.solana || (window as any).solana;
        
        if (solanaInstance?.signMessage) {
          const signedMessage = await solanaInstance.signMessage(encodedMessage, "utf8");
          proofData.signature = Array.from(signedMessage.signature).map((b: any) => (b as number).toString(16).padStart(2, '0')).join('');
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
          onSuccess: (data: any) => {
            if (data.error) {
              toast({
                title: "Protection Check Failed",
                description: data.error,
                variant: "destructive"
              });
              return;
            }
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

  useEffect(() => {
    if (open && isConnected && isHolderCampaign && campaign) {
      handleVerify(true);
    }
  }, [open, isConnected, isHolderCampaign, !!campaign]);

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/5 rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <DialogHeader className="p-8 pb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <DialogTitle className="text-2xl font-black uppercase text-white tracking-tighter">
                {isHolderCampaign ? "ELIGIBILITY CHECK" : "TASK VERIFICATION"}
              </DialogTitle>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                VERIFICATION FOR {campaign.tokenName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 pb-10 space-y-6">
          {isHolderCampaign ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-2">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest">Balance</p>
                  <p className={cn("text-3xl font-black font-mono tracking-tighter", (holdingStatus?.currentBalance || 0) >= Number(campaign.minHoldingAmount || 0) ? "text-primary" : "text-[#FF4B4B]")}>
                    {holdingStatus?.currentBalance?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-2">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest">Required</p>
                  <p className="text-3xl font-black font-mono text-white tracking-tighter">
                    {Number(campaign.minHoldingAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest">Progress</p>
                  <p className="text-[10px] font-black text-primary tracking-widest">
                    {holdingStatus?.status === 'verified' ? '100%' : '0%'}
                  </p>
                </div>
                <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000 flex items-center justify-center" 
                    style={{ width: holdingStatus?.status === 'verified' ? '100%' : '0%' }}
                  >
                    {holdingStatus?.status === 'verified' && (
                      <span className="text-[8px] font-black text-primary-foreground uppercase">Verified</span>
                    )}
                  </div>
                </div>
                {holdingStatus && (
                  <div className="pt-2 space-y-3 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest block">Hold Required</span>
                        <span className="text-[10px] font-bold text-white">{holdingStatus.holdDuration || 0} Days</span>
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest block">Remaining</span>
                        <span className="text-[10px] font-bold text-white">{holdingStatus.remaining !== undefined ? `${holdingStatus.remaining} Blocks` : '---'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 flex items-center justify-center min-h-[70px]">
                <Turnstile
                  siteKey={siteKey}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: "dark" }}
                />
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => handleVerify(false)} 
                  disabled={verifyMutation.isPending || !turnstileToken} 
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {verifyMutation.isPending ? <Loader2 className="animate-spin" /> : "REFRESH"}
                </Button>
                
                <div className="space-y-4 pt-2">
                  <p className="text-[10px] font-black text-center text-white uppercase tracking-[0.3em]">Quick Links</p>
                  <div className="flex justify-center items-center gap-6">
                    <button onClick={() => window.open(`${CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER}${campaign.tokenAddress}`, '_blank')} className="opacity-40 hover:opacity-100 transition-all hover:scale-110 flex flex-col items-center gap-1">
                      <img src={CONFIG.ui.walletIcons.jupiter} className="w-8 h-8" alt="Jupiter" />
                      <span className="text-[8px] font-black text-white">JUPITER</span>
                    </button>
                    <button onClick={() => window.open(`https://dexscreener.com/solana/${campaign.tokenAddress}`, '_blank')} className="opacity-40 hover:opacity-100 transition-all hover:scale-110 flex flex-col items-center gap-1">
                      <img src={CONFIG.ui.walletIcons.dexscreener} className="w-8 h-8 grayscale invert" alt="DexScreener" />
                      <span className="text-[8px] font-black text-white">DEX</span>
                    </button>
                    <button onClick={() => window.open(`https://pump.fun/coin/${campaign.tokenAddress}`, '_blank')} className="opacity-40 hover:opacity-100 transition-all hover:scale-110 flex flex-col items-center gap-1">
                      <img src={CONFIG.ui.walletIcons.pumpfun} className="w-8 h-8" alt="Pump.fun" />
                      <span className="text-[8px] font-black text-white">PUMP</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/[0.02] rounded-2xl border border-white/5 mt-4">
                <Info className="w-4 h-4 text-white mt-0.5" />
                <p className="text-[10px] leading-relaxed text-white font-medium">
                  Holding requirement ensures authentic community participation. Verification is checked directly on the Solana blockchain.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {step === "perform" && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-center">
                    <CheckCircle className="w-12 h-12 text-primary mx-auto opacity-20 mb-4" />
                    <p className="text-sm font-medium text-white/60">{action?.title}</p>
                  </div>
                  <Button className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest gap-3" onClick={() => { window.open(action?.url, '_blank'); setStep("verify"); }}>
                    OPEN TASK <ExternalLink className="w-5 h-5" />
                  </Button>
                </div>
              )}
              {step === "verify" && (
                <div className="space-y-6">
                  {action?.type !== "website" && (
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black text-white/40 tracking-widest">PROOF (USERNAME)</Label>
                      <Input placeholder="@username" value={proof} onChange={(e) => setProof(e.target.value)} className="bg-[#141414] border-white/10 h-14 rounded-xl" />
                    </div>
                  )}
                  
                  <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 flex items-center justify-center min-h-[70px]">
                    <Turnstile
                      siteKey={siteKey}
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: "dark" }}
                    />
                  </div>

                  <Button onClick={() => handleVerify(false)} disabled={verifyMutation.isPending || isVerifying || !turnstileToken} className="w-full h-16 bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-black rounded-2xl font-black uppercase tracking-widest">
                    {verifyMutation.isPending || isVerifying ? <Loader2 className="animate-spin" /> : "CONFIRM"}
                  </Button>
                </div>
              )}
              {step === "success" && (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle className="w-20 h-20 text-[#00D1FF] mx-auto" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">VERIFIED!</h3>
                  <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Reward unlocked</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
