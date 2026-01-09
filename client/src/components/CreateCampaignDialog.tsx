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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Rocket } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form Schema
const formSchema = insertCampaignSchema.extend({
  totalBudget: z.coerce.number().min(1),
  actions: z.array(insertActionSchema.omit({ campaignId: true }).extend({
    rewardAmount: z.coerce.number().min(0.00001),
    maxExecutions: z.coerce.number().optional()
  })).min(1, "At least one action is required"),
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
      totalBudget: 0,
      bannerUrl: "",
      logoUrl: "",
      websiteUrl: "",
      twitterUrl: "",
      telegramUrl: "",
      minSolBalance: 0,
      actions: [{ type: "website", title: "", url: "", rewardAmount: 0 }],
      creatorId: userId || 1
    },
  });

  useEffect(() => {
    if (userId) {
      form.setValue('creatorId', userId);
    }
  }, [userId, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  function onSubmit(values: FormValues) {
    // In real app, we would map walletAddress to user ID properly
    // For now we assume user ID 1 or passed from session
    createCampaign(values as any, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
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
                      <Input placeholder="Token Mint Address..." {...field} />
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
                  onClick={() => append({ type: "website", title: "", url: "", rewardAmount: 0 })}
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
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`actions.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Follow us on Twitter" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`actions.${index}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" disabled={isPending} className="w-full h-12 text-lg bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20">
              {isPending ? "Deploying Campaign..." : "Create Campaign & Deposit Budget"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
