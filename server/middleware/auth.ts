import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const walletAddress = req.headers['x-wallet-address'] || req.body?.walletAddress;
  if (walletAddress && typeof walletAddress === 'string') {
    const user = await storage.getUserByWallet(walletAddress);
    
    // Attach user to request for downstream middlewares
    (req as any).user = user;

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
    if (walletAddress && typeof clientIp === 'string' && clientIp !== "unknown" && clientIp !== "::1" && clientIp !== "127.0.0.1") {
      await storage.logIpWalletAssociation(clientIp, walletAddress);
    }
  }
  next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}
