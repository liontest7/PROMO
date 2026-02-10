import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { ADMIN_CONFIG } from "@shared/config";
import { z } from "zod";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import BadWordsNext from "bad-words-next";
import { PublicKey } from "@solana/web3.js";
import { ed25519 } from "@noble/curves/ed25519";

const badwords = new BadWordsNext();
const usernameUpdateRateLimit: Record<string, number> = {};

type AuthChallenge = {
  nonce: string;
  message: string;
  expiresAt: number;
};

const challengeStore = new Map<string, AuthChallenge>();
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const getSessionWallet = (req: Request): string | undefined => (req.session as any)?.walletAddress;

const ensureWalletSession = (req: Request, res: Response, walletAddress: string) => {
  const sessionWallet = getSessionWallet(req);
  if (!sessionWallet || sessionWallet !== walletAddress) {
    res.status(403).json({ message: "Forbidden: active wallet session is required" });
    return false;
  }
  return true;
};

const challengeInputSchema = z.object({
  walletAddress: z.string().min(32).max(44),
});

const authInputSchema = api.users.getOrCreate.input.extend({
  signature: z.string().min(1),
  nonce: z.string().min(8),
});

const makeNonce = () => `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;

const purgeExpiredChallenges = () => {
  const now = Date.now();
  challengeStore.forEach((challenge, wallet) => {
    if (challenge.expiresAt < now) {
      challengeStore.delete(wallet);
    }
  });
};

function verifyWalletSignature(walletAddress: string, message: string, signatureBase64: string) {
  const pubkeyBytes = new PublicKey(walletAddress).toBytes();
  const signatureBytes = Buffer.from(signatureBase64, "base64");
  const messageBytes = new TextEncoder().encode(message);
  return ed25519.verify(signatureBytes, messageBytes, pubkeyBytes);
}

export function setupUserRoutes(app: Express) {
  app.post("/api/users/auth/challenge", (req, res) => {
    try {
      purgeExpiredChallenges();
      const { walletAddress } = challengeInputSchema.parse(req.body);
      const nonce = makeNonce();
      const message = `Dropy Login\nWallet: ${walletAddress}\nNonce: ${nonce}`;
      challengeStore.set(walletAddress, {
        nonce,
        message,
        expiresAt: Date.now() + CHALLENGE_TTL_MS,
      });
      return res.json({ nonce, message });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return res.status(500).json({ message: "Failed to create auth challenge" });
    }
  });

  app.post("/api/users/auth", async (req, res) => {
    try {
      const input = authInputSchema.parse(req.body);
      purgeExpiredChallenges();
      const challenge = challengeStore.get(input.walletAddress);

      if (!challenge || challenge.expiresAt < Date.now()) {
        challengeStore.delete(input.walletAddress);
        return res.status(401).json({ message: "Challenge expired. Please reconnect wallet." });
      }

      if (challenge.nonce !== input.nonce) {
        return res.status(401).json({ message: "Invalid challenge nonce." });
      }

      const isValidSignature = verifyWalletSignature(input.walletAddress, challenge.message, input.signature);
      challengeStore.delete(input.walletAddress);
      if (!isValidSignature) {
        return res.status(401).json({ message: "Invalid wallet signature." });
      }

      let user = await storage.getUserByWallet(input.walletAddress);
      const existedBefore = Boolean(user);

      if (!user) {
        const isSuperAdmin = ADMIN_CONFIG.superAdminWallets.includes(input.walletAddress);

        const referrerWallet = req.headers["x-referrer-wallet"] as string;
        let referrerId: number | undefined;
        if (referrerWallet) {
          const referrer = await storage.getUserByWallet(referrerWallet);
          if (referrer) {
            referrerId = referrer.id;
            await storage.updateUser(referrer.id, { referralCount: referrer.referralCount + 1 });
          }
        }

        user = await storage.createUser({
          walletAddress: input.walletAddress,
          role: isSuperAdmin ? "admin" : (input.role || "user"),
          balance: "0",
          reputationScore: 0,
          status: "active",
          acceptedTerms: false,
          referrerId,
        } as any);
      }

      if (user.status !== "active") {
        return res.status(403).json({
          message: `Your account is ${user.status}. Please contact support.`,
          status: user.status,
        });
      }

      if (ADMIN_CONFIG.superAdminWallets.includes(user.walletAddress) && user.role !== "admin") {
        user = await storage.updateUserRole(user.id, "admin");
      }

      (req.session as any).walletAddress = user.walletAddress;
      (req.session as any).userRole = user.role;

      return res.status(existedBefore ? 200 : 201).json(user);
    } catch (err) {
      console.error("[Auth API] Error during authentication:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return res.status(500).json({ message: "Authentication failed on server" });
    }
  });

  app.post("/api/users/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.patch("/api/users/profile", async (req, res) => {
    try {
      const { walletAddress, twitterHandle, profileImageUrl, telegramHandle } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      if (!ensureWalletSession(req, res, walletAddress)) return;

      const user = await storage.getUserByWallet(walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const updatedUser = await storage.updateUserProfile(walletAddress, {
        twitterHandle,
        profileImageUrl,
        telegramHandle: telegramHandle !== undefined ? telegramHandle : undefined,
      });
      return res.json(updatedUser);
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Error updating profile" });
    }
  });

  app.patch("/api/users/:walletAddress/profile", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { username, profileImageUrl } = req.body;
      if (!ensureWalletSession(req, res, walletAddress)) return;

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
      return res.json(updatedUser);
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ message: "Error updating profile" });
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUserByWallet(req.params.walletAddress);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ ...user, balance: user.balance || "0", solBalance: 0 });
  });

  app.get(api.users.stats.path, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const user = await storage.getUserByWallet(req.params.walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const rawExecutions = await storage.getExecutionsByUser(user.id);
      const completed = rawExecutions.filter((e: any) => e.status === "paid" || e.status === "verified").length;

      const tokenBalances: Record<string, any> = {};
      for (const execution of rawExecutions) {
        const { action, campaign, status } = execution as any;
        if (!action || !campaign) continue;
        const symbol = campaign.tokenName;
        if (!tokenBalances[symbol]) tokenBalances[symbol] = { symbol, balance: "0", earned: "0", pending: "0" };
        const amount = Number(action.rewardAmount);
        if (status === "paid") {
          tokenBalances[symbol].earned = (Number(tokenBalances[symbol].earned) + amount).toFixed(6);
          tokenBalances[symbol].balance = (Number(tokenBalances[symbol].balance) + amount).toFixed(6);
        } else if (status === "verified") {
          tokenBalances[symbol].pending = (Number(tokenBalances[symbol].pending) + amount).toFixed(6);
        }
      }

      return res.json({
        totalEarned: "0",
        pendingRewards: "0",
        tokenBalances: Object.values(tokenBalances),
        tasksCompleted: completed,
        reputation: user.reputationScore,
        balance: user.balance,
        totalUsers: allUsers.filter((u) => u.acceptedTerms).length,
      });
    } catch (err) {
      console.error("Stats error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/user/accept-terms", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!ensureWalletSession(req, res, walletAddress)) return;

      const user = await storage.getUserByWallet(walletAddress);
      if (!user) return res.status(404).json({ message: "User not found" });

      const [updatedUser] = await db.update(users)
        .set({ acceptedTerms: true })
        .where(eq(users.id, user.id))
        .returning();

      return res.json(updatedUser);
    } catch {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post("/api/user/unlink-x", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address required" });
      }
      if (!ensureWalletSession(req, res, walletAddress)) return;

      const user = await storage.getUserByWallet(walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.updateUserSocials(user.id, { twitterHandle: "", profileImageUrl: "" });
      return res.json({ success: true, message: "Account unlinked successfully" });
    } catch (err) {
      console.error("Unlink error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
}
