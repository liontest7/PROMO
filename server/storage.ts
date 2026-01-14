import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import {
  users, campaigns, actions, executions, holderState, systemSettings,
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Action, type InsertAction,
  type Execution, type InsertExecution,
  type HolderState, type InsertHolderState
} from "@shared/schema";

export interface IStorage {
  // User
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  getUserByTwitterHandle(handle: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, score: number): Promise<User>;
  updateUserSocials(id: number, socials: { twitterHandle?: string; telegramHandle?: string }): Promise<User>;
  updateUserRole(id: number, role: "user" | "advertiser" | "admin"): Promise<User>;
  updateUserStatus(id: number, status: "active" | "suspended" | "blocked"): Promise<User>;

  // Fraud Monitoring
  getSuspiciousUsers(): Promise<User[]>;
  getSuspiciousCampaigns(): Promise<(Campaign & { actions: Action[] })[]>;

  // Campaign
  getCampaigns(creatorId?: number): Promise<(Campaign & { actions: Action[] })[]>;
  getCampaign(id: number): Promise<(Campaign & { actions: Action[] }) | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;

  // Action
  createAction(action: InsertAction): Promise<Action>;
  getActionsByCampaign(campaignId: number): Promise<Action[]>;
  getAction(id: number): Promise<Action | undefined>;
  incrementActionExecution(id: number): Promise<void>;

  // Execution
  createExecution(execution: InsertExecution): Promise<Execution>;
  getExecution(id: number): Promise<Execution | undefined>;
  getExecutionsByUser(userId: number): Promise<Execution[]>;
  updateExecutionStatus(id: number, status: "pending" | "verified" | "paid" | "rejected", txSignature?: string): Promise<Execution>;
  updateCampaignRemainingBudget(id: number, remainingBudget: string): Promise<Campaign>;

  // Holder State
  getHolderState(userId: number, campaignId: number): Promise<HolderState | undefined>;
  createHolderState(state: InsertHolderState): Promise<HolderState>;
  updateHolderClaimed(id: number): Promise<void>;
  getExecutionsByCampaign(campaignId: number): Promise<(Execution & { user: { walletAddress: string } })[]>;

  // Admin
  getAllUsers(): Promise<User[]>;
  getAllCampaigns(): Promise<(Campaign & { actions: Action[] })[]>;
  getAllExecutions(): Promise<(Execution & { user: User, campaign: Campaign, action: Action })[]>;
  getLeaderboard(): Promise<User[]>;
  // System Settings
  getSystemSettings(): Promise<typeof systemSettings.$inferSelect>;
  updateSystemSettings(settings: Partial<typeof systemSettings.$inferSelect>): Promise<typeof systemSettings.$inferSelect>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getCampaignBySymbol(symbol: string): Promise<(Campaign & { actions: Action[] }) | undefined>;
  // Anti-fraud
  getWalletsByIp(ip: string): Promise<string[]>;
  logIpWalletAssociation(ip: string, wallet: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private ipWalletLog: Map<string, Set<string>> = new Map();

  async getWalletsByIp(ip: string): Promise<string[]> {
    return Array.from(this.ipWalletLog.get(ip) || []);
  }

  async logIpWalletAssociation(ip: string, wallet: string): Promise<void> {
    if (!this.ipWalletLog.has(ip)) {
      this.ipWalletLog.set(ip, new Set());
    }
    this.ipWalletLog.get(ip)!.add(wallet);
  }

  async getCampaignBySymbol(symbol: string): Promise<(Campaign & { actions: Action[] }) | undefined> {
    const [campaign] = await db.select().from(campaigns).where(sql`LOWER(${campaigns.tokenName}) = LOWER(${symbol})`);
    if (!campaign) return undefined;
    
    const campaignActions = await db.select().from(actions).where(eq(actions.campaignId, campaign.id));
    return { ...campaign, actions: campaignActions };
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async getUserByTwitterHandle(handle: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.twitterHandle, handle));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserReputation(id: number, score: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ reputationScore: score })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserSocials(id: number, socials: { twitterHandle?: string; telegramHandle?: string; profileImageUrl?: string }): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    const [updatedUser] = await db.update(users)
      .set(socials)
      .where(eq(users.id, id))
      .returning();
    
    // Award reputation for first-time social link
    if (user && !user.twitterHandle && socials.twitterHandle) {
      const hasAlreadyEarnedXBonus = (user as any).earnedXBonus || false;
      if (!hasAlreadyEarnedXBonus) {
        await db.update(users)
          .set({ 
            reputationScore: (user.reputationScore || 0) + 25,
            // @ts-ignore
            earnedXBonus: true 
          })
          .where(eq(users.id, id));
      }
    } else if (user && user.twitterHandle && socials.twitterHandle === null) {
      // Deduct reputation when unlinking Twitter
      await db.update(users)
        .set({ reputationScore: Math.max(0, (user.reputationScore || 0) - 25) })
        .where(eq(users.id, id));
    }

