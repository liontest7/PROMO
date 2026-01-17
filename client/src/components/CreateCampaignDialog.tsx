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
import { Rocket } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BasicSettings } from "./create-campaign/BasicSettings";
import { EngagementActions } from "./create-campaign/EngagementActions";
import { CampaignProtections } from "./create-campaign/CampaignProtections";
import { CampaignPreview } from "./create-campaign/CampaignPreview";
import { CampaignSuccessCard } from "./CampaignSuccessCard";

const formSchema = insertCampaignSchema.extend({
  title: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  tokenName: z.string().min(1).max(10),
  tokenAddress: z.string().min(32).max(44),
  campaignType: z.enum(["engagement", "holder_qualification"]),
  totalBudget: z.coerce.number().min(0.00001),
  minHoldingAmount: z.coerce.number().min(0).optional(),
  rewardPerWallet: z.coerce.number().min(0).optional(),
  maxClaims: z.coerce.number().min(1).optional(),
  actions: z.array(insertActionSchema.omit({ campaignId: true }).extend({
    type: z.string(),
    title: z.string(),
    url: z.string().url(),
    rewardAmount: z.coerce.number().min(0.00001),
    maxExecutions: z.coerce.number().min(1),
  })).optional(),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().min(1),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  telegramUrl: z.string().url().optional().or(z.literal("")),
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
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  const { isConnected, userId, connect } = useWallet();
  const { toast } = useToast();

  const { data: settings } = useQuery<any>({ queryKey: ["/api/public/settings"], refetchInterval: 1000 });

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

  const gasFeeSol = 0.005 + (watchedType === "holder_qualification" ? Number(form.watch("maxClaims") || 0) : watchedActions.reduce((a, b) => a + Number(b.maxExecutions || 0), 0)) * 0.0015;

  const fetchTokenMetadata = async (address: string) => {
    if (address.length < 32) return;
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`).then(r => r.json());
      if (res.pairs?.[0]) {
        const p = res.pairs[0];
        form.setValue("tokenName", p.baseToken.symbol);
        form.setValue("title", `${p.baseToken.name} Growth Campaign`);
        if (p.info?.imageUrl) form.setValue("logoUrl", p.info.imageUrl);
        if (p.info?.header) form.setValue("bannerUrl", p.info.header);
      }
    } catch (e) { console.error(e); }
  };

  const onSubmit = (values: FormValues) => {
    if (step === "edit") return setStep("preview");
    createCampaign(values as any, {
      onSuccess: (data) => {
        setCreatedCampaign(data);
        setOpen(false);
        setShowSuccessCard(true);
        form.reset();
        setStep("edit");
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) setStep("edit"); }}>
        <DialogTrigger asChild>
          <Button onClick={e => {
            if (!isConnected) { e.preventDefault(); connect("advertiser"); }
            if (settings?.campaignsEnabled === false) { e.preventDefault(); toast({ title: "Maintenance", variant: "destructive" }); }
          }} className="bg-primary font-bold">
            <Rocket className="mr-2 h-4 w-4" /> Launch Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{step === "preview" ? "Preview Campaign" : "Create Campaign"}</DialogTitle>
            <DialogDescription>Setup your Pay-Per-Action campaign.</DialogDescription>
          </DialogHeader>

          {step === "edit" ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="campaignType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="engagement">Engagement Campaign</SelectItem>
                        <SelectItem value="holder_qualification">Holder Qualification</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <BasicSettings form={form} fetchTokenMetadata={fetchTokenMetadata} />
                {watchedType === "engagement" && <EngagementActions form={form} />}
                {watchedType === "holder_qualification" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="rewardPerWallet" render={({ field }) => (
                      <FormItem><FormLabel>Reward Per Wallet</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="maxClaims" render={({ field }) => (
                      <FormItem><FormLabel>Max Participants</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                )}
                <CampaignProtections form={form} />
                <Button type="submit" className="w-full">Continue to Preview</Button>
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
