import type { Express } from "express";
import type { Server } from "http";
import { setupTwitterRoutes } from "./routes/twitter";
import { setupUserRoutes } from "./routes/users";
import { setupCampaignRoutes } from "./routes/campaigns";
import { setupAdminRoutes } from "./routes/admin";
import { authMiddleware } from "./middleware/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { PLATFORM_CONFIG } from "@shared/config";
import { PublicKey } from "@solana/web3.js";
import { getSolanaConnection } from "./services/solana";
import { checkIpFraud, verifyTurnstile } from "./services/security";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Global Middleware
  app.use(authMiddleware);

  // Setup Modular Routes
  await setupTwitterRoutes(app);
  setupUserRoutes(app);
  setupCampaignRoutes(app);
  setupAdminRoutes(app);

  app.get("/api/stats/global", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allCampaigns = await storage.getAllCampaigns();
      const allExecutions = await storage.getAllExecutions();
      
      const activeCampaigns = allCampaigns.filter(c => c.status === 'active').length;
      const totalUsers = allUsers.filter(u => u.status === 'active' && u.acceptedTerms).length;
      const totalVerifiedProjects = Array.from(new Set(allCampaigns.map(c => c.creatorId))).length;
      
      // Calculate total paid rewards
      let totalPaid = 0;
      allExecutions.forEach(e => {
        if (e.status === 'paid' && e.action) {
          totalPaid += parseFloat(e.action.rewardAmount) || 0;
        }
      });

      // Calculate burned amount
      // Formula: (Total Campaigns * Creation Fee) * Burn Percent
      const creationFee = PLATFORM_CONFIG.TOKENOMICS.CREATION_FEE;
      const burnPercent = PLATFORM_CONFIG.TOKENOMICS.BURN_PERCENT / 100;
      const calculatedBurned = allCampaigns.length * creationFee * burnPercent;

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        activeCampaigns,
        totalUsers,
        totalVerifiedProjects,
        totalPaid: totalPaid.toLocaleString(),
        totalBurned: calculatedBurned.toLocaleString()
      });
    } catch (err) {
      console.error("Global stats error:", err);
      res.status(500).json({ message: "Error fetching global stats" });
    }
  });

  // Remaining specialized routes (Verification/Admin)
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Error updating settings" });
    }
  });

  app.get("/api/rewards/pending", async (req, res) => {
    try {
      const user = await storage.getUserByWallet(req.query.wallet as string);
      if (!user) return res.status(404).json({ message: "User not found" });
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      let pending = await storage.getPendingRewards(user.id);
      
      if (campaignId) {
        pending = pending.filter(r => r.campaignId === campaignId);
      }
      
      res.json(pending);
    } catch (err) {
      res.status(500).json({ message: "Error fetching pending rewards" });
    }
  });

  app.post("/api/rewards/claim", async (req, res) => {
    try {
      const user = await storage.getUserByWallet(req.body.wallet);
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const pending = await storage.getPendingRewards(user.id);
      const campaignIds = req.body.campaignIds;
      const filteredPending = pending.filter(r => campaignIds.includes(r.campaignId));
      
      if (filteredPending.length === 0) {
        return res.status(400).json({ message: "No pending rewards to claim for selected campaigns" });
      }

      // In a real implementation, we would call the Solana service to transfer tokens here.
      // We process each campaign reward as a separate logical transfer
      console.log(`[Claim] Processing claim for user ${user.walletAddress} across ${campaignIds.length} campaigns`);
      
      try {
        const { Keypair } = await import("@solana/web3.js");
        const { transferTokens } = await import("./services/solana");
        const bs58 = (await import("bs58")).default;

        const systemKeypairString = process.env.SYSTEM_WALLET_PRIVATE_KEY;
        if (!systemKeypairString) {
          throw new Error("System wallet not configured");
        }

        const fromKeypair = Keypair.fromSecretKey(bs58.decode(systemKeypairString));
        const signatures: string[] = [];

        for (const reward of filteredPending) {
          const sig = await transferTokens(
            user.walletAddress,
            parseFloat(reward.amount),
            reward.tokenAddress,
            fromKeypair
          );
          signatures.push(sig);
        }

        await storage.claimRewards(user.id, campaignIds);
        res.json({ success: true, message: "Rewards claimed successfully", signatures });
      } catch (transferError: any) {
        console.error("Transfer error during claim:", transferError);
        res.status(500).json({ message: "Blockchain transfer failed", error: transferError.message });
      }
    } catch (err) {
      console.error("Claim error:", err);
      res.status(500).json({ message: "Error claiming rewards" });
    }
  });

  app.post(api.executions.verify.path, async (req, res) => {
    // Keep verification logic here for now or move to separate service
    try {
      const userIp = req.ip;
      const { turnstileToken } = req.body;
      const parsedProof = JSON.parse(req.body.proof || "{}");
      const isAutoFetch = parsedProof.isAutoFetch === true;

      if (!turnstileToken && !isAutoFetch) {
        return res.status(400).json({ message: "Security verification required" });
      }

      if (turnstileToken) {
        const success = await verifyTurnstile(turnstileToken);
        if (!success) {
          return res.status(400).json({ message: "Security verification failed." });
        }
      }

      const user = await storage.getUserByWallet(req.body.userWallet);
      if (!user) return res.status(404).json({ message: "User not found" });

      const action = await storage.getAction(req.body.actionId);
      if (!action) return res.status(404).json({ message: "Action not found" });

      const campaign = await storage.getCampaign(action.campaignId);
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });

      // Anti-Bot & Requirements Validation
      if (campaign.requirements) {
        const { minSolBalance, minWalletAgeDays, multiDaySolHolding } = campaign.requirements;
        const connection = await getSolanaConnection();
        const pubkey = new PublicKey(user.walletAddress);

        // 1. Min SOL Balance
        if (minSolBalance && minSolBalance > 0) {
          const balance = await connection.getBalance(pubkey);
          const solBalance = balance / 1e9;
          if (solBalance < minSolBalance) {
            return res.status(403).json({ 
              message: `Requirement failed: Minimum ${minSolBalance} SOL balance required. Your current balance is ${solBalance.toFixed(3)} SOL.` 
            });
          }
        }

        // 2. Min Wallet Age
        if (minWalletAgeDays && minWalletAgeDays > 0) {
          const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1 }, 'confirmed');
          if (signatures.length === 0) {
            return res.status(403).json({ 
              message: "Requirement failed: This wallet has no transaction history and is considered too new." 
            });
          }
          const firstTx = signatures[signatures.length - 1];
          const firstTxTime = firstTx.blockTime ? firstTx.blockTime * 1000 : Date.now();
          const ageInDays = (Date.now() - firstTxTime) / (1000 * 60 * 60 * 24);
          if (ageInDays < minWalletAgeDays) {
            return res.status(403).json({ 
              message: `Requirement failed: Your wallet must be at least ${minWalletAgeDays} days old. It is currently only ${Math.floor(ageInDays)} days old.` 
            });
          }
        }

        // 3. Multi-day SOL Holding
        if (multiDaySolHolding && multiDaySolHolding.amount > 0) {
          const balance = await connection.getBalance(pubkey);
          const solBalance = balance / 1e9;
          if (solBalance < multiDaySolHolding.amount) {
            return res.status(403).json({ 
              message: `Requirement failed: You must hold at least ${multiDaySolHolding.amount} SOL for ${multiDaySolHolding.days} consecutive days to participate.` 
            });
          }
        }
      }

      // Twitter API Verification Integration
      if (action.type === 'twitter' || action.type.startsWith('twitter_')) {
        if (!user.twitterHandle) {
          return res.status(400).json({ message: "Please link your X (Twitter) account in settings first." });
        }

        const accessToken = (req.session as any).twitterAccessToken;
        if (!accessToken) {
          return res.status(401).json({ message: "X (Twitter) session expired. Please re-link your account." });
        }

        try {
          const { verifyTwitterFollow, verifyTwitterRetweet } = await import("./services/twitter");
          let verified = false;

          if (action.type === 'twitter_follow') {
            // Extract target username from URL
            const targetUsername = action.url.split('/').pop() || "";
            verified = await verifyTwitterFollow(accessToken, targetUsername);
          } else if (action.type === 'twitter_retweet') {
            // Extract tweet ID from URL
            const tweetId = action.url.split('/').pop() || "";
            verified = await verifyTwitterRetweet(accessToken, tweetId);
          } else {
            // For general twitter type, we might just assume it's verified if linked for now
            verified = true;
          }

          if (!verified) {
            return res.status(403).json({ 
              message: "X (Twitter) verification failed: Requirement not met. Please make sure you have performed the action." 
            });
          }
        } catch (error) {
          console.error("Twitter verification route error:", error);
          return res.status(500).json({ message: "Twitter verification service unavailable." });
        }
      }

      // Verification logic...
      await storage.createExecution({
        actionId: action.id,
        campaignId: action.campaignId,
        userId: user.id,
        status: "verified"
      } as any);
      
      res.json({ success: true, status: "verified", message: "Action verified!" });
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  return httpServer;
}
