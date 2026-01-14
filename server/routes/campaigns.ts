import { Express } from "express";
import { storage } from "../storage";
import { api } from "@shared/routes";
import { insertCampaignSchema, insertActionSchema } from "@shared/schema";
import { z } from "zod";

export function setupCampaignRoutes(app: Express) {
  app.get(api.campaigns.list.path, async (req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
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
      if (!settings.campaignsEnabled) {
        return res.status(503).json({ message: "Campaign creation is temporarily disabled." });
      }

      const body = req.body;
      if (body.campaignType === "holder_qualification" && !settings.holderQualificationEnabled) {
        return res.status(403).json({ message: "Holder Qualification campaigns are currently disabled." });
      }
      if (body.campaignType === "engagement" && !settings.socialEngagementEnabled) {
        return res.status(403).json({ message: "Social Engagement campaigns are currently disabled." });
      }

      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);

      const actionsData = z.array(insertActionSchema.omit({ campaignId: true })).parse(req.body.actions);
      for (const action of actionsData) {
        await storage.createAction({ ...action, campaignId: campaign.id });
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
