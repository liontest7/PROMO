import { useState, useEffect } from "react";
import { type Action, type Campaign } from "@shared/schema";
import { useVerifyAction } from "@/hooks/use-executions";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { CONFIG } from "@shared/config";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, ExternalLink, Info, RefreshCw, ShieldCheck } from "lucide-react";
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
    followProgress?: {
      currentDays: number;
      requiredDays: number;
      startDate: string;
    };
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

  const isHolderCampaign = campaign?.campaignType === 'holder_qualification' || (action && action.type === ('holder_verification' as any));

  const { data: user } = useQuery<any>({
    queryKey: [`/api/users/${walletAddress}`],
    enabled: !!walletAddress,
  });

  const handleVerify = async (isAutoFetch: boolean = false) => {
    if (!walletAddress || !campaign) return;
    
    setIsVerifying(true);
    if (!isAutoFetch && !turnstileToken && (isHolderCampaign || step === "verify")) {
      setIsVerifying(false);
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
                followProgress: data.followProgress,
                error: data.error
              });

              if (data.error) {
                toast({
                  title: "Verification Failed",
                  description: data.error,
                  variant: "destructive"
                });
                return;
              }

              if (data.status === 'ready' || data.status === 'verified') {
                setIsVerifying(false);
                setStep("success");
                toast({
                  title: "Eligibility Verified!",
                  description: "You are eligible to claim your reward.",
                });
                if (onSuccess) onSuccess(0);
                setTimeout(() => onOpenChange(false), 2000);
              }
            },
            onSettled: () => setIsVerifying(false)
          }
        );
        return;
      }

      if (!action) {
        setIsVerifying(false);
        return;
      }

      const isTwitterAction = action.type === 'twitter' || action.type.startsWith('twitter_');
      
      // Strict X Account Check
      if (isTwitterAction && !user?.twitterHandle) {
        setIsVerifying(false);
        toast({
          title: "X Account Required",
          description: "Please connect your X account to proceed.",
          variant: "destructive",
        });
        return;
      }
      
      const isWebsiteAction = action.type === "website";
      let proofData: any = { 
        proofText: isTwitterAction ? (user?.twitterHandle || proof) : proof, 
        socialVerified: isTwitterAction,
        isAutoFetch: !!isAutoFetch
      };

      if (!isWebsiteAction && !isTwitterAction) {
        if (!proof || proof.length < 3) {
          throw new Error("Please provide valid proof.");
        }
        
        const message = `Confirm task ${action.id}\nProof: ${proof}`;
        const encodedMessage = new TextEncoder().encode(message);
        const phantomInstance = (window as any).phantom?.solana;
        const solanaInstance = phantomInstance || (window as any).solana;
        
        if (solanaInstance?.signMessage) {
          const signedMessage = await solanaInstance.signMessage(encodedMessage, "utf8");
          proofData.signature = Array.from(signedMessage.signature).map((b: any) => (b as number).toString(16).padStart(2, '0')).join('');
          proofData.publicKey = signedMessage.publicKey.toString();
        } else {
          throw new Error("Wallet signing not supported");
        }
      } else if (isWebsiteAction) {
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
            if (data.status === "tracking") {
              setHoldingStatus(prev => ({
                ...prev ? prev : { status: "tracking" },
                status: "tracking",
                followProgress: data.followProgress
              }));
              toast({
                title: "Tracking Started",
                description: data.message,
              });
              return;
            }

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
          },
          onSettled: () => setIsVerifying(false)
        }
      );
    } catch (err: any) {
      setIsVerifying(false);
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
              <DialogTitle className="text-2xl font-black uppercase text-white tracking-tighter flex items-center gap-2">
                {isHolderCampaign ? "ELIGIBILITY CHECK" : "TASK VERIFICATION"}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-white/20 hover:text-white transition-colors"
                  onClick={() => handleVerify(true)}
                  disabled={verifyMutation.isPending || isVerifying}
                >
                  <RefreshCw className={cn("w-4 h-4", (verifyMutation.isPending || isVerifying) && "animate-spin")} />
                </Button>
              </DialogTitle>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                VERIFYING COMMUNITY STATUS
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-8 pb-10 space-y-6">
          {isHolderCampaign ? (
            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Your Balance</p>
                    <p className={cn("text-2xl font-black font-mono tracking-tighter", (holdingStatus?.currentBalance || 0) >= Number(campaign.minHoldingAmount || 0) ? "text-primary" : "text-red-500")}>
                      {holdingStatus?.currentBalance?.toLocaleString() || "0"} <span className="text-xs">${campaign.tokenName}</span>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Requirement</p>
                    <p className="text-2xl font-black font-mono text-white tracking-tighter">
                      {Number(campaign.minHoldingAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Verification Status</p>
                    <Badge className={cn("text-[9px] font-black px-2 py-0.5", holdingStatus?.status === 'verified' ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-white/40 border-white/10")}>
                      {holdingStatus?.status === 'verified' ? 'VERIFIED' : 'PENDING'}
                    </Badge>
                  </div>
                  <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
                      style={{ width: holdingStatus?.status === 'verified' ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              </div>

              {holdingStatus?.status !== 'verified' && (
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-center min-h-[70px]">
                  <Turnstile
                    siteKey={siteKey}
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: "dark" }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={() => handleVerify(false)} 
                  disabled={verifyMutation.isPending || (holdingStatus?.status !== 'verified' && !turnstileToken)} 
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(34,197,94,0.2)] transition-all hover:scale-[1.02]"
                >
                  {verifyMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                  {holdingStatus?.status === 'verified' ? "CLOSE WINDOW" : "VERIFY ELIGIBILITY"}
                </Button>
                
                <div className="flex justify-center items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest" onClick={() => window.open(`${CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER}${campaign.tokenAddress}`, '_blank')}>
                    Buy ${campaign.tokenName}
                  </Button>
                  <div className="w-1 h-1 rounded-full bg-white/10" />
                  <Button variant="ghost" size="sm" className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest" onClick={() => window.open(`https://dexscreener.com/solana/${campaign.tokenAddress}`, '_blank')}>
                    View Chart
                  </Button>
                </div>
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
                    <div className="space-y-4">
                      {action?.type === 'twitter' || action?.type.startsWith('twitter_') ? (
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-3">
                          <p className="text-[10px] uppercase font-black text-white/40 tracking-widest">Linked X Account</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                              <span className="text-primary font-black">X</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">{user?.twitterHandle ? `@${user.twitterHandle}` : "Not Linked"}</p>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Identity Verified</p>
                            </div>
                          </div>
                          {!user?.twitterHandle && (
                            <Button 
                              variant="default" 
                              className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-black uppercase text-[10px] tracking-widest h-12 shadow-lg shadow-[#1DA1F2]/20"
                              onClick={() => {
                                // Direct Twitter OAuth link
                                window.location.href = '/api/twitter/auth';
                              }}
                            >
                              Connect X Account Now
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-black text-white/40 tracking-widest">PROOF (USERNAME)</Label>
                          <Input placeholder="@username" value={proof} onChange={(e) => setProof(e.target.value)} className="bg-[#141414] border-white/10 h-14 rounded-xl" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-[#141414] p-6 rounded-3xl border border-white/5 flex items-center justify-center min-h-[70px]">
                    <Turnstile
                      siteKey={siteKey}
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: "dark" }}
                    />
                  </div>

                  {holdingStatus?.followProgress && (
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/40">Follow Progress</span>
                        <span className="text-primary">{holdingStatus.followProgress.currentDays} / {holdingStatus.followProgress.requiredDays} Days</span>
                      </div>
                      <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000" 
                          style={{ width: `${(holdingStatus.followProgress.currentDays / holdingStatus.followProgress.requiredDays) * 100}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-center text-white/30 font-bold uppercase">
                        Required: Follow since {new Date(holdingStatus.followProgress.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => handleVerify(false)} 
                      disabled={verifyMutation.isPending || isVerifying || !turnstileToken || ((action?.type === 'twitter' || action?.type.startsWith('twitter_')) && !user?.twitterHandle)} 
                      className={cn(
                        "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                        (action?.type === 'twitter' || action?.type.startsWith('twitter_')) ? "bg-[#1DA1F2] text-white" : "bg-primary text-primary-foreground"
                      )}
                    >
                      {verifyMutation.isPending || isVerifying ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                          {(action?.type === 'twitter' || action?.type.startsWith('twitter_')) && <RefreshCw className="w-4 h-4" />}
                          {holdingStatus?.status === 'verified' ? "CLOSE" : "VERIFY TASK"}
                        </div>
                      )}
                    </Button>
                    
                    <p className="text-[10px] text-center text-white/30 font-bold uppercase tracking-widest">
                      {isVerifying ? "Verifying with X API..." : "Verification is secured and encrypted"}
                    </p>
                  </div>
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
