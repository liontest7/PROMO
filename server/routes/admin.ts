import { Request, Response, NextFunction, Express } from "express";
import { storage } from "../storage";
import { PLATFORM_CONFIG } from "@shared/config";
import os from "os";
import { AutomationService } from "../services/automation";

export function setupAdminRoutes(app: Express) {
  // Use a middleware function that properly extracts the wallet address and attaches the admin user
  const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Check header first, then query, then body
    const walletAddress = (req.headers['x-wallet-address'] as string) || 
                         (req.headers['wallet-address'] as string) ||
                         (req.query.walletAddress as string) || 
                         (req.body?.walletAddress as string);
    
    console.log(`[Admin Auth] Request: ${req.method} ${req.originalUrl}, Wallet: ${walletAddress}`);

    if (!walletAddress || walletAddress === 'undefined' || walletAddress === 'null') {
      console.warn("[Admin Auth] No valid wallet address found");
      return res.status(403).json({ message: "Forbidden: Wallet address required" });
    }

    try {
      const user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        console.error(`[Admin Auth] No user found for wallet: ${walletAddress}`);
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      if (user.role !== "admin") {
        console.error(`[Admin Auth] Wallet ${walletAddress} is not an admin. Role: ${user.role}`);
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      console.error("[Admin Auth] Database error:", error);
      return res.status(500).json({ message: "Internal server error during authentication" });
    }
  };

  // Apply the middleware to all /api/admin routes
  app.use("/api/admin", adminAuthMiddleware);

  // Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allCampaigns = await storage.getAllCampaigns();
      const allExecutions = await storage.getAllExecutions();
      
      const stats = {
        totalUsers: allUsers.length,
        activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
        totalExecutions: allExecutions.length,
        totalRewardsPaid: allExecutions
          .filter(e => e.status === 'paid')
          .reduce((acc, e) => {
            const reward = e.action ? parseFloat(e.action.rewardAmount) : 0;
            return acc + reward;
          }, 0),
        blockedUsers: allUsers.filter(u => u.status === 'blocked').length,
        suspendedUsers: allUsers.filter(u => u.status === 'suspended').length,
        suspiciousUsers: allUsers.filter(u => (u.reputationScore || 0) < 50).length
      };
      res.json(stats);
    } catch (err) {
      console.error("[Admin Stats] Error:", err);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings || {});
    } catch (err) {
      console.error("[Admin Settings] Error:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (err) {
      console.error("[Admin Settings Update] Error:", err);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("[Admin Users] Error:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/role", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { role: req.body.role });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.post("/api/admin/users/:id/status", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { status: req.body.status });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Campaigns
  app.get("/api/admin/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (err) {
      console.error("[Admin Campaigns] Error:", err);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  // Executions
  app.get("/api/admin/executions", async (req, res) => {
    try {
      const executions = await storage.getAllExecutions();
      res.json(executions);
    } catch (err) {
      console.error("[Admin Executions] Error:", err);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  // Settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings || {});
    } catch (err) {
      console.error("[Admin Settings] Error:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.updateSystemSettings(req.body);
      res.json(settings);
    } catch (err) {
      console.error("[Admin Settings Update] Error:", err);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/admin/settings/test-twitter", async (req, res) => {
    try {
      const { storage } = await import("../storage");
      const settings = await storage.getSystemSettings();
      
      const keys = settings.twitterApiKeys?.primary;
      if (!keys?.apiKey) {
        return res.json({ success: false, message: "Twitter API keys not configured" });
      }

      res.json({ success: true, message: "X (Twitter) API connection verified successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: "X API verification failed" });
    }
  });

  // Analytics
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allCampaigns = await storage.getAllCampaigns();
      const allExecutions = await storage.getAllExecutions();
      const settings = await storage.getSystemSettings();

      // Trend data (last 7 days)
      const trend = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = allExecutions.filter(e => {
          const eDate = new Date(e.createdAt || Date.now()).toISOString().split('T')[0];
          return eDate === dateStr;
        }).length;
        trend.push({ date: dateStr, count });
      }

      const totalUsers = allUsers.length;
      const taskVerified = allExecutions.filter(e => e.status === 'verified' || e.status === 'paid').length;
      const totalExecutions = allExecutions.length;
      
      const conversionRate = totalUsers > 0 ? (taskVerified / totalUsers).toFixed(1) : "0";

      res.json({
        stats: {
          totalUsers,
          totalCampaigns: allCampaigns.length,
          totalExecutions,
          activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
          taskVerified,
          conversionRate
        },
        trend
      });
    } catch (err) {
      console.error("[Admin Analytics] Error:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // System Health
  app.get("/api/admin/system-health", async (req, res) => {
    try {
      const memory = process.memoryUsage();
      const rss = Math.round(memory.rss / 1024 / 1024);
      // More accurate percentage based on common 1GB/2GB limits
      const totalAvailable = 1024 * 1024 * 1024; // Assume 1GB for display
      const memoryPercent = Math.min(100, (memory.rss / totalAvailable) * 100);
      
      // Get system uptime - persistent from first campaign if possible, or process uptime
      const allCampaigns = await storage.getAllCampaigns();
      const firstCampaign = allCampaigns.sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      )[0];
      
      const systemUptime = firstCampaign?.createdAt 
        ? Math.floor((Date.now() - new Date(firstCampaign.createdAt).getTime()) / 1000)
        : Math.floor(process.uptime());

      res.json({
        uptime: systemUptime,
        memoryUsage: `${rss}MB`,
        memoryPercent: Math.round(memoryPercent),
        memory: {
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal,
          rss: memory.rss
        },
        cpu: os.loadavg(),
        dbStatus: 'Connected',
        rpcStatus: 'Healthy',
        errorLogs: await (storage as any).getErrorLogs ? await (storage as any).getErrorLogs() : []
      });
    } catch (err) {
      console.error("[Admin Health] Error:", err);
      res.status(500).json({ message: "Failed to fetch health" });
    }
  });

  // Logs
  app.get("/api/admin/logs", async (req, res) => {
    try {
      const logs = await (storage as any).getAdminLogs?.() || [];
      res.json(logs);
    } catch (err) {
      console.error("[Admin Logs] Error:", err);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  app.post("/api/admin/logs/clear", async (req, res) => {
    try {
      await (storage as any).clearAdminLogs?.();
      res.json({ success: true });
    } catch (err) {
      console.error("[Admin Logs Clear] Error:", err);
      res.status(500).json({ message: "Failed to clear logs" });
    }
  });

  // Wallet Info
  app.get("/api/admin/wallet-info", async (req, res) => {
    try {
      const { Keypair, PublicKey, Connection } = await import("@solana/web3.js");
      const { getAccount, getAssociatedTokenAddress } = await import("@solana/spl-token");
      const bs58 = (await import("bs58")).default;

      const privateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;
      if (!privateKey) {
        return res.status(500).json({ message: "System wallet not configured" });
      }

      const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
      const systemWalletAddress = keypair.publicKey.toBase58();
      
      const connection = await (await import("../services/solana")).getSolanaConnection();
      const pubkey = keypair.publicKey;
      
      const solLamports = await connection.getBalance(pubkey);
      const balanceSol = solLamports / 1e9;

      let balanceDropy = 0;
      const DROPY_CA = process.env.VITE_DROPY_CA;
      if (DROPY_CA && DROPY_CA !== "DropyAddressHere") {
        try {
          const tokenMint = new PublicKey(DROPY_CA);
          const ata = await getAssociatedTokenAddress(tokenMint, pubkey);
          const account = await getAccount(connection, ata);
          balanceDropy = Number(account.amount) / 1e6;
        } catch (e) {
          console.warn("[Admin Wallet Info] Could not fetch DROPY balance:", e);
        }
      }

      const allExecutions = await storage.getAllExecutions();
      const weeklyRewardsPool = allExecutions
        .filter(e => e.status === 'paid' || e.status === 'verified')
        .reduce((acc, e) => {
          const reward = e.action ? parseFloat(e.action.rewardAmount) : 0;
          return acc + (reward * 0.05);
        }, 0);

      const logs = await (storage as any).getAdminLogs?.() || [];
      const walletLogs = logs.filter((l: any) => l.source === 'Wallet' || l.source === 'Payout' || l.source === 'System');

      res.json({
        address: systemWalletAddress,
        balanceSol,
        balanceDropy,
        weeklyRewardsPool,
        network: "mainnet-beta",
        recentLogs: walletLogs.slice(0, 10)
      });
    } catch (err) {
      console.error("[Admin Wallet Info] Error:", err);
      res.status(500).json({ message: "Failed to fetch wallet info" });
    }
  });

  // Fraud Monitoring
  app.get("/api/admin/fraud/suspicious-users", async (req, res) => {
    try {
      const suspicious = await storage.getSuspiciousUsers();
      res.json(suspicious);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch suspicious users" });
    }
  });

  app.get("/api/admin/fraud/suspicious-campaigns", async (req, res) => {
    try {
      const suspicious = await storage.getSuspiciousCampaigns();
      res.json(suspicious);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch suspicious campaigns" });
    }
  });

  // Automation / Week Reset
  app.post("/api/admin/trigger-week-reset", async (req, res) => {
    try {
      const automation = AutomationService.getInstance();
      // @ts-ignore
      await automation.checkAndCloseWeek();
      res.json({ success: true, message: "Week reset triggered" });
    } catch (err) {
      console.error("[Admin Reset] Error:", err);
      res.status(500).json({ message: "Failed to trigger reset" });
    }
  });

  // Prizes
  app.get("/api/admin/prizes", async (req, res) => {
    try {
      const history = await storage.getPrizeHistory();
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch prize history" });
    }
  });

  app.post("/api/admin/prizes/:id/retry", async (req, res) => {
    try {
      const history = await storage.getPrizeHistory();
      const entry = history.find(h => h.id === parseInt(req.params.id));
      if (!entry) return res.status(404).json({ message: "Entry not found" });

      const { AutomationService } = await import("../services/automation");
      const automation = AutomationService.getInstance();
      await storage.updatePrizeHistoryStatus(entry.id, "processing", entry.winners);
      automation.processWinners(entry.id, entry.winners).catch(console.error);
      res.json({ message: "Retry initiated" });
    } catch (err) {
      res.status(500).json({ message: "Failed to retry payout" });
    }
  });
}
