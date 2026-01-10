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
    title: "Solana Summer Airdrop",
    description: "Join the Solana Summer movement! Complete social tasks to earn $SOLSUM tokens and be part of the most vibrant community on Solana. We are scaling DeFi to the next billion users.",
    tokenName: "SOLSUM",
    tokenAddress: "So11111111111111111111111111111111111111112",
    totalBudget: "1000000",
    creatorId: advertiser.id,
    requirements: { minSolBalance: 0.1 },
    bannerUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000",
    logoUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=200&h=200&fit=crop",
    websiteUrl: "https://solana.com",
    twitterUrl: "https://twitter.com/solana",
    telegramUrl: "https://t.me/solana",
    campaignType: "engagement",
    rewardPerWallet: "1000"
  });

  await storage.createAction({
    campaignId: c1.id,
    type: "twitter",
    title: "Follow @Solana on Twitter",
    rewardAmount: "500",
    url: "https://twitter.com/solana",
    maxExecutions: 1000
  });
  
  await storage.createAction({
    campaignId: c1.id,
    type: "telegram",
    title: "Join Solana Official Telegram",
    rewardAmount: "500",
    url: "https://t.me/solana",
    maxExecutions: 1000
  });

  // Create Campaign 2 (Holder Qualification)
  const c2 = await storage.createCampaign({
    title: "MonkeDAO Holder Rewards",
    description: "Exclusive rewards for long-term MonkeDAO supporters. Verify your holdings and earn $MONKE as a thank you for your commitment to the DAO.",
    tokenName: "MONKE",
    tokenAddress: "AFBqr4W2t7oW36X64z4N9PqG5XF5f8L6p9F5f8L6p9",
    totalBudget: "50000",
    creatorId: advertiser.id,
    requirements: { minSolBalance: 0.5 },
    bannerUrl: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2000",
    logoUrl: "https://images.unsplash.com/photo-1621504450181-5d356f63d3ee?q=80&w=200&h=200&fit=crop",
    websiteUrl: "https://monkedao.io",
    twitterUrl: "https://twitter.com/monkedao",
    telegramUrl: "https://t.me/monkedao",
    campaignType: "holder_qualification",
    rewardPerWallet: "100",
    minHoldingAmount: "10",
    minHoldingDuration: 7
  });

  console.log("Seeding complete.");
}
