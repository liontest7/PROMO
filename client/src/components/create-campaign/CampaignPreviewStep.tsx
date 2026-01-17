import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Coins } from "lucide-react";
import { PLATFORM_CONFIG } from "@shared/config";
import { type FormValues } from "./schema";

interface CampaignPreviewStepProps {
  form: UseFormReturn<FormValues>;
  isPending: boolean;
  onBack: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function CampaignPreviewStep({
  form,
  isPending,
  onBack,
  onSubmit,
}: CampaignPreviewStepProps) {
  const watchedActions = form.watch("actions");
  const watchedType = form.watch("campaignType");

  const totalCalculatedCost = (watchedActions || []).reduce((acc, action) => {
    const reward = Number(action.rewardAmount) || 0;
    const executions = Number(action.maxExecutions) || 0;
    return acc + reward * executions;
  }, 0);

  const platformFee = PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE;
  const baseGasFee = PLATFORM_CONFIG.FEE_SOL; // Base fee for Escrow setup (0.005 SOL)
  const perRewardGasFee = 0.0015; // Optimized gas fee per reward transaction

  const totalExecutions =
    watchedType === "holder_qualification"
      ? Number(form.watch("maxClaims") || 0)
      : (watchedActions || []).reduce(
          (acc, a) => acc + (Number(a.maxExecutions) || 0),
          0,
        );

  const dynamicGasFee = baseGasFee + totalExecutions * perRewardGasFee;
  const gasFeeSol = Number(dynamicGasFee.toFixed(4));
  const airdropBudget =
    watchedType === "holder_qualification"
      ? Number(form.watch("rewardPerWallet")) *
          Number(form.watch("maxClaims")) || 0
      : totalCalculatedCost;

  const totalProjectTokenCost = airdropBudget + platformFee;

  useEffect(() => {
    if (watchedType === "holder_qualification") {
      const reward = Number(form.watch("rewardPerWallet")) || 0;
      const claims = Number(form.watch("maxClaims")) || 0;
      form.setValue("totalBudget", Number((reward * claims).toFixed(6)));
    } else if (totalCalculatedCost > 0) {
      form.setValue("totalBudget", Number(totalCalculatedCost.toFixed(6)));
    }
  }, [
    totalCalculatedCost,
    form.watch("rewardPerWallet"),
    form.watch("maxClaims"),
    watchedType,
    form,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
          <p className="text-[10px] uppercase font-black text-white/40 mb-1">
            Airdrop Budget
          </p>
          <p className="text-xl font-display text-primary">
            {airdropBudget.toFixed(4)} <span className="text-xs">PROJECT</span>
          </p>
        </div>
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
          <p className="text-[10px] uppercase font-black text-white/40 mb-1">
            Creation Fee
          </p>
          <p className="text-xl font-display text-primary">
            {platformFee} <span className="text-xs">PROJECT</span>
          </p>
        </div>
      </div>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <h3 className="font-display text-lg text-white">
              Campaign Summary
            </h3>
          </div>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px]"
          >
            {watchedType === "engagement"
              ? "Social Engagement"
              : "Holder Qualification"}
          </Badge>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Token to Lock</span>
            <span className="text-primary font-bold">
              {totalProjectTokenCost.toFixed(4)} PROJECT
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Escrow Gas Fee</span>
            <span className="text-primary font-bold">{gasFeeSol} SOL</span>
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex justify-between items-center">
            <span className="text-white font-black uppercase tracking-widest text-xs">
              Total to Pay
            </span>
            <div className="text-right">
              <div className="text-lg font-display text-primary">
                {totalProjectTokenCost.toFixed(4)} PROJECT
              </div>
              <div className="text-[10px] text-white/40 font-mono">
                +{gasFeeSol} SOL
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/5"
        >
          Back to Edit
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isPending}
          className="flex-[2] h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Launching...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm & Launch
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
