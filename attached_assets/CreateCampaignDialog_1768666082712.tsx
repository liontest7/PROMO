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
import {
  Plus,
  Trash2,
  Rocket,
  Eye,
  CheckCircle2,
  Globe,
  Twitter,
  Send,
  Loader2,
  Coins,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CampaignSuccessCard } from "./CampaignSuccessCard";
import { SuccessCard } from "./SuccessCard";

// Form Schema
const formSchema = insertCampaignSchema
  .extend({
    title: z
      .string()
      .min(3, "Campaign title must be at least 3 characters")
      .max(50, "Title too long"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description too long"),
    tokenName: z
      .string()
      .min(1, "Token symbol is required")
      .max(10, "Symbol too long"),
    tokenAddress: z
      .string()
      .min(32, "Invalid Solana address")
      .max(44, "Invalid Solana address"),
    campaignType: z.enum(["engagement", "holder_qualification"], {
      required_error: "Please select a campaign category",
    }),
    totalBudget: z.coerce
      .number()
      .min(0.00001, "Total budget must be greater than 0"),
    minHoldingAmount: z.coerce.number().min(0).optional(),
    minHoldingDuration: z.coerce.number().min(0).optional(),
    rewardPerWallet: z.coerce.number().min(0).optional(),
    maxClaims: z.coerce
      .number()
      .min(1, "At least 1 participant required")
      .optional(),
    actions: z
      .array(
        insertActionSchema.omit({ campaignId: true }).extend({
          type: z.string().min(1, "Action type required"),
          title: z.string().min(3, "Action title required"),
          url: z.string().url("Invalid action URL"),
          rewardAmount: z.coerce
            .number()
            .min(0.00001, "Reward must be greater than 0"),
          maxExecutions: z.coerce
            .number()
            .min(1, "Executions must be at least 1"),
        }),
      )
      .optional(),
    creatorId: z.number().optional(),
    bannerUrl: z
      .string()
      .url("Invalid banner URL")
      .optional()
      .or(z.literal("")),
    logoUrl: z
      .string()
      .url("Invalid logo URL")
      .min(1, "Logo image is required"),
    websiteUrl: z
      .string()
      .url("Invalid website URL")
      .optional()
      .or(z.literal("")),
    twitterUrl: z
      .string()
      .url("Invalid Twitter URL")
      .optional()
      .or(z.literal("")),
    telegramUrl: z
      .string()
      .url("Invalid Telegram URL")
      .optional()
      .or(z.literal("")),
    minSolBalance: z.coerce.number().min(0).default(0),
    minWalletAgeDays: z.coerce.number().min(0).default(0),
    minXAccountAgeDays: z.coerce.number().min(0).default(0),
    minXFollowers: z.coerce.number().min(0).default(0),
    minFollowDurationDays: z.coerce.number().min(0).default(0),
    multiDaySolAmount: z.coerce.number().min(0).default(0),
    multiDaySolDays: z.coerce.number().min(0).default(0),
    initialMarketCap: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.campaignType === "engagement") {
        return data.actions && data.actions.length > 0;
      }
      return true;
    },
    {
      message: "Engagement campaigns require at least one action",
      path: ["actions"],
    },
  )
  .refine(
    (data) => {
      if (data.campaignType === "holder_qualification") {
        return (data.rewardPerWallet || 0) > 0 && (data.maxClaims || 0) > 0;
      }
      return true;
    },
    {
      message: "Reward and participants are required for holder campaigns",
      path: ["rewardPerWallet"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

export function CreateCampaignDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen =
    controlledOnOpenChange !== undefined
      ? controlledOnOpenChange
      : setInternalOpen;
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
    // If settings are still loading, wait
    if (loadingSettings) {
      e.preventDefault();
      return;
    }

    if (settings && settings.campaignsEnabled === false) {
      e.preventDefault();
      toast({
        title: "Maintenance",
        description: "Campaign creation is temporarily disabled.",
        variant: "destructive",
      });
      return;
    }
    if (!isConnected) {
      e.preventDefault();
      toast({
        title: "Connection Required",
        description:
          "Please connect your wallet as an advertiser to create campaigns.",
        variant: "destructive",
      });
      connect("advertiser");
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
    if (type === "holder_qualification" && isHolderDisabled)
      return "(Maintenance)";
    if (type === "engagement" && isSocialDisabled) return "(Maintenance)";
    return "(Live)";
  };

  const totalCalculatedCost = (watchedActions || []).reduce((acc, action) => {
    const reward = Number(action.rewardAmount) || 0;
    const executions = Number(action.maxExecutions) || 0;
    return acc + reward * executions;
  }, 0);

  const platformFee = PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE;
  const baseGasFee = PLATFORM_CONFIG.FEE_SOL; // Base fee for Escrow setup (0.005 SOL)
  const perRewardGasFee = 0.0015; // Optimized gas fee per reward transaction

  const totalExecutions =
    watchedType === "holder_qualification"
      ? Number(form.watch("maxClaims") || 0)
      : (watchedActions || []).reduce(
          (acc, a) => acc + (Number(a.maxExecutions) || 0),
          0,
        );

  const dynamicGasFee = baseGasFee + totalExecutions * perRewardGasFee;
  const gasFeeSol = Number(dynamicGasFee.toFixed(4));
  const airdropBudget =
    watchedType === "holder_qualification"
      ? Number(form.watch("rewardPerWallet")) *
          Number(form.watch("maxClaims")) || 0
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
  }, [
    totalCalculatedCost,
    form.watch("rewardPerWallet"),
    form.watch("maxClaims"),
    watchedType,
    form,
  ]);

  const fetchTokenMetadata = async (address: string) => {
    if (!address || address.length < 32) return;
    try {
      const mergedMetadata: any = {};
      const dexPromise = fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      )
        .then((res) => res.json())
        .catch(() => null);
      const pumpPromise = fetch(
        `https://pmpapi.fun/api/get_metadata/${address}`,
      )
        .then((res) => res.json())
        .catch(() => null);
      const moralisPromise = fetch(
        `https://solana-gateway.moralis.io/token/mainnet/${address}/metadata`,
        {
          headers: {
            accept: "application/json",
            "X-API-Key":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImRhY2M3ZmQ1LWYyOTgtNGY5Zi1iZDIwLTdiYWM5MWRkMjNhNCIsIm9yZ0lkIjoiNDcxNTg3IiwidXNlcklkIjoiNDg1MTI3IiwidHlwZUlkIjoiYmVlNmFiMTItODg0NS00Nzc3LWJlMDQtODU4ODYzOTYxMjAxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTgzNDIwMzksImV4cCI6NDkxNDEwMjAzOX0.twhytkJWhGoqh5NVfhSkG9Irub-cS2cSSqKqPCI5Ur8",
          },
        },
      )
        .then((res) => res.json())
        .catch(() => null);

      // Fetch Jupiter as well as it's often more reliable for captures
      const jupPromise = fetch(`https://tokens.jup.ag/token/${address}`)
        .then((res) => res.json())
        .catch(() => null);

      const [dexData, pumpData, moralisData, jupData] = await Promise.all([
        dexPromise,
        pumpPromise,
        moralisPromise,
        jupPromise,
      ]);

      // Initialize logoUrl as empty string to track if we found a good one
      mergedMetadata.logoUrl = "";

      // 1. TOP PRIORITY: PumpFun (imagedelivery.net) - Best for capture
      if (pumpData && pumpData.success && pumpData.result) {
        const res = pumpData.result;
        if (!mergedMetadata.tokenName) mergedMetadata.tokenName = res.symbol;
        if (!mergedMetadata.title)
          mergedMetadata.title = `${res.name} Growth Campaign`;
        mergedMetadata.logoUrl = `https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/coin-image/${address}/86x86?alpha=true`;
        if (!mergedMetadata.description)
          mergedMetadata.description = res.description;
      }

      // 2. SECOND PRIORITY: Jupiter - Usually allows CORS/Capture
      if (!mergedMetadata.logoUrl && jupData && jupData.logoURI) {
        mergedMetadata.logoUrl = jupData.logoURI;
        if (jupData.symbol && !mergedMetadata.tokenName)
          mergedMetadata.tokenName = jupData.symbol;
      }

      // 3. THIRD PRIORITY: DexScreener
      if (dexData && dexData.pairs && dexData.pairs.length > 0) {
        const bestPair = dexData.pairs.sort(
          (a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0),
        )[0];
        const token = bestPair.baseToken;
        if (token.symbol && !mergedMetadata.tokenName)
          mergedMetadata.tokenName = token.symbol;
        if (token.name && !mergedMetadata.title)
          mergedMetadata.title = `${token.name} Growth Campaign`;

        if (!mergedMetadata.logoUrl && bestPair.info?.imageUrl) {
          mergedMetadata.logoUrl = bestPair.info.imageUrl;
        }
        if (bestPair.info?.header)
          mergedMetadata.bannerUrl = bestPair.info.header;
        if (bestPair.info?.websites?.[0]?.url)
          mergedMetadata.websiteUrl = bestPair.info.websites[0].url;
        const twitter = bestPair.info?.socials?.find(
          (s: any) => s.type === "twitter",
        );
        if (twitter?.url) mergedMetadata.twitterUrl = twitter.url;
        const telegram = bestPair.info?.socials?.find(
          (s: any) => s.type === "telegram",
        );
        if (telegram?.url) mergedMetadata.telegramUrl = telegram.url;
      }

      // 4. LAST RESORT: Moralis
      if (moralisData && moralisData.mint) {
        if (moralisData.symbol && !mergedMetadata.tokenName)
          mergedMetadata.tokenName = moralisData.symbol;
        if (moralisData.name && !mergedMetadata.title)
          mergedMetadata.title = `${moralisData.name} Growth Campaign`;
        if (moralisData.logo && !mergedMetadata.logoUrl) {
          mergedMetadata.logoUrl = moralisData.logo;
        }
        if (moralisData.description && !mergedMetadata.description)
          mergedMetadata.description = moralisData.description;
        if (moralisData.links?.website && !mergedMetadata.websiteUrl)
          mergedMetadata.websiteUrl = moralisData.links.website;
        if (moralisData.links?.twitter && !mergedMetadata.twitterUrl)
          mergedMetadata.twitterUrl = moralisData.links.twitter;
      }

      if (Object.keys(mergedMetadata).length > 0) {
        if (mergedMetadata.tokenName)
          form.setValue("tokenName", mergedMetadata.tokenName);
        if (mergedMetadata.title && !form.getValues("title"))
          form.setValue("title", mergedMetadata.title);
        if (mergedMetadata.logoUrl)
          form.setValue("logoUrl", mergedMetadata.logoUrl);
        if (mergedMetadata.bannerUrl)
          form.setValue("bannerUrl", mergedMetadata.bannerUrl);
        if (mergedMetadata.description && !form.getValues("description"))
          form.setValue("description", mergedMetadata.description);
        if (mergedMetadata.websiteUrl)
          form.setValue("websiteUrl", mergedMetadata.websiteUrl);
        if (mergedMetadata.twitterUrl)
          form.setValue("twitterUrl", mergedMetadata.twitterUrl);
        if (mergedMetadata.telegramUrl)
          form.setValue("telegramUrl", mergedMetadata.telegramUrl);

        // Handle Market Cap from different sources
        let mcValue = "";
        // Prioritize DexScreener FDV/MarketCap as it's free and often more accurate for new tokens
        if (dexData?.pairs?.[0]?.marketCap) {
          mcValue = dexData.pairs[0].marketCap.toString();
        } else if (dexData?.pairs?.[0]?.fdv) {
          mcValue = dexData.pairs[0].fdv.toString();
        } else if (moralisData?.market_cap_usd) {
          mcValue = moralisData.market_cap_usd.toString();
        }

        if (mcValue) {
          form.setValue("initialMarketCap", mcValue);
        }

        toast({
          title: "Metadata Loaded",
          description: `Successfully retrieved token details.`,
        });
      } else {
        toast({
          title: "Limited Data",
          description: "Found token but could not retrieve full metadata.",
          variant: "default",
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
        description: "Please reconnect your wallet.",
        variant: "destructive",
      });
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
      totalBudget:
        values.campaignType === "holder_qualification"
          ? (
              Number(values.rewardPerWallet || 0) *
              Number(values.maxClaims || 0)
            ).toString()
          : (values.totalBudget || 0).toString(),
      minHoldingAmount: values.minHoldingAmount?.toString() || null,
      rewardPerWallet: values.rewardPerWallet?.toString() || null,
      requirements: {
        minSolBalance: values.minSolBalance,
        minWalletAgeDays: values.minWalletAgeDays,
        minXAccountAgeDays: values.minXAccountAgeDays,
        minXFollowers: values.minXFollowers,
        minFollowDurationDays: values.minFollowDurationDays,
        multiDaySolHolding:
          values.multiDaySolAmount > 0 && values.multiDaySolDays > 0
            ? {
                amount: values.multiDaySolAmount,
                days: values.multiDaySolDays,
              }
            : undefined,
      },
      actions:
        values.campaignType === "holder_qualification" || !values.actions
          ? []
          : values.actions.map((a) => ({
              ...a,
              rewardAmount: a.rewardAmount.toString(),
              maxExecutions: a.maxExecutions ? Number(a.maxExecutions) : null,
            })),
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
            colors: ["#22c55e", "#16a34a", "#ffffff"],
          });
        });
        setShowSuccessCard(true);
        window.dispatchEvent(
          new CustomEvent("campaign-created", { detail: data }),
        );
      },
      onError: (error: any) => {
        toast({
          title: "Launch Failed",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      },
    });
  }

  const getActionDefaultTitle = (type: string) => {
    switch (type) {
      case "website":
        return "Visit Website";
      case "twitter_follow":
        return "Follow on Twitter";
      case "twitter_retweet":
        return "Retweet Post";
      case "telegram_join":
        return "Join Telegram";
      default:
        return "Custom Task";
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setStep("edit");
        }}
      >
        <DialogTrigger asChild>
          <Button
            onClick={handleOpenClick}
            className="bg-primary text-primary-foreground font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
          >
            <Rocket className="mr-2 h-4 w-4" /> Launch Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/20 p-0">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-display text-primary">
                {step === "preview"
                  ? "Preview Your Campaign"
                  : "Create New Campaign"}
              </DialogTitle>
              <DialogDescription>
                {step === "preview"
                  ? "Review all details before publishing."
                  : "Set up a new Pay-Per-Action campaign to boost your project."}
              </DialogDescription>
            </DialogHeader>

            {step === "edit" ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tokenAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-primary font-bold">
                            Token Contract Address
                          </FormLabel>
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
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              if (value === "holder_qualification") {
                                form.setValue("actions", []);
                              } else {
                                form.setValue("actions", [
                                  {
                                    type: "website",
                                    title: "Visit Website",
                                    url: "",
                                    rewardAmount: 0.01,
                                    maxExecutions: 10,
                                  },
                                ]);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="holder_qualification"
                                disabled={isHolderDisabled || loadingSettings}
                              >
                                Holder Qualification{" "}
                                {getCampaignStatusLabel("holder_qualification")}
                              </SelectItem>
                              <SelectItem
                                value="engagement"
                                disabled={isSocialDisabled || loadingSettings}
                              >
                                Social Engagement{" "}
                                {getCampaignStatusLabel("engagement")}
                                {settings?.twitterApiStatus !== "active" &&
                                  settings?.socialEngagementEnabled && (
                                    <span className="block text-[10px] text-yellow-500 font-medium mt-0.5">
                                      Verification delayed: Twitter API
                                      Disconnected
                                    </span>
                                  )}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchedType && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="websiteUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
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
                              <FormLabel>Twitter</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://x.com/..."
                                  {...field}
                                />
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
                              <FormLabel>Telegram</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://t.me/..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Community Growth"
                                  {...field}
                                />
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
                              <FormLabel>Token Symbol</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. SOL" {...field} />
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
                            <FormLabel>Project Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell users about your project..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-primary">
                          Assets & Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="bannerUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Banner Image URL</FormLabel>
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
                                <FormLabel>Logo Image URL</FormLabel>
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
                                <FormLabel>Website</FormLabel>
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
                                <FormLabel>Twitter</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://x.com/..."
                                    {...field}
                                  />
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
                                <FormLabel>Telegram</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://t.me/..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Unified Anti-Bot Protection Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                          <Shield className="w-5 h-5 text-orange-500" />
                          <div className="flex-1">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider leading-none mb-1">
                              Advanced Anti-Bot Protection
                            </h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                              Multi-layer security for your campaign
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-white/5 bg-white/5">
                          <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest border-b border-white/5 pb-2">
                              Wallet Requirements
                            </p>
                            <FormField
                              control={form.control}
                              name="minSolBalance"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] uppercase font-bold text-white/60">
                                    Min SOL Balance
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.1"
                                      className="h-10 bg-black/20"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="minWalletAgeDays"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[10px] uppercase font-bold text-white/60">
                                    Min Wallet Age (Days)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="30"
                                      className="h-10 bg-black/20"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4 border-l border-white/5 pl-4">
                            <p className="text-[10px] font-black uppercase text-[#1DA1F2] tracking-widest border-b border-white/5 pb-2">
                              X (Twitter) Requirements
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                              <FormField
                                control={form.control}
                                name="minXAccountAgeDays"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[10px] uppercase font-bold text-white/60">
                                      Account Age (Days)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="90"
                                        className="h-10 bg-black/20"
                                        {...field}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name="minXFollowers"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[10px] uppercase font-bold text-white/60">
                                        Min Followers
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="10"
                                          className="h-10 bg-black/20"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="minFollowDurationDays"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[10px] uppercase font-bold text-white/60">
                                        Hold Follow (Days)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="3"
                                          className="h-10 bg-black/20"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Visual Summary Sentence - Integrated as requested */}
                        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-[11px] font-bold text-white leading-relaxed uppercase tracking-tight">
                            <span className="text-primary mr-1">
                              Final Setup:
                            </span>
                            Only users with {form.watch("minSolBalance") || 0}{" "}
                            SOL & {form.watch("minWalletAgeDays") || 0} day old
                            wallets can participate.
                            {form.watch("minXAccountAgeDays") > 0 &&
                              ` Accounts must be ${form.watch("minXAccountAgeDays")}d+ old.`}
                            {form.watch("minXFollowers") > 0 &&
                              ` ${form.watch("minXFollowers")}+ followers required.`}
                            {form.watch("minFollowDurationDays") > 0 &&
                              ` Must maintain follow for ${form.watch("minFollowDurationDays")} days.`}
                          </p>
                        </div>
                      </div>

                      {watchedType === "holder_qualification" ? (
                        <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <h3 className="font-semibold text-primary flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Holding
                            Requirements
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="minHoldingAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Min Holding Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="1000"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
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
                                    <Input
                                      type="number"
                                      placeholder="7"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
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
                                    <Input
                                      type="number"
                                      placeholder="10"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
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
                                    <Input
                                      type="number"
                                      placeholder="100"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-primary flex items-center gap-2">
                              <Twitter className="w-4 h-4" /> Social Missions
                            </h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                append({
                                  type: "website",
                                  title: "Visit Website",
                                  url: "",
                                  rewardAmount: 0.01,
                                  maxExecutions: 10,
                                })
                              }
                              className="h-8 text-xs border-primary/20 hover:bg-primary/10"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Task
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {fields.map((field, index) => (
                              <div
                                key={field.id}
                                className="p-4 rounded-lg bg-background/50 border border-white/5 space-y-4 relative group"
                              >
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
                                        <FormLabel className="text-[10px] uppercase">
                                          Type
                                        </FormLabel>
                                        <Select
                                          onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue(
                                              `actions.${index}.title`,
                                              getActionDefaultTitle(val),
                                            );
                                          }}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="h-8">
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="website">
                                              Website
                                            </SelectItem>
                                            <SelectItem value="twitter_follow">
                                              X Follow
                                            </SelectItem>
                                            <SelectItem value="twitter_retweet">
                                              X Retweet
                                            </SelectItem>
                                            <SelectItem value="telegram_join">
                                              Telegram
                                            </SelectItem>
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
                                        <FormLabel className="text-[10px] uppercase">
                                          Task Label
                                        </FormLabel>
                                        <FormControl>
                                          <Input className="h-8" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>

                                <FormField
                                  control={form.control}
                                  name={`actions.${index}.url`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-[10px] uppercase">
                                        Target URL
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          className="h-8"
                                          placeholder="https://..."
                                          {...field}
                                        />
                                      </FormControl>
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
                                        <FormLabel className="text-[10px] uppercase">
                                          Reward
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            step="any"
                                            className="h-8"
                                            {...field}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`actions.${index}.maxExecutions`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[10px] uppercase">
                                          Slots
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            className="h-8"
                                            {...field}
                                          />
                                        </FormControl>
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
                          <span className="text-sm font-bold text-primary uppercase tracking-wider">
                            Payment Breakdown
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase border-primary/20 text-primary"
                          >
                            Live Summary
                          </Badge>
                        </div>

                        <div className="space-y-2 border-b border-primary/10 pb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground italic">
                              Airdrop Budget
                            </span>
                            <span className="font-bold">
                              {watchedType === "holder_qualification"
                                ? (
                                    Number(form.watch("rewardPerWallet")) *
                                      Number(form.watch("maxClaims")) || 0
                                  ).toLocaleString()
                                : totalCalculatedCost.toLocaleString()}{" "}
                              {form.watch("tokenName") || "Tokens"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground italic">
                              Platform Fee (Burn/Rewards/System)
                            </span>
                            <span className="font-bold">
                              {platformFee.toLocaleString()}{" "}
                              {PLATFORM_CONFIG.TOKEN_SYMBOL}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground italic">
                              Network Gas (SOL)
                            </span>
                            <div className="text-right">
                              <span className="font-bold text-emerald-500">
                                {gasFeeSol} SOL
                              </span>
                              <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">
                                {totalExecutions > 0
                                  ? `Covers ${totalExecutions} distribution txs`
                                  : "Creation fee included"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end pt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              Total to Pay
                            </p>
                            <div className="space-y-1">
                              <p className="text-xl font-black text-white leading-none">
                                {airdropBudget.toLocaleString(undefined, {
                                  maximumFractionDigits: 6,
                                })}
                                <span className="text-xs ml-1 font-bold text-white/70">
                                  {form.watch("tokenName") || "Tokens"}
                                </span>
                              </p>
                              <p className="text-xl font-black text-primary leading-none">
                                {platformFee.toLocaleString()}
                                <span className="text-xs ml-1 font-bold text-primary/70">
                                  {PLATFORM_CONFIG.TOKEN_SYMBOL}
                                </span>
                              </p>
                              <p className="text-xs text-emerald-500 font-bold">
                                + {gasFeeSol} SOL GAS FEE
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                              Total Slots
                            </p>
                            <p className="text-xl font-bold">
                              {totalExecutions}
                            </p>
                          </div>
                        </div>

                        <div className="bg-primary/10 p-3 rounded-lg flex items-start gap-3 border border-primary/20">
                          <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-[11px] text-primary/80 leading-relaxed font-medium">
                            You will sign{" "}
                            <strong>one single transaction</strong> to authorize
                            both the token budget and platform fees.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          className="flex-1 font-black text-sm h-12 shadow-[0_10px_20px_rgba(34,197,94,0.2)] hover:shadow-[0_15px_30px_rgba(34,197,94,0.3)] transition-all"
                          onClick={async () => {
                            const isValid = await form.trigger();
                            if (isValid) {
                              setStep("preview");
                            } else {
                              toast({
                                title: "Incomplete Form",
                                description:
                                  "Please fill in all required fields marked with errors.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> PREVIEW BEFORE LAUNCH
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            ) : (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-primary/10 border border-primary/20 group">
                  {form.getValues("bannerUrl") ? (
                    <img
                      src={form.getValues("bannerUrl")}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt="Banner"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-primary/40 italic">
                      <Globe className="w-12 h-12 mb-2 opacity-20" />
                      <span>No Banner Preview Available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-background/80 backdrop-blur border border-primary/30 p-1">
                      {form.getValues("logoUrl") && (
                        <img
                          src={form.getValues("logoUrl")}
                          className="w-full h-full object-cover rounded-lg"
                          alt="Logo"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        {form.getValues("title")}
                      </h3>
                      <p className="text-primary font-bold uppercase tracking-widest text-sm">
                        ${form.getValues("tokenName")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                      Total Budget
                    </p>
                    <p className="font-bold text-lg">
                      {form.getValues("totalBudget")}{" "}
                      {form.getValues("tokenName")}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                      Type
                    </p>
                    <p className="font-bold text-lg capitalize">
                      {form.getValues("campaignType")?.replace("_", " ")}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
                      Network
                    </p>
                    <p className="font-bold text-lg">Solana</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                    Active Protections
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.getValues("minSolBalance") > 0 && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">
                          Min Balance
                        </p>
                        <p className="text-sm font-black text-white">
                          {form.getValues("minSolBalance")} SOL
                        </p>
                      </div>
                    )}
                    {form.getValues("minWalletAgeDays") > 0 && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">
                          Wallet Age
                        </p>
                        <p className="text-sm font-black text-white">
                          {form.getValues("minWalletAgeDays")} Days
                        </p>
                      </div>
                    )}
                    {form.getValues("minXAccountAgeDays") > 0 && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">
                          X Account Age
                        </p>
                        <p className="text-sm font-black text-white">
                          {form.getValues("minXAccountAgeDays")} Days
                        </p>
                      </div>
                    )}
                    {form.getValues("minXFollowers") > 0 && (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] text-white/40 font-bold uppercase mb-1">
                          X Followers
                        </p>
                        <p className="text-sm font-black text-white">
                          {form.getValues("minXFollowers")}+
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("edit")}
                  >
                    Back to Edit
                  </Button>
                  <Button
                    className="flex-1 font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Rocket className="mr-2 h-4 w-4" />
                    )}
                    Confirm & Launch
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CampaignSuccessCard
        campaign={createdCampaign}
        open={showSuccessCard}
        onClose={() => {
          setShowSuccessCard(false);
          setCreatedCampaign(null);
        }}
      />
    </>
  );
}
