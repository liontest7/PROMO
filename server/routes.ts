import type { Express } from "express";
import type { Server } from "http";
import { setupTwitterRoutes } from "./routes/twitter";
import { setupUserRoutes } from "./routes/users";
import { setupCampaignRoutes } from "./routes/campaigns";
import { setupAdminRoutes } from "./routes/admin";
import { authMiddleware } from "./middleware/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
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

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.json({
        activeCampaigns,
        totalUsers,
        totalVerifiedProjects,
        totalPaid: totalPaid.toLocaleString(),
        totalBurned: "50,000" // Hardcoded for now based on config or fetch from actual burn logic
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
