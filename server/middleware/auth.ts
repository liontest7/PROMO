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
