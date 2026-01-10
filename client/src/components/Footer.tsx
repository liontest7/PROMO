import { Link } from "wouter";
import { PLATFORM_CONFIG } from "@shared/config";

export function Footer() {
  return (
    <footer className="py-16 bg-black border-t border-white/5" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} alt="Logo" className="w-10 h-10 object-contain" />
              <span className="font-display font-black text-2xl tracking-tighter text-white">MEMEDROP</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs font-medium uppercase tracking-widest leading-loose">
              The leading Pay-Per-Action platform for the Solana ecosystem.
            </p>
          </div>
          <div className="flex justify-center gap-12 font-black text-xs uppercase tracking-tighter">
            <Link href="/earn" className="hover:text-primary transition-all text-white/70 hover:text-white" data-testid="footer-link-explore">Explore</Link>
            <Link href="/about" className="hover:text-primary transition-all text-white/70 hover:text-white" data-testid="footer-link-about">About</Link>
            <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer" className="hover:text-primary transition-all text-white/70 hover:text-white" data-testid="footer-link-twitter">Twitter</a>
            <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="hover:text-primary transition-all text-white/70 hover:text-white" data-testid="footer-link-telegram">Telegram</a>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-xs text-muted-foreground font-bold text-white/40">© 2026 MEMEDROP INC.</p>
            <p className="text-[10px] text-muted-foreground/30 uppercase tracking-widest font-black">Building on Solana Mainnet-Beta</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
