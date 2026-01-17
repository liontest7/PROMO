import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { CONFIG, PLATFORM_CONFIG } from "@shared/config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Rocket, Eye, CheckCircle2, Globe, Twitter, Send, Loader2, Coins, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { SuccessCard } from "./SuccessCard";

// Form Schema
const formSchema = insertCampaignSchema.extend({
  title: z.string().min(3, "Campaign title must be at least 3 characters").max(50, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  tokenName: z.string().min(1, "Token symbol is required").max(10, "Symbol too long"),
  tokenAddress: z.string().min(32, "Invalid Solana address").max(44, "Invalid Solana address"),
  campaignType: z.enum(["engagement", "holder_qualification"], {
    required_error: "Please select a campaign category",
  }),
  totalBudget: z.coerce.number().min(0.00001, "Total budget must be greater than 0"),
  minHoldingAmount: z.coerce.number().min(0).optional().nullable(),
  minHoldingDuration: z.coerce.number().min(0).optional().nullable(),
  rewardPerWallet: z.coerce.number().min(0).optional().nullable(),
  maxClaims: z.coerce.number().min(1, "At least 1 participant required").optional().nullable(),
  actions: z.array(insertActionSchema.omit({ campaignId: true }).extend({
    type: z.string().min(1, "Action type required"),
    title: z.string().min(3, "Action title required"),
    url: z.string().url("Invalid action URL"),
    rewardAmount: z.coerce.number().min(0.00001, "Reward must be greater than 0"),
    maxExecutions: z.coerce.number().min(1, "Executions must be at least 1")
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
}).refine((data) => {
  if (data.campaignType === "engagement") {
    return data.actions && data.actions.length > 0;
  }
  return true;
}, {
  message: "Engagement campaigns require at least one action",
  path: ["actions"],
}).refine((data) => {
  if (data.campaignType === "holder_qualification") {
    return (data.rewardPerWallet || 0) > 0 && (data.maxClaims || 0) > 0;
  }
  return true;
}, {
  message: "Reward and participants are required for holder campaigns",
  path: ["rewardPerWallet"],
});

type FormValues = z.infer<typeof formSchema>;

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const watchedActions = form.watch("actions");
  const watchedType = form.watch("campaignType");
  const watchedTokenAddress = form.watch("tokenAddress");

  const isHolderDisabled = !settings?.holderQualificationEnabled;
  const isSocialDisabled = !settings?.socialEngagementEnabled;

  const getCampaignStatusLabel = (type: string) => {
    if (type === "holder_qualification" && isHolderDisabled) return "(Maintenance)";
    if (type === "engagement" && isSocialDisabled) return "(Maintenance)";
    return "(Live)";
  };
  
  const totalCalculatedCost = (watchedActions || []).reduce((acc, action) => {
    const reward = Number(action.rewardAmount) || 0;
    const executions = Number(action.maxExecutions) || 0;
    return acc + (reward * executions);
  }, 0);

  const platformFee = PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE;
  const baseGasFee = PLATFORM_CONFIG.FEE_SOL; 
  const perRewardGasFee = 0.0015; 
  
  const totalExecutions = watchedType === "holder_qualification" 
    ? Number(form.watch("maxClaims") || 0)
    : (watchedActions || []).reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0);
    
  const dynamicGasFee = baseGasFee + (totalExecutions * perRewardGasFee);
  const gasFeeSol = Number(dynamicGasFee.toFixed(4));
  const airdropBudget = watchedType === "holder_qualification" 
    ? (Number(form.watch("rewardPerWallet")) * Number(form.watch("maxClaims")) || 0)
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
  }, [totalCalculatedCost, form.watch("rewardPerWallet"), form.watch("maxClaims"), watchedType, form]);

  const fetchTokenMetadata = async (address: string) => {
    if (!address || address.length < 32) return;
    try {
      const mergedMetadata: any = {};
      const dexPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`)
        .then(res => res.json())
        .catch(() => null);
      const pumpPromise = fetch(`https://pmpapi.fun/api/get_metadata/${address}`)
        .then(res => res.json())
        .catch(() => null);
      const moralisPromise = fetch(`https://solana-gateway.moralis.io/token/mainnet/${address}/metadata`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhY2M3ZmQ1LWYyOTgtNGY5Zi1iZDIwLTdiYWM5MWRkMjNhNCIsIm9yZ0lkIjoiNDcxNTg3IiwidXNlcklkIjoiNDg1MTI3IiwidHlwZUlkIjoiYmVlNmFiMTItODg0NS00Nzc3LWJlMDQtODU4ODYzOTYxMjAxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTgzNDIwMzksImV4cCI6NDkxNDEwMjAzOX0.twhytkJWhGoqh5NVfhSkG9Irub-cS2cSSqKqPCI5Ur8'
        }
      })
        .then(res => res.json())
        .catch(() => null);

      const jupPromise = fetch(`https://tokens.jup.ag/token/${address}`)
        .then(res => res.json())
        .catch(() => null);

      const [dexData, pumpData, moralisData, jupData] = await Promise.all([dexPromise, pumpPromise, moralisPromise, jupPromise]);

      mergedMetadata.logoUrl = "";

      if (pumpData && pumpData.success && pumpData.result) {
        const res = pumpData.result;
        if (!mergedMetadata.tokenName) mergedMetadata.tokenName = res.symbol;
        if (!mergedMetadata.title) mergedMetadata.title = `${res.name} Growth Campaign`;
        mergedMetadata.logoUrl = `https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image/${address}/86x86?alpha=true`;
        if (!mergedMetadata.description) mergedMetadata.description = res.description;
      }

      if (!mergedMetadata.logoUrl && jupData && jupData.logoURI) {
        mergedMetadata.logoUrl = jupData.logoURI;
        if (jupData.symbol && !mergedMetadata.tokenName) mergedMetadata.tokenName = jupData.symbol;
      }

      if (dexData && dexData.pairs && dexData.pairs.length > 0) {
        const bestPair = dexData.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        const token = bestPair.baseToken;
        if (token.symbol && !mergedMetadata.tokenName) mergedMetadata.tokenName = token.symbol;
        if (token.name && !mergedMetadata.title) mergedMetadata.title = `${token.name} Growth Campaign`;
        
        if (!mergedMetadata.logoUrl && bestPair.info?.imageUrl) {
           mergedMetadata.logoUrl = bestPair.info.imageUrl;
        }
        if (bestPair.info?.header) mergedMetadata.bannerUrl = bestPair.info.header;
        if (bestPair.info?.websites?.[0]?.url) mergedMetadata.websiteUrl = bestPair.info.websites[0].url;
        const twitter = bestPair.info?.socials?.find((s: any) => s.type === 'twitter');
        if (twitter?.url) mergedMetadata.twitterUrl = twitter.url;
        const telegram = bestPair.info?.socials?.find((s: any) => s.type === 'telegram');
        if (telegram?.url) mergedMetadata.telegramUrl = telegram.url;
      }

      if (moralisData && moralisData.mint) {
        if (moralisData.symbol && !mergedMetadata.tokenName) mergedMetadata.tokenName = moralisData.symbol;
        if (moralisData.name && !mergedMetadata.title) mergedMetadata.title = `${moralisData.name} Growth Campaign`;
        if (moralisData.logo && !mergedMetadata.logoUrl) {
           mergedMetadata.logoUrl = moralisData.logo;
        }
        if (moralisData.description && !mergedMetadata.description) mergedMetadata.description = moralisData.description;
        if (moralisData.links?.website && !mergedMetadata.websiteUrl) mergedMetadata.websiteUrl = moralisData.links.website;
        if (moralisData.links?.twitter && !mergedMetadata.twitterUrl) mergedMetadata.twitterUrl = moralisData.links.twitter;
      }

      if (Object.keys(mergedMetadata).length > 0) {
        if (mergedMetadata.tokenName) form.setValue('tokenName', mergedMetadata.tokenName);
        if (mergedMetadata.title && !form.getValues('title')) form.setValue('title', mergedMetadata.title);
        if (mergedMetadata.logoUrl) form.setValue('logoUrl', mergedMetadata.logoUrl);
        if (mergedMetadata.bannerUrl) form.setValue('bannerUrl', mergedMetadata.bannerUrl);
        if (mergedMetadata.description && !form.getValues('description')) form.setValue('description', mergedMetadata.description);
        if (mergedMetadata.websiteUrl) form.setValue('websiteUrl', mergedMetadata.websiteUrl);
        if (mergedMetadata.twitterUrl) form.setValue('twitterUrl', mergedMetadata.twitterUrl);
        if (mergedMetadata.telegramUrl) form.setValue('telegramUrl', mergedMetadata.telegramUrl);
        
        let mcValue = "";
        if (dexData?.pairs?.[0]?.marketCap) {
          mcValue = dexData.pairs[0].marketCap.toString();
        } else if (dexData?.pairs?.[0]?.fdv) {
          mcValue = dexData.pairs[0].fdv.toString();
        } else if (moralisData?.market_cap_usd) {
          mcValue = moralisData.market_cap_usd.toString();
        }
        
        if (mcValue) {
          form.setValue('initialMarketCap', mcValue);
        }

        toast({ title: "Metadata Loaded", description: `Successfully retrieved token details.` });
      } else {
        toast({ title: "Limited Data", description: "Found token but could not retrieve full metadata.", variant: "default" });
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

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

  const getActionDefaultTitle = (type: string) => {
    switch (type) {
      case "website": return "Visit Website";
      case "twitter_follow": return "Follow on Twitter";
      case "twitter_retweet": return "Retweet Post";
      case "telegram_join": return "Join Telegram";
      default: return "Custom Task";
    }
  };

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <FormField
                      control={form.control}
                      name="tokenAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-black uppercase tracking-widest text-[10px]">Token Mint Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Solana Mint Address..." 
                              className="bg-primary/5 border-primary/20 focus:border-primary h-12 font-mono text-xs text-white"
                              {...field} 
                              onChange={(e) => { 
                                field.onChange(e); 
                                fetchTokenMetadata(e.target.value); 
                              }} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="campaignType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-black uppercase tracking-widest text-[10px]">Campaign Category</FormLabel>
                          <Select onValueChange={(value) => { field.onChange(value); if (value === "holder_qualification") { form.setValue("actions", []); } else { form.setValue("actions", [{ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 }]); } }} value={field.value}>
                            <FormControl><SelectTrigger className="h-12 bg-primary/5 border-primary/20 font-black uppercase tracking-widest text-xs text-white"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                            <SelectContent className="bg-black border-white/10">
                              <SelectItem value="holder_qualification" disabled={isHolderDisabled || loadingSettings} className="font-black uppercase tracking-widest text-xs py-3 text-white">
                                Holder Qualification {getCampaignStatusLabel("holder_qualification")}
                              </SelectItem>
                              <SelectItem value="engagement" disabled={isSocialDisabled || loadingSettings} className="font-black uppercase tracking-widest text-xs py-3 text-white">
                                Social Engagement {getCampaignStatusLabel("engagement")}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchedType && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                      
                      {/* Project Details Section - Always Visible */}
                      <div className="space-y-4">
                        <div className="border border-white/10 bg-white/[0.02] rounded-3xl overflow-hidden px-6 pb-6">
                          <div className="flex items-center gap-3 py-4 border-b border-white/5 mb-4">
                            <Globe className="w-5 h-5 text-primary" />
                            <span className="font-black uppercase tracking-widest text-xs text-white">Project Details</span>
                          </div>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] uppercase font-black text-white">Campaign Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter title..." className="bg-white/5 border-white/10 text-white text-base h-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="tokenName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] uppercase font-black text-white">Token Symbol</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. SOL" className="bg-white/5 border-white/10 text-white text-base h-11" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] uppercase font-black text-white">Description</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Tell users about your project..." className="bg-white/5 border-white/10 min-h-[100px] text-white text-base" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Accordion type="single" collapsible defaultValue="assets" className="space-y-4">
                          <AccordionItem value="assets" className="border border-white/10 bg-white/[0.02] rounded-3xl overflow-hidden px-6">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-3">
                                <Plus className="w-5 h-5 text-primary" />
                                <span className="font-black uppercase tracking-widest text-xs text-white">Assets & Links</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6 space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="logoUrl" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-black text-white">Logo URL</FormLabel><FormControl><Input placeholder="https://..." className="bg-white/5 border-white/10 text-white" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="bannerUrl" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-black text-white">Banner URL</FormLabel><FormControl><Input placeholder="https://..." className="bg-white/5 border-white/10 text-white" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-black text-white">Website</FormLabel><FormControl><Input placeholder="https://..." className="bg-white/5 border-white/10 text-white" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-black text-white">Twitter</FormLabel><FormControl><Input placeholder="https://x.com/..." className="bg-white/5 border-white/10 text-white" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="telegramUrl" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-black text-white">Telegram</FormLabel><FormControl><Input placeholder="https://t.me/..." className="bg-white/5 border-white/10 text-white" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {/* Unified Anti-Bot Protection Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                          <Shield className="w-5 h-5 text-orange-500" />
                          <div className="flex-1">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none mb-1">Advanced Anti-Bot Protection</h3>
                            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Multi-layer security for your campaign</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-white/5 bg-white/5">
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest border-b border-white/5 pb-2">Wallet Requirements</p>
                            <FormField control={form.control} name="minSolBalance" render={({ field }) => (
                              <FormItem><FormLabel className="text-[10px] uppercase font-bold text-white">Min SOL Balance</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.1" className="h-10 bg-black/20 text-white text-base" {...field} /></FormControl></FormItem>
                            )} />
                            <FormField control={form.control} name="minWalletAgeDays" render={({ field }) => (
                              <FormItem><FormLabel className="text-[10px] uppercase font-bold text-white">Min Wallet Age (Days)</FormLabel><FormControl><Input type="number" placeholder="30" className="h-10 bg-black/20 text-white text-base" {...field} /></FormControl></FormItem>
                            )} />
                          </div>

                          <div className="space-y-4 border-l border-white/5 pl-4">
                            <p className="text-[10px] font-black uppercase text-[#1DA1F2] tracking-widest border-b border-white/5 pb-2">X (Twitter) Requirements</p>
                            <div className="grid grid-cols-1 gap-3">
                              <FormField control={form.control} name="minXAccountAgeDays" render={({ field }) => (
                                <FormItem><FormLabel className="text-[10px] uppercase font-bold text-white">Account Age (Days)</FormLabel><FormControl><Input type="number" placeholder="90" className="h-10 bg-black/20 text-white text-base" {...field} /></FormControl></FormItem>
                              )} />
                              <div className="grid grid-cols-2 gap-3">
                                <FormField control={form.control} name="minXFollowers" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-bold text-white">Min Followers</FormLabel><FormControl><Input type="number" placeholder="10" className="h-10 bg-black/20 text-white text-base" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="minFollowDurationDays" render={({ field }) => (
                                  <FormItem><FormLabel className="text-[10px] uppercase font-bold text-white">Hold Follow (Days)</FormLabel><FormControl><Input type="number" placeholder="3" className="h-10 bg-black/20 text-white text-base" {...field} /></FormControl></FormItem>
                                )} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Visual Summary Sentence */}
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-[11px] font-bold text-white leading-relaxed uppercase tracking-tight">
                            <span className="text-primary mr-1">Final Setup:</span>
                            Only users with {form.watch('minSolBalance') || 0} SOL & {form.watch('minWalletAgeDays') || 0} day old wallets can participate. 
                            {form.watch('minXAccountAgeDays') > 0 && ` Accounts must be ${form.watch('minXAccountAgeDays')}d+ old.`}
                            {form.watch('minXFollowers') > 0 && ` ${form.watch('minXFollowers')}+ followers required.`}
                            {form.watch('minFollowDurationDays') > 0 && ` Must maintain follow for ${form.watch('minFollowDurationDays')} days.`}
                          </p>
                        </div>
                      </div>

                      {watchedType === "holder_qualification" ? (
                        <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <h3 className="font-semibold text-primary flex items-center gap-2 uppercase tracking-widest text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Holding Requirements
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="minHoldingAmount" render={({ field }) => (
                              <FormItem><FormLabel className="text-white font-bold">Min Holding Amount</FormLabel><FormControl><Input type="number" placeholder="1000" className="text-white text-base" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="minHoldingDuration" render={({ field }) => (
                              <FormItem><FormLabel className="text-white font-bold">Min Duration (Days)</FormLabel><FormControl><Input type="number" placeholder="7" className="text-white text-base" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="rewardPerWallet" render={({ field }) => (
                              <FormItem><FormLabel className="text-white font-bold">Reward Per Wallet</FormLabel><FormControl><Input type="number" placeholder="10" className="text-white text-base" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="maxClaims" render={({ field }) => (
                              <FormItem><FormLabel className="text-white font-bold">Max Participants</FormLabel><FormControl><Input type="number" placeholder="100" className="text-white text-base" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-primary flex items-center gap-2 uppercase tracking-widest text-xs">
                              <Twitter className="w-4 h-4" /> Social Missions
                            </h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => append({ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 })}
                              className="h-8 text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/10 text-white"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Task
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {fields.map((field, index) => (
                              <div key={field.id} className="p-4 rounded-lg bg-background/50 border border-white/5 space-y-4 relative group">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>

                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`actions.${index}.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black text-white">Type</FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); form.setValue(`actions.${index}.title`, getActionDefaultTitle(val)); }} defaultValue={field.value}>
                                          <FormControl><SelectTrigger className="h-10 text-white bg-black/40"><SelectValue /></SelectTrigger></FormControl>
                                          <SelectContent className="bg-black border-white/10">
                                            <SelectItem value="website" className="text-white">Website</SelectItem>
                                            <SelectItem value="twitter_follow" className="text-white">X Follow</SelectItem>
                                            <SelectItem value="twitter_retweet" className="text-white">X Retweet</SelectItem>
                                            <SelectItem value="telegram_join" className="text-white">Telegram</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`actions.${index}.title`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black text-white">Task Label</FormLabel>
                                        <FormControl><Input className="h-10 text-white text-base" {...field} /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={form.control}
                                  name={`actions.${index}.url`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[10px] uppercase font-black text-white">Target URL</FormLabel>
                                      <FormControl><Input className="h-10 text-white text-base" placeholder="https://..." {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`actions.${index}.rewardAmount`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black text-white">Reward</FormLabel>
                                        <FormControl><Input type="number" step="any" className="h-10 text-white text-base" {...field} /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`actions.${index}.maxExecutions`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black text-white">Slots</FormLabel>
                                        <FormControl><Input type="number" className="h-10 text-white text-base" {...field} /></FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-primary uppercase tracking-widest">Payment Breakdown</span>
                          <Badge variant="outline" className="text-[10px] uppercase border-primary/20 text-primary font-black">Live Summary</Badge>
                        </div>
                        
                        <div className="space-y-2 border-b border-primary/10 pb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60 italic font-medium">Airdrop Budget</span>
                            <span className="font-black text-white">{watchedType === "holder_qualification" 
                                ? (Number(form.watch("rewardPerWallet")) * Number(form.watch("maxClaims")) || 0).toLocaleString()
                                : totalCalculatedCost.toLocaleString()
                              } {form.watch("tokenName") || "Tokens"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60 italic font-medium">Platform Fee</span>
                            <span className="font-black text-white">{platformFee.toLocaleString()} {PLATFORM_CONFIG.TOKEN_SYMBOL}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60 italic font-medium">Network Gas (SOL)</span>
                            <div className="text-right">
                              <span className="font-black text-emerald-400">{gasFeeSol} SOL</span>
                              <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">
                                {totalExecutions > 0 ? `Covers ${totalExecutions} distribution txs` : "Creation fee included"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end pt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Total to Pay</p>
                            <div className="space-y-1">
                              <p className="text-2xl font-black text-white leading-none">
                                {airdropBudget.toLocaleString(undefined, { maximumFractionDigits: 6 })} 
                                <span className="text-xs ml-1 font-bold text-white/70">{form.watch("tokenName") || "Tokens"}</span>
                              </p>
                              <p className="text-2xl font-black text-primary leading-none">
                                {platformFee.toLocaleString()} 
                                <span className="text-xs ml-1 font-bold text-primary/70">{PLATFORM_CONFIG.TOKEN_SYMBOL}</span>
                              </p>
                              <p className="text-sm text-emerald-400 font-black tracking-widest">+ {gasFeeSol} SOL GAS FEE</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-black">Total Slots</p>
                            <p className="text-2xl font-black text-white">
                              {totalExecutions}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-primary/10 p-3 rounded-lg flex items-start gap-3 border border-primary/20">
                           <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                           <p className="text-[11px] text-primary font-bold leading-relaxed uppercase tracking-tight">
                             You will sign <strong>one single transaction</strong> to authorize both the token budget and platform fees.
                           </p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button 
                          type="button" 
                          className="flex-1 font-black text-sm h-14 bg-primary text-primary-foreground uppercase tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.4)] transition-all" 
                          onClick={async () => {
                            const isValid = await form.trigger();
                            if (isValid) {
                              setStep("preview");
                            } else {
                              toast({
                                title: "Incomplete Form",
                                description: "Please fill in all required fields marked with errors.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Eye className="mr-2 h-5 w-5" /> PREVIEW BEFORE LAUNCH
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            ) : (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-primary/10 border border-primary/20 group">
                  {form.getValues("bannerUrl") ? (
                    <img src={form.getValues("bannerUrl")} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Banner" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                      <Rocket className="w-20 h-20 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
                    <div className="w-24 h-24 rounded-3xl border-4 border-black bg-black overflow-hidden shadow-2xl">
                      <img src={form.getValues("logoUrl")} className="w-full h-full object-cover" alt="Logo" />
                    </div>
                    <div className="flex-1 mb-2">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">{form.getValues("title")}</h3>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px]">
                          {form.getValues("campaignType") === "engagement" ? "Social Mission" : "Holder Airdrop"}
                        </Badge>
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                          ${form.getValues("tokenName")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Budget</p>
                    <p className="text-xl font-black text-white">{Number(form.getValues("totalBudget")).toLocaleString()} ${form.getValues("tokenName")}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Rewards</p>
                    <p className="text-xl font-black text-white">{totalExecutions} Slots</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sol Gas</p>
                    <p className="text-xl font-black text-emerald-400">{gasFeeSol} SOL</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Security Config
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-white border-white/10 uppercase font-black text-[9px] py-1 px-3">
                        {form.getValues("minWalletAgeDays")}d+ Wallet Age
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/10 uppercase font-black text-[9px] py-1 px-3">
                        {form.getValues("minSolBalance")} SOL+ Balance
                      </Badge>
                      {Number(form.getValues("minXFollowers")) > 0 && (
                        <Badge variant="outline" className="text-white border-white/10 uppercase font-black text-[9px] py-1 px-3">
                          {form.getValues("minXFollowers")} Followers
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep("edit")} 
                    className="flex-1 h-14 font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5 text-white"
                  >
                    Edit Details
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    disabled={isPending}
                    className="flex-[2] h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest text-base hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] transition-all"
                  >
                    {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRM & DEPLOY"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {showSuccessCard && createdCampaign && (
        <SuccessCard
          isOpen={showSuccessCard}
          onClose={() => setShowSuccessCard(false)}
          campaignTitle={createdCampaign.title}
          rewardAmount={createdCampaign.rewardPerWallet || "0"}
          tokenName={createdCampaign.tokenName}
          actionTitle={createdCampaign.campaignType === 'engagement' ? "Social Engagement" : "Holder Qualification"}
        />
      )}
    </>
  );
}
