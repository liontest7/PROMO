import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const walletAddress = (req.headers['x-wallet-address'] as string) || 
                       (req.headers['wallet-address'] as string) ||
                       req.body?.walletAddress || 
                       req.body?.wallet ||
                       (req.query?.walletAddress as string) ||
                       (req.query?.wallet as string);
  
  if (walletAddress && typeof walletAddress === 'string') {
    const user = await storage.getUserByWallet(walletAddress);
    (req as any).user = user;

    if (user?.status === 'blocked') {
      return res.status(403).json({ status: 'blocked', message: "Account blocked" });
    }
    if (user?.status === 'suspended') {
      return res.status(403).json({ status: 'suspended', message: "Account suspended" });
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
