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
  
  // Strict limit: Max 5 wallets per IP to prevent sybil attacks
  // Optimization: Early exit if wallet is already associated
  if (associatedWallets.includes(walletAddress)) return true;

  if (associatedWallets.length >= 5) {
    console.warn(`[Anti-Fraud] Blocked wallet ${walletAddress} from IP ${ip} (Already has ${associatedWallets.length} wallets)`);
    return false;
  }
  
  await storage.logIpWalletAssociation(ip, walletAddress);
  return true;
}
