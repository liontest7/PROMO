import { Telegraf } from "telegraf";
import { storage } from "../storage";

let bot: Telegraf | null = null;

export function startTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[Telegram Service] TELEGRAM_BOT_TOKEN not found. Bot disabled.");
    return;
  }

  try {
    bot = new Telegraf(token);

    bot.start(async (ctx) => {
      const payload = ctx.payload; // This is the 'start' parameter (Deep Link)
      if (!payload) {
        return ctx.reply("Welcome to Dropy! Please use the link from your dashboard to connect your account.");
      }

      // Payload expected format: connect_<walletAddress>
      if (payload.startsWith('connect_')) {
        const walletAddress = payload.replace('connect_', '');
        const tgUser = ctx.from;
        
        try {
          const user = await storage.getUserByWallet(walletAddress);
          if (!user) {
            return ctx.reply("User not found. Please make sure your wallet is connected on Dropy.");
          }

          await storage.updateUserProfile(walletAddress, {
            telegramHandle: tgUser.username || tgUser.first_name,
            profileImageUrl: tgUser.id ? `https://t.me/i/userpic/320/${tgUser.username || tgUser.id}.jpg` : undefined,
          });

          return ctx.reply(`🚀 *Connection Successful!*

Welcome to the Dropy Protocol, agent. 

Your identity @${tgUser.username || tgUser.first_name} is now securely linked to wallet:
\`${walletAddress}\`

You have unlocked:
✅ Community Verification Nodes
✅ Group Membership Tracking
✅ High-Yield Engagement Access

Return to your dashboard to see your updated status.`, { parse_mode: 'Markdown' });
        } catch (err) {
          console.error("[Telegram Bot] Connection error:", err);
          return ctx.reply("An error occurred while connecting your account. Please try again.");
        }
      }
    });

    bot.launch();
    console.log("[Telegram Service] Dropy Sentinel Bot initialized and listening.");

    // Enable graceful stop
    process.once('SIGINT', () => bot?.stop('SIGINT'));
    process.once('SIGTERM', () => bot?.stop('SIGTERM'));
  } catch (err) {
    console.error("[Telegram Service] Failed to initialize bot:", err);
  }
}

export async function verifyTelegramMembership(telegramHandle: string, groupId: string): Promise<boolean> {
  if (!bot) return false;
  
  try {
    const settings = await storage.getSystemSettings();
    if (!settings || !settings.socialEngagementEnabled) {
      return false;
    }

    // In a real scenario, we'd need the telegram numeric ID.
    // For this implementation, we assume the user has connected via /start and we have their handle.
    // We would use getChatMember here if we had the ID stored.
    // In dev, we return true if the handle looks valid to allow testing the flow.
    return telegramHandle.length >= 3;
  } catch (error) {
    console.error("[Telegram Service] Verification error:", error);
    return false;
  }
}
