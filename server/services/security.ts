import fetch from "node-fetch";
import { storage } from "../storage";

export async function verifyTurnstile(token: string) {
  const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const verifyRes = await fetch(verifyUrl, {
    method: "POST",
    body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const verifyJson = await verifyRes.json() as { success: boolean };
  return verifyJson.success;
}

export async function checkIpFraud(ip: string, walletAddress: string) {
  // Ignore local/unknown IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'unknown') return true; 
  
  const associatedWallets = await storage.getWalletsByIp(ip);
  
  // Strict limit: Max 2 wallets per IP to prevent sybil attacks
  if (associatedWallets.includes(walletAddress)) return true;

  if (associatedWallets.length >= 2) {
    console.warn(`[Anti-Fraud] Blocked wallet ${walletAddress} from IP ${ip} (Already has ${associatedWallets.length} wallets)`);
    
    // Penalize reputation for multi-wallet attempts
    const user = await storage.getUserByWallet(walletAddress);
    if (user) {
      await storage.updateUserReputation(user.id, Math.max(0, (user.reputationScore || 0) - 50));
    }
    return false;
  }
  
  await storage.logIpWalletAssociation(ip, walletAddress);
  return true;
}

export async function detectSuspiciousActivity(userId: number, actionType: string) {
  const user = await storage.getUser(userId);
  if (!user) return;

  // Logic to detect rapid-fire claims or other suspicious patterns
  const recentExecutions = await storage.getExecutionsByUser(userId);
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  
  const rapidClaims = recentExecutions.filter(e => 
    e.createdAt && new Date(e.createdAt) > oneMinuteAgo
  ).length;

  if (rapidClaims > 10) {
    await storage.updateUserReputation(userId, Math.max(0, (user.reputationScore || 0) - 20));
    await storage.createLog({
      level: "warn",
      source: "SECURITY",
      message: `Suspicious activity detected for user ${userId}: ${rapidClaims} claims in 1 minute`,
      details: { userId, rapidClaims, actionType }
    });
  }
}
