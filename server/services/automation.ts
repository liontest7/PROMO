import { storage } from "../storage";
import { Keypair } from "@solana/web3.js";
import { transferTokens } from "./solana";
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
  }

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  private async checkAndCloseWeek() {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      const history = await storage.getPrizeHistory();
      const now = new Date();

      // Find the last week entry
      const lastWeek = history[0]; // Ordered by endDate desc
      
      let nextWeekNumber = 1;
      let nextStartDate = new Date(now);
      // Start of current week (Monday 00:00:00)
      const day = nextStartDate.getDay();
      const diff = nextStartDate.getDate() - day + (day === 0 ? -6 : 1);
      nextStartDate.setDate(diff);
      nextStartDate.setHours(0, 0, 0, 0);

      if (lastWeek) {
        // Check if the current week should be closed (End date is Sunday 23:59:59)
        if (now < lastWeek.endDate) {
          return; // Still in the current week
        }
        nextWeekNumber = lastWeek.weekNumber + 1;
        nextStartDate = new Date(lastWeek.endDate);
        nextStartDate.setMilliseconds(nextStartDate.getMilliseconds() + 1);
      }

      // Calculate end date (Next Sunday 23:59:59)
      const nextEndDate = new Date(nextStartDate);
      nextEndDate.setDate(nextStartDate.getDate() + 6);
      nextEndDate.setHours(23, 59, 59, 999);

      log(`Processing week reset. Current: Week #${nextWeekNumber-1}. Target: Week #${nextWeekNumber}`, "Automation");

      // Calculate prizes based on real system settings
      const settings = await storage.getSystemSettings();
      const allCampaigns = await storage.getAllCampaigns();
      const rewardsPercent = (settings.rewardsPercent || 40) / 100;
      const creationFee = settings.creationFee || 10000;
      const weeklyPrizePool = allCampaigns.length * creationFee * rewardsPercent;

      // Get leaderboard (Top 3)
      const users = await storage.getLeaderboard();
      const winners = users.slice(0, 3).map((user, index) => {
        const prizeWeight = index === 0 ? 0.5 : index === 1 ? 0.3 : 0.2;
        const prizeAmount = (weeklyPrizePool * prizeWeight).toFixed(2);

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
      
      // Process Payments
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
      await storage.updatePrizeHistoryStatus(historyId, "failed", winners.map(w => ({ ...w, status: "failed" })));
      return;
    }

    const fromKeypair = Keypair.fromSecretKey(bs58.decode(systemKeypairString));
    const updatedWinners = [...winners];

    for (let i = 0; i < updatedWinners.length; i++) {
      const winner = updatedWinners[i];
      if (winner.status === "paid") continue;

      try {
        log(`Paying ${winner.prizeAmount} $DROPY to ${winner.walletAddress}`, "Automation");
        // Replace with actual $DROPY token address
        const tokenAddress = "DROPyHsh35kS5eJ7qYqYqYqYqYqYqYqYqYqYqYqYqYq"; 
        
        const sig = await transferTokens(
          winner.walletAddress,
          parseFloat(winner.prizeAmount),
          tokenAddress,
          fromKeypair
        );

        updatedWinners[i] = {
          ...winner,
          status: "paid",
          transactionSignature: sig
        };
      } catch (err) {
        log(`Failed to pay winner ${winner.walletAddress}: ${err}`, "Automation");
        updatedWinners[i] = {
          ...winner,
          status: "failed"
        };
      }
    }

    const allPaid = updatedWinners.every(w => w.status === "paid");
    await storage.updatePrizeHistoryStatus(
      historyId, 
      allPaid ? "completed" : "failed", 
      updatedWinners
    );
  }
}
