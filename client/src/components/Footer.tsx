import { Link } from "wouter";
import { PLATFORM_CONFIG } from "@shared/config";
import { 
  Twitter, 
  Send, 
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: "Earn Rewards", href: "/earn" },
      { label: "About Us", href: "/about" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    resources: [
      { label: "Jupiter Exchange", href: PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER, isExternal: true },
      { label: "DexScreener", href: PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.DEX_SCREENER, isExternal: true },
      { label: "Pump.fun", href: PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.PUMP_FUN, isExternal: true },
    ]
  };

  return (
    <footer className="relative bg-background pt-16 pb-8 overflow-hidden border-t border-white/5" data-testid="footer-main">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-4">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-colors" />
                <img 
                  src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} 
                  alt="Logo" 
                  className="w-full h-full object-contain relative transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <span className="font-display font-black text-4xl tracking-tighter text-white uppercase italic">
                {PLATFORM_CONFIG.TOKEN_SYMBOL}
              </span>
            </Link>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md font-medium">
              The premier Pay-Per-Action engine for the Solana ecosystem. 
              Bridging projects and users through decentralized engagement and verifiable rewards.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="w-10 h-10 rounded-full bg-white/5 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-lg shadow-black/20"
                asChild
              >
                <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-10 h-10 rounded-full bg-white/5 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-lg shadow-black/20"
                asChild
              >
                <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer">
                  <Send className="w-4 h-4" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-10 h-10 rounded-full bg-white/5 border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-lg shadow-black/20"
                asChild
              >
                <a href={`mailto:hello@${PLATFORM_CONFIG.TOKEN_SYMBOL.toLowerCase()}.com`} target="_blank" rel="noreferrer">
                  <Mail className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8">
            <div className="lg:pl-12">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">
                Platform
              </h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:pl-12">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors text-sm font-bold"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[13px] text-muted-foreground font-medium flex items-center gap-2">
              © {currentYear} {PLATFORM_CONFIG.TOKEN_SYMBOL} INC.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              Solana Mainnet-Beta
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-black text-white/50 group-hover:text-primary transition-colors uppercase tracking-[0.15em]">System Operational</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <a href="#" className="text-[11px] text-muted-foreground/60 hover:text-white transition-colors uppercase tracking-widest font-black">Privacy & Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
