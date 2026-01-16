import type { Express } from "express";
import { storage } from "../storage";
import { PLATFORM_CONFIG } from "@shared/config";
import os from "os";
import { AutomationService } from "../services/automation";
import { adminMiddleware } from "../middleware/auth";

export function setupAdminRoutes(app: Express) {
  // Protect all admin routes
  app.use("/api/admin", adminMiddleware);

  // Fraud Monitoring
  app.get("/api/admin/fraud/suspicious-users", async (req, res) => {
    try {
      const suspicious = await storage.getSuspiciousUsers();
      res.json(suspicious);
    } catch (err) {
      res.status(500).json({ message: "Error fetching suspicious users" });
    }
  });

  app.get("/api/admin/fraud/suspicious-campaigns", async (req, res) => {
    try {
      const suspicious = await storage.getSuspiciousCampaigns();
      res.json(suspicious);
    } catch (err) {
      res.status(500).json({ message: "Error fetching suspicious campaigns" });
    }
  });

  // Admin stats
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
      console.error("Admin stats error:", err);
      res.status(500).json({ message: "Error fetching admin stats" });
    }
  });

  app.post("/api/admin/trigger-week-reset", async (req, res) => {
    try {
      const automation = AutomationService.getInstance();
      // @ts-ignore - Reaching into private method for manual trigger
      await automation.checkAndCloseWeek();
      res.json({ success: true, message: "Week reset triggered" });
    } catch (err) {
      console.error("Manual reset error:", err);
      res.status(500).json({ message: "Failed to trigger reset" });
    }
  });

  // Users management
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/admin/users/:id/role", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { role: req.body.role });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Error updating user role" });
    }
  });

  app.post("/api/admin/users/:id/status", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { status: req.body.status });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Error updating user status" });
    }
  });

  app.post("/api/admin/users/:id/balance", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { balance: req.body.balance });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Error updating user balance" });
    }
  });

  app.post("/api/admin/users/:id/reputation", async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), { reputationScore: req.body.reputationScore });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Error updating user reputation" });
    }
  });

  // Campaigns management
  app.get("/api/admin/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      res.json(campaigns);
    } catch (err) {
      res.status(500).json({ message: "Error fetching campaigns" });
    }
  });

  // Executions management
  app.get("/api/admin/executions", async (req, res) => {
    try {
      const executions = await storage.getAllExecutions();
      res.json(executions);
    } catch (err) {
      res.status(500).json({ message: "Error fetching executions" });
    }
  });

  // System Health
  app.get("/api/admin/system-health", async (req, res) => {
    try {
      const health = {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        },
        cpu: os.loadavg(),
        dbStatus: 'Connected',
        rpcStatus: 'Healthy',
        errorLogs: []
      };
      res.json(health);
    } catch (err) {
      res.status(500).json({ message: "Error fetching system health" });
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

  // Admin Analytics
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allCampaigns = await storage.getAllCampaigns();
      const allExecutions = await storage.getAllExecutions();

      const stats = {
        totalUsers: allUsers.length,
        totalCampaigns: allCampaigns.length,
        totalExecutions: allExecutions.length,
        activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
        taskVerified: allExecutions.filter(e => e.status === 'verified' || e.status === 'paid').length,
        conversionRate: allUsers.length > 0 
          ? (allExecutions.length / allUsers.length).toFixed(1)
          : "0.0"
      };

      // Generate last 7 days trend
      const trend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = allExecutions.filter(e => {
          if (!e.createdAt) return false;
          const eDate = new Date(e.createdAt).toISOString().split('T')[0];
          return eDate === dateStr;
        }).length;

        trend.push({ date: dateStr, count });
      }

      res.json({ stats, trend });
    } catch (err) {
      console.error("Analytics error:", err);
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  // Prize History Payout Management
  app.get("/api/admin/prizes", async (req, res) => {
    try {
      const history = await storage.getPrizeHistory();
      res.json(history);
    } catch (err) {
      res.status(500).json({ message: "Error fetching prize history" });
    }
  });

  app.post("/api/admin/prizes/:id/retry", async (req, res) => {
    try {
      const history = await storage.getPrizeHistory();
      const entry = history.find(h => h.id === parseInt(req.params.id));
      if (!entry) return res.status(404).json({ message: "Entry not found" });

      const { AutomationService } = await import("../services/automation");
      const automation = AutomationService.getInstance();
      
      // Update status to processing before retrying
      await storage.updatePrizeHistoryStatus(entry.id, "processing", entry.winners);
      
      // Run async
      automation.processWinners(entry.id, entry.winners).catch(err => {
        console.error(`Manual retry failed: ${err}`);
      });

      res.json({ message: "Retry initiated" });
    } catch (err) {
      res.status(500).json({ message: "Error retrying payouts" });
    }
  });
}
