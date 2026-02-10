import { storage } from "../storage";
import { Keypair } from "@solana/web3.js";
import { transferTokens } from "./solana";
import { PLATFORM_CONFIG } from "@shared/config";
import bs58 from "bs58";

// Utility for logging
function log(message: string, source = "Automation") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export class AutomationService {
  private static instance: AutomationService;
  private isProcessing = false;

  private constructor() {
    // Start the interval (check every hour)
    setInterval(() => this.checkAndCloseWeek(), 60 * 60 * 1000);
    // Initial check on startup
    setTimeout(() => this.checkAndCloseWeek(), 10000);
    // Start retry mechanism
    this.startRetryMechanism();
    // Start payout/RPC alert monitor
    this.startHealthAlertMonitor();
  }

  private async startHealthAlertMonitor() {
    const intervalMs = 10 * 60 * 1000;
    const failureRateThreshold = Number(process.env.PAYOUT_FAILURE_ALERT_THRESHOLD_PERCENT || "15");
    const rpcErrorThreshold = Number(process.env.RPC_ERROR_ALERT_THRESHOLD_COUNT || "5");

    setInterval(async () => {
      try {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const executions = await storage.getAllExecutions();
        const recent = executions.filter((execution) =>
          execution.createdAt && new Date(execution.createdAt).getTime() >= oneHourAgo,
        );
        const failed = recent.filter((execution) => execution.status === "failed").length;
        const failureRate = recent.length > 0 ? (failed / recent.length) * 100 : 0;

        const errorLogs = await storage.getErrorLogs(200);
        const recentRpcErrors = errorLogs.filter((entry) => {
          const createdAt = entry.createdAt ? new Date(entry.createdAt).getTime() : 0;
          if (createdAt < oneHourAgo) return false;
          const message = `${entry.message || ""} ${JSON.stringify(entry.details || {})}`.toLowerCase();
          return message.includes("rpc") || message.includes("solana") || message.includes("blockhash");
        }).length;

        if (failureRate >= failureRateThreshold) {
          await storage.createLog({
            level: "warn",
            source: "ALERT",
            message: "High payout failure rate detected",
            details: {
              failureRatePercent: Number(failureRate.toFixed(2)),
              thresholdPercent: failureRateThreshold,
              failed,
              totalRecent: recent.length,
              windowMinutes: 60,
            },
          });
          log(`ALERT payout failure rate ${failureRate.toFixed(2)}% (threshold ${failureRateThreshold}%)`, "Automation:Alert");
        }

        if (recentRpcErrors >= rpcErrorThreshold) {
          await storage.createLog({
            level: "warn",
            source: "ALERT",
            message: "RPC error spike detected",
            details: {
              rpcErrors: recentRpcErrors,
              thresholdCount: rpcErrorThreshold,
              windowMinutes: 60,
            },
          });
          log(`ALERT RPC error spike ${recentRpcErrors} (threshold ${rpcErrorThreshold})`, "Automation:Alert");
        }
      } catch (err) {
        log(`Alert monitor error: ${err}`, "Automation:Alert");
      }
    }, intervalMs);
  }

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  /**
   * Automated retry mechanism for failed payouts.
   * Runs every 30 minutes to check for pending/failed prizes.
   */
  private async startRetryMechanism() {
    setInterval(async () => {
      try {
        log("Running automated payout retry check...", "Automation:Retry");
        const history = await storage.getPrizeHistory();
        const failedEntries = history.filter(h => h.status === 'failed' || h.status === 'processing');
        
        for (const entry of failedEntries) {
          const winners = entry.winners as any[];
          const hasUnpaid = winners.some(w => w.status !== 'paid');
          
          if (hasUnpaid) {
            log(`Retrying payouts for week #${entry.weekNumber} (ID: ${entry.id})`, "Automation:Retry");
            await this.processWinners(entry.id, winners);
          }
        }
      } catch (err) {
        log(`Retry mechanism error: ${err}`, "Automation:Retry");
      }
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  private async checkAndCloseWeek() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      const history = await storage.getPrizeHistory();
      const now = new Date();

      // Find the last week entry
      const lastWeek = history[0]; // Ordered by endDate desc
      
      const allCampaigns = await storage.getAllCampaigns();
      const fundedCampaigns = allCampaigns.filter(c => c.status === 'active' && c.creationFeePaid);
      
      if (fundedCampaigns.length === 0 && !lastWeek) {
        log("Waiting for the first funded campaign to start the weekly cycle.", "Automation");
        return;
      }

      let nextWeekNumber = 1;
      let nextStartDate = new Date(now);

      if (!lastWeek) {
        // Initial activation: Start now, and end on the coming Sunday.
        nextWeekNumber = 1;
        nextStartDate = new Date(now);
      } else {
        // Check if the current week should be closed (End date is Sunday 23:59:59)
        const lastEndDate = lastWeek.endDate ? new Date(lastWeek.endDate) : new Date();
        if (now < lastEndDate) {
          log(`Still in week #${lastWeek.weekNumber}. Ends at ${lastEndDate.toISOString()}`, "Automation");
          return;
        }
        nextWeekNumber = lastWeek.weekNumber + 1;
        nextStartDate = new Date(lastEndDate);
        nextStartDate.setMilliseconds(nextStartDate.getMilliseconds() + 1);
      }

      const nowUTC = new Date();
      // Safety check to prevent rapid duplicate week creation
      const recentHistory = await storage.getPrizeHistory();
      const tooRecent = recentHistory.some(h => {
        const hEnd = new Date(h.endDate);
        return Math.abs(nowUTC.getTime() - hEnd.getTime()) < 1000 * 60 * 5; // 5 minutes
      });
      if (tooRecent && lastWeek) {
        log("A week was closed very recently. Skipping to avoid duplicates.", "Automation");
        return;
      }

      // Calculate end date (Next Sunday 23:59:59)
      const nextEndDate = new Date(nextStartDate);
      nextEndDate.setDate(nextStartDate.getDate() + 6);
      nextEndDate.setHours(23, 59, 59, 999);

      log(`Closing week #${nextWeekNumber-1}. Winners determined based on points earned this week.`, "Automation");

      // Calculate prizes based on real system settings
      const settings = await storage.getSystemSettings();
      const rewardsPercent = (settings.rewardsPercent || 40) / 100;
      const creationFee = settings.creationFee || 10000;
      
      // Safety check: Filter for only active and funded campaigns
      const activeCampaigns = allCampaigns.filter(c => c.status === 'active' && c.creationFeePaid);
      const weeklyPrizePool = activeCampaigns.length * creationFee * rewardsPercent;

      // Get leaderboard based on weekly timeframe points
      const allUsers = await storage.getAllUsers();
      const allExecutions = await storage.getAllExecutions();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weeklyRankings = allUsers.map(user => {
        const weeklyPoints = allExecutions.filter(e => 
          e.userId === user.id && 
          e.status === 'verified' && 
          e.createdAt && 
          new Date(e.createdAt) >= oneWeekAgo
        ).length * 10;
        return { ...user, weeklyPoints };
      }).sort((a, b) => {
        if (b.weeklyPoints !== a.weeklyPoints) return b.weeklyPoints - a.weeklyPoints;
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      });

      const winners = weeklyRankings.slice(0, 3).map((user, index) => {
        const prizeWeight = index === 0 ? 0.5 : index === 1 ? 0.3 : 0.2;
        const prizeAmount = (weeklyPrizePool * prizeWeight).toFixed(6);

        return {
          userId: user.id,
          rank: index + 1,
          prizeAmount,
          walletAddress: user.walletAddress,
          twitterHandle: user.twitterHandle || undefined,
          status: "pending" as const
        };
      });

      const entry = {
        weekNumber: nextWeekNumber,
        startDate: nextStartDate,
        endDate: nextEndDate,
        totalPrizePool: weeklyPrizePool.toString(),
        winners,
        status: "processing" as const
      };

      const prizeHistoryEntry = await storage.createPrizeHistory(entry);
      log(`Week #${nextWeekNumber} created in history. Starting automated payout...`, "Automation");
      
      // Process Payments automatically
      await this.processWinners(prizeHistoryEntry.id, winners);

    } catch (err) {
      log(`Automation error: ${err}`, "Automation");
    } finally {
      this.isProcessing = false;
    }
  }

  private calculatePrize(rank: number): string {
    if (rank === 1) return "5000";
    if (rank === 2) return "2500";
    if (rank === 3) return "1000";
    return "0";
  }

  public async processWinners(historyId: number, winners: any[]) {
    const systemKeypairString = process.env.SYSTEM_WALLET_PRIVATE_KEY;
    if (!systemKeypairString) {
      log("System wallet not configured. Payments skipped.", "Automation");
      await storage.updatePrizeHistoryStatus(historyId, "failed", winners.map(w => ({ ...w, status: "failed", errorMessage: "System wallet not configured" })));
      return;
    }

    let fromKeypair: Keypair;
    try {
      fromKeypair = Keypair.fromSecretKey(bs58.decode(systemKeypairString.trim()));
    } catch (err) {
      log("Invalid system wallet key format. Payments skipped.", "Automation");
      await storage.updatePrizeHistoryStatus(historyId, "failed", winners.map(w => ({ ...w, status: "failed", errorMessage: "Invalid system wallet key format" })));
      return;
    }

    const updatedWinners = [...winners];

    for (let i = 0; i < updatedWinners.length; i++) {
      const winner = updatedWinners[i];
      if (winner.status === "paid") continue;

      try {
        log(`Paying ${winner.prizeAmount} $DROPY to ${winner.walletAddress}`, "Automation");
        
        // Robust wallet address validation
        const isValidSolanaAddress = (address: string) => {
          try {
            if (!address || typeof address !== 'string') return false;
            const trimmed = address.trim();
            if (trimmed.length < 32 || trimmed.length > 44) return false;
            const decoded = bs58.decode(trimmed);
            return decoded.length === 32;
          } catch (e) {
            return false;
          }
        };

        if (!isValidSolanaAddress(winner.walletAddress)) {
          throw new Error(`Invalid or malformed wallet address: ${winner.walletAddress}`);
        }

        // Use the reward token address from config or system settings
        const settings = await storage.getSystemSettings();
        // Fallback to a valid default if needed, but ideally it's in settings
        const tokenAddress = PLATFORM_CONFIG.TOKEN_DETAILS.ADDRESS; 
        
        const sig = await transferTokens(
          winner.walletAddress.trim(),
          parseFloat(winner.prizeAmount),
          tokenAddress,
          fromKeypair
        );

        updatedWinners[i] = {
          ...winner,
          status: "paid",
          transactionSignature: sig
        };
        log(`Payment success: ${sig}`, "Automation");
      } catch (err) {
        log(`Payment FAILED for ${winner.walletAddress}: ${err}`, "Automation");
        updatedWinners[i] = {
          ...winner,
          status: "failed",
          errorMessage: err instanceof Error ? err.message : String(err)
        };
      }
    }

    const allPaid = updatedWinners.every(w => w.status === "paid");
    await storage.updatePrizeHistoryStatus(
      historyId, 
      allPaid ? "completed" : "failed", 
      updatedWinners
    );
    log(`Week reset process finished. Status: ${allPaid ? "COMPLETED" : "FAILED (Needs manual retry)"}`, "Automation");
  }
}
