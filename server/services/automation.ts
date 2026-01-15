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
      nextStartDate.setHours(0, 0, 0, 0);

      if (lastWeek) {
        // Check if the current week should be closed
        if (now < lastWeek.endDate) {
          return; // Still in the current week
        }
        nextWeekNumber = lastWeek.weekNumber + 1;
        nextStartDate = new Date(lastWeek.endDate);
      }

      // Calculate next end date (next Sunday at midnight)
      const nextEndDate = new Date(nextStartDate);
      nextEndDate.setDate(nextStartDate.getDate() + (7 - nextStartDate.getDay()) % 7 || 7);
      nextEndDate.setHours(23, 59, 59, 999);

      log(`Closing week #${nextWeekNumber-1} and starting week #${nextWeekNumber}`, "Automation");

      // Get leaderboard for the period
      const users = await storage.getLeaderboard();
      const winners = users.slice(0, 3).map((user, index) => ({
        userId: user.id,
        rank: index + 1,
        prizeAmount: this.calculatePrize(index + 1),
        walletAddress: user.walletAddress,
        twitterHandle: user.twitterHandle || undefined,
        status: "pending" as const
      }));

      const entry = {
        weekNumber: nextWeekNumber,
        startDate: nextStartDate,
        endDate: nextEndDate,
        totalPrizePool: winners.reduce((sum, w) => sum + parseFloat(w.prizeAmount), 0).toString(),
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
