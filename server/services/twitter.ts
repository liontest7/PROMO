import fetch from "node-fetch";
import { storage } from "../storage";

// Optimized Twitter verification service with reusable ID fetching
async function getUserId(accessToken: string, username?: string): Promise<string | null> {
  const url = username 
    ? `https://api.twitter.com/2/users/by/username/${username}`
    : "https://api.twitter.com/2/users/me";
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data: any = await res.json();
  return data.data?.id || null;
}

// Background Health Check and Auto-Reconnection logic
export function startTwitterHealthCheck() {
  console.log("[Twitter Service] Initializing health monitor...");
  
  const checkHealth = async () => {
    try {
      const settings = await storage.getSystemSettings();
      
      // Use X_BEARER_TOKEN from secrets directly if configured
      const bearerToken = process.env.X_BEARER_TOKEN;
      
      if (!bearerToken) {
        console.warn("[Twitter Service] X_BEARER_TOKEN not found in environment");
        if (settings.twitterApiStatus !== 'disconnected') {
          await storage.updateSystemSettings({ twitterApiStatus: 'disconnected' });
        }
        return;
      }

      // Simple verification test
      const res = await fetch("https://api.twitter.com/2/users/by/username/Twitter", {
        headers: { Authorization: `Bearer ${bearerToken}` }
      });
      
      const isOperational = res.ok;
      const newStatus = isOperational ? 'active' : 'degraded';
      
      if (settings.twitterApiStatus !== newStatus) {
        console.log(`[Twitter Service] Status changed: ${settings.twitterApiStatus} -> ${newStatus}`);
        await storage.updateSystemSettings({ twitterApiStatus: newStatus });
      }

      // Fallback logic if degraded
      if (!isOperational && settings.twitterApiKeys?.backup?.apiKey) {
        console.warn("[Twitter Service] Primary API failing, consider switching to backup...");
        // In a real scenario, we might automatically rotate keys here
      }

    } catch (error) {
      console.error("[Twitter Service] Health check failed:", error);
      await storage.updateSystemSettings({ twitterApiStatus: 'error' });
    }
  };

  // Run every 5 minutes
  setInterval(checkHealth, 5 * 60 * 1000);
  checkHealth(); // Initial run
}

export async function verifyTwitterFollow(accessToken: string, targetUsername: string): Promise<boolean> {
  try {
    const [targetUserId, myUserId] = await Promise.all([
      getUserId(accessToken, targetUsername),
      getUserId(accessToken)
    ]);

    if (!targetUserId || !myUserId) return false;

    const followRes = await fetch(`https://api.twitter.com/2/users/${myUserId}/following`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const followData: any = await followRes.json();
    
    return followData.data?.some((u: any) => u.id === targetUserId) || false;
  } catch (error) {
    console.error("Twitter follow verification error:", error);
    return false;
  }
}

export async function verifyTwitterRetweet(accessToken: string, tweetId: string): Promise<boolean> {
  try {
    const myUserId = await getUserId(accessToken);
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
