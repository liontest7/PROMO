import { storage } from "./storage";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { Connection, PublicKey } from "@solana/web3.js";
import { db } from "./db";
import { users as usersTable, campaigns as campaignsTable, actions as actionsTable, executions as executionsTable } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { PLATFORM_CONFIG } from "@shared/config";

export async function seed() {
  const campaigns = await storage.getCampaigns();
  if (campaigns.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  console.log("Seeding real-world data...");
  
  // Create Demo Advertiser
  const advertiser = await storage.createUser({
    walletAddress: "D4n7z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5z5",
    role: "advertiser",
    balance: "0"
  });

  // Create Campaign 1
  const c1 = await storage.createCampaign({
    title: "Dropy Ecosystem Expansion",
    description: "Help grow the Dropy ecosystem! Complete simple social tasks to earn $DROPY rewards and become an early supporter of the premier marketing platform on Solana.",
    tokenName: "DROPY",
    tokenAddress: "EPjFW33rdvq2zhpks87j3jt7jjh8p7wlwnvxy3cb68",
    totalBudget: "1000000",
    creatorId: advertiser.id,
    requirements: { minSolBalance: 0.1 },
    bannerUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000",
    logoUrl: "https://i.ibb.co/TBd95CcD/1-Untitled-design.png",
    websiteUrl: "https://dropy.app",
    twitterUrl: "https://x.com/Dropy_Sol",
    telegramUrl: "https://t.me/Dropy_Sol",
    campaignType: "engagement",
    rewardPerWallet: "1000"
  });

  await storage.createAction({
    campaignId: c1.id,
    type: "twitter",
    title: "Follow @Dropy_Sol on X",
    rewardAmount: "500",
    url: "https://x.com/Dropy_Sol",
    maxExecutions: 1000
  });
  
  await storage.createAction({
    campaignId: c1.id,
    type: "telegram",
    title: "Join Dropy Official Telegram",
    rewardAmount: "500",
    url: "https://t.me/Dropy_Sol",
    maxExecutions: 1000
  });

  console.log("Seeding complete.");
}
