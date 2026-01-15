import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const walletAddress = req.headers['x-wallet-address'] || req.body?.walletAddress;
  if (walletAddress && typeof walletAddress === 'string') {
    const user = await storage.getUserByWallet(walletAddress);
    if (user?.status === 'blocked') {
      return res.status(403).json({ 
        status: 'blocked',
        message: "Your account is permanently blocked for security reasons." 
      });
    }
    if (user?.status === 'suspended') {
      return res.status(403).json({ 
        status: 'suspended',
        message: "Your account is temporarily suspended for review. Please check back later." 
      });
    }

    // IP-Wallet association for anti-fraud
    const clientIp = (req.headers['x-forwarded-for'] as string || req.ip || req.socket.remoteAddress || "unknown").split(',')[0].trim();
    if (walletAddress && typeof clientIp === 'string' && clientIp !== "unknown") {
      await storage.logIpWalletAssociation(clientIp, walletAddress);
      
      const walletsOnIp = await storage.getWalletsByIp(clientIp);
      if (walletsOnIp.length > 3) {
        console.warn(`[Anti-Fraud] IP ${clientIp} has ${walletsOnIp.length} wallets associated:`, walletsOnIp);
        // Optional: Auto-flag or suspend if it exceeds a threshold
      }
    }

    // Branding update
    const originalSend = res.send;
    res.send = function(body) {
      if (typeof body === 'string') {
        body = body.replace(/Dropy/g, 'Dropy');
      }
      return originalSend.call(this, body);
    };
  }
  next();
}
