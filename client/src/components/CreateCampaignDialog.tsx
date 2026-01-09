import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
import { Plus, Trash2, Rocket } from "lucide-react";
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
  const watchedTotalBudget = form.watch("totalBudget");
  
  const totalCalculatedCost = (watchedActions || []).reduce((acc, action) => {
    const reward = Number(action.rewardAmount) || 0;
    const executions = Number(action.maxExecutions) || 0;
    return acc + (reward * executions);
  }, 0);

  useEffect(() => {
    if (form.watch("campaignType") === "holder_qualification") {
      const reward = Number(form.watch("rewardPerWallet")) || 0;
      const claims = Number(form.watch("maxClaims")) || 0;
      form.setValue("totalBudget", Number((reward * claims).toFixed(6)));
    } else if (totalCalculatedCost > 0) {
      form.setValue("totalBudget", Number(totalCalculatedCost.toFixed(6)));
    }
  }, [totalCalculatedCost, form.watch("rewardPerWallet"), form.watch("maxClaims"), form.watch("campaignType"), form]);

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
        form.reset();
        toast({ title: "Campaign Launched!", description: `Successfully created campaign.` });
      },
      onError: (error: any) => {
        toast({ title: "Launch Failed", description: error.message || "Something went wrong.", variant: "destructive" });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpenClick} className="bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
          <Rocket className="mr-2 h-4 w-4" /> Launch Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">Create New Campaign</DialogTitle>
          <DialogDescription>Set up a new Pay-Per-Action campaign to boost your project.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl><Input placeholder="e.g. SolPunks Airdrop Phase 1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("campaignType") && (
              <>
                {form.watch("campaignType") === "holder_qualification" ? (
                  <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold text-primary">Holding Requirements</h3>
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
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-primary/30 rounded-2xl bg-primary/5 text-center space-y-4">
                    <Rocket className="w-12 h-12 text-primary animate-pulse" />
                    <h3 className="text-xl font-bold text-primary">Social Engagement is Coming Soon</h3>
                    <p className="text-muted-foreground max-w-sm">API integration for Twitter and Telegram is coming soon.</p>
                    <Button disabled className="bg-primary/50 cursor-not-allowed">Coming Soon</Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="tokenName" render={({ field }) => (
                    <FormItem><FormLabel>Token Symbol</FormLabel><FormControl><Input placeholder="SOL" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="tokenAddress" render={({ field }) => (
                    <FormItem><FormLabel>Contract Address</FormLabel><FormControl><Input placeholder="Token Mint Address..." {...field} onChange={(e) => { field.onChange(e); fetchTokenMetadata(e.target.value); }} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium">Campaign Summary</span><Badge variant="outline">Auto-calculated</Badge></div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><p className="text-muted-foreground">Total Budget</p><p className="text-lg font-bold text-primary">{form.watch("campaignType") === "holder_qualification" ? (Number(form.watch("rewardPerWallet")) * Number(form.watch("maxClaims")) || 0).toFixed(6) : totalCalculatedCost.toFixed(6)} {form.watch("tokenName") || "Tokens"}</p></div>
                    <div><p className="text-muted-foreground">Total Participants</p><p className="text-lg font-bold">{form.watch("campaignType") === "holder_qualification" ? form.watch("maxClaims") || 0 : (watchedActions || []).reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0)}</p></div>
                  </div>
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your project..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />

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
                    <FormItem><FormLabel>Website URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                    <FormItem><FormLabel>Twitter URL</FormLabel><FormControl><Input placeholder="https://twitter.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="telegramUrl" render={({ field }) => (
                    <FormItem><FormLabel>Telegram URL</FormLabel><FormControl><Input placeholder="https://t.me/..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="minSolBalance" render={({ field }) => (
                  <FormItem><FormLabel className="text-primary font-bold">Minimum SOL Balance</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                {form.watch("campaignType") === "engagement" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><h3 className="font-semibold text-lg text-primary">Actions & Rewards</h3><Button type="button" variant="outline" size="sm" onClick={() => append({ type: "website", title: "", url: "", rewardAmount: 0, maxExecutions: 100 })} className="border-dashed border-primary/30 text-primary"><Plus className="mr-2 h-4 w-4" /> Add Action</Button></div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4 relative group">
                        <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground" onClick={() => remove(index)}><Trash2 className="h-3 w-3" /></Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`actions.${index}.type`} render={({ field }) => (
                            <FormItem><FormLabel>Action Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="website">Visit Website</SelectItem><SelectItem value="twitter_follow">Follow on Twitter</SelectItem><SelectItem value="twitter_retweet">Retweet Post</SelectItem><SelectItem value="telegram_join">Join Telegram</SelectItem><SelectItem value="custom">Custom Task</SelectItem></SelectContent></Select><FormMessage /></FormItem>
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
                )}
                
                <Button type="submit" className="w-full h-12 bg-primary text-primary-foreground font-bold text-lg" disabled={isPending}>
                  {isPending ? "Launching..." : "Deploy Campaign"}
                </Button>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
