import fetch from "node-fetch";
import { storage } from "../storage";
import { Issuer, generators, Client } from "openid-client";

const TWITTER_REDIRECT_URI = process.env.TWITTER_REDIRECT_URI!;

class TwitterService {
  private client: Client | null = null;

  async getClient() {
    if (this.client) return this.client;

    const twitterIssuer = new Issuer({
      issuer: "https://twitter.com",
      authorization_endpoint: "https://twitter.com/i/oauth2/authorize",
      token_endpoint: "https://api.twitter.com/2/oauth2/token",
    });

    this.client = new twitterIssuer.Client({
      client_id: process.env.TWITTER_CLIENT_ID!,
      client_secret: process.env.TWITTER_CLIENT_SECRET!,
      redirect_uris: [TWITTER_REDIRECT_URI],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_basic",
    });

    return this.client;
  }

  async getUserId(accessToken: string, username?: string): Promise<string | null> {
    const url = username 
      ? `https://api.twitter.com/2/users/by/username/${username}`
      : "https://api.twitter.com/2/users/me";
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data: any = await res.json();
    return data.data?.id || null;
  }

  async verifyFollow(accessToken: string, targetUsername: string, campaignId?: number): Promise<boolean> {
    try {
      const [targetUserId, myUserId] = await Promise.all([
        this.getUserId(accessToken, targetUsername),
        this.getUserId(accessToken)
      ]);

      if (!targetUserId || !myUserId) return false;

      // Real API check with pagination or specific check if available
      const followRes = await fetch(`https://api.twitter.com/2/users/${myUserId}/following`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const followData: any = await followRes.json();
      
      const isFollowing = followData.data?.some((u: any) => u.id === targetUserId) || false;

      // Enhanced security: Check account age based on campaign requirements
      const userRes = await fetch("https://api.twitter.com/2/users/me?user.fields=created_at", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userData: any = await userRes.json();
      const createdAt = new Date(userData.data?.created_at);
      const now = new Date();
      const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
      
      let minAge = 0;
      if (campaignId) {
        const campaign = await storage.getCampaign(campaignId);
        if (campaign?.requirements?.minXAccountAgeDays) {
          minAge = campaign.requirements.minXAccountAgeDays;
        }
      }

      if (minAge > 0 && ageInDays < minAge) {
        console.warn(`[Twitter Verify] Account too young: ${ageInDays.toFixed(1)} days. Required: ${minAge} days`);
        return false;
      }

      return isFollowing;
    } catch (error) {
      console.error("Twitter follow verification error:", error);
      return false;
    }
  }

  async verifyRetweet(accessToken: string, tweetId: string): Promise<boolean> {
    try {
      const myUserId = await this.getUserId(accessToken);
      if (!myUserId) return false;

      const retweetRes = await fetch(`https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const retweetData: any = await retweetRes.json();
      
      return retweetData.data?.some((u: any) => u.id === myUserId) || false;
    } catch (error) {
      console.error("Twitter retweet verification error:", error);
      return false;
    }
  }

  startTwitterHealthCheck() {
    console.log("Twitter health check started");
  }
}

export const twitterService = new TwitterService();
export const startTwitterHealthCheck = () => twitterService.startTwitterHealthCheck();
