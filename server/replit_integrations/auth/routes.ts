import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { storage } from "../../storage";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Link Replit Auth with Wallet
  app.post("/api/auth/link", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      const replitUser = await authStorage.getUser(userId);
      if (!replitUser) {
        return res.status(404).json({ message: "Replit user not found" });
      }

      const updatedUser = await storage.linkReplitUser(walletAddress, userId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error linking user:", error);
      res.status(500).json({ message: "Failed to link accounts" });
    }
  });
}
