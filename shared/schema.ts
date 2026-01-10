import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  role: text("role", { enum: ["user", "advertiser", "admin"] }).default("user").notNull(),
  reputationScore: integer("reputation_score").default(100),
  balance: numeric("balance").default("0").notNull(),
  twitterHandle: text("twitter_handle"),
  telegramHandle: text("telegram_handle"),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").references(() => users.id).notNull(),
  action: text("action").notNull(),
  targetId: integer("target_id"),
  targetType: text("target_type"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id],
  }),
}));

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tokenName: text("token_name").notNull(),
  tokenAddress: text("token_address").notNull(),
  totalBudget: numeric("total_budget").notNull(),
  remainingBudget: numeric("remaining_budget").notNull(),
  bannerUrl: text("banner_url"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  twitterUrl: text("twitter_url"),
  telegramUrl: text("telegram_url"),
  campaignType: text("campaign_type", { enum: ["engagement", "holder_qualification"] }).default("engagement").notNull(),
  minHoldingAmount: numeric("min_holding_amount"),
  minHoldingDuration: integer("min_holding_duration"), // in days
  rewardPerWallet: numeric("reward_per_wallet"),
  maxClaims: integer("max_claims"),
  status: text("status", { enum: ["active", "completed", "paused"] }).default("active").notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  requirements: jsonb("requirements").$type<{
    minSolBalance?: number;
    walletAgeDays?: number;
    minWalletAgeDays?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const holderState = pgTable("holder_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  holdStartTimestamp: timestamp("hold_start_timestamp").defaultNow().notNull(),
  claimed: boolean("claimed").default(false).notNull(),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  type: text("type", { enum: ["website", "telegram", "twitter"] }).notNull(),
  title: text("title").notNull(),
  rewardAmount: numeric("reward_amount").notNull(),
  url: text("url").notNull(),
  maxExecutions: integer("max_executions"),
  currentExecutions: integer("current_executions").default(0),
});

export const executions = pgTable("executions", {
  id: serial("id").primaryKey(),
  actionId: integer("action_id").references(() => actions.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "verified", "paid", "rejected", "waiting"] }).default("pending").notNull(),
  transactionSignature: text("transaction_signature"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  campaigns: many(campaigns),
  executions: many(executions),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, {
    fields: [campaigns.creatorId],
    references: [users.id],
  }),
  actions: many(actions),
  executions: many(executions),
  holderStates: many(holderState),
}));

export const holderStateRelations = relations(holderState, ({ one }) => ({
  user: one(users, {
    fields: [holderState.userId],
    references: [users.id],
  }),
  campaign: one(campaigns, {
    fields: [holderState.campaignId],
    references: [campaigns.id],
  }),
}));

export const actionsRelations = relations(actions, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [actions.campaignId],
    references: [campaigns.id],
  }),
  executions: many(executions),
}));

export const executionsRelations = relations(executions, ({ one }) => ({
  action: one(actions, {
    fields: [executions.actionId],
    references: [actions.id],
  }),
  campaign: one(campaigns, {
    fields: [executions.campaignId],
    references: [campaigns.id],
  }),
  user: one(users, {
    fields: [executions.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, reputationScore: true }).extend({
  twitterHandle: z.string().optional().or(z.literal("")),
  telegramHandle: z.string().optional().or(z.literal(""))
});
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true, 
  createdAt: true, 
  remainingBudget: true, 
  status: true 
}).extend({
  bannerUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  telegramUrl: z.string().url().optional().or(z.literal(""))
});
export const insertActionSchema = createInsertSchema(actions).omit({ id: true, currentExecutions: true });
export const insertExecutionSchema = createInsertSchema(executions).omit({ id: true, createdAt: true, status: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;

export type Execution = typeof executions.$inferSelect;
export type InsertExecution = z.infer<typeof insertExecutionSchema>;

export const insertHolderStateSchema = createInsertSchema(holderState).omit({ id: true });
export type HolderState = typeof holderState.$inferSelect;
export type InsertHolderState = z.infer<typeof insertHolderStateSchema>;

// Request Types
export type CreateCampaignRequest = InsertCampaign & {
  actions: InsertAction[];
};

export type VerifyActionRequest = {
  actionId: number;
  userWallet: string;
  proof?: string;
  handle?: string;
  socialVerified?: boolean;
};

// Response Types
export type CampaignWithActions = Campaign & {
  actions: Action[];
  creator?: User;
};

export type ExecutionWithDetails = Execution & {
  action: Action;
  campaign: Campaign;
};
