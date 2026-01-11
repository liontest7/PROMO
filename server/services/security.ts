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
  const associatedWallets = await storage.getWalletsByIp(ip || 'unknown');
  if (associatedWallets.length > 5 && !associatedWallets.includes(walletAddress)) {
    return false;
  }
  await storage.logIpWalletAssociation(ip || 'unknown', walletAddress);
  return true;
}
