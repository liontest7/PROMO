import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import {
  Coins,
  Wallet,
  LogOut,
  ExternalLink,
  Trophy,
  ShieldCheck,
  Send,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FaXTwitter } from "react-icons/fa6";
import { PLATFORM_CONFIG } from "@shared/config";

export function Navigation() {
  const [location] = useLocation();
  const { isConnected, role, walletAddress, disconnect, connect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [buyMenuOpen, setBuyMenuOpen] = useState(false);
  const buyMenuTimeout = useRef<number | null>(null);

  const openBuyMenu = () => {
    if (buyMenuTimeout.current) {
      clearTimeout(buyMenuTimeout.current);
      buyMenuTimeout.current = null;
    }
    setBuyMenuOpen(true);
  };

  const closeBuyMenu = () => {
    if (buyMenuTimeout.current) clearTimeout(buyMenuTimeout.current);
    buyMenuTimeout.current = window.setTimeout(() => {
      setBuyMenuOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (buyMenuTimeout.current) clearTimeout(buyMenuTimeout.current);
    };
  }, []);

  const handleConnect = async (roleType: "user") => {
    setIsConnecting(true);
    try {
      await connect(roleType);
    } finally {
      setIsConnecting(false);
    }
  };

  const NavLink = ({
    href,
    children,
    icon: Icon,
  }: {
    href: string;
    children: React.ReactNode;
    icon: any;
  }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-[15px] font-bold transition-all duration-200",
        location === href
          ? "bg-primary/15 text-white border border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          : "text-white hover:text-white hover:bg-white/10",
      )}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );

  return (
    <nav className="border-b border-white/5 bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-16 h-16 overflow-visible flex items-center justify-center">
              <img
                src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO}
                alt="Dropy Logo"
                className="w-full h-full object-contain scale-125 group-hover:scale-150 transition-transform duration-500"
              />
            </div>
            <span className="font-display font-black text-3xl tracking-tighter bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500 origin-left uppercase">
              Dropy
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <NavLink href="/earn" icon={Coins}>
              Earn Rewards
            </NavLink>
            <NavLink href="/about" icon={ShieldCheck}>
              About Us
            </NavLink>
            {isConnected && (
              <NavLink href="/dashboard" icon={UserIcon}>
                My Dashboard
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Buy Menu */}
            <div
              className="relative hidden lg:flex items-center gap-3 mr-2 lg:mr-4 pr-2 lg:pr-4 border-r border-white/10"
              onMouseEnter={openBuyMenu}
              onMouseLeave={closeBuyMenu}
            >
              <Button
                variant="ghost"
                size="default"
                className="px-4 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all gap-2 group"
              >
                <span className="text-xs font-black uppercase tracking-widest">
                  Buy ${PLATFORM_CONFIG.TOKEN_SYMBOL}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    buyMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {buyMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-black border border-white/10 z-50 rounded-lg shadow-lg">
                  <div className="p-2 text-[10px] font-black uppercase text-white tracking-widest border-b border-white/5 mb-1">
                    Buy ${PLATFORM_CONFIG.TOKEN_SYMBOL} on DEX
                  </div>

                  <a
                    href={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.PUMP_FUN}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 w-full py-2 px-2 cursor-pointer hover:bg-primary/10 rounded"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.PUMP_FUN_LOGO
                        }
                        className="w-full h-full object-cover"
                        alt="Pump.fun"
                      />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Pump.fun
                    </span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>

                  <a
                    href={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.DEX_SCREENER}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 w-full py-2 px-2 cursor-pointer hover:bg-primary/10 rounded"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden p-1">
                      <img
                        src="https://dexscreener.com/favicon.png"
                        className="w-full h-full object-contain"
                        alt="DexScreener"
                      />
                    </div>
                    <span className="text-sm font-bold text-white">
                      DEXScreener
                    </span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>

                  <a
                    href={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 w-full py-2 px-2 cursor-pointer hover:bg-primary/10 rounded"
                  >
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden p-1">
                      <img
                        src="https://jup.ag/svg/jupiter-logo.svg"
                        className="w-full h-full object-contain"
                        alt="Jupiter"
                      />
                    </div>
                    <span className="text-sm font-bold text-white">
                      Jupiter
                    </span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                </div>
              )}
            </div>

            {/* Social + Wallet */}
            <div className="hidden lg:flex items-center gap-3 mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full border border-white/10 text-white hover:text-white hover:bg-white/5 transition-all shadow-lg shadow-black/20"
                asChild
                title="Leaderboard"
              >
                <Link href="/leaderboard">
                  <Trophy className="w-5 h-5" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/10 text-white hover:text-primary transition-colors shadow-lg shadow-black/20"
                asChild
              >
                <a
                  href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaXTwitter className="w-4 h-4" />
                </a>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/10 text-white hover:text-blue-400 transition-colors shadow-lg shadow-black/20"
                asChild
              >
                <a
                  href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Send className="w-5 h-5" />
                </a>
              </Button>
            </div>

            {/* Wallet Connect / Logout */}
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                      role === "admin" || role === "superadmin"
                        ? "text-primary"
                        : "text-white",
                    )}
                  >
                    {role}
                  </span>
                  <span className="text-[14px] font-mono text-primary font-black leading-none">
                    {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={disconnect}
                  className="border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-destructive h-10 px-4 shadow-lg shadow-black/20"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleConnect("user")}
                  disabled={isConnecting}
                  className="bg-primary text-primary-foreground font-black text-[14px] hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all h-10 px-6 rounded-xl uppercase tracking-tight"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
