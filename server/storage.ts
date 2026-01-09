import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, campaigns, actions, executions,
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Action, type InsertAction,
  type Execution, type InsertExecution
} from "@shared/schema";

export interface IStorage {
  // User
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserReputation(id: number, score: number): Promise<User>;

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
}

export class DatabaseStorage implements IStorage {
  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
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

  async getCampaigns(creatorId?: number): Promise<(Campaign & { actions: Action[] })[]> {
    const allCampaigns = await (creatorId 
      ? db.select().from(campaigns).where(eq(campaigns.creatorId, creatorId)).orderBy(desc(campaigns.createdAt))
      : db.select().from(campaigns).orderBy(desc(campaigns.createdAt)));
    
    const results = [];
    for (const campaign of allCampaigns) {
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
    const [campaign] = await db.insert(campaigns).values({
      ...insertCampaign,
      remainingBudget: insertCampaign.totalBudget,
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

  async getExecutionsByUser(userId: number): Promise<Execution[]> {
    return await db.select().from(executions).where(eq(executions.userId, userId));
  }

  async updateExecutionStatus(id: number, status: "pending" | "verified" | "paid" | "rejected", txSignature?: string): Promise<Execution> {
    const [execution] = await db.update(executions)
      .set({ status, transactionSignature: txSignature })
      .where(eq(executions.id, id))
      .returning();

    // If verified, update user balance and campaign remaining budget
    if (status === "verified" || status === "paid") {
      const action = await this.getAction(execution.actionId);
      if (action) {
        const [user] = await db.select().from(users).where(eq(users.id, execution.userId));
        if (user) {
          const newBalance = (parseFloat(user.balance) + parseFloat(action.rewardAmount)).toString();
          await db.update(users)
            .set({ balance: newBalance, reputationScore: (user.reputationScore || 0) + 1 })
            .where(eq(users.id, user.id));
        }

        const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, execution.campaignId));
        if (campaign) {
          const newRemaining = (parseFloat(campaign.remainingBudget) - parseFloat(action.rewardAmount)).toString();
          await db.update(campaigns)
            .set({ remainingBudget: newRemaining })
            .where(eq(campaigns.id, campaign.id));
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
}

export const storage = new DatabaseStorage();
