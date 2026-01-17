import { Express } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { ADMIN_CONFIG } from "@shared/config";
import { z } from "zod";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import BadWordsNext from "bad-words-next";

const badwords = new BadWordsNext();

const usernameUpdateRateLimit: Record<string, number> = {};

export function setupUserRoutes(app: Express) {
  app.post('/api/users/auth', async (req, res) => {
    try {
      const input = api.users.getOrCreate.input.parse(req.body);
      console.log(`[Auth API] Authenticating wallet: ${input.walletAddress}, Role: ${input.role}`);
      
      let user = await storage.getUserByWallet(input.walletAddress);
      
      if (!user) {
        console.log(`[Auth API] Creating new user for: ${input.walletAddress}`);
        const isSuperAdmin = ADMIN_CONFIG.superAdminWallets.includes(input.walletAddress);
        const userData = { 
          walletAddress: input.walletAddress,
          role: isSuperAdmin ? "admin" : (input.role || "user"),
          balance: "0",
          reputationScore: 0,
          status: "active",
          acceptedTerms: false
        };
        // @ts-ignore
        user = await storage.createUser(userData);
        console.log(`[Auth API] User created successfully: ${user.id}`);
        res.status(201).json(user);
      } else {
        console.log(`[Auth API] User found: ${user.id}, Status: ${user.status}`);
        if (user.status !== 'active') {
          return res.status(403).json({ 
            message: `Your account is ${user.status}. Please contact support.`,
            status: user.status
          });
        }

        if (ADMIN_CONFIG.superAdminWallets.includes(user.walletAddress) && user.role !== "admin") {
          user = await storage.updateUserRole(user.id, "admin");
        }
        
        res.json(user);
      }
    } catch (err) {
      console.error("[Auth API] Error during authentication:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Authentication failed on server" });
    }
  });

  app.patch("/api/users/:walletAddress/profile", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { username, profileImageUrl } = req.body;

      const user = await storage.getUserByWallet(walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const updates: Partial<typeof user> = {};

      if (username !== undefined) {
        if (typeof username !== "string" || username.length < 3 || username.length > 20) {
          return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
        }
        if (badwords.check(username)) {
          return res.status(400).json({ message: "Username contains restricted content" });
        }

        // Rate limit username change: Once every 24 hours
        const now = Date.now();
        const lastUpdate = usernameUpdateRateLimit[walletAddress] || 0;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (now - lastUpdate < twentyFourHours) {
          const remainingHours = Math.ceil((twentyFourHours - (now - lastUpdate)) / (1000 * 60 * 60));
          return res.status(429).json({ message: `You can update your username again in ${remainingHours} hours` });
        }
        updates.username = username;
        usernameUpdateRateLimit[walletAddress] = now;
      }

      if (profileImageUrl !== undefined) {
        if (profileImageUrl && !profileImageUrl.startsWith("http")) {
          return res.status(400).json({ message: "Invalid image URL" });
        }
        updates.profileImageUrl = profileImageUrl;
      }

      const updatedUser = await storage.updateUser(user.id, updates);
      res.json(updatedUser);
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ message: "Error updating profile" });
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUserByWallet(req.params.walletAddress);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      ...user,
      balance: user.balance || "0",
      solBalance: 0 
    });
  });

  app.get(api.users.stats.path, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const user = await storage.getUserByWallet(req.params.walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const rawExecutions = await storage.getExecutionsByUser(user.id);
      const completed = rawExecutions.filter((e: any) => e.status === 'paid' || e.status === 'verified').length;
      
      const tokenBalances: Record<string, any> = {};
      for (const execution of rawExecutions) {
        const { action, campaign, status } = execution as any;
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
        balance: user.balance,
        totalUsers: allUsers.filter(u => u.acceptedTerms).length
      });
    } catch (err) {
      console.error("Stats error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/user/accept-terms", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const user = await storage.getUserByWallet(walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const [updatedUser] = await db.update(users)
        .set({ acceptedTerms: true })
        .where(eq(users.id, user.id))
        .returning();
      
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/user/unlink-x", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
      }

      const user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUserSocials(user.id, {
        twitterHandle: "",
        profileImageUrl: "",
      });

      res.json({ success: true, message: "Account unlinked successfully" });
    } catch (err) {
      console.error("Unlink error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
}
