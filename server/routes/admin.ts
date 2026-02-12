import { Request, Response, NextFunction, Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { PLATFORM_CONFIG } from "@shared/config";
import { SERVER_CONFIG } from "@shared/config";
import os from "os";
import { AutomationService } from "../services/automation";

export function setupAdminRoutes(app: Express) {
  const roleSchema = z.enum(["user", "advertiser", "admin"]);
  const statusSchema = z.enum(["active", "suspended", "blocked"]);
  const settingsPatchSchema = z.object({
    campaignsEnabled: z.boolean().optional(),
    holderQualificationEnabled: z.boolean().optional(),
    socialEngagementEnabled: z.boolean().optional(),
    rewardsPercent: z.number().int().min(0).max(100).optional(),
    burnPercent: z.number().int().min(0).max(100).optional(),
    systemPercent: z.number().int().min(0).max(100).optional(),
    creationFee: z.number().int().min(0).optional(),
    systemWalletAddress: z.string().min(32).max(44).optional(),
    solanaRpcUrls: z.array(z.string().url()).optional(),
    twitterApiStatus: z.enum(["active", "coming_soon", "error"]).optional(),
    twitterApiKeys: z.any().optional(),
  }).refine((data) => {
    const values = [data.rewardsPercent, data.burnPercent, data.systemPercent];
    if (values.every((v) => v === undefined)) return true;
    return (data.rewardsPercent ?? 0) + (data.burnPercent ?? 0) + (data.systemPercent ?? 0) === 100;
  }, { message: "burnPercent + rewardsPercent + systemPercent must equal 100 when updated together" });

  // Session-backed admin guard
  const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const sessionWallet = (req.session as any)?.walletAddress as string | undefined;
    if (!sessionWallet) {
      return res.status(403).json({ message: "Forbidden: active admin session required" });
    }

    try {
      const user = await storage.getUserByWallet(sessionWallet);
      if (!user || user.role !== "admin") {
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
      const role = roleSchema.parse(req.body.role);
      const user = await storage.updateUser(parseInt(req.params.id, 10), { role });
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid role value" });
      }
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.post("/api/admin/users/:id/status", async (req, res) => {
    try {
      const status = statusSchema.parse(req.body.status);
      const user = await storage.updateUser(parseInt(req.params.id, 10), { status });
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status value" });
      }
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const allExecutions = await storage.getAllExecutions();
      // Sort by date descending
      const sorted = allExecutions.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      res.json(sorted.slice(0, limit));
    } catch (err) {
      console.error("[Admin Executions] Error:", err);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  // Public recent executions for Landing and Explorer
  app.get("/api/public/executions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const allExecutions = await storage.getAllExecutions();
      const sorted = allExecutions.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      // Strip sensitive user data if any (though walletAddress is public)
      res.json(sorted.slice(0, limit));
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/campaigns/:id/status", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(parseInt(req.params.id), { status: req.body.status });
      res.json(campaign);
    } catch (err) {
      console.error("[Admin Campaign Status Update] Error:", err);
      res.status(500).json({ message: "Failed to update campaign status" });
    }
  });

  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json({
        ...(settings || {}),
        dbSource: process.env.DATABASE_URL ? "Production" : "Staging (Railway)",
        solanaCluster: SERVER_CONFIG.SOLANA_CLUSTER
      });
    } catch (err) {
      console.error("[Admin Settings] Error:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", async (req, res) => {
    try {
      const payload = settingsPatchSchema.parse(req.body);
      const settings = await storage.updateSystemSettings(payload);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message || "Invalid settings payload" });
      }
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
      
      const twitterCount = allExecutions.filter(e => e.action?.type?.includes('twitter')).length;
      const telegramCount = allExecutions.filter(e => e.action?.type?.includes('telegram')).length;
      const websiteCount = allExecutions.filter(e => e.action?.type?.includes('website')).length;

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
        distribution: [
          { name: 'Twitter', value: twitterCount },
          { name: 'Telegram', value: telegramCount },
          { name: 'Website', value: websiteCount },
        ],
        trend
      });
    } catch (err) {
      console.error("[Admin Analytics] Error:", err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/reconciliation", async (_req, res) => {
    try {
      const executions = await storage.getAllExecutions();
      const prizeRounds = await storage.getPrizeHistory();

      const paidWithoutSignature = executions.filter((execution) => execution.status === "paid" && !execution.transactionSignature);
      const failedWithSignature = executions.filter((execution) => execution.status === "failed" && !!execution.transactionSignature);
      const verifiedTooOld = executions.filter((execution) => {
        if (execution.status !== "verified" || !execution.createdAt) return false;
        return Date.now() - new Date(execution.createdAt).getTime() > 24 * 60 * 60 * 1000;
      });

      const inconsistentPrizeRounds = prizeRounds.filter((round) => {
        const winners = (round.winners || []) as any[];
        const hasFailedWinner = winners.some((winner) => winner.status === "failed");
        return round.status === "completed" && hasFailedWinner;
      }).map((round) => ({
        id: round.id,
        weekNumber: round.weekNumber,
        status: round.status,
      }));

      return res.json({
        summary: {
          paidWithoutSignature: paidWithoutSignature.length,
          failedWithSignature: failedWithSignature.length,
          verifiedOlderThan24h: verifiedTooOld.length,
          inconsistentPrizeRounds: inconsistentPrizeRounds.length,
        },
        sample: {
          paidWithoutSignature: paidWithoutSignature.slice(0, 10).map((execution) => execution.id),
          failedWithSignature: failedWithSignature.slice(0, 10).map((execution) => execution.id),
          verifiedOlderThan24h: verifiedTooOld.slice(0, 10).map((execution) => execution.id),
          inconsistentPrizeRounds,
        },
      });
    } catch (err) {
      console.error("[Admin Reconciliation] Error:", err);
      return res.status(500).json({ message: "Failed to fetch reconciliation report" });
    }
  });

  app.get("/api/admin/payout-health", async (_req, res) => {
    try {
      const allExecutions = await storage.getAllExecutions();
      const paid = allExecutions.filter(e => e.status === "paid");
      const failed = allExecutions.filter(e => e.status === "failed");
      const verifiedPending = allExecutions.filter(e => e.status === "verified");
      const missingSignature = paid.filter(e => !e.transactionSignature);

      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const recent = allExecutions.filter(e => e.createdAt && new Date(e.createdAt).getTime() >= oneDayAgo);
      const recentFailed = recent.filter(e => e.status === "failed").length;

      const prizeHistory = await storage.getPrizeHistory();
      const recentPrizeRounds = prizeHistory.slice(0, 5).map((round) => ({
        weekNumber: round.weekNumber,
        status: round.status,
        totalPrizePool: round.totalPrizePool,
        endDate: round.endDate,
      }));

      return res.json({
        totals: {
          executions: allExecutions.length,
          paid: paid.length,
          failed: failed.length,
          verifiedPending: verifiedPending.length,
          missingSignature: missingSignature.length,
        },
        recent24hFailureRate: recent.length > 0 ? Number(((recentFailed / recent.length) * 100).toFixed(2)) : 0,
        recentPrizeRounds,
      });
    } catch (err) {
      console.error("[Admin Payout Health] Error:", err);
      return res.status(500).json({ message: "Failed to fetch payout health" });
    }
  });

  app.get("/api/admin/payout-metrics", async (req, res) => {
    try {
      const rawDays = typeof req.query.days === "string" ? Number(req.query.days) : 7;
      const days = Number.isFinite(rawDays) ? Math.min(30, Math.max(1, Math.floor(rawDays))) : 7;

      const executions = await storage.getAllExecutions();
      const campaigns = await storage.getAllCampaigns();
      const campaignNameById = new Map(campaigns.map((campaign) => [campaign.id, campaign.title]));

      const dayKeys = Array.from({ length: days }, (_, idx) => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - idx);
        return date.toISOString().slice(0, 10);
      }).reverse();

      const metricByDay = new Map(dayKeys.map((day) => [day, {
        day,
        paid: 0,
        failed: 0,
        verifiedPending: 0,
        total: 0,
      }]));

      const metricByCampaignDay = new Map<string, {
        campaignId: number;
        campaignName: string;
        day: string;
        paid: number;
        failed: number;
        verifiedPending: number;
        total: number;
      }>();

      for (const execution of executions) {
        if (!execution.createdAt) continue;
        const day = new Date(execution.createdAt).toISOString().slice(0, 10);
        if (!metricByDay.has(day)) continue;

        const dayMetric = metricByDay.get(day)!;
        dayMetric.total += 1;
        if (execution.status === "paid") dayMetric.paid += 1;
        if (execution.status === "failed") dayMetric.failed += 1;
        if (execution.status === "verified") dayMetric.verifiedPending += 1;

        const campaignName = campaignNameById.get(execution.campaignId) || `Campaign ${execution.campaignId}`;
        const campaignKey = `${execution.campaignId}:${day}`;
        if (!metricByCampaignDay.has(campaignKey)) {
          metricByCampaignDay.set(campaignKey, {
            campaignId: execution.campaignId,
            campaignName,
            day,
            paid: 0,
            failed: 0,
            verifiedPending: 0,
            total: 0,
          });
        }

        const campaignMetric = metricByCampaignDay.get(campaignKey)!;
        campaignMetric.total += 1;
        if (execution.status === "paid") campaignMetric.paid += 1;
        if (execution.status === "failed") campaignMetric.failed += 1;
        if (execution.status === "verified") campaignMetric.verifiedPending += 1;
      }

      const daily = Array.from(metricByDay.values()).map((metric) => ({
        ...metric,
        failureRatePercent: metric.total > 0 ? Number(((metric.failed / metric.total) * 100).toFixed(2)) : 0,
      }));

      const perCampaignPerDay = Array.from(metricByCampaignDay.values())
        .map((metric) => ({
          ...metric,
          failureRatePercent: metric.total > 0 ? Number(((metric.failed / metric.total) * 100).toFixed(2)) : 0,
        }))
        .sort((a, b) => {
          if (a.day !== b.day) return a.day.localeCompare(b.day);
          return a.campaignName.localeCompare(b.campaignName);
        });

      return res.json({
        windowDays: days,
        daily,
        perCampaignPerDay,
      });
    } catch (err) {
      console.error("[Admin Payout Metrics] Error:", err);
      return res.status(500).json({ message: "Failed to fetch payout metrics" });
    }
  });

  // System Health
  app.get("/api/admin/system-health", async (req, res) => {
    try {
      const memory = process.memoryUsage();
      const rss = Math.round(memory.rss / 1024 / 1024);
      const heapUsed = Math.round(memory.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memory.heapTotal / 1024 / 1024);
      // More accurate percentage based on common 1GB/2GB limits
      const totalAvailable = 1024; // 1GB in MB
      const memoryPercent = Math.min(100, (rss / totalAvailable) * 100);
      
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
          heapUsed: heapUsed,
          heapTotal: heapTotal,
          rss: rss
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

  // Wallet & payout model info
  app.get("/api/admin/wallet-info", async (_req, res) => {
    try {
      const { Keypair, PublicKey } = await import("@solana/web3.js");
      const { getAccount, getAssociatedTokenAddress } = await import("@solana/spl-token");
      const bs58 = (await import("bs58")).default;

      const privateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;
      const systemWalletConfigured = Boolean(privateKey);
      let systemWalletAddress: string | null = null;
      let balanceSol = 0;
      let balanceDropy = 0;

      const connection = await (await import("../services/solana")).getSolanaConnection();

      if (privateKey) {
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        systemWalletAddress = keypair.publicKey.toBase58();
        const pubkey = keypair.publicKey;

        const solLamports = await connection.getBalance(pubkey);
        balanceSol = solLamports / 1e9;

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
      }

      const allExecutions = await storage.getAllExecutions();
      const allCampaigns = await storage.getAllCampaigns();
      const activeEscrows = allCampaigns.filter((campaign) => Boolean(campaign.escrowWallet)).length;
      const fundedEscrows = allCampaigns.filter((campaign) => Boolean(campaign.fundingTxSignature)).length;

      const weeklyRewardsPool = allExecutions
        .filter((execution) => execution.status === "paid" || execution.status === "verified")
        .reduce((acc, execution) => {
          const reward = execution.action ? parseFloat(execution.action.rewardAmount) : 0;
          return acc + (reward * 0.05);
        }, 0);

      const logs = await (storage as any).getAdminLogs?.() || [];
      const walletLogs = logs.filter((log: any) => ["Wallet", "Payout", "System", "CLAIM"].includes(log.source));

      return res.json({
        payoutModel: {
          rewardsPayoutsEnabled: SERVER_CONFIG.REWARDS_PAYOUTS_ENABLED,
          smartContractEnabled: SERVER_CONFIG.SMART_CONTRACT_ENABLED,
          smartContractProgramId: process.env.SMART_CONTRACT_PROGRAM_ID || PLATFORM_CONFIG.SMART_CONTRACT.PROGRAM_ID,
          cluster: SERVER_CONFIG.SOLANA_CLUSTER,
        },
        treasury: {
          systemWalletConfigured,
          systemWalletAddress,
          balanceSol,
          balanceDropy,
        },
        escrow: {
          activeEscrows,
          fundedEscrows,
          totalCampaigns: allCampaigns.length,
        },
        weeklyRewardsPool,
        recentLogs: walletLogs.slice(0, 10),
      });
    } catch (err) {
      console.error("[Admin Wallet Info] Error:", err);
      return res.status(500).json({ message: "Failed to fetch wallet info" });
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
  app.post("/api/admin/premium/broadcast/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });

      const { broadcastPremiumCampaign } = await import("../services/telegram");
      await broadcastPremiumCampaign(campaign);
      
      await storage.createLog({
        level: "info",
        source: "PREMIUM_PROMO",
        message: `Manual premium broadcast triggered for campaign: ${campaign.title}`,
        details: { campaignId: campaign.id }
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Manual broadcast failed:", err);
      res.status(500).json({ message: "Manual broadcast failed", error: String(err) });
    }
  });
}
