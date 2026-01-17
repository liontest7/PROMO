import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_CONFIG } from "@shared/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

import { SuccessCard } from "./SuccessCard";
import { formSchema, type FormValues } from "./create-campaign/schema";
import { CampaignEditStep } from "./create-campaign/CampaignEditStep";
import { CampaignPreviewStep } from "./create-campaign/CampaignPreviewStep";

export function CreateCampaignDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { isConnected, userId, connect } = useWallet();
  const { toast } = useToast();

  const { data: settings, isLoading: loadingSettings } = useQuery<any>({
    queryKey: ["/api/public/settings"],
    refetchInterval: 1000,
    staleTime: 0,
  });

  const handleOpenClick = (e: React.MouseEvent) => {
    if (loadingSettings) {
      e.preventDefault();
      return;
    }

    if (settings && settings.campaignsEnabled === false) {
      e.preventDefault();
      toast({
        title: "Maintenance",
        description: "Campaign creation is temporarily disabled.",
        variant: "destructive"
      });
      return;
    }
    if (!isConnected) {
      e.preventDefault();
      toast({
        title: "Connection Required",
        description: "Please connect your wallet as an advertiser to create campaigns.",
        variant: "destructive"
      });
      connect('advertiser');
      return;
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tokenName: "",
      tokenAddress: "",
      totalBudget: 0.1,
      bannerUrl: "",
      logoUrl: "",
      websiteUrl: "",
      twitterUrl: "",
      telegramUrl: "",
      minSolBalance: 0,
      minWalletAgeDays: 0,
      minXAccountAgeDays: 0,
      minXFollowers: 0,
      minFollowDurationDays: 0,
      multiDaySolAmount: 0,
      multiDaySolDays: 0,
      campaignType: undefined,
      actions: [],
      creatorId: userId || undefined,
      minHoldingAmount: 0,
      minHoldingDuration: 0,
      rewardPerWallet: 0,
      maxClaims: 0,
      initialMarketCap: ""
    },
  });

  function onSubmit(values: FormValues) {
    if (!userId) {
      toast({ title: "User Error", description: "Please reconnect your wallet.", variant: "destructive" });
      return;
    }

    if (step === "edit") {
      setStep("preview");
      return;
    }

    const formattedValues = {
      ...values,
      initialMarketCap: values.initialMarketCap || "0",
      currentMarketCap: values.initialMarketCap || "0",
      creatorId: userId,
      totalBudget: values.campaignType === 'holder_qualification' 
        ? (Number(values.rewardPerWallet || 0) * Number(values.maxClaims || 0)).toString()
        : (values.totalBudget || 0).toString(),
      minHoldingAmount: values.minHoldingAmount?.toString() || null,
      rewardPerWallet: values.rewardPerWallet?.toString() || null,
      requirements: {
        minSolBalance: values.minSolBalance,
        minWalletAgeDays: values.minWalletAgeDays,
        minXAccountAgeDays: values.minXAccountAgeDays,
        minXFollowers: values.minXFollowers,
        minFollowDurationDays: values.minFollowDurationDays,
        multiDaySolHolding: values.multiDaySolAmount > 0 && values.multiDaySolDays > 0 ? {
          amount: values.multiDaySolAmount,
          days: values.multiDaySolDays
        } : undefined
      },
      actions: (values.campaignType === 'holder_qualification' || !values.actions) ? [] : values.actions.map(a => ({
        ...a,
        rewardAmount: a.rewardAmount.toString(),
        maxExecutions: a.maxExecutions ? Number(a.maxExecutions) : null
      }))
    };

    createCampaign(formattedValues as any, {
      onSuccess: (data) => {
        setCreatedCampaign(data);
        setOpen(false);
        setStep("edit");
        form.reset();
        import("canvas-confetti").then((confetti) => {
          confetti.default({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#16a34a', '#ffffff']
          });
        });
        setShowSuccessCard(true);
        window.dispatchEvent(new CustomEvent('campaign-created', { detail: data }));
      },
      onError: (error: any) => {
        toast({ title: "Launch Failed", description: error.message || "Something went wrong.", variant: "destructive" });
      }
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if(!o) setStep("edit"); }}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenClick} className="bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
            <Rocket className="mr-2 h-4 w-4" /> Launch Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/20 p-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-display text-primary">
                {step === "preview" ? "Preview Your Campaign" : "Create New Campaign"}
              </DialogTitle>
              <DialogDescription className="text-white/80 text-base">
                {step === "preview" ? "Review all details before publishing." : "Set up a new Pay-Per-Action campaign to boost your project."}
              </DialogDescription>
            </DialogHeader>

            {step === "edit" ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <CampaignEditStep form={form} settings={settings} loadingSettings={loadingSettings} />
                </form>
              </Form>
            ) : (
              <CampaignPreviewStep 
                form={form} 
                isPending={isPending} 
                onBack={() => setStep("edit")} 
                onSubmit={form.handleSubmit(onSubmit)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      {showSuccessCard && createdCampaign && (
        <SuccessCard
          open={showSuccessCard}
          onOpenChange={setShowSuccessCard}
          campaign={createdCampaign}
        />
      )}
    </>
  );
}
