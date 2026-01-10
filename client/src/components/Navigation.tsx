import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Coins, 
  Wallet, 
  LogOut, 
  ExternalLink, 
  Trophy, 
  Twitter, 
  Send, 
  ShieldCheck,
  ChevronDown,
  ShieldAlert,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SiJupyter } from "react-icons/si";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_CONFIG } from "@shared/config";

export function Navigation() {
  const [location] = useLocation();
  const { isConnected, role, walletAddress, disconnect, connect } = useWallet();
  const { user, isAuthenticated, logout } = useAuth();

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: any }) => (
    <Link href={href} className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg text-[15px] font-bold transition-all duration-200",
      location === href 
        ? "bg-primary/15 text-white border border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
        : "text-white/80 hover:text-white hover:bg-white/10"
    )}>
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );

  return (
    <nav className="border-b border-white/5 bg-background/80 backdrop-blur-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group cursor-pointer">
            <div className="w-16 h-16 overflow-visible">
              <img src={PLATFORM_CONFIG.ASSETS.MAIN_LOGO} alt="Logo" className="w-full h-full object-contain scale-125 group-hover:scale-150 transition-transform duration-500" />
            </div>
            <span className="font-display font-black text-3xl tracking-tighter bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-500 origin-left uppercase">
              {PLATFORM_CONFIG.TOKEN_SYMBOL}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink href="/earn" icon={Coins}>Earn Rewards</NavLink>
            
            {isConnected && role === "user" && (
              <NavLink href="/dashboard" icon={Trophy}>My Dashboard</NavLink>
            )}
            
            {isConnected && role === "advertiser" && (
              <NavLink href="/advertiser" icon={LayoutDashboard}>Admin Console</NavLink>
            )}
            {isConnected && role === "admin" && (
              <NavLink href="/admin" icon={ShieldAlert}>Admin Panel</NavLink>
            )}
            <div className="ml-1 flex items-center gap-3">
              <NavLink href="/about" icon={ShieldCheck}>About Us</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 mr-4 pr-4 border-r border-white/10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="default" 
                    className="px-4 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all gap-2 group"
                  >
                    <span className="text-xs font-black uppercase tracking-widest">Buy ${PLATFORM_CONFIG.TOKEN_SYMBOL}</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-card border-white/10 bg-background/95 backdrop-blur-xl">
                  <div className="p-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-white/5 mb-1">
                    Buy ${PLATFORM_CONFIG.TOKEN_SYMBOL} on DEX
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <a href={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.PUMP_FUN} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full py-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img src={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.PUMP_FUN_LOGO} className="w-full h-full object-cover" alt="Pump.fun" />
                      </div>
                      <span className="text-sm font-bold">Pump.fun</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <a href={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.DEX_SCREENER} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full py-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden p-1">
                        <img src="https://dexscreener.com/favicon.png" className="w-full h-full object-contain" alt="DexScreener" />
                      </div>
                      <span className="text-sm font-bold">DEXScreener</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <a href={PLATFORM_CONFIG.TOKEN_DETAILS.BUY_LINKS.JUPITER} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full py-2">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden p-1">
                        <img src="https://jup.ag/svg/jupiter-logo.svg" className="w-full h-full object-contain" alt="Jupiter" />
                      </div>
                      <span className="text-sm font-bold">Jupiter</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Social Links */}
            <div className="hidden lg:flex items-center gap-3 mr-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/10 text-white/80 hover:text-blue-400 transition-colors shadow-lg shadow-black/20"
                asChild
                data-testid="nav-link-twitter"
              >
                <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-10 h-10 rounded-full border border-white/10 hover:bg-white/10 text-white/80 hover:text-blue-500 transition-colors shadow-lg shadow-black/20"
                asChild
                data-testid="nav-link-telegram"
              >
                <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer">
                  <Send className="w-5 h-5" />
                </a>
              </Button>
            </div>

            {/* User Wallet Info */}
            {isConnected ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{role}</span>
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
              <Button 
                onClick={() => connect('user')}
                className="bg-primary text-primary-foreground font-black text-[14px] hover:bg-primary/90 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all h-10 px-6 rounded-xl uppercase tracking-tight"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
