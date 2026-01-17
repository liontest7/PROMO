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
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles, ChevronRight, Layout, ShieldCheck, ListChecks, Coins, Search, Zap, Loader2, Info, X } from "lucide-react";
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
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
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

  // Drafts system
  useEffect(() => {
    if (open && step === "initial") {
      const draft = localStorage.getItem("campaign_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          // Only restore if it's less than 24h old
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            form.reset(parsed.data);
            if (parsed.data.tokenAddress && parsed.data.campaignType) {
              setStep("edit");
            }
          }
        } catch (e) {
          console.error("Draft restoration failed", e);
        }
      }
    }
  }, [open, step, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        localStorage.setItem("campaign_draft", JSON.stringify({
          data: value,
          timestamp: Date.now()
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const watchedType = form.watch("campaignType");
  const watchedActions = form.watch("actions") || [];
  const watchedMaxClaims = form.watch("maxClaims") || 0;

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
    } else {
      const total = watchedActions.reduce((acc, a) => acc + (Number(a.rewardAmount) * Number(a.maxExecutions) || 0), 0);
      form.setValue("totalBudget", Number(total.toFixed(6)));
    }
  }, [watchedActions, form.watch("rewardPerWallet"), watchedMaxClaims, watchedType]);

  const fetchTokenMetadata = async (address: string) => {
    if (!address || address.length < 32) return;
    setIsFetchingMetadata(true);
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

      let found = false;
      if (pumpData?.success && pumpData.result) {
        const res = pumpData.result;
        form.setValue("tokenName", res.symbol);
        form.setValue("title", `${res.name} Growth Campaign`);
        form.setValue("logoUrl", `https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image/${address}/86x86?alpha=true`);
        form.setValue("description", res.description || "");
        found = true;
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
        found = true;
      } else if (jupData) {
        form.setValue("tokenName", jupData.symbol);
        form.setValue("logoUrl", jupData.logoURI);
        found = true;
      }
      
      if (moralisData && moralisData.mint) {
        if (!form.getValues("tokenName")) form.setValue("tokenName", moralisData.symbol);
        if (!form.getValues("logoUrl")) form.setValue("logoUrl", moralisData.logo);
        if (moralisData.description && !form.getValues("description")) form.setValue("description", moralisData.description);
        found = true;
      }
      
      if (found) toast({ title: "Metadata Loaded", description: "Project details retrieved successfully." });
    } catch (e) { console.error("Metadata error:", e); } finally { setIsFetchingMetadata(false); }
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
    setActiveTab("general");
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
        minProjectTokenHolding: (values.minHoldingAmount || 0) > 0 ? {
          amount: values.minHoldingAmount || 0,
          days: values.minHoldingDuration || 0
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
      <Dialog open={open} onOpenChange={o => { 
        if (!o) {
          // If the step is preview, we probably finished or want to keep it.
          // But if they just hit the background while editing, let's keep the draft.
          // We'll use a heuristic: if they click "X" (hard close), we reset.
          // However, Radix doesn't expose the trigger source easily.
          // Let's keep the data if it's a background click, but for now we'll 
          // default to NOT resetting unless it's a specific action.
        }
        setOpen(o); 
      }}>
        <DialogTrigger asChild>
          <Button onClick={e => {
            if (!isConnected) { e.preventDefault(); connect("advertiser"); return; }
            if (settings?.campaignsEnabled === false) { 
              e.preventDefault(); 
              toast({ title: "Maintenance", description: "Campaign creation is disabled.", variant: "destructive" }); 
              return;
            }
          }} className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all h-14 px-10 rounded-2xl border-b-4 border-black/20 active:border-b-0 active:translate-y-1 group">
            <Rocket className="mr-3 h-6 w-6 animate-bounce group-hover:animate-pulse transition-all" /> LAUNCH CAMPAIGN
          </Button>
        </DialogTrigger>
        <DialogContent 
          onPointerDownOutside={(e) => {
            // Keep the data on background click
            e.preventDefault();
            setOpen(false);
          }}
          className="max-w-3xl max-h-[95vh] flex flex-col glass-card border-primary/20 p-0 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2"
        >
          <DialogClose 
            onClick={() => {
              // RESET only on X button
              setStep("initial"); 
              setActiveTab("general");
              form.reset({
                title: "", description: "", tokenName: "", tokenAddress: "", totalBudget: 0.1,
                bannerUrl: "", logoUrl: "", websiteUrl: "", twitterUrl: "", telegramUrl: "",
                minSolBalance: 0, minWalletAgeDays: 0, minXAccountAgeDays: 0, minXFollowers: 0,
                minFollowDurationDays: 0, multiDaySolAmount: 0, multiDaySolDays: 0,
                minHoldingAmount: 0, minHoldingDuration: 0,
                campaignType: undefined, actions: [], creatorId: userId || undefined,
              });
              localStorage.removeItem("campaign_draft");
            }}
            className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-[100]"
          >
            <X className="h-6 w-6 text-white" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="absolute top-0 right-0 p-16 text-primary/5 pointer-events-none overflow-hidden">
              <Zap className="h-64 w-64 rotate-12 animate-pulse" />
            </div>

            <div className="px-10 pt-6 shrink-0">
              <DialogHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-2">
                      {step === "initial" ? (
                        <>
                          <span className="text-white">INITIALIZE</span>
                          <span className="text-primary">MISSION</span>
                        </>
                      ) : step === "preview" ? (
                        <>
                          <span className="text-white">PREVIEW</span>
                          <span className="text-primary">MISSION</span>
                        </>
                      ) : (
                        <>
                          <span className="text-white">STRATEGIC</span>
                          <span className="text-primary">OVERRIDE</span>
                        </>
                      )}
                    </DialogTitle>
                    <div className="h-1 w-full bg-primary mt-1 rounded-full" />
                  </div>
                </div>
                <DialogDescription className="text-white font-bold tracking-[0.1em] uppercase text-sm opacity-90 pb-2">
                  {step === "initial" ? "Input Token Signature (CA) to begin protocol." : step === "preview" ? "Verify all mission parameters before deployment." : "Override settings for maximum project impact."}
                </DialogDescription>
              </DialogHeader>

              {step === "initial" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-700 py-6">
                  <div className="grid grid-cols-1 gap-6 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-black text-primary uppercase tracking-[0.3em]">Token Address (CA)</label>
                        {form.watch("tokenName") && (
                          <Badge variant="outline" className="text-[10px] font-black border-primary text-primary tracking-widest uppercase bg-primary/10 animate-in fade-in zoom-in">
                            LOADED: ${form.watch("tokenName")}
                          </Badge>
                        )}
                        {!form.watch("tokenName") && (
                          <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary/60 tracking-widest uppercase">Solana Mainnet</Badge>
                        )}
                      </div>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-primary opacity-40 group-focus-within:opacity-100 transition-all duration-500">
                          {isFetchingMetadata ? <Loader2 className="animate-spin" /> : <Search />}
                        </div>
                        <Input 
                          placeholder="Paste Contract Address..." 
                          className="h-16 pl-14 bg-primary/5 border-2 border-primary/10 focus:border-primary/50 rounded-2xl text-lg font-mono tracking-tighter transition-all shadow-inner group-hover:border-primary/30 text-white"
                          value={form.watch("tokenAddress")}
                          autoComplete="on"
                          name="tokenAddress"
                          id="tokenAddress"
                          onChange={e => {
                            const val = e.target.value;
                            form.setValue("tokenAddress", val);
                            if (val.length >= 32) fetchTokenMetadata(val);
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-primary uppercase tracking-[0.3em] px-2">Mission Objective</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => form.setValue("campaignType", "engagement")}
                          className={`flex flex-col items-center justify-center p-6 rounded-[24px] border-4 transition-all gap-3 relative overflow-hidden group/btn ${watchedType === 'engagement' ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                        >
                          <div className={`absolute inset-0 bg-primary/5 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700`} />
                          <Zap className={`h-10 w-10 relative z-10 ${watchedType === 'engagement' ? 'text-primary scale-110' : 'text-white/40'} transition-all`} />
                          <div className="text-center relative z-10">
                            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-white leading-none mb-1">Social Growth</p>
                            <p className="text-[9px] text-white font-black italic uppercase tracking-widest opacity-80">Engagement</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => form.setValue("campaignType", "holder_qualification")}
                          className={`flex flex-col items-center justify-center p-6 rounded-[24px] border-4 transition-all gap-3 relative overflow-hidden group/btn ${watchedType === 'holder_qualification' ? 'bg-primary/20 border-primary shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                        >
                          <div className={`absolute inset-0 bg-primary/5 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700`} />
                          <Coins className={`h-10 w-10 relative z-10 ${watchedType === 'holder_qualification' ? 'text-primary scale-110' : 'text-white/40'} transition-all`} />
                          <div className="text-center relative z-10">
                            <p className="text-[12px] font-black uppercase tracking-[0.15em] text-white leading-none mb-1">Holder Reward</p>
                            <p className="text-[9px] text-white font-black italic uppercase tracking-widest opacity-80">Retention</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleInitialSubmit}
                    disabled={isFetchingMetadata || !form.watch("tokenAddress")}
                    className="w-full h-16 rounded-[24px] font-black text-lg uppercase tracking-[0.3em] bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all group relative overflow-hidden active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    {isFetchingMetadata ? <Loader2 className="animate-spin h-7 w-7" /> : <div className="flex items-center gap-3 text-white">INITIALIZE <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" /></div>}
                  </Button>
                </div>
              )}
            </div>

            {step !== "initial" && (
              <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar animate-in fade-in duration-500">
                {step === "edit" ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-6 mt-4 bg-primary/5 border-2 border-primary/10 p-1.5 h-14 rounded-[20px] shadow-inner shrink-0 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
                          <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:!text-primary-foreground font-black text-[13px] uppercase tracking-[0.2em] gap-3 transition-all shadow-sm text-white hover:text-white">
                            <Layout className="h-4 w-4" /> BRANDING
                          </TabsTrigger>
                          <TabsTrigger value="protections" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:!text-primary-foreground font-black text-[13px] uppercase tracking-[0.2em] gap-3 transition-all shadow-sm text-white hover:text-white">
                            <ShieldCheck className="h-4 w-4" /> SHIELD
                          </TabsTrigger>
                          <TabsTrigger value="actions" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:!text-primary-foreground font-black text-[13px] uppercase tracking-[0.2em] gap-3 transition-all shadow-sm text-white hover:text-white">
                            <ListChecks className="h-4 w-4" /> REWARDS
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-8 duration-500">
                          <BasicSettings form={form} fetchTokenMetadata={fetchTokenMetadata} />
                          <div className="flex justify-between pt-6 gap-4 pb-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setStep("initial");
                                setActiveTab("general");
                              }}
                              className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-2 hover:bg-white/5 relative z-[100] cursor-pointer touch-none"
                            >
                              BACK
                            </Button>
                            <Button type="button" onClick={() => setActiveTab("protections")} className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:scale-105 transition-all">
                              CONFIGURE SECURITY <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="protections" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-8 duration-500">
                          <CampaignProtections form={form} />
                          <div className="flex justify-between pt-6 gap-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveTab("general");
                              }}
                              className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-2 hover:bg-white/5 relative z-[100] cursor-pointer touch-none"
                            >
                              BACK
                            </Button>
                            <Button type="button" onClick={() => setActiveTab("actions")} className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs gap-3 shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:scale-105 transition-all">
                              DESIGN REWARDS <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="actions" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-8 duration-500">
                          <EngagementActions form={form} gasFeeSol={gasFeeSol} />
                          <div className="flex justify-between pt-6 gap-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveTab("protections");
                              }}
                              className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-2 hover:bg-white/5 relative z-[100] cursor-pointer touch-none"
                            >
                              BACK
                            </Button>
                            <Button type="submit" className="h-16 px-12 rounded-2xl font-black uppercase tracking-[0.3em] text-sm bg-primary shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:scale-105 transition-all">
                              REVIEW MISSION <Sparkles className="h-5 w-5 ml-2" />
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
                    gasFeeSol={gasFeeSol}
                  />
                )}
              </div>
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
