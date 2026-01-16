import { Express } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { insertCampaignSchema, insertActionSchema, auditLogs, executions } from "@shared/schema";
import { z } from "zod";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";

export function setupCampaignRoutes(app: Express) {
  app.get(api.campaigns.list.path, async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      // Only show campaigns that have paid the creation fee for the main list
      res.json(campaigns.filter(c => c.creationFeePaid || c.status === 'active'));
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    const id = req.params.id;
    // Handle both numeric ID and Symbol
    let campaign;
    if (/^\d+$/.test(id)) {
      campaign = await storage.getCampaign(parseInt(id));
    } else {
      campaign = await storage.getCampaignBySymbol(id);
    }
    
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.get("/api/campaigns/symbol/:symbol", async (req, res) => {
    const campaign = await storage.getCampaignBySymbol(req.params.symbol);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      
      // Global switch check
      if (settings.campaignsEnabled === false) {
        return res.status(503).json({ message: "Campaign creation is temporarily disabled by administrator." });
      }

      const body = req.body;
      
      // Category specific checks
      if (body.campaignType === "holder_qualification" && settings.holderQualificationEnabled === false) {
        return res.status(403).json({ message: "Holder Qualification campaigns are currently disabled." });
      }
      
      if (body.campaignType === "engagement" && settings.socialEngagementEnabled === false) {
        return res.status(403).json({ message: "Social Engagement campaigns are currently disabled (check Twitter API connection)." });
      }

      const campaignData = insertCampaignSchema.parse(req.body);
      
      // Calculate real gas budget based on actions and max claims
      // 0.000005 SOL per interaction is a very safe estimate for transaction fees
      const totalPotentialExecutions = (req.body.actions || []).reduce((acc: number, action: any) => acc + (action.maxExecutions || 100), 0);
      const gasBudgetSol = (totalPotentialExecutions * 0.000005).toFixed(6); 

      const campaign = await storage.createCampaign({
        ...campaignData,
        gasBudgetSol
      } as any);

      // Create actions
      if (req.body.actions && Array.isArray(req.body.actions)) {
        await Promise.all(req.body.actions.map((action: any) => 
          storage.createAction({
            ...action,
            campaignId: campaign.id
          })
        ));
      }

      // Process deflationary fee (10,000 $Dropy)
      const DROPY_TOKEN_ADDRESS = process.env.VITE_DROPY_TOKEN_ADDRESS;
      if (DROPY_TOKEN_ADDRESS) {
        // Calculate splits
        const feeAmount = settings.creationFee || 10000;
        const burnAmount = Math.floor(feeAmount * (settings.burnPercent / 100));
        const rewardsAmount = Math.floor(feeAmount * (settings.rewardsPercent / 100));
        const systemAmount = feeAmount - burnAmount - rewardsAmount;

        console.log(`[Fee System] Processing ${feeAmount} $Dropy fee: ${burnAmount} burn, ${rewardsAmount} rewards, ${systemAmount} system`);
        
        // Update weekly rewards pool - Removed as it was deprecated in schema
        
        // Log auditing for fee distribution
        await db.insert(auditLogs).values({
          adminId: campaign.creatorId,
          action: "campaign_fee_distribution",
          targetId: campaign.id,
          targetType: "campaign",
          details: { feeAmount, burnAmount, rewardsAmount, systemAmount }
        });
      }

      const result = await storage.getCampaign(campaign.id);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });
}
