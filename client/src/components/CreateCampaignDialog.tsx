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
import { Rocket, Sparkles, ChevronRight, Layout, ShieldCheck, ListChecks, Coins, Search, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [step, setStep] = useState<"initial" | "edit" | "preview">("initial");
  const [activeTab, setActiveTab] = useState("general");
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
      minHoldingAmount: 0, minHoldingDuration: 0,
      campaignType: undefined, actions: [], creatorId: userId || undefined,
    },
  });

  const watchedType = form.watch("campaignType");
  const watchedActions = form.watch("actions") || [];
  const watchedMaxClaims = form.watch("maxClaims") || 0;

  const platformFee = 0.5; // Fixed SOL fee
  const baseGasFee = 0.005;
  const perRewardGasFee = 0.0015;

  const totalExecutions = watchedType === "holder_qualification"
    ? Number(watchedMaxClaims)
    : watchedActions.reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0);

  const gasFeeSol = Number((baseGasFee + totalExecutions * perRewardGasFee).toFixed(4));

  useEffect(() => {
    if (watchedType === "holder_qualification") {
      const reward = Number(form.watch("rewardPerWallet")) || 0;
      const claims = Number(watchedMaxClaims) || 0;
      form.setValue("totalBudget", Number((reward * claims).toFixed(6)));
    } else if (watchedActions.length > 0) {
      const total = watchedActions.reduce((acc, a) => acc + (Number(a.rewardAmount) * Number(a.maxExecutions) || 0), 0);
      form.setValue("totalBudget", Number(total.toFixed(6)));
    }
  }, [watchedActions, form.watch("rewardPerWallet"), watchedMaxClaims, watchedType, form]);

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
        if (moralisData.description) form.setValue("description", moralisData.description);
      }
      
      toast({ title: "Metadata Loaded", description: "Project details retrieved successfully." });
    } catch (e) { console.error("Metadata error:", e); }
  };

  const handleInitialSubmit = async () => {
    const address = form.getValues("tokenAddress");
    const type = form.getValues("campaignType");
    
    if (!address || address.length < 32) {
      toast({ title: "Error", description: "Please enter a valid Solana token address.", variant: "destructive" });
      return;
    }
    if (!type) {
      toast({ title: "Error", description: "Please select a campaign category.", variant: "destructive" });
      return;
    }

    await fetchTokenMetadata(address);
    setStep("edit");
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
        } : undefined,
        minProjectTokenHolding: values.minHoldingAmount > 0 ? {
          amount: values.minHoldingAmount,
          days: values.minHoldingDuration
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
        setStep("initial");
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
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setStep("initial"); setActiveTab("general"); } }}>
        <DialogTrigger asChild>
          <Button onClick={e => {
            if (!isConnected) { e.preventDefault(); connect("advertiser"); return; }
            if (settings?.campaignsEnabled === false) { 
              e.preventDefault(); 
              toast({ title: "Maintenance", description: "Campaign creation is disabled.", variant: "destructive" }); 
              return;
            }
          }} className="bg-primary text-primary-foreground font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all h-12 px-8 rounded-2xl border-b-4 border-black/20 active:border-b-0 active:translate-y-1">
            <Rocket className="mr-2 h-5 w-5 animate-pulse" /> Launch Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden glass-card border-primary/20 p-0 shadow-2xl">
          <div className="relative">
            <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none overflow-hidden">
              <Zap className="h-48 w-48 rotate-12" />
            </div>

            <div className="p-8 pb-4">
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <DialogTitle className="text-3xl font-display text-white italic tracking-tighter uppercase leading-none">
                    {step === "initial" ? "Initialize Launch" : step === "preview" ? "Final Review" : "Configure Strategy"}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-muted-foreground font-medium tracking-wide">
                  {step === "initial" ? "Enter your token details to start your growth engine." : step === "preview" ? "Verify all parameters before deploying to Solana." : "Define how you want to scale your project presence."}
                </DialogDescription>
              </DialogHeader>

              {step === "initial" ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 py-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-1">Target Asset</label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50 group-focus-within:opacity-100 transition-opacity" />
                        <Input 
                          placeholder="Enter Solana Token Address (CA)..." 
                          className="h-16 pl-12 bg-primary/5 border-2 border-primary/10 focus:border-primary/40 rounded-2xl text-lg font-mono tracking-tight transition-all"
                          value={form.watch("tokenAddress")}
                          onChange={e => form.setValue("tokenAddress", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-1">Campaign Core</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => form.setValue("campaignType", "engagement")}
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${watchedType === 'engagement' ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                        >
                          <Zap className={`h-8 w-8 ${watchedType === 'engagement' ? 'text-primary' : 'text-white/40'}`} />
                          <div className="text-center">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Social Growth</p>
                            <p className="text-[9px] text-muted-foreground font-bold italic">Pay-Per-Action</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => form.setValue("campaignType", "holder_qualification")}
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3 ${watchedType === 'holder_qualification' ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                        >
                          <Coins className={`h-8 w-8 ${watchedType === 'holder_qualification' ? 'text-primary' : 'text-white/40'}`} />
                          <div className="text-center">
                            <p className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Holder Airdrop</p>
                            <p className="text-[9px] text-muted-foreground font-bold italic">Loyalty Reward</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleInitialSubmit}
                    className="w-full h-16 rounded-[24px] font-black text-lg uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all group"
                  >
                    START CONFIGURATION <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : step === "edit" ? (
                <div className="overflow-y-auto max-h-[65vh] pr-2 custom-scrollbar p-1">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-8 bg-primary/5 border border-primary/10 p-1.5 h-14 rounded-[20px]">
                          <TabsTrigger value="general" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-[10px] uppercase tracking-widest gap-2 transition-all">
                            <Layout className="h-4 w-4" /> BRANDING
                          </TabsTrigger>
                          <TabsTrigger value="actions" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-[10px] uppercase tracking-widest gap-2 transition-all">
                            <ListChecks className="h-4 w-4" /> REWARDS
                          </TabsTrigger>
                          <TabsTrigger value="protections" className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black text-[10px] uppercase tracking-widest gap-2 transition-all">
                            <ShieldCheck className="h-4 w-4" /> SECURITY
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-0 space-y-6">
                          <BasicSettings form={form} fetchTokenMetadata={fetchTokenMetadata} />
                          <div className="flex justify-end pt-4">
                            <Button type="button" onClick={() => setActiveTab("actions")} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg hover:scale-105 transition-all">
                              CONFIGURE REWARDS <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="actions" className="mt-0 space-y-6">
                          {watchedType === "engagement" ? (
                            <EngagementActions form={form} />
                          ) : (
                            <div className="space-y-6">
                              <div className="p-8 bg-primary/10 rounded-[32px] border-2 border-primary/20 text-center space-y-4 shadow-inner relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 p-2 opacity-5"><Coins className="h-24 w-24" /></div>
                                <div className="p-4 bg-primary/20 rounded-3xl w-fit mx-auto shadow-lg"><Coins className="h-10 w-10 text-primary animate-bounce" /></div>
                                <div className="space-y-2">
                                  <h3 className="text-xl font-black uppercase tracking-widest text-white italic">Airdrop Parameters</h3>
                                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Define incentives for your long-term holders</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                  <FormField control={form.control} name="rewardPerWallet" render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Reward / Wallet</FormLabel>
                                      <FormControl><Input type="number" step="0.00001" {...field} className="h-14 bg-primary/5 border-2 border-primary/10 focus:border-primary/40 rounded-2xl text-center font-mono text-lg font-black" /></FormControl>
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name="maxClaims" render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Max Participants</FormLabel>
                                      <FormControl><Input type="number" {...field} className="h-14 bg-primary/5 border-2 border-primary/10 focus:border-primary/40 rounded-2xl text-center font-mono text-lg font-black" /></FormControl>
                                    </FormItem>
                                  )} />
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setActiveTab("general")} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-2">BACK</Button>
                            <Button type="button" onClick={() => setActiveTab("protections")} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg hover:scale-105 transition-all">
                              ACTIVATE SHIELD <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="protections" className="mt-0 space-y-6">
                          <CampaignProtections form={form} />
                          <div className="p-6 bg-white/5 rounded-[28px] border-2 border-white/10 space-y-5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Rocket className="h-24 w-24" /></div>
                            <div className="space-y-4 relative z-10">
                              <div className="flex justify-between items-center group/fee">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover/fee:text-white transition-colors">Airdrop Budget</span>
                                <span className="font-mono text-primary font-black text-lg group-hover/fee:scale-105 transition-transform">{form.watch("totalBudget")?.toLocaleString()} ${form.watch("tokenName")}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                <div className="flex flex-col gap-1">
                                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Platform Fee: 0.50 SOL</span>
                                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-primary/40 rounded-full" /> Gas (Escrow): {gasFeeSol} SOL</span>
                                </div>
                                <div className="text-right">
                                  <span className="block text-primary/40 mb-1 italic">Secured in Smart Contract</span>
                                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-white font-mono">Total: {(0.5 + gasFeeSol).toFixed(4)} SOL</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setActiveTab("actions")} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-2">BACK</Button>
                            <Button type="submit" className="h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs bg-primary shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-105 transition-all">
                              PREVIEW CAMPAIGN <Sparkles className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </form>
                  </Form>
                </div>
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
