import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
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
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiJupyter } from "react-icons/si";

export function Navigation() {
  const [location] = useLocation();
  const { isConnected, role, walletAddress, disconnect, connect } = useWallet();

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: any }) => (
    <Link href={href} className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
      location === href 
        ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]" 
        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    )}>
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  );

  return (
    <nav className="border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all">
              <Coins className="text-white w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {APP_CONFIG.platformName}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink href="/earn" icon={Coins}>Earn</NavLink>
            
            {isConnected && role === "user" && (
              <NavLink href="/dashboard" icon={Trophy}>Dashboard</NavLink>
            )}
            
            {isConnected && role === "advertiser" && (
              <NavLink href="/advertiser" icon={LayoutDashboard}>Campaigns</NavLink>
            )}
            <div className="ml-auto flex items-center gap-2">
              <NavLink href="/about" icon={ShieldCheck}>About</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 mr-4 pr-4 border-r border-white/10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-4 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all gap-2 group"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">Buy {APP_CONFIG.token.symbol}</span>
                    <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-card border-white/10 bg-background/95 backdrop-blur-xl">
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <a href={APP_CONFIG.token.buyLinks.pumpFun} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full py-2">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <Coins className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium">Pump.fun</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <a href={APP_CONFIG.token.buyLinks.dexScanner} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full py-2">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <Coins className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium">DEXScreener</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 focus:text-primary">
                    <a href={APP_CONFIG.token.buyLinks.jupiter} target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full py-2">
                      <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                        <SiJupyter className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium">Jupiter</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{role}</span>
                  <span className="text-sm font-mono text-primary font-bold">
                    {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={disconnect}
                  className="border-white/10 hover:bg-white/5 hover:border-white/20 hover:text-destructive h-9"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => connect('user')}
                className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all h-9"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
