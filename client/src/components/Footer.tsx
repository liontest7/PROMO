import { Link } from "wouter";
import { PLATFORM_CONFIG } from "@shared/config";
import { useWallet } from "@/hooks/use-wallet";
import { ShieldCheck, Send, Mail, ArrowUpRight, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isConnected, role } = useWallet();

  const footerLinks = {
    platform: [
      { label: "Earn Rewards", href: "/earn" },
      { label: "About Us", href: "/about" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    community: [
      {
        label: "X (Twitter)",
        href: PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER,
        isExternal: true,
        icon: ShieldCheck,
      },
      {
        label: "Telegram",
        href: PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM,
        isExternal: true,
        icon: Send,
      },
    ],
    resources: [
      {
        label: "Jupiter Exchange",
        href: PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER,
        isExternal: true,
      },
      {
        label: "DexScreener",
        href: PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.DEX_SCREENER,
        isExternal: true,
      },
      {
        label: "Pump.fun",
        href: PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.PUMP_FUN,
        isExternal: true,
      },
    ],
  };

  return (
    <footer
      className="relative bg-background pt-12 pb-6 overflow-hidden border-t border-white/5"
      data-testid="footer-main"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <Link
              href="/"
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-16 h-16 overflow-visible relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-colors" />
                <img
                  src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO}
                  alt="Logo"
                  className="w-full h-full object-contain scale-125 relative transition-transform duration-500 group-hover:scale-150"
                />
              </div>
              <span className="font-display font-black text-3xl tracking-tighter bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500 origin-left uppercase italic pr-4">
                {PLATFORM_CONFIG.TOKEN_SYMBOL}
              </span>
            </Link>

            <p className="text-muted-foreground text-[14px] leading-relaxed max-w-sm font-medium">
              The premier Pay-Per-Action engine for the Solana ecosystem.
              Bridging projects and users through decentralized engagement and
              verifiable rewards.
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Platform
              </h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
                    >
                      <ChevronRight className="w-3 h-3 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                {isConnected &&
                  ((role as any) === "admin" ||
                    (role as any) === "superadmin") && (
                    <li>
                      <Link
                        href="/admin"
                        className="group flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
                      >
                        <ChevronRight className="w-3 h-3 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        Admin Panel
                      </Link>
                    </li>
                  )}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Community
              </h4>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
                    >
                      <ChevronRight className="w-3 h-3 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 ml-1 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
                    >
                      <ChevronRight className="w-3 h-3 mr-1 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 ml-1 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5 mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-[12px] text-muted-foreground font-medium">
              © {currentYear} {PLATFORM_CONFIG.TOKEN_SYMBOL} Platform.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5">
              <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              Solana Mainnet-Beta
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_2px_rgba(34,197,94,0.3)]" />
              <span className="text-[10px] font-black text-primary transition-colors uppercase tracking-[0.15em] opacity-60 group-hover:opacity-100 transition-opacity">
                System Operational
              </span>
            </div>
            <div className="hidden sm:block w-px h-3 bg-white/10" />
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="text-[10px] text-white/70 hover:text-primary transition-colors uppercase tracking-[0.15em] font-black"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[10px] text-white/70 hover:text-primary transition-colors uppercase tracking-[0.15em] font-black"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
