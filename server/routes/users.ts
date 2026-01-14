import { Express } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { ADMIN_CONFIG } from "@shared/config";
import { z } from "zod";

export function setupUserRoutes(app: Express) {
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
    
    const tokenBalances: Record<string, any> = {};
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
}
