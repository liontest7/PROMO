import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const replitUsers = pgTable("replit_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertReplitUser = typeof replitUsers.$inferInsert;
export type ReplitUser = typeof replitUsers.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  role: text("role", { enum: ["user", "advertiser"] }).default("user").notNull(),
  reputationScore: integer("reputation_score").default(100),
  balance: numeric("balance").default("0").notNull(),
  twitterHandle: text("twitter_handle"),
  telegramHandle: text("telegram_handle"),
  replitId: text("replit_id"), // Added to link with Replit Auth
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tokenName: text("token_name").notNull(),
  tokenAddress: text("token_address").notNull(),
  totalBudget: numeric("total_budget").notNull(), // Using numeric for token amounts
  remainingBudget: numeric("remaining_budget").notNull(),
  bannerUrl: text("banner_url"), // Added for professional look
  logoUrl: text("logo_url"), // Added for professional look
  websiteUrl: text("website_url"), // Project website
  twitterUrl: text("twitter_url"), // Project Twitter
  telegramUrl: text("telegram_url"), // Project Telegram
  status: text("status", { enum: ["active", "completed", "paused"] }).default("active").notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  requirements: jsonb("requirements").$type<{
    minSolBalance?: number;
    walletAgeDays?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  type: text("type", { enum: ["website", "telegram", "twitter"] }).notNull(),
  title: text("title").notNull(), // e.g., "Follow us on Twitter"
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
  status: text("status", { enum: ["pending", "verified", "paid", "rejected"] }).default("pending").notNull(),
  transactionSignature: text("transaction_signature"), // For on-chain proof if needed
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

// Request Types
export type CreateCampaignRequest = InsertCampaign & {
  actions: InsertAction[];
};

export type VerifyActionRequest = {
  actionId: number;
  userWallet: string;
  proof?: string; // e.g., tweet URL or signature
  handle?: string; // New field for social handle verification
  socialVerified?: boolean; // Flag if social account was verified
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
