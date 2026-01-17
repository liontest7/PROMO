import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";

export const formSchema = insertCampaignSchema
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

export type FormValues = z.infer<typeof formSchema>;
