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
import { Rocket, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { BasicSettings } from "./create-campaign/BasicSettings";
import { EngagementActions } from "./create-campaign/EngagementActions";
import { CampaignProtections } from "./create-campaign/CampaignProtections";
import { CampaignPreview } from "./create-campaign/CampaignPreview";
import { CampaignSuccessCard } from "./CampaignSuccessCard";

const formSchema = insertCampaignSchema.extend({
  title: z.string().min(3, "Campaign title must be at least 3 characters").max(50, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  tokenName: z.string().min(1, "Token symbol is required").max(10, "Symbol too long"),
  tokenAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  campaignType: z.enum(["engagement", "holder_qualification"], {
    required_error: "Please select a campaign category",
  }),
  totalBudget: z.coerce.number().min(0.00001, "Total budget must be greater than 0"),
  minHoldingAmount: z.coerce.number().min(0).optional(),
  minHoldingDuration: z.coerce.number().min(0).optional(),
  rewardPerWallet: z.coerce.number().min(0).optional(),
  maxClaims: z.coerce.number().min(1, "At least 1 participant required").optional(),
  actions: z.array(insertActionSchema.omit({ campaignId: true }).extend({
    type: z.string().min(1, "Action type required"),
    title: z.string().min(3, "Action title required"),
    url: z.string().url("Invalid action URL"),
    rewardAmount: z.coerce.number().min(0.00001, "Reward must be greater than 0"),
    maxExecutions: z.coerce.number().min(1, "Executions must be at least 1"),
  })).optional(),
  creatorId: z.number().optional(),
  bannerUrl: z.string().url("Invalid banner URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").min(1, "Logo image is required"),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  telegramUrl: z.string().url("Invalid Telegram URL").optional().or(z.literal("")),
  minSolBalance: z.coerce.number().min(0).default(0),
  minWalletAgeDays: z.coerce.number().min(0).default(0),
  minXAccountAgeDays: z.coerce.number().min(0).default(0),
  minXFollowers: z.coerce.number().min(0).default(0),
  minFollowDurationDays: z.coerce.number().min(0).default(0),
  multiDaySolAmount: z.coerce.number().min(0).default(0),
  multiDaySolDays: z.coerce.number().min(0).default(0),
  initialMarketCap: z.string().optional().or(z.literal("")),
}).refine(data => {
  if (data.campaignType === "engagement") return data.actions && data.actions.length > 0;
  return true;
}, {
  message: "Engagement campaigns require at least one action",
  path: ["actions"],
}).refine(data => {
  if (data.campaignType === "holder_qualification") return (data.rewardPerWallet || 0) > 0 && (data.maxClaims || 0) > 0;
  return true;
}, {
  message: "Reward and participants are required for holder campaigns",
  path: ["rewardPerWallet"],
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: { open?: boolean, onOpenChange?: (o: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { isConnected, userId, connect } = useWallet();
  const { toast } = useToast();

  const { data: settings } = useQuery<any>({ 
    queryKey: ["/api/public/settings"], 
    refetchInterval: 1000,
    staleTime: 0,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", description: "", tokenName: "", tokenAddress: "", totalBudget: 0.1,
      bannerUrl: "", logoUrl: "", websiteUrl: "", twitterUrl: "", telegramUrl: "",
      minSolBalance: 0, minWalletAgeDays: 0, minXAccountAgeDays: 0, minXFollowers: 0,
      minFollowDurationDays: 0, multiDaySolAmount: 0, multiDaySolDays: 0,
      campaignType: undefined, actions: [], creatorId: userId || undefined,
    },
  });

  const watchedType = form.watch("campaignType");
  const watchedActions = form.watch("actions") || [];

  const platformFee = PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE;
  const baseGasFee = PLATFORM_CONFIG.FEE_SOL;
  const perRewardGasFee = 0.0015;

  const totalExecutions = watchedType === "holder_qualification"
    ? Number(form.watch("maxClaims") || 0)
    : watchedActions.reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0);

  const gasFeeSol = Number((baseGasFee + totalExecutions * perRewardGasFee).toFixed(4));

  useEffect(() => {
    if (watchedType === "holder_qualification") {
      const reward = Number(form.watch("rewardPerWallet")) || 0;
      const claims = Number(form.watch("maxClaims")) || 0;
      form.setValue("totalBudget", Number((reward * claims).toFixed(6)));
    } else if (watchedActions.length > 0) {
      const total = watchedActions.reduce((acc, a) => acc + (Number(a.rewardAmount) * Number(a.maxExecutions) || 0), 0);
      form.setValue("totalBudget", Number(total.toFixed(6)));
    }
  }, [watchedActions, form.watch("rewardPerWallet"), form.watch("maxClaims"), watchedType, form]);

  const fetchTokenMetadata = async (address: string) => {
    if (!address || address.length < 32) return;
    try {
      const results = await Promise.allSettled([
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`).then(r => r.json()),
        fetch(`https://pmpapi.fun/api/get_metadata/${address}`).then(r => r.json()),
        fetch(`https://tokens.jup.ag/token/${address}`).then(r => r.json()),
        fetch(`https://solana-gateway.moralis.io/token/mainnet/${address}/metadata`, {
          headers: { accept: "application/json", "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhY2M3ZmQ1LWYyOTgtNGY5Zi1iZDIwLTdiYWM5MWRkMjNhNCIsIm9yZ0lkIjoiNDcxNTg3IiwidXNlcklkIjoiNDg1MTI3IiwidHlwZUlkIjoiYmVlNmFiMTItODg0NS00Nzc3LWJlMDQtODU4ODYzOTYxMjAxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTgzNDIwMzksImV4cCI6NDkxNDEwMjAzOX0.twhytkJWhGoqh5NVfhSkG9Irub-cS2cSSqKqPCI5Ur8" },
        }).then(r => r.json())
      ]);

      const dexData = results[0].status === 'fulfilled' ? results[0].value : null;
      const pumpData = results[1].status === 'fulfilled' ? results[1].value : null;
      const jupData = results[2].status === 'fulfilled' ? results[2].value : null;
      const moralisData = results[3].status === 'fulfilled' ? results[3].value : null;

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
      } else if (moralisData && moralisData.mint) {
        form.setValue("tokenName", moralisData.symbol);
        form.setValue("logoUrl", moralisData.logo);
      }
      
      toast({ title: "Metadata Loaded", description: "Project details retrieved successfully." });
    } catch (e) { console.error("Metadata error:", e); }
  };

  const onSubmit = (values: FormValues) => {
    if (!userId) { toast({ title: "User Error", description: "Please reconnect your wallet.", variant: "destructive" }); return; }
    if (step === "edit") { setStep("preview"); return; }
    
    const formattedValues = {
      ...values,
      creatorId: userId,
      initialMarketCap: values.initialMarketCap || "0",
      currentMarketCap: values.initialMarketCap || "0",
      totalBudget: values.campaignType === "holder_qualification" 
        ? (Number(values.rewardPerWallet || 0) * Number(values.maxClaims || 0)).toString()
        : (values.totalBudget || 0).toString(),
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
      },
      actions: values.campaignType === "holder_qualification" || !values.actions ? [] : values.actions.map(a => ({
        ...a, rewardAmount: a.rewardAmount.toString(), maxExecutions: a.maxExecutions ? Number(a.maxExecutions) : null
      }))
    };

    createCampaign(formattedValues as any, {
      onSuccess: (data) => {
        setCreatedCampaign(data);
        setOpen(false);
        setStep("edit");
        form.reset();
        setShowSuccessCard(true);
        window.dispatchEvent(new CustomEvent("campaign-created", { detail: data }));
      },
      onError: (err: any) => {
        toast({ title: "Launch Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setStep("edit"); }}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/20 p-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-display text-primary">
                {step === "preview" ? "Preview Your Campaign" : "Create New Campaign"}
              </DialogTitle>
              <DialogDescription>
                {step === "preview" ? "Review all details before publishing." : "Set up a new Pay-Per-Action campaign to boost your project."}
              </DialogDescription>
            </DialogHeader>

            {step === "edit" ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="campaignType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Category</FormLabel>
                        <Select onValueChange={v => { field.onChange(v); form.setValue("actions", v === "holder_qualification" ? [] : [{ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 }]); }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="engagement">Social Engagement</SelectItem>
                            <SelectItem value="holder_qualification">Holder Qualification</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <BasicSettings form={form} fetchTokenMetadata={fetchTokenMetadata} />
                  
                  {watchedType === "engagement" ? (
                    <EngagementActions form={form} />
                  ) : watchedType === "holder_qualification" ? (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-primary/5">
                      <FormField control={form.control} name="rewardPerWallet" render={({ field }) => (
                        <FormItem><FormLabel>Reward Per Holder</FormLabel><FormControl><Input type="number" step="0.00001" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="maxClaims" render={({ field }) => (
                        <FormItem><FormLabel>Max Participants</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  ) : null}

                  <CampaignProtections form={form} />
                  
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold">Airdrop Budget</span>
                      <span className="font-mono text-primary font-bold">{form.watch("totalBudget")} {form.watch("tokenName")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Creation Fee: 0.5 SOL</span>
                      <span>Gas (Escrow): {gasFeeSol} SOL</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 font-bold text-lg">Continue to Preview</Button>
                </form>
              </Form>
            ) : (
              <CampaignPreview
                values={form.getValues()}
                onBack={() => setStep("edit")}
                onConfirm={form.handleSubmit(onSubmit)}
                isPending={isPending}
                gasFeeSol={gasFeeSol}
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
