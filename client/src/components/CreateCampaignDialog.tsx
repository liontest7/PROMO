import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Plus, Trash2, Rocket, Eye, CheckCircle2, Globe, Twitter, Send, Loader2, Coins } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignSuccessCard } from "./CampaignSuccessCard";

// Form Schema
const formSchema = insertCampaignSchema.extend({
  campaignType: z.enum(["engagement", "holder_qualification"]).default("engagement"),
  totalBudget: z.coerce.number().min(0.00001).optional(),
  minHoldingAmount: z.coerce.number().min(0).optional(),
  minHoldingDuration: z.coerce.number().min(0).optional(),
  rewardPerWallet: z.coerce.number().min(0).optional(),
  maxClaims: z.coerce.number().min(1).optional(),
  actions: z.array(insertActionSchema.omit({ campaignId: true }).extend({
    rewardAmount: z.coerce.number().min(0.00001),
    maxExecutions: z.coerce.number().min(1)
  })).optional(),
  creatorId: z.number().optional(),
  bannerUrl: z.string().url("Invalid banner URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid website URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
  telegramUrl: z.string().url("Invalid Telegram URL").optional().or(z.literal("")),
  minSolBalance: z.coerce.number().min(0).default(0),
  minWalletAgeDays: z.coerce.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { isConnected, userId, connect } = useWallet();
  const { toast } = useToast();

  const handleOpenClick = (e: React.MouseEvent) => {
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
      campaignType: undefined as any,
      actions: [],
      creatorId: userId || undefined
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const watchedActions = form.watch("actions");
  const watchedType = form.watch("campaignType");
  const watchedTokenAddress = form.watch("tokenAddress");
  
  const totalCalculatedCost = (watchedActions || []).reduce((acc, action) => {
    const reward = Number(action.rewardAmount) || 0;
    const executions = Number(action.maxExecutions) || 0;
    return acc + (reward * executions);
  }, 0);

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
      // Create an object to store merged metadata
      const mergedMetadata: any = {};

      // 1. Fetch from DexScreener (Best for liquidity, socials, and header)
      const dexPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`)
        .then(res => res.json())
        .catch(() => null);

      // 2. Fetch from Pump.fun API (Best for native pump tokens and IPFS images)
      const pumpPromise = fetch(`https://pmpapi.fun/api/get_metadata/${address}`)
        .then(res => res.json())
        .catch(() => null);

      // 3. Fetch from Moralis (Excellent for logos and native supply)
      const moralisPromise = fetch(`https://solana-gateway.moralis.io/token/mainnet/${address}/metadata`, {
        headers: {
          'accept': 'application/json',
          'X-API-Key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhY2M3ZmQ1LWYyOTgtNGY5Zi1iZDIwLTdiYWM5MWRkMjNhNCIsIm9yZ0lkIjoiNDcxNTg3IiwidXNlcklkIjoiNDg1MTI3IiwidHlwZUlkIjoiYmVlNmFiMTItODg0NS00Nzc3LWJlMDQtODU4ODYzOTYxMjAxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTgzNDIwMzksImV4cCI6NDkxNDEwMjAzOX0.twhytkJWhGoqh5NVfhSkG9Irub-cS2cSSqKqPCI5Ur8'
        }
      })
        .then(res => res.json())
        .catch(() => null);

      const [dexData, pumpData, moralisData] = await Promise.all([dexPromise, pumpPromise, moralisPromise]);

      // Process Moralis data (often best for official logos and metadata URI)
      if (moralisData && moralisData.mint) {
        if (moralisData.symbol) mergedMetadata.tokenName = moralisData.symbol;
        if (moralisData.name && !mergedMetadata.title) mergedMetadata.title = `${moralisData.name} Growth Campaign`;
        if (moralisData.logo) mergedMetadata.logoUrl = moralisData.logo;
        if (moralisData.description) mergedMetadata.description = moralisData.description;
        
        // Moralis sometimes provides links directly
        if (moralisData.links?.website) mergedMetadata.websiteUrl = moralisData.links.website;
        if (moralisData.links?.twitter) mergedMetadata.twitterUrl = moralisData.links.twitter;
      }

      // Process Pump.fun data (often more direct for new tokens)
      if (pumpData && pumpData.success && pumpData.result) {
        const res = pumpData.result;
        if (!mergedMetadata.tokenName) mergedMetadata.tokenName = res.symbol;
        if (!mergedMetadata.title) mergedMetadata.title = `${res.name} Growth Campaign`;
        if (!mergedMetadata.logoUrl) mergedMetadata.logoUrl = res.image;
        if (!mergedMetadata.description) mergedMetadata.description = res.description;
        
        // Pump.fun API result sometimes has links in different places, 
        // but often DexScreener is better for this.
      }

      // Process DexScreener data (excellent for socials and header/banner)
      if (dexData && dexData.pairs && dexData.pairs.length > 0) {
        const bestPair = dexData.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        const token = bestPair.baseToken;
        
        if (token.symbol) mergedMetadata.tokenName = token.symbol;
        if (token.name && !mergedMetadata.title) mergedMetadata.title = `${token.name} Growth Campaign`;
        
        if (bestPair.info?.imageUrl && !mergedMetadata.logoUrl) mergedMetadata.logoUrl = bestPair.info.imageUrl;
        if (bestPair.info?.header) mergedMetadata.bannerUrl = bestPair.info.header;
        
        // Update links - DexScreener is often the most complete source for these
        if (bestPair.info?.websites?.[0]?.url) mergedMetadata.websiteUrl = bestPair.info.websites[0].url;
        
        const twitter = bestPair.info?.socials?.find((s: any) => s.type === 'twitter');
        if (twitter?.url) mergedMetadata.twitterUrl = twitter.url;
        
        const telegram = bestPair.info?.socials?.find((s: any) => s.type === 'telegram');
        if (telegram?.url) mergedMetadata.telegramUrl = telegram.url;
      }

      // Apply merged metadata to form
      if (Object.keys(mergedMetadata).length > 0) {
        if (mergedMetadata.tokenName) form.setValue('tokenName', mergedMetadata.tokenName);
        if (mergedMetadata.title && !form.getValues('title')) form.setValue('title', mergedMetadata.title);
        if (mergedMetadata.logoUrl) form.setValue('logoUrl', mergedMetadata.logoUrl);
        if (mergedMetadata.bannerUrl) form.setValue('bannerUrl', mergedMetadata.bannerUrl);
        if (mergedMetadata.description && !form.getValues('description')) form.setValue('description', mergedMetadata.description);
        if (mergedMetadata.websiteUrl) form.setValue('websiteUrl', mergedMetadata.websiteUrl);
        if (mergedMetadata.twitterUrl) form.setValue('twitterUrl', mergedMetadata.twitterUrl);
        if (mergedMetadata.telegramUrl) form.setValue('telegramUrl', mergedMetadata.telegramUrl);

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
      creatorId: userId,
      totalBudget: values.campaignType === 'holder_qualification' 
        ? (Number(values.rewardPerWallet || 0) * Number(values.maxClaims || 0)).toString()
        : (values.totalBudget || 0).toString(),
      minHoldingAmount: values.minHoldingAmount?.toString() || null,
      rewardPerWallet: values.rewardPerWallet?.toString() || null,
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
        // Show success card immediately
        setCreatedCampaign(data);
        setShowSuccessCard(true);
        // Dispatch custom event to ensure state update if needed
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
            <DialogDescription>
              {step === "preview" ? "Review all details before publishing." : "Set up a new Pay-Per-Action campaign to boost your project."}
            </DialogDescription>
          </DialogHeader>

          {step === "edit" ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 1. Contract Address & Category (First Step) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tokenAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Token Contract Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter Solana Mint Address..." 
                            className="bg-primary/5 border-primary/20 focus:border-primary"
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
                        <FormLabel>Campaign Category</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); if (value === "holder_qualification") { form.setValue("actions", []); } else { form.setValue("actions", [{ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 }]); } }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="holder_qualification">Holder Qualification (Live)</SelectItem>
                            <SelectItem value="engagement">Social Engagement (Coming Soon)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {watchedType && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                      <h3 className="font-bold text-secondary flex items-center gap-2 mb-2 uppercase tracking-widest text-xs">
                        <Coins className="w-4 h-4" /> Platform Fee & Costs
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                        <p>
                          Creating a campaign requires a one-time fee of <strong>{CONFIG.TOKENOMICS.CREATION_FEE.toLocaleString()} ${PLATFORM_CONFIG.TOKEN_SYMBOL}</strong>.
                        </p>
                        <p>
                          Fee Breakdown:
                          <ul className="list-disc ml-4 mt-1 space-y-1">
                            <li>{CONFIG.TOKENOMICS.BURN_PERCENT}% Burned (Deflationary)</li>
                            <li>{CONFIG.TOKENOMICS.REWARDS_PERCENT}% to Weekly Rewards Pool</li>
                            <li>{CONFIG.TOKENOMICS.SYSTEM_PERCENT}% to System Maintenance</li>
                          </ul>
                        </p>
                        <p className="text-[10px] border-t border-white/5 pt-2 italic">
                          Rewards are secured in a multi-sig escrow and distributed only upon task verification. Users will cover their own gas fees for claiming rewards.
                        </p>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Title</FormLabel>
                            <FormControl><Input placeholder="e.g. SolPunks Airdrop" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="tokenName" render={({ field }) => (
                        <FormItem><FormLabel>Token Symbol</FormLabel><FormControl><Input placeholder="SOL" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    {watchedType === "holder_qualification" ? (
                      <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <h3 className="font-semibold text-primary flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Holding Requirements
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="minHoldingAmount" render={({ field }) => (
                            <FormItem><FormLabel>Min Holding Amount</FormLabel><FormControl><Input type="number" placeholder="1000" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="minHoldingDuration" render={({ field }) => (
                            <FormItem><FormLabel>Min Duration (Days)</FormLabel><FormControl><Input type="number" placeholder="7" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="rewardPerWallet" render={({ field }) => (
                            <FormItem><FormLabel>Reward Per Wallet</FormLabel><FormControl><Input type="number" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="maxClaims" render={({ field }) => (
                            <FormItem><FormLabel>Max Participants</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </div>
                    ) : null}

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-primary">Budget Estimation</span>
                        <Badge variant="outline" className="text-[10px] uppercase">Auto-calculated</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Budget</p>
                          <p className="text-xl font-bold text-primary">
                            {watchedType === "holder_qualification" 
                              ? (Number(form.watch("rewardPerWallet")) * Number(form.watch("maxClaims")) || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })
                              : totalCalculatedCost.toLocaleString(undefined, { maximumFractionDigits: 6 })
                            } <span className="text-sm">{form.watch("tokenName") || "Tokens"}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Participants</p>
                          <p className="text-xl font-bold">
                            {form.watch("campaignType") === "holder_qualification" 
                              ? form.watch("maxClaims") || 0 
                              : (watchedActions || []).reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0)
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Project Description</FormLabel><FormControl><Textarea placeholder="Describe your project and campaign goals..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-primary">Assets & Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="bannerUrl" render={({ field }) => (
                          <FormItem><FormLabel>Banner Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="logoUrl" render={({ field }) => (
                          <FormItem><FormLabel>Logo Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                          <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                          <FormItem><FormLabel>Twitter</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="telegramUrl" render={({ field }) => (
                          <FormItem><FormLabel>Telegram</FormLabel><FormControl><Input placeholder="https://t.me/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="minSolBalance" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">Anti-Bot: Min SOL Balance</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} className="bg-primary/5" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="minWalletAgeDays" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">Min Wallet Age (Days)</FormLabel>
                          <FormControl><Input type="number" {...field} className="bg-primary/5" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-primary">Task Flow</h3>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => append({ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 })}
                          disabled={watchedType === "holder_qualification"}
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Task
                        </Button>
                      </div>
                      
                      {fields.length === 0 && watchedType === "engagement" && (
                        <div className="text-center py-12 border-2 border-dashed border-primary/10 rounded-2xl bg-primary/5">
                          <p className="text-sm text-muted-foreground">No tasks added yet. Click "Add Task" to begin.</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <FormField
                                control={form.control}
                                name={`actions.${index}.type`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <Select onValueChange={(v) => { field.onChange(v); form.setValue(`actions.${index}.title`, getActionDefaultTitle(v)); }} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Action Type" /></SelectTrigger></FormControl>
                                      <SelectContent>
                                        <SelectItem value="website">Website Visit</SelectItem>
                                        <SelectItem value="twitter_follow">Twitter Follow</SelectItem>
                                        <SelectItem value="twitter_retweet">Twitter Retweet</SelectItem>
                                        <SelectItem value="telegram_join">Telegram Join</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name={`actions.${index}.title`} render={({ field }) => (
                                <FormItem><FormLabel>Task Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                              )} />
                              <FormField control={form.control} name={`actions.${index}.url`} render={({ field }) => (
                                <FormItem><FormLabel>Target URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl></FormItem>
                              )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name={`actions.${index}.rewardAmount`} render={({ field }) => (
                                <FormItem><FormLabel>Reward per User</FormLabel><FormControl><Input type="number" step="0.00001" {...field} /></FormControl></FormItem>
                              )} />
                              <FormField control={form.control} name={`actions.${index}.maxExecutions`} render={({ field }) => (
                                <FormItem><FormLabel>Max Participants</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                              )} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-primary/10">
                  <Button type="submit" className="flex-1 h-12 font-bold text-lg" disabled={isPending}>
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="mr-2" />}
                    Preview Campaign
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative aspect-[3/1] rounded-2xl overflow-hidden bg-primary/5 border border-primary/20">
                {form.getValues("bannerUrl") ? (
                  <img src={form.getValues("bannerUrl")} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">No banner image</div>
                )}
                <div className="absolute bottom-4 left-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border-2 border-primary/20 shadow-xl">
                    {form.getValues("logoUrl") ? (
                      <img src={form.getValues("logoUrl")} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">{form.getValues("tokenName")?.slice(0, 1)}</div>
                    )}
                  </div>
                  <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <h2 className="text-xl font-display text-white">{form.getValues("title")}</h2>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest">{form.getValues("tokenName")}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Budget</p>
                  <p className="text-xl font-bold">{form.getValues("totalBudget")} {form.getValues("tokenName")}</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Participants</p>
                  <p className="text-xl font-bold">
                    {watchedType === "holder_qualification" 
                      ? form.getValues("maxClaims") 
                      : (watchedActions || []).reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0)
                    }
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Type</p>
                  <Badge className="mt-1">{watchedType === "holder_qualification" ? "HOLDER QUAL" : "ENGAGEMENT"}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-primary uppercase tracking-widest text-xs flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Requirements Review
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[8px] uppercase text-muted-foreground block mb-1">Min SOL Balance</span>
                    <span className="text-sm font-bold">{form.getValues("minSolBalance")} SOL</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[8px] uppercase text-muted-foreground block mb-1">Wallet Age</span>
                    <span className="text-sm font-bold">{form.getValues("minWalletAgeDays")} Days</span>
                  </div>
                  {watchedType === "holder_qualification" && (
                    <>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[8px] uppercase text-muted-foreground block mb-1">Hold Amount</span>
                        <span className="text-sm font-bold">{form.getValues("minHoldingAmount")}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-[8px] uppercase text-muted-foreground block mb-1">Hold Duration</span>
                        <span className="text-sm font-bold">{form.getValues("minHoldingDuration")} Days</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep("edit")}>Back to Edit</Button>
                <Button className="flex-1 h-12 font-bold" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="mr-2" />}
                  Launch Campaign Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <CampaignSuccessCard 
        isOpen={showSuccessCard} 
        onClose={() => setShowSuccessCard(false)}
        campaign={createdCampaign}
      />
    </Dialog>
  );
}
