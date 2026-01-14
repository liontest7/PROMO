import type { Express } from "express";
import type { Server } from "http";
import { setupTwitterRoutes } from "./routes/twitter";
import { setupUserRoutes } from "./routes/users";
import { setupCampaignRoutes } from "./routes/campaigns";
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

  // Remaining specialized routes (Verification/Admin)
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
