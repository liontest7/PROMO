import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  users, campaigns, actions, executions, holderState, systemSettings, prizeHistory,
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
  updateExecutionStatus(id: number, status: "pending" | "verified" | "paid" | "rejected" | "failed", txSignature?: string, errorMessage?: string): Promise<Execution>;
  updateCampaignRemainingBudget(id: number, remainingBudget: string): Promise<Campaign>;
  getPendingRewards(userId: number): Promise<{ campaignId: number; amount: string; tokenName: string; tokenAddress: string }[]>;
  claimRewards(userId: number, campaignIds: number[]): Promise<void>;

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
  getLeaderboardData(timeframe: string): Promise<any[]>;
  getPrizeHistoryEntry(id: number): Promise<any>;
  // Prize History
  getPrizeHistory(): Promise<(typeof prizeHistory.$inferSelect)[]>;
  createPrizeHistory(entry: any): Promise<typeof prizeHistory.$inferSelect>;
  updatePrizeHistoryStatus(id: number, status: string, winners: any[]): Promise<void>;

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
    const [campaign] = await db.select().from(campaigns).where(
      sql`LOWER(${campaigns.slug}) = LOWER(${symbol})`
    ).orderBy(desc(campaigns.createdAt)).limit(1);
    
    // Fallback to tokenName only if no slug match (for safety)
    if (!campaign) {
      const [campaignByTicker] = await db.select().from(campaigns).where(
        sql`LOWER(${campaigns.tokenName}) = LOWER(${symbol})`
      ).orderBy(asc(campaigns.createdAt)).limit(1);
      
      if (!campaignByTicker) return undefined;
      const campaignActions = await db.select().from(actions).where(eq(actions.campaignId, campaignByTicker.id));
      return { ...campaignByTicker, actions: campaignActions };
    }
    
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
    if (!user) throw new Error("User not found");

    const [updatedUser] = await db.update(users)
      .set(socials)
      .where(eq(users.id, id))
      .returning();
    
    // Efficiency: Combine reputation updates
    let reputationBonus = 0;
    const updates: any = {};

    if (!user.twitterHandle && socials.twitterHandle) {
      if (!user.earnedXBonus) {
        reputationBonus += 25;
        updates.earnedXBonus = true;
      }
    } else if (user.twitterHandle && socials.twitterHandle === null) {
      reputationBonus -= 25;
    }

    if (!user.telegramHandle && socials.telegramHandle) {
      if (!user.earnedTGBonus) {
        reputationBonus += 25;
        updates.earnedTGBonus = true;
      }
    } else if (user.telegramHandle && socials.telegramHandle === null) {
      reputationBonus -= 25;
    }

    if (reputationBonus !== 0 || Object.keys(updates).length > 0) {
      await db.update(users)
        .set({ 
          ...updates,
          reputationScore: Math.max(0, (user.reputationScore || 0) + reputationBonus) 
        })
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
      .where(sql`${users.reputationScore} > 200 OR ${users.balance}::numeric > 500 OR ${users.status} = 'suspended'`)
      .orderBy(desc(users.reputationScore));
  }

  async getSuspiciousCampaigns(): Promise<(Campaign & { actions: Action[] })[]> {
    const suspicious = await db.select()
      .from(campaigns)
      .where(sql`${campaigns.remainingBudget}::numeric < 0 OR ${campaigns.status} = 'paused'`)
      .orderBy(desc(campaigns.createdAt));
    
    if (suspicious.length === 0) return [];

    const campaignIds = suspicious.map(c => c.id);
    const allActions = await db.select().from(actions).where(sql`${actions.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`);
    
    return suspicious.map(campaign => ({
      ...campaign,
      actions: allActions.filter(a => a.campaignId === campaign.id)
    }));
  }

  async getCampaigns(creatorId?: number): Promise<(Campaign & { actions: Action[] })[]> {
    const allCampaigns = await (creatorId 
      ? db.select().from(campaigns).where(eq(campaigns.creatorId, creatorId)).orderBy(desc(campaigns.createdAt))
      : db.select().from(campaigns).orderBy(desc(campaigns.createdAt)));
    
    if (allCampaigns.length === 0) return [];

    const campaignIds = allCampaigns.map(c => c.id);
    const allActions = await db.select().from(actions).where(sql`${actions.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`);
    
    return allCampaigns.map(campaign => ({
      ...campaign,
      actions: allActions.filter(a => a.campaignId === campaign.id)
    }));
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

    // Generate unique slug (ticker, ticker-v2, ticker-v3...)
    const baseSlug = insertCampaign.tokenName.toLowerCase();
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const currentSlug = counter === 1 ? slug : `${slug}-v${counter}`;
      const [existing] = await db.select().from(campaigns).where(eq(campaigns.slug, currentSlug)).limit(1);
      if (!existing) {
        slug = currentSlug;
        break;
      }
      counter++;
    }

    const [campaign] = await db.insert(campaigns).values({
      ...insertCampaign,
      slug,
      totalBudget,
      remainingBudget: totalBudget,
      status: "active",
      creationFeePaid: false
    } as any).returning();
    return campaign;
  }

  async updateCampaignFunding(id: number, data: { escrowWallet?: string; fundingTxSignature?: string; creationFeePaid?: boolean }): Promise<Campaign> {
    const [campaign] = await db.update(campaigns)
      .set(data)
      .where(eq(campaigns.id, id))
      .returning();
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
    const results = await db.select({
      execution: executions,
      action: actions,
      campaign: campaigns
    })
    .from(executions)
    .innerJoin(actions, eq(executions.actionId, actions.id))
    .innerJoin(campaigns, eq(executions.campaignId, campaigns.id))
    .where(eq(executions.userId, userId))
    .orderBy(desc(executions.createdAt));

    return results.map(r => ({
      ...r.execution,
      action: r.action,
      campaign: r.campaign
    }));
  }

  async updateExecutionStatus(id: number, status: "pending" | "verified" | "paid" | "rejected" | "failed", txSignature?: string, errorMessage?: string): Promise<Execution> {
    const [execution] = await db.update(executions)
      .set({ 
        status, 
        transactionSignature: txSignature,
        errorMessage: errorMessage || null,
        paidAt: status === "paid" ? new Date() : null
      })
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

  async getPendingRewards(userId: number): Promise<{ campaignId: number; amount: string; tokenName: string; tokenAddress: string }[]> {
    const pending = await db.select({
      campaignId: executions.campaignId,
      rewardAmount: actions.rewardAmount,
      tokenName: campaigns.tokenName,
      tokenAddress: campaigns.tokenAddress,
    })
    .from(executions)
    .innerJoin(actions, eq(executions.actionId, actions.id))
    .innerJoin(campaigns, eq(executions.campaignId, campaigns.id))
    .where(sql`${executions.userId} = ${userId} AND ${executions.status} = 'verified' AND ${executions.withdrawn} = false`);

    // Group by campaign
    const grouped = pending.reduce((acc, curr) => {
      const key = curr.campaignId;
      if (!acc[key]) {
        acc[key] = { 
          campaignId: curr.campaignId, 
          amount: "0", 
          tokenName: curr.tokenName, 
          tokenAddress: curr.tokenAddress 
        };
      }
      acc[key].amount = (parseFloat(acc[key].amount) + parseFloat(curr.rewardAmount)).toString();
      return acc;
    }, {} as Record<number, any>);

    return Object.values(grouped);
  }

  async claimRewards(userId: number, campaignIds: number[]): Promise<void> {
    const rewards = await db.select({
      id: executions.id,
      campaignId: executions.campaignId,
      rewardAmount: actions.rewardAmount,
    })
    .from(executions)
    .innerJoin(actions, eq(executions.actionId, actions.id))
    .where(sql`${executions.userId} = ${userId} AND ${executions.status} = 'verified' AND ${executions.withdrawn} = false AND ${executions.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`);

    if (rewards.length === 0) return;

    // Batch update execution status
    await db.update(executions)
      .set({ 
        status: 'paid',
        withdrawn: true,
        paidAt: new Date()
      })
      .where(sql`${executions.id} IN (${sql.join(rewards.map(r => sql`${r.id}`), sql`, `)})`);

    // Aggregate rewards per campaign to update budgets
    const campaignRewards = rewards.reduce((acc, curr) => {
      acc[curr.campaignId] = (acc[curr.campaignId] || 0) + parseFloat(curr.rewardAmount);
      return acc;
    }, {} as Record<number, number>);

    // Update individual campaign budgets
    for (const [campaignId, amount] of Object.entries(campaignRewards)) {
      const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, parseInt(campaignId)));
      if (campaign) {
        const newRemaining = Math.max(0, parseFloat(campaign.remainingBudget) - amount).toFixed(6);
        await db.update(campaigns)
          .set({ remainingBudget: newRemaining })
          .where(eq(campaigns.id, parseInt(campaignId)));
      }
    }

    // Final balance and reputation update for user
    const totalReward = rewards.reduce((sum, r) => sum + parseFloat(r.rewardAmount), 0);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await db.update(users)
        .set({ 
          balance: (parseFloat(user.balance) + totalReward).toFixed(6),
          reputationScore: (user.reputationScore || 0) + (rewards.length * 10)
        })
        .where(eq(users.id, userId));
    }
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

  async getLeaderboardData(timeframe: string): Promise<any[]> {
    const usersList = await this.getAllUsers();
    const allExecutions = await db.select().from(executions).where(eq(executions.status, 'verified'));

    const activeUsers = usersList.filter(u => u.acceptedTerms && u.walletAddress);

    const leaderboardData = activeUsers.map((user) => {
      const userExecutions = allExecutions.filter(e => e.userId === user.id);
      
      const filteredExecutions = userExecutions.filter(e => {
        if (timeframe === "all_time") return true;
        
        const executionDate = e.createdAt ? new Date(e.createdAt) : new Date();
        const now = new Date();
        
        if (timeframe === "weekly") {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return executionDate >= oneWeekAgo;
        }
        
        if (timeframe === "monthly") {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return executionDate >= oneMonthAgo;
        }
        
        return true;
      });

      const protocolReputation = user.reputationScore || 0;
      const points = timeframe === "all_time" ? protocolReputation : filteredExecutions.length * 10;

      return {
        name: user.twitterHandle ? `@${user.twitterHandle}` : (user.walletAddress ? `User ${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}` : "Anonymous User"),
        fullWallet: user.walletAddress || "N/A",
        avatar: user.twitterHandle ? user.twitterHandle[0].toUpperCase() : 'U',
        points: points,
        tasks: filteredExecutions.length,
        id: user.id,
        createdAt: user.createdAt,
        isEligibleForPrize: points > 0
      };
    });

    leaderboardData.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    return leaderboardData.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }

  async getLeaderboard(): Promise<User[]> {
    const allUsers = await db.select()
      .from(users)
      .where(sql`${users.walletAddress} IS NOT NULL`)
      .orderBy(desc(users.reputationScore), asc(users.createdAt))
      .limit(100);
    
    return allUsers;
  }

  async getPrizeHistory(): Promise<(typeof prizeHistory.$inferSelect)[]> {
    return await db.select().from(prizeHistory)
      .where(eq(prizeHistory.status, 'completed'))
      .orderBy(desc(prizeHistory.endDate));
  }

  async createPrizeHistory(entry: any): Promise<typeof prizeHistory.$inferSelect> {
    const [inserted] = await db.insert(prizeHistory).values(entry).returning();
    return inserted;
  }

  async updatePrizeHistoryStatus(id: number, status: "processing" | "completed" | "failed", winners: any[]): Promise<void> {
    await db.update(prizeHistory)
      .set({ status, winners, createdAt: new Date() })
      .where(eq(prizeHistory.id, id));
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
