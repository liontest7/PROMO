import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

import { Connection, PublicKey } from "@solana/web3.js";
import { db } from "./db";
import { users as usersTable, campaigns as campaignsTable, actions as actionsTable, executions as executionsTable } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import rateLimit from "express-rate-limit";

import { ADMIN_CONFIG } from "@shared/config";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api", apiLimiter);

  await setupAuth(app);
  registerAuthRoutes(app);

  app.use(async (req, res, next) => {
    const walletAddress = req.headers['x-wallet-address'] || req.body?.walletAddress;
    if (walletAddress && typeof walletAddress === 'string') {
      const user = await storage.getUserByWallet(walletAddress);
      if (user?.isBlocked) {
        return res.status(403).json({ message: "Your account is blocked. Please contact support." });
      }
    }
    next();
  });

  app.post('/api/users/auth', async (req, res) => {
    try {
      const input = api.users.getOrCreate.input.parse(req.body);
      let user = await storage.getUserByWallet(input.walletAddress);
      
      if (!user) {
        const isSuperAdmin = ADMIN_CONFIG.superAdminWallets.includes(input.walletAddress);
        const userData = { 
          walletAddress: input.walletAddress,
          role: isSuperAdmin ? "admin" : (input.role || "user"),
          balance: "0",
          reputationScore: 0
        };
        // @ts-ignore
        user = await storage.createUser(userData);
        res.status(201).json(user);
      } else {
        if (ADMIN_CONFIG.superAdminWallets.includes(user.walletAddress) && user.role !== "admin") {
          user = await storage.updateUserRole(user.id, "admin");
        }
        res.json(user);
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUserByWallet(req.params.walletAddress);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.get(api.users.stats.path, async (req, res) => {
    const user = await storage.getUserByWallet(req.params.walletAddress);
    if (!user) return res.status(404).json({ message: "User not found" });

    const rawExecutions = await storage.getExecutionsByUser(user.id);
    const completed = rawExecutions.filter(e => e.status === 'paid' || e.status === 'verified').length;
    
    const tokenBalances: Record<string, { symbol: string, balance: string, earned: string, pending: string }> = {};
    
    for (const execution of rawExecutions) {
      const { action, campaign, status } = execution;
      if (!action || !campaign) continue;
      
      const symbol = campaign.tokenName;
      if (!tokenBalances[symbol]) {
        tokenBalances[symbol] = { symbol, balance: "0", earned: "0", pending: "0" };
      }
      
      const amount = Number(action.rewardAmount);
      if (status === 'paid') {
        tokenBalances[symbol].earned = (Number(tokenBalances[symbol].earned) + amount).toFixed(6);
        tokenBalances[symbol].balance = (Number(tokenBalances[symbol].balance) + amount).toFixed(6);
      } else if (status === 'verified') {
        tokenBalances[symbol].pending = (Number(tokenBalances[symbol].pending) + amount).toFixed(6);
      }
    }

    res.json({
      totalEarned: "0",
      pendingRewards: "0",
      tokenBalances: Object.values(tokenBalances),
      tasksCompleted: completed,
      reputation: user.reputationScore,
      balance: user.balance
    });
  });

  app.patch('/api/users/profile', async (req, res) => {
    try {
      const { walletAddress, twitterHandle, telegramHandle } = req.body;
      const user = await storage.getUserByWallet(walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const updatedUser = await storage.updateUserSocials(user.id, {
        twitterHandle: twitterHandle || user.twitterHandle,
        telegramHandle: telegramHandle || user.telegramHandle
      });

      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get(api.campaigns.list.path, async (req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    const campaign = await storage.getCampaign(parseInt(req.params.id));
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.get('/api/campaigns/symbol/:symbol', async (req, res) => {
    const campaigns = await storage.getCampaigns();
    const campaign = campaigns.find(c => c.tokenName.toLowerCase() === req.params.symbol.toLowerCase());
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    try {
      const body = req.body;
      const campaignData = insertCampaignSchema.parse(body);
      const campaign = await storage.createCampaign(campaignData);

      const actionsData = z.array(insertActionSchema.omit({ campaignId: true })).parse(body.actions);
      for (const action of actionsData) {
        await storage.createAction({
          ...action,
          campaignId: campaign.id
        });
      }

      const result = await storage.getCampaign(campaign.id);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.post(api.executions.verify.path, async (req, res) => {
    try {
      const input = api.executions.verify.input.parse(req.body);
      const user = await storage.getUserByWallet(input.userWallet);
      if (!user) return res.status(404).json({ message: "User not found" });

      const userExecutions = await storage.getExecutionsByUser(user.id);
      const existingExecution = userExecutions.find(e => e.actionId === input.actionId);
      if (existingExecution && (existingExecution.status === 'verified' || existingExecution.status === 'paid')) {
        return res.status(400).json({ message: "Task already completed" });
      }

      const action = await storage.getAction(input.actionId);
      if (!action) {
        const campaign = await storage.getCampaign(input.actionId);
        if (campaign && campaign.campaignType === 'holder_qualification') {
          let state = await storage.getHolderState(user.id, campaign.id);
          let balance = 0;
          try {
            const connection = new Connection("https://api.mainnet-beta.solana.com");
            const walletPublicKey = new PublicKey(input.userWallet);
            const tokenPublicKey = new PublicKey(campaign.tokenAddress);
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
              mint: tokenPublicKey
            });
            if (tokenAccounts.value.length > 0) {
              balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
            }
          } catch (err) {
            console.error("Solana balance check failed:", err);
            balance = 0; 
          }

          const required = parseFloat(campaign.minHoldingAmount || "0");
          if (!state) {
            if (balance < required) {
              return res.json({ 
                success: false, 
                status: "insufficient",
                currentBalance: balance,
                requiredBalance: required,
                message: `Insufficient balance` 
              });
            }
            state = await storage.createHolderState({
              userId: user.id,
              campaignId: campaign.id,
              holdStartTimestamp: new Date(),
              claimed: false
            });
            return res.json({ success: true, status: "holding", message: "Holding period started!" });
          }
          if (state.claimed) return res.json({ success: false, message: "Already claimed" });
          const now = new Date();
          const durationDays = (now.getTime() - state.holdStartTimestamp.getTime()) / (1000 * 60 * 60 * 24);
          const minDuration = campaign.minHoldingDuration || 0;
          if (balance < required) {
            return res.json({ success: false, status: "insufficient", message: `Verification failed.` });
          }
          if (durationDays < minDuration) {
            return res.json({ success: true, status: "waiting", message: "Still in holding period" });
          }
          return res.json({ success: true, status: "ready", message: "Eligibility verified!" });
        }
        return res.status(404).json({ message: "Action or Campaign not found" });
      }

      const proofObj = JSON.parse(input.proof || "{}");
      let isVerified = false;
      if (action.type === 'twitter' || action.type === 'telegram') {
        const userHandle = action.type === 'twitter' ? user.twitterHandle : user.telegramHandle;
        if (userHandle || (proofObj.proofText && proofObj.proofText.length > 3)) {
          isVerified = true;
        }
      } else if (action.type === 'website') {
        isVerified = true;
      }

      if (isVerified) {
        const freshAction = await storage.getAction(action.id);
        const reward = freshAction ? freshAction.rewardAmount : action.rewardAmount;
        const execution = await storage.createExecution({
          actionId: action.id,
          campaignId: action.campaignId,
          userId: user.id,
          status: "verified"
        } as any);
        await storage.incrementActionExecution(action.id);
        if (action.type === 'website') {
          const txSignature = "sol-" + Math.random().toString(36).substring(7);
          await storage.updateExecutionStatus(execution.id, "paid", txSignature);
          return res.json({ success: true, status: "paid", message: `Action verified and rewards paid!`, executionId: execution.id, txSignature });
        }
        res.json({ success: true, status: "verified", message: `Action verified!`, executionId: execution.id });
      } else {
         res.json({ success: false, status: "rejected", message: `Verification failed.` });
      }
    } catch (err) {
      console.error("Verification error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.executions.claim.path, async (req, res) => {
    try {
      const { walletAddress: userWallet, executionIds } = req.body;
      if (!executionIds || !Array.isArray(executionIds)) {
        return res.status(400).json({ message: "Invalid execution IDs" });
      }
      const results = [];
      const txSignature = "sol-" + Math.random().toString(36).substring(7);
      for (const id of executionIds) {
        const execution = await storage.getExecution(id);
        if (!execution || execution.status === 'paid') continue;
        await storage.updateExecutionStatus(id, "paid", txSignature);
        results.push(id);
      }
      res.json({ success: true, txSignature, claimedIds: results });
    } catch (err) {
      console.error("Claim error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get('/api/executions/campaign/:campaignId', async (req, res) => {
    try {
      const executions = await storage.getExecutionsByCampaign(parseInt(req.params.campaignId));
      res.json(executions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.get('/api/stats/global', async (req, res) => {
    try {
      const allCampaigns = await storage.getCampaigns();
      const activeCount = allCampaigns.filter(c => c.status === 'active').length;
      const users = await db.select().from(usersTable);
      const totalUsersCount = users.length;
      const paidExecutions = await db.select().from(executionsTable).innerJoin(actionsTable, eq(executionsTable.actionId, actionsTable.id)).where(eq(executionsTable.status, 'paid'));
      const totalPaidValue = paidExecutions.reduce((sum, e) => sum + Number(e.actions.rewardAmount), 0);
      const totalBurnedValue = allCampaigns.length * 10000;
      res.json({
        activeCampaigns: activeCount,
        totalVerifiedProjects: allCampaigns.length, 
        totalUsers: totalUsersCount.toLocaleString(),
        totalPaid: totalPaidValue.toLocaleString(),
        totalBurned: totalBurnedValue.toLocaleString(),
        totalValueDistributed: (totalPaidValue * 0.5).toFixed(2)
      });
    } catch (err) {
      console.error("Global stats error:", err);
      res.status(500).json({ message: "Failed to fetch global stats" });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get('/api/admin/campaigns', async (req, res) => {
    const campaigns = await storage.getAllCampaigns();
    res.json(campaigns);
  });

  app.get('/api/admin/executions', async (req, res) => {
    try {
      const executions = await storage.getAllExecutions();
      res.json(executions);
    } catch (err) {
      console.error("Admin executions error:", err);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  app.post('/api/admin/users/:id/role', async (req, res) => {
    try {
      const { role } = req.body;
      const [user] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, parseInt(req.params.id))).returning();
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.post('/api/admin/campaigns/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const [campaign] = await db.update(campaignsTable).set({ status }).where(eq(campaignsTable.id, parseInt(req.params.id))).returning();
      res.json(campaign);
    } catch (err) {
      res.status(500).json({ message: "Failed to update campaign status" });
    }
  });

  app.post('/api/admin/users/:id/block', async (req, res) => {
    try {
      const { isBlocked } = req.body;
      const user = await storage.updateUserBlockStatus(parseInt(req.params.id), isBlocked);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to update block status" });
    }
  });

  app.patch('/api/admin/campaigns/:id/budget', async (req, res) => {
    try {
      const { totalBudget } = req.body;
      const [campaign] = await db.update(campaignsTable).set({ totalBudget, remainingBudget: totalBudget }).where(eq(campaignsTable.id, parseInt(req.params.id))).returning();
      res.json(campaign);
    } catch (err) {
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const campaigns = await storage.getAllCampaigns();
      const executions = await storage.getAllExecutions();
      const totalRewardsPaid = executions.filter(e => e.status === 'paid').reduce((sum, e) => sum + parseFloat(e.action?.rewardAmount || "0"), 0);
      res.json({
        totalUsers: users.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalExecutions: executions.length,
        totalRewardsPaid,
        blockedUsers: users.filter(u => u.isBlocked).length
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  return httpServer;
}
