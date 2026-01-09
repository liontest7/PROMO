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
  const [location] = useLocation();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { isConnected, walletAddress, userId, connect } = useWallet();
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
      actions: [{ type: "website", title: "Visit Website", url: "", rewardAmount: 0.01, maxExecutions: 10 }],
      creatorId: userId || undefined
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  // Watch for changes to calculate derived values
  const watchedActions = form.watch("actions");
  const watchedTotalBudget = form.watch("totalBudget");
  
  const totalCalculatedCost = (watchedActions || []).reduce((acc, action) => {
    const reward = Number(action.rewardAmount) || 0;
    const executions = Number(action.maxExecutions) || 0;
    return acc + (reward * executions);
  }, 0);

  // Sync totalBudget with calculated cost if user wants automatic calculation
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
      // In a real Solana app, we'd use @solana/web3.js and @metaplex-foundation/js
      // For this demo, we'll simulate a fetch from a DEX aggregator or Helius API
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        const token = pair.baseToken;
        
        if (token.symbol) form.setValue('tokenName', token.symbol);
        if (token.name && !form.getValues('title')) form.setValue('title', `${token.name} Growth Campaign`);
        if (pair.info?.imageUrl) form.setValue('logoUrl', pair.info.imageUrl);
        if (pair.info?.websites?.[0]?.url) form.setValue('websiteUrl', pair.info.websites[0].url);
        
        // Try to find social links
        const twitter = pair.info?.socials?.find((s: any) => s.type === 'twitter');
        if (twitter?.url) form.setValue('twitterUrl', twitter.url);
        
        const telegram = pair.info?.socials?.find((s: any) => s.type === 'telegram');
        if (telegram?.url) form.setValue('telegramUrl', telegram.url);

        toast({
          title: "Metadata Loaded",
          description: `Found details for ${token.symbol}. Some fields have been auto-filled.`,
        });
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  function onSubmit(values: FormValues) {
    if (!userId) {
      toast({
        title: "User Error",
        description: "Your account could not be identified. Please reconnect your wallet.",
        variant: "destructive"
      });
      return;
    }

    // Ensure numeric values are properly handled
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
        toast({
          title: "Campaign Launched!",
          description: `Successfully deposited ${formattedValues.totalBudget} ${formattedValues.tokenName} into the escrow pool.`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Launch Failed",
          description: error.message || "Something went wrong while creating the campaign.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleOpenClick}
          className="bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
        >
          <Rocket className="mr-2 h-4 w-4" />
          Launch Campaign
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
                    <FormLabel>Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="holder_qualification">Holder Qualification (Hold & Win)</SelectItem>
                        <SelectItem value="engagement" disabled>Social Engagement (Coming Soon)</SelectItem>
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
                    <FormControl>
                      <Input placeholder="e.g. SolPunks Airdrop Phase 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("campaignType") === "holder_qualification" ? (
              <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-primary">Holding Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minHoldingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Holding Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minHoldingDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Duration (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rewardPerWallet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reward Per Wallet</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxClaims"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Participants</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tokenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="SOL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tokenAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Token Mint Address..." 
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
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Campaign Summary</span>
                <Badge variant="outline">
                  Auto-calculated
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Total Budget Required</p>
                  <p className="text-lg font-bold text-primary">{totalCalculatedCost.toFixed(6)} {form.watch("tokenName") || "Tokens"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Tasks</p>
                  <p className="text-lg font-bold">
                    {(watchedActions || []).reduce((acc, a) => acc + (Number(a.maxExecutions) || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your project and campaign goals..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Banner Image URL 
                      <span className="text-[10px] text-muted-foreground font-normal">(Direct link to image)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Logo Image URL
                      <span className="text-[10px] text-muted-foreground font-normal">(Token or project logo)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telegramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://t.me/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="minSolBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold">Minimum SOL Balance Requirement</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Input type="number" step="0.01" placeholder="e.g. 0.1" className="bg-primary/5 border-primary/20 focus:border-primary pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" {...field} />
                      <div className="absolute right-0 top-0 h-full flex items-center border-l border-primary/20 bg-primary/5 px-2 rounded-r-md">
                        <span className="text-xs font-bold text-primary mr-1">SOL</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            className="p-0.5 hover:bg-primary/20 rounded transition-colors"
                            onClick={() => {
                              const current = Number(field.value) || 0;
                              field.onChange(Math.max(0, Number((current + 0.01).toFixed(2))));
                            }}
                          >
                            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                          </button>
                          <button
                            type="button"
                            className="p-0.5 hover:bg-primary/20 rounded transition-colors"
                            onClick={() => {
                              const current = Number(field.value) || 0;
                              field.onChange(Math.max(0, Number((current - 0.01).toFixed(2))));
                            }}
                          >
                            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-[10px] text-muted-foreground mt-1 italic">Users must hold at least this amount of SOL to participate.</p>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-primary">Actions & Rewards</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ type: "website", title: "", url: "", rewardAmount: 0, maxExecutions: 100 })}
                  className="border-dashed border-primary/30 hover:border-primary text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Action
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-white/10 rounded-lg bg-black/20 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-muted-foreground">Action #{index + 1}</span>
                    {fields.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`actions.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="website">Visit Website</SelectItem>
                              <SelectItem value="twitter">Twitter Follow</SelectItem>
                              <SelectItem value="telegram">Join Telegram</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`actions.${index}.rewardAmount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.00001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`actions.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Action Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Follow us" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`actions.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel className="flex items-center justify-between">
                            Target URL
                            <div className="flex gap-1">
                              {form.watch("websiteUrl") && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-4 w-4" 
                                  onClick={() => field.onChange(form.watch("websiteUrl"))}
                                  title="Use project website"
                                >
                                  <Rocket className="h-3 w-3" />
                                </Button>
                              )}
                              {form.watch("twitterUrl") && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-4 w-4" 
                                  onClick={() => field.onChange(form.watch("twitterUrl"))}
                                  title="Use Twitter URL"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`actions.${index}.maxExecutions`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-1">
                          <FormLabel>Max Participants</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button 
              type="submit" 
              disabled={isPending || totalCalculatedCost > Number(watchedTotalBudget)} 
              className="w-full h-12 text-lg bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            >
              {isPending ? "Deploying Campaign..." : totalCalculatedCost > Number(watchedTotalBudget) ? "Insufficient Budget" : "Create Campaign & Deposit Budget"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
