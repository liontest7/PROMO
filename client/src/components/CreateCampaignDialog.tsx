import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, ChevronRight, Layout, ShieldCheck, ListChecks, Coins } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BasicSettings } from "./create-campaign/BasicSettings";
import { EngagementActions } from "./create-campaign/EngagementActions";
import { CampaignProtections } from "./create-campaign/CampaignProtections";
import { CampaignPreview } from "./create-campaign/CampaignPreview";
import { CampaignSuccessCard } from "./CampaignSuccessCard";

const formSchema = insertCampaignSchema.extend({
  title: z.string().min(3, "Title must be at least 3 chars").max(50),
  description: z.string().min(10, "Description must be at least 10 chars").max(500),
  tokenName: z.string().min(1, "Token symbol required").max(10),
  tokenAddress: z.string().min(32, "Invalid Solana address").max(44),
  campaignType: z.enum(["engagement", "holder_qualification"]),
  totalBudget: z.coerce.number().min(0.00001, "Budget must be > 0"),
  minHoldingAmount: z.coerce.number().min(0).optional(),
  rewardPerWallet: z.coerce.number().min(0).optional(),
  maxClaims: z.coerce.number().min(1).optional(),
  actions: z.array(insertActionSchema.omit({ campaignId: true }).extend({
    type: z.string().min(1),
    title: z.string().min(3),
    url: z.string().url(),
    rewardAmount: z.coerce.number().min(0.00001),
    maxExecutions: z.coerce.number().min(1),
  })).optional(),
  bannerUrl: z.string().url("Invalid banner URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").min(1, "Logo required"),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid twitter URL").optional().or(z.literal("")),
  telegramUrl: z.string().url("Invalid telegram URL").optional().or(z.literal("")),
  minSolBalance: z.coerce.number().min(0).default(0),
  minWalletAgeDays: z.coerce.number().min(0).default(0),
  minXAccountAgeDays: z.coerce.number().min(0).default(0),
  minXFollowers: z.coerce.number().min(0).default(0),
  minFollowDurationDays: z.coerce.number().min(0).default(0),
  multiDaySolAmount: z.coerce.number().min(0).default(0),
  multiDaySolDays: z.coerce.number().min(0).default(0),
  initialMarketCap: z.string().optional().or(z.literal("")),
}).refine(d => d.campaignType === "engagement" ? d.actions && d.actions.length > 0 : true, {
  message: "Engagement campaigns require at least one action",
  path: ["actions"],
}).refine(d => d.campaignType === "holder_qualification" ? (d.rewardPerWallet || 0) > 0 && (d.maxClaims || 0) > 0 : true, {
  message: "Reward and participants are required for holder campaigns",
  path: ["rewardPerWallet"],
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: { open?: boolean, onOpenChange?: (o: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [activeTab, setActiveTab] = useState("general");
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { isConnected, userId, connect } = useWallet();
  const { toast } = useToast();

  const { data: settings } = useQuery<any>({ 
    queryKey: ["/api/public/settings"], 
    refetchInterval: 1000 
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", tokenName: "", tokenAddress: "", totalBudget: 0.1,
      bannerUrl: "", logoUrl: "", websiteUrl: "", twitterUrl: "", telegramUrl: "",
      minSolBalance: 0, minWalletAgeDays: 0, minXAccountAgeDays: 0, minXFollowers: 0,
      minFollowDurationDays: 0, multiDaySolAmount: 0, multiDaySolDays: 0,
      campaignType: "engagement", actions: [],
    },
  });

  const watchedType = form.watch("campaignType");
  const watchedActions = form.watch("actions") || [];
  const watchedMaxClaims = form.watch("maxClaims") || 0;

  // Calculate gas fee dynamically like original code
  const totalExecutions = watchedType === "holder_qualification" 
    ? Number(watchedMaxClaims) 
    : watchedActions.reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0);
  
  const baseGasFee = 0.005; // Base SOL fee
  const perRewardGasFee = 0.0015;
  const gasFeeSol = baseGasFee + (totalExecutions * perRewardGasFee);

  // Re-implementing the complex metadata fetch from original code
  const fetchTokenMetadata = async (address: string) => {
    if (!address || address.length < 32) return;
    try {
      const results = await Promise.allSettled([
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`).then(r => r.json()),
        fetch(`https://pmpapi.fun/api/get_metadata/${address}`).then(r => r.json()),
        fetch(`https://tokens.jup.ag/token/${address}`).then(r => r.json())
      ]);

      const dexData = results[0].status === 'fulfilled' ? results[0].value : null;
      const pumpData = results[1].status === 'fulfilled' ? results[1].value : null;
      const jupData = results[2].status === 'fulfilled' ? results[2].value : null;

      if (pumpData?.success && pumpData.result) {
        const res = pumpData.result;
        form.setValue("tokenName", res.symbol);
        form.setValue("title", `${res.name} Growth Campaign`);
        form.setValue("logoUrl", `https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image/${address}/86x86?alpha=true`);
        form.setValue("description", res.description);
      } else if (dexData?.pairs?.[0]) {
        const p = dexData.pairs[0];
        form.setValue("tokenName", p.baseToken.symbol);
        form.setValue("title", `${p.baseToken.name} Growth Campaign`);
        if (p.info?.imageUrl) form.setValue("logoUrl", p.info.imageUrl);
        if (p.info?.header) form.setValue("bannerUrl", p.info.header);
        if (p.info?.websites?.[0]?.url) form.setValue("websiteUrl", p.info.websites[0].url);
        const twitter = p.info?.socials?.find((s: any) => s.type === "twitter");
        if (twitter?.url) form.setValue("twitterUrl", twitter.url);
        if (p.marketCap) form.setValue("initialMarketCap", p.marketCap.toString());
      } else if (jupData) {
        form.setValue("tokenName", jupData.symbol);
        form.setValue("logoUrl", jupData.logoURI);
      }
      
      toast({ title: "Metadata Loaded", description: "Project details retrieved successfully." });
    } catch (e) { console.error("Metadata error:", e); }
  };

  const onSubmit = (values: FormValues) => {
    if (step === "edit") {
      setStep("preview");
      return;
    }
    
    const formattedValues = {
      ...values,
      creatorId: userId,
      initialMarketCap: values.initialMarketCap || "0",
      currentMarketCap: values.initialMarketCap || "0",
      requirements: {
        minSolBalance: values.minSolBalance,
        minWalletAgeDays: values.minWalletAgeDays,
        minXAccountAgeDays: values.minXAccountAgeDays,
        minXFollowers: values.minXFollowers,
        minFollowDurationDays: values.minFollowDurationDays,
        multiDaySolHolding: values.multiDaySolAmount > 0 ? {
          amount: values.multiDaySolAmount,
          days: values.multiDaySolDays
        } : undefined
      }
    };

    createCampaign(formattedValues as any, {
      onSuccess: (data) => {
        setCreatedCampaign(data);
        setOpen(false);
        setShowSuccessCard(true);
        form.reset();
        setStep("edit");
        setActiveTab("general");
        // Confetti effect can be added here
      },
      onError: (err: any) => {
        toast({ title: "Launch Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setStep("edit"); setActiveTab("general"); } }}>
        <DialogTrigger asChild>
          <Button onClick={e => {
            if (!isConnected) { e.preventDefault(); connect("advertiser"); return; }
            if (settings?.campaignsEnabled === false) { 
              e.preventDefault(); 
              toast({ title: "Maintenance", description: "Campaign creation is disabled.", variant: "destructive" }); 
              return;
            }
          }} className="bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
            <Rocket className="mr-2 h-4 w-4" /> Launch Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/20 p-0 overflow-hidden">
          <div className="p-6 relative">
            <div className="absolute top-0 right-0 p-8 text-primary/5 pointer-events-none">
              <Sparkles className="h-24 w-24 rotate-12" />
            </div>
            
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-display text-primary italic tracking-tighter uppercase">
                {step === "preview" ? "Review & Deploy" : "New Growth Campaign"}
              </DialogTitle>
              <DialogDescription>
                {step === "preview" ? "Verify your campaign parameters before deploying to Solana." : "Define your campaign strategy and set rewards."}
              </DialogDescription>
            </DialogHeader>

            {step === "edit" ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-8 bg-primary/5 border border-primary/10 p-1 h-12 rounded-2xl">
                      <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase tracking-widest gap-2">
                        <Layout className="h-3.5 w-3.5" /> General
                      </TabsTrigger>
                      <TabsTrigger value="actions" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase tracking-widest gap-2">
                        <ListChecks className="h-3.5 w-3.5" /> Tasks
                      </TabsTrigger>
                      <TabsTrigger value="protections" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold text-xs uppercase tracking-widest gap-2">
                        <ShieldCheck className="h-3.5 w-3.5" /> Shield
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6 mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                      <FormField control={form.control} name="campaignType" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">Campaign Strategy</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-primary/5 border-primary/20 h-12 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border-primary/20">
                              <SelectItem value="engagement">
                                <div className="flex items-center gap-2">
                                  <Rocket className="h-4 w-4 text-primary" /> Pay-Per-Action (Social Growth)
                                </div>
                              </SelectItem>
                              <SelectItem value="holder_qualification">
                                <div className="flex items-center gap-2">
                                  <Coins className="h-4 w-4 text-primary" /> Holder Airdrop (Retain Holders)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <BasicSettings form={form} fetchTokenMetadata={fetchTokenMetadata} />
                      <div className="flex justify-end pt-4">
                        <Button type="button" onClick={() => setActiveTab("actions")} className="gap-2 font-bold px-8 h-12 rounded-xl shadow-lg">
                          Next: Define Tasks <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-6 mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                      {watchedType === "engagement" ? (
                        <EngagementActions form={form} />
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 bg-primary/10 rounded-3xl border border-primary/20 text-center space-y-2">
                            <Coins className="h-10 w-10 text-primary mx-auto mb-2" />
                            <h3 className="text-lg font-bold">Holder Airdrop Parameters</h3>
                            <p className="text-xs text-muted-foreground">Define how many tokens users will receive for holding your project.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="rewardPerWallet" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-primary font-bold">Reward Per Holder</FormLabel>
                                <FormControl><Input type="number" step="0.00001" {...field} className="h-12 bg-primary/5 border-primary/20" /></FormControl>
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="maxClaims" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-primary font-bold">Max Claim Slots</FormLabel>
                                <FormControl><Input type="number" {...field} className="h-12 bg-primary/5 border-primary/20" /></FormControl>
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("general")} className="h-12 px-6 rounded-xl border-primary/20">Back</Button>
                        <Button type="button" onClick={() => setActiveTab("protections")} className="gap-2 font-bold px-8 h-12 rounded-xl shadow-lg">
                          Next: Security <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="protections" className="space-y-6 mt-0 animate-in fade-in slide-in-from-left-4 duration-300">
                      <CampaignProtections form={form} />
                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("actions")} className="h-12 px-6 rounded-xl border-primary/20">Back</Button>
                        <Button type="submit" className="gap-2 font-black uppercase tracking-widest px-8 h-12 rounded-xl bg-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                          Continue to Preview <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            ) : (
              <CampaignPreview
                values={form.getValues()}
                onBack={() => setStep("edit")}
                onConfirm={form.handleSubmit(onSubmit)}
                isPending={isPending}
                gasFeeSol={Number(gasFeeSol.toFixed(4))}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      {showSuccessCard && createdCampaign && (
        <CampaignSuccessCard
          campaign={createdCampaign}
          open={showSuccessCard}
          onOpenChange={setShowSuccessCard}
        />
      )}
    </>
  );
}
