import { db } from "./db";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  users, campaigns, actions, executions, holderState, systemSettings, prizeHistory, systemLogs,
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Action, type InsertAction,
  type Execution, type InsertExecution,
  type HolderState, type InsertHolderState
} from "@shared/schema";

export interface IStorage {
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  getUserByTwitterHandle(handle: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, score: number): Promise<User>;
  updateUserSocials(id: number, socials: { twitterHandle?: string; telegramHandle?: string; profileImageUrl?: string }): Promise<User>;
  updateUserProfile(walletAddress: string, data: { twitterHandle?: string, profileImageUrl?: string, telegramHandle?: string }): Promise<User>;
  updateUserRole(id: number, role: "user" | "advertiser" | "admin"): Promise<User>;
  updateUserStatus(id: number, status: "active" | "suspended" | "blocked"): Promise<User>;
  getSuspiciousUsers(): Promise<User[]>;
  getSuspiciousCampaigns(): Promise<(Campaign & { actions: Action[] })[]>;
  getCampaigns(creatorId?: number): Promise<(Campaign & { actions: Action[] })[]>;
  getCampaign(id: number): Promise<(Campaign & { actions: Action[] }) | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  createAction(action: InsertAction): Promise<Action>;
  getActionsByCampaign(campaignId: number): Promise<Action[]>;
  getAction(id: number): Promise<Action | undefined>;
  incrementActionExecution(id: number): Promise<void>;
  createExecution(execution: InsertExecution): Promise<Execution>;
  getExecution(id: number): Promise<Execution | undefined>;
  getExecutionsByUser(userId: number): Promise<Execution[]>;
  updateExecutionStatus(id: number, status: string, txSignature?: string, errorMessage?: string): Promise<Execution>;
  updateCampaignRemainingBudget(id: number, remainingBudget: string): Promise<Campaign>;
  getPendingRewards(userId: number): Promise<{ campaignId: number; amount: string; tokenName: string; tokenAddress: string }[]>;
  claimRewards(userId: number, campaignIds: number[]): Promise<void>;
  getHolderState(userId: number, campaignId: number): Promise<HolderState | undefined>;
  createHolderState(state: InsertHolderState): Promise<HolderState>;
  updateHolderClaimed(id: number): Promise<void>;
  getExecutionsByCampaign(campaignId: number): Promise<(Execution & { user: { walletAddress: string } })[]>;
  getAllUsers(): Promise<User[]>;
  getAllCampaigns(): Promise<(Campaign & { actions: Action[] })[]>;
  getAllExecutions(): Promise<(Execution & { user: User, campaign: Campaign, action: Action })[]>;
  getLeaderboard(): Promise<User[]>;
  getLeaderboardData(timeframe: string): Promise<any[]>;
  getPrizeHistoryEntry(id: number): Promise<any>;
  getPrizeHistory(): Promise<(typeof prizeHistory.$inferSelect)[]>;
  createPrizeHistory(entry: any): Promise<typeof prizeHistory.$inferSelect>;
  updatePrizeHistoryStatus(id: number, status: string, winners: any[]): Promise<void>;
  getSystemSettings(): Promise<typeof systemSettings.$inferSelect>;
  updateSystemSettings(settings: Partial<typeof systemSettings.$inferSelect>): Promise<typeof systemSettings.$inferSelect>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getCampaignBySymbol(symbol: string): Promise<(Campaign & { actions: Action[] }) | undefined>;
  getWalletsByIp(ip: string): Promise<string[]>;
  logIpWalletAssociation(ip: string, wallet: string): Promise<void>;
  createLog(log: { level: "info" | "warn" | "error", source: string, message: string, details?: any }): Promise<void>;
  getLogs(limit?: number): Promise<any[]>;
  getErrorLogs(limit?: number): Promise<any[]>;
  getAdminLogs(limit?: number): Promise<any[]>;
  clearLogs(): Promise<void>;
  clearAdminLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private ipWalletLog: Map<string, Set<string>> = new Map();

  async createLog(log: { level: "info" | "warn" | "error", source: string, message: string, details?: any }): Promise<void> {
    await db.insert(systemLogs).values(log);
  }

