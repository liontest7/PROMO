import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
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
import { Plus, Trash2, Rocket, Eye, CheckCircle2, Globe, Twitter, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"edit" | "preview">("edit");
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
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const token = pair.baseToken;
        if (token.symbol) form.setValue('tokenName', token.symbol);
        if (token.name && !form.getValues('title')) form.setValue('title', `${token.name} Growth Campaign`);
        if (pair.info?.imageUrl) form.setValue('logoUrl', pair.info.imageUrl);
        if (pair.info?.websites?.[0]?.url) form.setValue('websiteUrl', pair.info.websites[0].url);
        const twitter = pair.info?.socials?.find((s: any) => s.type === 'twitter');
        if (twitter?.url) form.setValue('twitterUrl', twitter.url);
        const telegram = pair.info?.socials?.find((s: any) => s.type === 'telegram');
        if (telegram?.url) form.setValue('telegramUrl', telegram.url);
        toast({ title: "Metadata Loaded", description: `Found details for ${token.symbol}.` });
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
      onSuccess: () => {
        setOpen(false);
        setStep("edit");
        form.reset();
        toast({ title: "Campaign Launched!", description: `Successfully created campaign.` });
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
                            {form.watch("campaignType") === "holder_qualification" 
                              ? (Number(form.watch("rewardPerWallet")) * Number(form.watch("maxClaims")) || 0).toFixed(6) 
                              : totalCalculatedCost.toFixed(6)
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

                    <FormField control={form.control} name="minSolBalance" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary font-bold">Anti-Bot: Min SOL Balance</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} className="bg-primary/5" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchedType === "engagement" && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-lg text-primary">Task Flow</h3>
                          <Button type="button" variant="outline" size="sm" onClick={() => append({ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 100 })} className="border-dashed border-primary/30 text-primary">
                            <Plus className="mr-2 h-4 w-4" /> Add Action
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {fields.map((field, index) => (
                            <div key={field.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4 relative group hover:border-primary/30 transition-colors">
                              <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(index)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`actions.${index}.type`} render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Action Type</FormLabel>
                                    <Select onValueChange={(v) => { field.onChange(v); form.setValue(`actions.${index}.title`, getActionDefaultTitle(v)); }} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                      <SelectContent>
                                        <SelectItem value="website">Visit Website</SelectItem>
                                        <SelectItem value="twitter_follow">Follow on Twitter</SelectItem>
                                        <SelectItem value="twitter_retweet">Retweet Post</SelectItem>
                                        <SelectItem value="telegram_join">Join Telegram</SelectItem>
                                        <SelectItem value="custom">Custom Task</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name={`actions.${index}.title`} render={({ field }) => (
                                  <FormItem><FormLabel>Action Title</FormLabel><FormControl><Input placeholder="e.g. Follow us" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                              </div>
                              <FormField control={form.control} name={`actions.${index}.url`} render={({ field }) => (
                                <FormItem><FormLabel>Verification URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name={`actions.${index}.rewardAmount`} render={({ field }) => (
                                  <FormItem><FormLabel>Reward</FormLabel><FormControl><Input type="number" step="0.00001" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name={`actions.${index}.maxExecutions`} render={({ field }) => (
                                  <FormItem><FormLabel>Max Completions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Button type="submit" className="w-full h-14 bg-primary text-primary-foreground font-bold text-xl hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all">
                      {watchedType === "engagement" ? "Coming Soon" : "Review Campaign"}
                      {watchedType === "engagement" ? null : <Eye className="ml-2 h-5 w-5" />}
                    </Button>
                    {watchedType === "engagement" && (
                      <p className="text-center text-xs text-muted-foreground italic mt-2">
                        Social Engagement is currently in development. Phase 2 coming soon.
                      </p>
                    )}
                  </div>
                )}
              </form>
            </Form>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/40">
                {form.getValues("bannerUrl") ? (
                  <img src={form.getValues("bannerUrl")} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Banner Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/50 bg-black">
                    {form.getValues("logoUrl") ? <img src={form.getValues("logoUrl")} className="w-full h-full object-cover" alt="Logo" /> : <div className="w-full h-full flex items-center justify-center font-bold text-primary">{form.getValues("tokenName")?.[0]}</div>}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{form.getValues("title")}</h2>
                    <p className="text-sm text-primary font-mono">{form.getValues("tokenName")}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Platform Burn / Fee</p>
                  <p className="text-lg font-bold text-destructive">5,000 MEME</p>
                </div>
                <div className="space-y-2 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary uppercase tracking-widest">Reward Pool Deposit</p>
                  <p className="text-lg font-bold text-primary">{form.getValues("totalBudget")} {form.getValues("tokenName")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-primary">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{form.getValues("campaignType") === 'holder_qualification' ? 'Holder Check' : 'Social Tasks'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Token</span>
                    <span className="font-medium font-mono">{form.getValues("tokenName")}</span>
                  </div>
                  {form.getValues("campaignType") === 'holder_qualification' && (
                    <>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">Min Holding</span>
                        <span className="font-medium">{form.getValues("minHoldingAmount")}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">Min Days</span>
                        <span className="font-medium">{form.getValues("minHoldingDuration")}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-muted-foreground">Anti-Bot Balance</span>
                    <span className="font-medium">{form.getValues("minSolBalance")} SOL</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex gap-4">
                  {form.getValues("websiteUrl") && <Globe className="w-5 h-5 text-muted-foreground" />}
                  {form.getValues("twitterUrl") && <Twitter className="w-5 h-5 text-muted-foreground" />}
                  {form.getValues("telegramUrl") && <Send className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep("edit")}>Back to Edit</Button>
                <Button 
                  className="flex-[2] h-12 bg-primary text-primary-foreground font-bold text-lg hover:shadow-primary/40" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isPending}
                >
                  {isPending ? "Confirming..." : "Confirm & Launch"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
