import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Users
  app.post('/api/users/auth', async (req, res) => {
    try {
      const input = api.users.getOrCreate.input.parse(req.body);
      let user = await storage.getUserByWallet(input.walletAddress);
      
      if (!user) {
        // Use a plain object that matches the expected User type properties
        // to bypass strict type check for balance/reputationScore while seeding DB correctly
        const userData = { 
          walletAddress: input.walletAddress,
          role: input.role || "user",
          balance: "0",
          reputationScore: 0
        };
        // @ts-ignore
        user = await storage.createUser(userData);
        res.status(201).json(user);
      } else {
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

    const executions = await storage.getExecutionsByUser(user.id);
    const completed = executions.filter(e => e.status === 'paid' || e.status === 'verified').length;
    
    // Calculate real total earned from paid executions
    let totalEarned = 0;
    const paidExecutions = executions.filter(e => e.status === 'paid');
    for (const execution of paidExecutions) {
      const action = await storage.getAction(execution.actionId);
      if (action) {
        totalEarned += Number(action.rewardAmount);
      }
    }

    res.json({
      totalEarned: totalEarned.toFixed(6),
      tasksCompleted: completed,
      reputation: user.reputationScore,
      balance: user.balance
    });
  });

  app.get(api.users.executions.path, async (req, res) => {
    const user = await storage.getUserByWallet(req.params.walletAddress);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userExecutions = await storage.getExecutionsByUser(user.id);
    const results = [];
    
    for (const execution of userExecutions) {
      const action = await storage.getAction(execution.actionId);
      const campaign = await storage.getCampaign(execution.campaignId);
      if (action && campaign) {
        results.push({
          ...execution,
          action,
          campaign
        });
      }
    }
    
    res.json(results);
  });

  // Campaigns
  app.get(api.campaigns.list.path, async (req, res) => {
    // const creatorId = req.query.creatorId ? parseInt(req.query.creatorId as string) : undefined;
    // For MVP, just list all
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    const campaign = await storage.getCampaign(parseInt(req.params.id));
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    try {
      // Manually parse to handle the extended schema with actions
      const body = req.body;
      const campaignData = insertCampaignSchema.parse(body);
      
      const campaign = await storage.createCampaign(campaignData);

      // Create actions
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

  // Verification & Claiming
  app.post(api.executions.verify.path, async (req, res) => {
    try {
      const input = api.executions.verify.input.parse(req.body);
      
      const user = await storage.getUserByWallet(input.userWallet);
      if (!user) return res.status(404).json({ message: "User not found" });

      const action = await storage.getAction(input.actionId);
      if (!action) return res.status(404).json({ message: "Action not found" });

      // Verification Logic
      const proofObj = JSON.parse(input.proof || "{}");
      let isVerified = !!proofObj.signature;

      // Smart Verification Simulation for social tasks
      if (action.type === 'twitter' || action.type === 'telegram') {
        console.log(`Smart verifying ${action.type} for user ${user.walletAddress}`);
        // In real app, we would call Twitter/Telegram API here
        // For now, we simulate success if a proofText is provided
        if (!proofObj.proofText) {
          isVerified = false;
        }
      }

      if (isVerified) {
        const execution = await storage.createExecution({
          actionId: action.id,
          campaignId: action.campaignId,
          userId: user.id,
          status: "verified"
        } as any);
        
        await storage.incrementActionExecution(action.id);
        
        // Auto-pay to simulate real experience for MVP
        const txSignature = "sol-" + Math.random().toString(36).substring(7);
        await storage.updateExecutionStatus(execution.id, "paid", txSignature);

        res.json({
          success: true,
          status: "paid",
          message: "Action verified and rewards paid!",
          executionId: execution.id,
          txSignature
        });
      } else {
         res.json({
          success: false,
          status: "rejected",
          message: "Verification failed: Requirements not met"
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.post(api.executions.claim.path, async (req, res) => {
     try {
      const input = api.executions.claim.input.parse(req.body);
      
      const execution = await storage.getExecution(input.executionId);
      if (!execution) return res.status(404).json({ message: "Execution not found" });
      
      if (execution.status === 'paid') {
        return res.status(400).json({ message: "Already paid" });
      }

      // In real app, this would trigger a Solana transaction from the campaign budget
      // For MVP, we simulate the payment confirmation
      const txSignature = "sol-" + Math.random().toString(36).substring(7);

      const updated = await storage.updateExecutionStatus(
        execution.id,
        "paid",
        txSignature
      );

      // Update campaign remaining budget
      const campaign = await storage.getCampaign(execution.campaignId);
      if (campaign) {
        const action = await storage.getAction(execution.actionId);
        if (action) {
          const newBudget = Number(campaign.remainingBudget) - Number(action.rewardAmount);
          await storage.updateCampaignRemainingBudget(campaign.id, newBudget.toString());
        }
      }

      res.json({
        success: true,
        txSignature: txSignature
      });

    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Seed Data
  // seed(); // Commented out to prevent mock data on restart if database has real data

  return httpServer;
}

// Function remains for manual trigger if needed, but not called by default
async function seed() {
  const campaigns = await storage.getCampaigns();
  if (campaigns.length === 0) {
    console.log("Seeding database...");
    
    // Create Demo Advertiser
    const advertiser = await storage.createUser({
      walletAddress: "DemoAdvertiserWallet123",
      role: "advertiser"
    });

      // Create Campaign 1
      const c1 = await storage.createCampaign({
        title: "Solana Summer Airdrop",
        description: "Join our community and get free tokens! We are building the next gen DeFi protocol.",
        tokenName: "SOLSUM",
        tokenAddress: "So11111111111111111111111111111111111111112",
        totalBudget: "10000",
        remainingBudget: "10000",
        status: "active",
        creatorId: advertiser.id,
        requirements: { minSolBalance: 0.1 },
        bannerUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000",
        logoUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=200&h=200&fit=crop",
        websiteUrl: "https://solana.com",
        twitterUrl: "https://twitter.com/solana",
        telegramUrl: "https://t.me/solana"
      });

      await storage.createAction({
        campaignId: c1.id,
        type: "twitter",
        title: "Follow @SolanaSummer",
        rewardAmount: "100",
        url: "https://twitter.com/solana",
        maxExecutions: 1000
      });
      
      await storage.createAction({
        campaignId: c1.id,
        type: "telegram",
        title: "Join Telegram Group",
        rewardAmount: "50",
        url: "https://t.me/solana",
        maxExecutions: 500
      });

      // Create Campaign 2
      const c2 = await storage.createCampaign({
        title: "Neon EVM Launch",
        description: "Experience Ethereum on Solana. Complete tasks to earn NEON tokens.",
        tokenName: "NEON",
        tokenAddress: "Neon...",
        totalBudget: "5000",
        remainingBudget: "5000",
        status: "active",
        creatorId: advertiser.id,
        requirements: {},
        bannerUrl: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2000",
        logoUrl: "https://images.unsplash.com/photo-1621504450181-5d356f63d3ee?q=80&w=200&h=200&fit=crop",
        websiteUrl: "https://neonevm.org",
        twitterUrl: "https://twitter.com/neonevm",
        telegramUrl: "https://t.me/neonevm"
      });

     await storage.createAction({
      campaignId: c2.id,
      type: "website",
      title: "Visit Official Website",
      rewardAmount: "10",
      url: "https://neonevm.org",
      maxExecutions: 2000
    });

    console.log("Seeding complete.");
  }
}