  async getLogs(limit: number = 100): Promise<any[]> {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.createdAt)).limit(limit);
  }

  async getErrorLogs(limit: number = 20): Promise<any[]> {
    return await db.select().from(systemLogs).where(eq(systemLogs.level, 'error')).orderBy(desc(systemLogs.createdAt)).limit(limit);
  }

  async getAdminLogs(limit: number = 100): Promise<any[]> {
    return this.getLogs(limit);
  }

  async clearLogs(): Promise<void> {
    await db.delete(systemLogs);
  }

  async clearAdminLogs(): Promise<void> {
    return this.clearLogs();
  }

  async getWalletsByIp(ip: string): Promise<string[]> {
    return Array.from(this.ipWalletLog.get(ip) || []);
  }

  async logIpWalletAssociation(ip: string, wallet: string): Promise<void> {
    if (!this.ipWalletLog.has(ip)) this.ipWalletLog.set(ip, new Set());
    this.ipWalletLog.get(ip)!.add(wallet);
  }

  async getCampaignBySymbol(symbol: string): Promise<(Campaign & { actions: Action[] }) | undefined> {
    const [campaign] = await db.select().from(campaigns).where(sql`LOWER(${campaigns.slug}) = LOWER(${symbol})`).orderBy(desc(campaigns.createdAt)).limit(1);
    if (!campaign) {
      const [campaignByTicker] = await db.select().from(campaigns).where(sql`LOWER(${campaigns.tokenName}) = LOWER(${symbol})`).orderBy(asc(campaigns.createdAt)).limit(1);
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
    const [user] = await db.update(users).set({ reputationScore: score }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserSocials(id: number, socials: any): Promise<User> {
    const [user] = await db.update(users).set(socials).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserProfile(walletAddress: string, data: { twitterHandle?: string, profileImageUrl?: string, telegramHandle?: string }): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        twitterHandle: data.twitterHandle,
        profileImageUrl: data.profileImageUrl,
        telegramHandle: data.telegramHandle
      })
      .where(eq(users.walletAddress, walletAddress))
      .returning();
    return updatedUser;
  }

  async updateUserRole(id: number, role: any): Promise<User> {
    const [user] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStatus(id: number, status: any): Promise<User> {
    const [user] = await db.update(users).set({ status }).where(eq(users.id, id)).returning();
    return user;
  }

  async getSuspiciousUsers(): Promise<User[]> {
    return await db.select().from(users).where(sql`${users.reputationScore} > 200 OR ${users.balance}::numeric > 500 OR ${users.status} = 'suspended'`).orderBy(desc(users.reputationScore));
  }

  async getSuspiciousCampaigns(): Promise<(Campaign & { actions: Action[] })[]> {
    const suspicious = await db.select().from(campaigns).where(sql`${campaigns.remainingBudget}::numeric < 0 OR ${campaigns.status} = 'paused'`).orderBy(desc(campaigns.createdAt));
    if (suspicious.length === 0) return [];
    const campaignIds = suspicious.map(c => c.id);
    const allActions = await db.select().from(actions).where(sql`${actions.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`);
    return suspicious.map(campaign => ({ ...campaign, actions: allActions.filter(a => a.campaignId === campaign.id) }));
  }

  async getCampaigns(creatorId?: number): Promise<(Campaign & { actions: Action[] })[]> {
    const allCampaigns = await (creatorId ? db.select().from(campaigns).where(eq(campaigns.creatorId, creatorId)).orderBy(desc(campaigns.createdAt)) : db.select().from(campaigns).orderBy(desc(campaigns.createdAt)));
    if (allCampaigns.length === 0) return [];
    const campaignIds = allCampaigns.map(c => c.id);
    const allActions = await db.select().from(actions).where(sql`${actions.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`);
    return allCampaigns.map(campaign => ({ ...campaign, actions: allActions.filter(a => a.campaignId === campaign.id) }));
  }

  async getCampaign(id: number): Promise<(Campaign & { actions: Action[] }) | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (!campaign) return undefined;
    const campaignActions = await db.select().from(actions).where(eq(actions.campaignId, campaign.id));
    return { ...campaign, actions: campaignActions };
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const totalBudget = insertCampaign.campaignType === 'holder_qualification' ? (parseFloat(insertCampaign.rewardPerWallet || "0") * (insertCampaign.maxClaims || 0)).toString() : insertCampaign.totalBudget;
    const baseSlug = insertCampaign.tokenName.toLowerCase();
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const currentSlug = counter === 1 ? slug : `${slug}-v${counter}`;
      const [existing] = await db.select().from(campaigns).where(eq(campaigns.slug, currentSlug)).limit(1);
      if (!existing) { slug = currentSlug; break; }
      counter++;
    }
    const [campaign] = await db.insert(campaigns).values({ ...insertCampaign, slug, totalBudget, remainingBudget: totalBudget, status: "active", creationFeePaid: false } as any).returning();
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

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    const [campaign] = await db.update(campaigns).set(data).where(eq(campaigns.id, id)).returning();
    return campaign;
  }

  async incrementActionExecution(id: number): Promise<void> {
    const action = await this.getAction(id);
    if (action) await db.update(actions).set({ currentExecutions: (action.currentExecutions || 0) + 1 }).where(eq(actions.id, id));
  }

  async createExecution(insertExecution: InsertExecution): Promise<Execution> {
    const [execution] = await db.insert(executions).values(insertExecution).returning();
    return execution;
  }

  async getExecution(id: number): Promise<Execution | undefined> {
    const [execution] = await db.select().from(executions).where(eq(executions.id, id));
    return execution;
  }

  async getExecutionsByUser(userId: number): Promise<any[]> {
    const results = await db.select({ execution: executions, action: actions, campaign: campaigns }).from(executions).innerJoin(actions, eq(executions.actionId, actions.id)).innerJoin(campaigns, eq(executions.campaignId, campaigns.id)).where(eq(executions.userId, userId)).orderBy(desc(executions.createdAt));
    return results.map(r => ({ ...r.execution, action: r.action, campaign: r.campaign }));
  }

  async updateExecutionStatus(id: number, status: string, txSignature?: string, errorMessage?: string): Promise<Execution> {
    const [execution] = await db.update(executions).set({ status: status as any, transactionSignature: txSignature, errorMessage: errorMessage || null, paidAt: status === "paid" ? new Date() : null }).where(eq(executions.id, id)).returning();
    return execution;
  }

  async updateCampaignRemainingBudget(id: number, remainingBudget: string): Promise<Campaign> {
    const [campaign] = await db.update(campaigns).set({ remainingBudget }).where(eq(campaigns.id, id)).returning();
    return campaign;
  }

  async getPendingRewards(userId: number): Promise<any[]> {
    const pending = await db.select({ campaignId: executions.campaignId, rewardAmount: actions.rewardAmount, tokenName: campaigns.tokenName, tokenAddress: campaigns.tokenAddress }).from(executions).innerJoin(actions, eq(executions.actionId, actions.id)).innerJoin(campaigns, eq(executions.campaignId, campaigns.id)).where(sql`${executions.userId} = ${userId} AND ${executions.status} = 'verified' AND ${executions.withdrawn} = false`);
    const grouped = pending.reduce((acc, curr) => {
      const key = curr.campaignId;
      if (!acc[key]) acc[key] = { campaignId: curr.campaignId, amount: "0", tokenName: curr.tokenName, tokenAddress: curr.tokenAddress };
      acc[key].amount = (parseFloat(acc[key].amount) + parseFloat(curr.rewardAmount)).toString();
      return acc;
    }, {} as Record<number, any>);
    return Object.values(grouped);
  }

  async claimRewards(userId: number, campaignIds: number[]): Promise<void> {
    const rewards = await db.select({ id: executions.id, campaignId: executions.campaignId, rewardAmount: actions.rewardAmount }).from(executions).innerJoin(actions, eq(executions.actionId, actions.id)).where(sql`${executions.userId} = ${userId} AND ${executions.status} = 'verified' AND ${executions.withdrawn} = false AND ${executions.campaignId} IN (${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)})`);
    if (rewards.length === 0) return;
    await db.update(executions).set({ status: 'paid', withdrawn: true, paidAt: new Date() }).where(sql`${executions.id} IN (${sql.join(rewards.map(r => sql`${r.id}`), sql`, `)})`);
    const totalReward = rewards.reduce((sum, r) => sum + parseFloat(r.rewardAmount), 0);
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) await db.update(users).set({ balance: (parseFloat(user.balance) + totalReward).toFixed(6), reputationScore: (user.reputationScore || 0) + (rewards.length * 10) }).where(eq(users.id, userId));
  }

  async getHolderState(userId: number, campaignId: number): Promise<HolderState | undefined> {
    const [state] = await db.select().from(holderState).where(sql`${holderState.userId} = ${userId} AND ${holderState.campaignId} = ${campaignId}`);
    return state;
  }

  async createHolderState(insertState: InsertHolderState): Promise<HolderState> {
    const [state] = await db.insert(holderState).values(insertState).returning();
    return state;
  }

  async updateHolderClaimed(id: number): Promise<void> {
    await db.update(holderState).set({ claimed: true }).where(eq(holderState.id, id));
  }

  async getExecutionsByCampaign(campaignId: number): Promise<any[]> {
    return await db.select({ id: executions.id, campaignId: executions.campaignId, userId: executions.userId, actionId: executions.actionId, status: executions.status, createdAt: executions.createdAt, transactionSignature: executions.transactionSignature, user: { walletAddress: users.walletAddress } }).from(executions).innerJoin(users, eq(executions.userId, users.id)).where(eq(executions.campaignId, campaignId)).orderBy(desc(executions.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllCampaigns(): Promise<(Campaign & { actions: Action[] })[]> {
    return await this.getCampaigns();
  }

  async getAllExecutions(): Promise<any[]> {
    const results = await db.select({ execution: executions, user: users, campaign: campaigns, action: actions }).from(executions).innerJoin(users, eq(executions.userId, users.id)).innerJoin(campaigns, eq(executions.campaignId, campaigns.id)).innerJoin(actions, eq(executions.actionId, actions.id)).orderBy(desc(executions.createdAt));
    return results.map(r => ({ ...r.execution, user: r.user, campaign: r.campaign, action: r.action }));
  }

  async getLeaderboard(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, 'active')).orderBy(desc(users.reputationScore)).limit(100);
  }

  async getLeaderboardData(timeframe: string): Promise<any[]> {
    const allUsers = await this.getAllUsers();
    const allExecutions = await this.getAllExecutions();
    
    const now = new Date();
    let startDate: Date | null = null;
    
    if (timeframe === 'weekly') {
      // Start of current week (Monday 00:00:00)
      startDate = new Date(now);
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const rankings = allUsers.map(user => {
      const filteredExecutions = allExecutions.filter(e => {
        const isUser = e.userId === user.id;
        const isVerified = e.status === 'verified' || e.status === 'paid';
        const isWithinTimeframe = !startDate || (e.createdAt && new Date(e.createdAt) >= startDate);
        return isUser && isVerified && isWithinTimeframe;
      });

      const points = filteredExecutions.length * 10;
      const tasks = filteredExecutions.length;
      
      return {
        id: user.id,
        name: user.username || (user.twitterHandle ? `@${user.twitterHandle}` : `User ${user.walletAddress.slice(0, 4)}...${user.walletAddress.slice(-4)}`),
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        avatar: user.twitterHandle ? user.twitterHandle[0].toUpperCase() : 'U',
        points,
        tasks,
        walletAddress: user.walletAddress,
        fullWallet: user.walletAddress,
        rank: 0 
      };
    });

    return rankings
      .sort((a, b) => b.points - a.points || a.id - b.id)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  async getPrizeHistoryEntry(id: number): Promise<any> {
    const [entry] = await db.select().from(prizeHistory).where(eq(prizeHistory.id, id));
    return entry;
  }

  async getPrizeHistory(): Promise<any[]> {
    return await db.select().from(prizeHistory).orderBy(desc(prizeHistory.createdAt));
  }

  async createPrizeHistory(entry: any): Promise<any> {
    const [newEntry] = await db.insert(prizeHistory).values(entry).returning();
    return newEntry;
  }

  async updatePrizeHistoryStatus(id: number, status: string, winners: any[]): Promise<void> {
    await db.update(prizeHistory).set({ status: status as any, winners }).where(eq(prizeHistory.id, id));
  }

  async getSystemSettings(): Promise<any> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    return settings;
  }

  async updateSystemSettings(settings: Partial<any>): Promise<any> {
    const [existing] = await db.select().from(systemSettings).limit(1);
    if (existing) {
      const [updated] = await db.update(systemSettings).set({ ...settings, updatedAt: new Date() }).where(eq(systemSettings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(systemSettings).values({ ...settings } as any).returning();
      return created;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}

export const storage = new DatabaseStorage();