    if (user && !user.telegramHandle && socials.telegramHandle) {
      const hasAlreadyEarnedTGBonus = (user as any).earnedTGBonus || false;
      if (!hasAlreadyEarnedTGBonus) {
        await db.update(users)
          .set({ 
            reputationScore: (user.reputationScore || 0) + 25,
            // @ts-ignore
            earnedTGBonus: true 
          })
          .where(eq(users.id, id));
      }
    } else if (user && user.telegramHandle && socials.telegramHandle === null) {
      // Deduct reputation when unlinking Telegram
      await db.update(users)
        .set({ reputationScore: Math.max(0, (user.reputationScore || 0) - 25) })
        .where(eq(users.id, id));
    }

    return updatedUser;
  }

  async updateUserRole(id: number, role: "user" | "advertiser" | "admin"): Promise<User> {
    const [user] = await db.update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStatus(id: number, status: "active" | "suspended" | "blocked"): Promise<User> {
    const [user] = await db.update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getSuspiciousUsers(): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(sql`${users.reputationScore} > 200 OR ${users.balance}::numeric > 50 OR ${users.status} = 'suspended'`)
      .orderBy(desc(users.reputationScore));
  }

  async getSuspiciousCampaigns(): Promise<(Campaign & { actions: Action[] })[]> {
    const suspicious = await db.select()
      .from(campaigns)
      .where(sql`${campaigns.remainingBudget}::numeric < 0 OR ${campaigns.status} = 'paused'`)
      .orderBy(desc(campaigns.createdAt));
    
    const results = [];
    for (const campaign of suspicious) {
      const campaignActions = await db.select().from(actions).where(eq(actions.campaignId, campaign.id));
      results.push({ ...campaign, actions: campaignActions });
    }
    return results;
  }

  async getCampaigns(creatorId?: number): Promise<(Campaign & { actions: Action[] })[]> {
    const allCampaigns = await (creatorId 
      ? db.select().from(campaigns).where(eq(campaigns.creatorId, creatorId)).orderBy(desc(campaigns.createdAt))
      : db.select().from(campaigns).orderBy(desc(campaigns.createdAt)));
    
    // Filter out campaigns that might be MOCK if requested, but let's assume we want all that exist in DB.
    // The user specifically wants to remove MOCK coins/data.
    
    const results = [];
    for (const campaign of allCampaigns) {
      // Skip campaigns that look like mock data if they aren't created by real users
      // For now, let's just make sure we don't have hardcoded mocks here.
      const campaignActions = await db.select().from(actions).where(eq(actions.campaignId, campaign.id));
      results.push({ ...campaign, actions: campaignActions });
    }
    return results;
  }

  async getCampaign(id: number): Promise<(Campaign & { actions: Action[] }) | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (!campaign) return undefined;
    
    const campaignActions = await db.select().from(actions).where(eq(actions.campaignId, campaign.id));
    return { ...campaign, actions: campaignActions };
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const totalBudget = insertCampaign.campaignType === 'holder_qualification' 
      ? (parseFloat(insertCampaign.rewardPerWallet || "0") * (insertCampaign.maxClaims || 0)).toString()
      : insertCampaign.totalBudget;

    const [campaign] = await db.insert(campaigns).values({
      ...insertCampaign,
      totalBudget,
      remainingBudget: totalBudget,
      status: "active"
    } as any).returning();
    return campaign;
  }

  async createAction(insertAction: InsertAction): Promise<Action> {
    const [action] = await db.insert(actions).values(insertAction).returning();
    return action;
  }

  async getActionsByCampaign(campaignId: number): Promise<Action[]> {
    return await db.select().from(actions).where(eq(actions.campaignId, campaignId));
  }

  async getAction(id: number): Promise<Action | undefined> {
    const [action] = await db.select().from(actions).where(eq(actions.id, id));
    return action;
  }

  async incrementActionExecution(id: number): Promise<void> {
    const action = await this.getAction(id);
    if (action) {
      await db.update(actions)
        .set({ currentExecutions: (action.currentExecutions || 0) + 1 })
        .where(eq(actions.id, id));
    }
  }

  async createExecution(insertExecution: InsertExecution): Promise<Execution> {
    const [execution] = await db.insert(executions).values(insertExecution).returning();
    return execution;
  }

  async getExecution(id: number): Promise<Execution | undefined> {
    const [execution] = await db.select().from(executions).where(eq(executions.id, id));
    return execution;
  }

  async getExecutionsByUser(userId: number): Promise<(Execution & { action: Action; campaign: Campaign })[]> {
    const userExecutions = await db.select().from(executions).where(eq(executions.userId, userId)).orderBy(desc(executions.createdAt));
    const results = [];
    for (const execution of userExecutions) {
      const [action] = await db.select().from(actions).where(eq(actions.id, execution.actionId));
      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, execution.campaignId));
      if (action && campaign) {
        results.push({ ...execution, action, campaign });
      }
    }
    return results;
  }

  async updateExecutionStatus(id: number, status: "pending" | "verified" | "paid" | "rejected", txSignature?: string): Promise<Execution> {
    const [execution] = await db.update(executions)
      .set({ status, transactionSignature: txSignature })
      .where(eq(executions.id, id))
      .returning();

    if (status === "verified" || status === "paid") {
      const action = await this.getAction(execution.actionId);
      if (action) {
        if (status === "verified") {
           const [user] = await db.select().from(users).where(eq(users.id, execution.userId));
           if (user) {
             await db.update(users)
               .set({ reputationScore: (user.reputationScore || 0) + 5 })
               .where(eq(users.id, user.id));
           }
        }

        if (status === "paid") {
          const [user] = await db.select().from(users).where(eq(users.id, execution.userId));
          if (user) {
            const currentBalance = parseFloat(user.balance) || 0;
            const reward = parseFloat(action.rewardAmount) || 0;
            const newBalance = (currentBalance + reward).toFixed(6);
            
            await db.update(users)
              .set({ 
                balance: newBalance, 
                reputationScore: (user.reputationScore || 0) + 10
              })
              .where(eq(users.id, user.id));
          }

          const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, execution.campaignId));
          if (campaign) {
            const currentRemaining = parseFloat(campaign.remainingBudget) || 0;
            const reward = parseFloat(action.rewardAmount) || 0;
            const newRemaining = Math.max(0, currentRemaining - reward).toFixed(6);
            
            await db.update(campaigns)
              .set({ remainingBudget: newRemaining })
              .where(eq(campaigns.id, campaign.id));
          }
        }
      }
    }
    return execution;
  }

  async updateCampaignRemainingBudget(id: number, remainingBudget: string): Promise<Campaign> {
    const [campaign] = await db.update(campaigns)
      .set({ remainingBudget })
      .where(eq(campaigns.id, id))
      .returning();
    return campaign;
  }

  async getHolderState(userId: number, campaignId: number): Promise<HolderState | undefined> {
    const [state] = await db.select().from(holderState)
      .where(sql`${holderState.userId} = ${userId} AND ${holderState.campaignId} = ${campaignId}`);
    return state;
  }

  async createHolderState(insertState: InsertHolderState): Promise<HolderState> {
    const [state] = await db.insert(holderState).values(insertState).returning();
    return state;
  }

  async updateHolderClaimed(id: number): Promise<void> {
    await db.update(holderState).set({ claimed: true }).where(eq(holderState.id, id));
  }

  async getExecutionsByCampaign(campaignId: number): Promise<(Execution & { user: { walletAddress: string } })[]> {
    const campaignExecutions = await db.select({
      id: executions.id,
      campaignId: executions.campaignId,
      userId: executions.userId,
      actionId: executions.actionId,
      status: executions.status,
      createdAt: executions.createdAt,
      transactionSignature: executions.transactionSignature,
      user: {
        walletAddress: users.walletAddress
      }
    })
    .from(executions)
    .innerJoin(users, eq(executions.userId, users.id))
    .where(eq(executions.campaignId, campaignId))
    .orderBy(desc(executions.createdAt));
    
    return campaignExecutions as any;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllCampaigns(): Promise<(Campaign & { actions: Action[] })[]> {
    return await this.getCampaigns();
  }

  async getAllExecutions(): Promise<(Execution & { user: User; campaign: Campaign; action: Action })[]> {
    const results = await db.select({
      execution: executions,
      user: users,
      campaign: campaigns,
      action: actions
    })
    .from(executions)
    .innerJoin(users, eq(executions.userId, users.id))
    .innerJoin(campaigns, eq(executions.campaignId, campaigns.id))
    .innerJoin(actions, eq(executions.actionId, actions.id))
    .orderBy(desc(executions.createdAt));

    return results.map(r => ({
      ...r.execution,
      user: r.user,
      campaign: r.campaign,
      action: r.action
    }));
  }

  async getLeaderboard(): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(sql`${users.role} = 'user' AND ${users.acceptedTerms} = true`)
      .orderBy(desc(users.reputationScore), desc(users.createdAt))
      .limit(100);
  }

  async getSystemSettings(): Promise<typeof systemSettings.$inferSelect> {
    let [settings] = await db.select().from(systemSettings);
    if (!settings) {
      const hasTwitterKeys = !!(process.env.X_CONSUMER_KEY && process.env.X_CONSUMER_SECRET && process.env.X_BEARER_TOKEN);
      [settings] = await db.insert(systemSettings).values({
        campaignsEnabled: true,
        holderQualificationEnabled: true,
        socialEngagementEnabled: true,
        twitterApiStatus: hasTwitterKeys ? "active" : "coming_soon",
        burnPercent: 50,
        rewardsPercent: 40,
        systemPercent: 10,
        creationFee: 10000
      }).returning();
    }
    return settings;
  }

  async updateSystemSettings(update: Partial<typeof systemSettings.$inferSelect>): Promise<typeof systemSettings.$inferSelect> {
    const [settings] = await db.select().from(systemSettings);
    if (!settings) {
      const [newSettings] = await db.insert(systemSettings).values({
        campaignsEnabled: update.campaignsEnabled ?? true,
        twitterApiStatus: update.twitterApiStatus ?? "coming_soon"
      }).returning();
      return newSettings;
    }
    const [updated] = await db.update(systemSettings)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(systemSettings.id, settings.id))
      .returning();
    return updated;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }
}

export const storage = new DatabaseStorage();
