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
  if (!ip || ip === '::1' || ip === '127.0.0.1') return true; // Skip local for testing
  
  const associatedWallets = await storage.getWalletsByIp(ip);
  
  // Strict limit: Max 3 wallets per IP to prevent sybil attacks
  if (associatedWallets.length >= 3 && !associatedWallets.includes(walletAddress)) {
    console.warn(`[Anti-Fraud] Blocked wallet ${walletAddress} from IP ${ip} (Already has ${associatedWallets.length} wallets)`);
    return false;
  }
  
  await storage.logIpWalletAssociation(ip, walletAddress);
  return true;
}
