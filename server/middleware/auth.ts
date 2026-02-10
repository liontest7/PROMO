import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionWallet = (req.session as any)?.walletAddress as string | undefined;
  if (!sessionWallet) {
    return next();
  }

  const user = await storage.getUserByWallet(sessionWallet);
  (req as any).user = user;

  if (user?.status === "blocked") {
    return res.status(403).json({ status: "blocked", message: "Account blocked" });
  }
  if (user?.status === "suspended") {
    return res.status(403).json({ status: "suspended", message: "Account suspended" });
  }

  return next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  return next();
}
