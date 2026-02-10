import { Express } from "express";
import { campaignService } from "../services/campaign";
import { api } from "@shared/routes";
import { z } from "zod";

export function setupCampaignRoutes(app: Express) {
  app.get(api.campaigns.list.path, async (req, res) => {
    try {
      const campaigns = await campaignService.listCampaigns();
      res.json(campaigns);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    try {
      const campaign = await campaignService.getCampaign(req.params.id);
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });
      res.json(campaign);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // Backward-compatible symbol endpoint used by older client builds
  app.get("/api/campaigns/symbol/:symbol", async (req, res) => {
    try {
      const campaign = await campaignService.getCampaign(req.params.symbol);
      if (!campaign) return res.status(404).json({ message: "Campaign not found" });
      res.json(campaign);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    try {
      const campaign = await campaignService.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(err.message.includes("disabled") ? 403 : 500).json({ message: err.message || "Failed to create campaign" });
    }
  });
}
