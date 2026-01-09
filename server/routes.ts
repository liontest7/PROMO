import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

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

    const rawExecutions = await storage.getExecutionsByUser(user.id);
    const completed = rawExecutions.filter(e => e.status === 'paid' || e.status === 'verified').length;
    
    // Calculate balances and earnings per token
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
      totalEarned: "0", // Legacy field, keeping for compatibility but frontend should use balances
      pendingRewards: "0", // Legacy field
      tokenBalances: Object.values(tokenBalances),
      tasksCompleted: completed,
      reputation: user.reputationScore,
      balance: user.balance // SOL balance
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
      if (!action) {
        // Handle direct campaign eligibility check for HOLDER_QUALIFICATION
        const campaign = await storage.getCampaign(input.actionId); // Reusing ID for simplicity in MVP
        if (campaign && campaign.campaignType === 'holder_qualification') {
          let state = await storage.getHolderState(user.id, campaign.id);
          
          if (!state) {
            // Check balance (mocked for Phase 1)
            const balance = 10; // Simulated wallet check (user has 10)
            const required = parseFloat(campaign.minHoldingAmount || "0");
            
            if (balance < required) {
              return res.json({ 
                success: false, 
                status: "insufficient",
                currentBalance: balance,
                requiredBalance: required,
                message: "Insufficient balance" 
              });
            }
            state = await storage.createHolderState({
              userId: user.id,
              campaignId: campaign.id,
              holdStartTimestamp: new Date(),
              claimed: false
            });
            return res.json({ 
              success: true, 
              status: "holding", 
              currentBalance: balance,
              requiredBalance: required,
              holdDuration: 0,
              message: "Holding period started!" 
            });
          }

          if (state.claimed) return res.json({ success: false, message: "Already claimed" });

          const now = new Date();
          const durationDays = (now.getTime() - state.holdStartTimestamp.getTime()) / (1000 * 60 * 60 * 24);
          const balance = 1000; // Simulated wallet check
          const required = parseFloat(campaign.minHoldingAmount || "0");

          if (durationDays < (campaign.minHoldingDuration || 0)) {
            return res.json({ 
              success: true, 
              status: "waiting", 
              remaining: (campaign.minHoldingDuration || 0) - durationDays,
              currentBalance: balance,
              requiredBalance: required,
              holdDuration: durationDays,
              message: "Still in holding period" 
            });
          }

          // Ready to claim
          return res.json({ 
            success: true, 
            status: "ready", 
            currentBalance: balance,
            requiredBalance: required,
            holdDuration: durationDays,
            message: "Eligibility verified! You can claim now." 
          });
        }
        return res.status(404).json({ message: "Action or Campaign not found" });
      }

      // Proof-of-Action Verification Logic (Cost-Effective)
      const proofObj = JSON.parse(input.proof || "{}");
      let isVerified = false;

      // Smart Verification for linked social accounts or manual proof
      if (action.type === 'twitter' || action.type === 'telegram') {
        const userHandle = action.type === 'twitter' ? user.twitterHandle : user.telegramHandle;
        
        // If account is linked, we prioritize that verification
        if (userHandle) {
          isVerified = true;
          console.log(`Auto-verified via linked ${action.type} account: ${userHandle}`);
        } else if (proofObj.proofText && proofObj.proofText.length > 3) {
          // Accept manual proof (username or link) as "pending verification"
          // In a more advanced version, this would be flagged for advertiser review
          isVerified = true;
          console.log(`Verified via manual proof: ${proofObj.proofText}`);
        }
      } else if (action.type === 'website') {
        isVerified = true; // Website clicks are always auto-verified for now
      }

      if (isVerified) {
        // Get action again to ensure we have latest rewardAmount
        const freshAction = await storage.getAction(action.id);
        const reward = freshAction ? freshAction.rewardAmount : action.rewardAmount;

        const execution = await storage.createExecution({
          actionId: action.id,
          campaignId: action.campaignId,
          userId: user.id,
          status: "verified"
        } as any);
        
        await storage.incrementActionExecution(action.id);
        
        // Updated: Only set to paid automatically for website clicks
        // Social tasks go to 'verified' first to allow batch claiming
        if (action.type === 'website') {
          const txSignature = "sol-" + Math.random().toString(36).substring(7);
          await storage.updateExecutionStatus(execution.id, "paid", txSignature);

          return res.json({
            success: true,
            status: "paid",
            message: `Action verified and ${reward} rewards paid!`,
            executionId: execution.id,
            txSignature
          });
        }

        res.json({
          success: true,
          status: "verified",
          message: `Action verified! Claim your ${reward} rewards in the dashboard.`,
          executionId: execution.id
        });
      } else {
         res.json({
          success: false,
          status: "rejected",
          message: `Verification failed: Please link your ${action.type} account in profile or provide proof.`
        });
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

      res.json({
        success: true,
        txSignature,
        claimedIds: results,
        message: `Successfully claimed ${results.length} rewards. Transaction fee paid by user.`
      });

    } catch (err) {
      console.error("Claim error:", err);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get('/api/stats/global', async (req, res) => {
    try {
      const allCampaigns = await storage.getCampaigns();
      const allExecutions = await storage.getExecutionsByUser(-1); // Use -1 to mean "all users" or implement dedicated method
      
      // Since our storage doesn't have a specific global stats method, we calculate it here
      // In a real app, you'd use a single SQL query with count/sum
      const activeCount = allCampaigns.filter(c => c.status === 'active').length;
      
      // Calculate total paid across all users
      // This is a bit expensive for Express side but okay for small scale MVP
      // Implementation needs to be in storage.ts for efficiency
      
      res.json({
        activeCampaigns: activeCount,
        totalUsers: "1,240", // Mock for now until storage supports it
        totalPaid: "450000"
      });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch global stats" });
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
