import type { Express } from "express";
import { storage } from "../storage";
import { PLATFORM_CONFIG } from "@shared/config";
import os from "os";
import { AutomationService } from "../services/automation";
import { adminMiddleware } from "../middleware/auth";

export function setupAdminRoutes(app: Express) {
  // Use a middleware function that properly extracts the wallet address and attaches the admin user
  const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Check header first, then query, then body
    const walletAddress = (req.headers['x-wallet-address'] as string) || (req.query.walletAddress as string) || (req.body?.walletAddress as string);
    
    console.log(`[Admin Auth] Request: ${req.method} ${req.originalUrl}, Wallet: ${walletAddress}`);

    if (!walletAddress) {
      console.warn("[Admin Auth] No wallet address found in headers, query, or body");
      // Don't block completely if we want to allow testing but for now let's keep it strict
      // but ensure the frontend is sending it.
      return res.status(403).json({ message: "Forbidden: Wallet address required" });
    }

    const user = await storage.getUserByWallet(walletAddress);
    if (!user) {
      // If user doesn't exist but is trying to access admin, maybe it's the first admin?
      // Or just a typo. Let's check if any user exists at all.
      const allUsers = await storage.getAllUsers();
      if (allUsers.length === 0) {
        // Bootstrap mode: allow first user to be admin? No, too risky.
        // Just log it.
        console.error(`[Admin Auth] No user found for wallet: ${walletAddress}`);
      }
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    if (user.role !== "admin") {
      console.error(`[Admin Auth] Wallet ${walletAddress} is not an admin. Role: ${user.role}`);
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    (req as any).user = user;
    next();
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

  // Analytics
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allCampaigns = await storage.getAllCampaigns();
      const allExecutions = await storage.getAllExecutions();

      res.json({
        stats: {
          totalUsers: allUsers.length,
          totalCampaigns: allCampaigns.length,
          totalExecutions: allExecutions.length,
          activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
        },
        trend: []
      });
    } catch (err) {
      console.error("[Admin Analytics] Error:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // System Health
  app.get("/api/admin/system-health", async (req, res) => {
    try {
      res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.loadavg(),
        dbStatus: 'Connected',
        rpcStatus: 'Healthy',
        errorLogs: []
      });
    } catch (err) {
      console.error("[Admin Health] Error:", err);
      res.status(500).json({ message: "Failed to fetch health" });
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
