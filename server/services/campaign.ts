import { storage } from "../storage";
import { insertCampaignSchema } from "@shared/schema";
import { z } from "zod";

export class CampaignService {
  async listCampaigns() {
    const campaigns = await storage.getCampaigns();
    return campaigns.filter(c => c.creationFeePaid || c.status === 'active');
  }

  async getCampaign(id: string) {
    if (/^\d+$/.test(id)) {
      return await storage.getCampaign(parseInt(id));
    }
    return await storage.getCampaignBySymbol(id);
  }

  async createCampaign(data: any) {
    const settings = await storage.getSystemSettings();
    
    if (settings && settings.campaignsEnabled === false) {
      throw new Error("Campaign creation is temporarily disabled");
    }

    if (data.campaignType === "holder_qualification" && settings.holderQualificationEnabled === false) {
      throw new Error("Holder Qualification campaigns are currently disabled");
    }
    
    const campaignData = insertCampaignSchema.parse(data);
    
    const actionsData = Array.isArray(data.actions) ? data.actions : [];
    const totalPotentialExecutions = actionsData.reduce((acc: number, action: any) => acc + (Number(action.maxExecutions) || 100), 0);
    const gasBudgetSol = (totalPotentialExecutions * 0.000005).toFixed(6); 

    const creator = await storage.getUser(Number(data.creatorId));
    if (!creator || (creator.role !== 'advertiser' && creator.role !== 'admin')) {
      throw new Error("Only registered advertisers or admins can launch campaigns");
    }

    const campaign = await storage.createCampaign({
      ...campaignData,
      isPremium: data.isPremium === true,
      gasBudgetSol: gasBudgetSol.toString(),
      creationFeePaid: !CONFIG.SMART_CONTRACT?.ENABLED // Auto-pay if SC is disabled for testing
    } as any);

    if (actionsData.length > 0) {
      await Promise.all(actionsData.map((action: any) => 
        storage.createAction({
          ...action,
          campaignId: campaign.id
        })
      ));
    }

    return await storage.getCampaign(campaign.id);
  }
}

export const campaignService = new CampaignService();
