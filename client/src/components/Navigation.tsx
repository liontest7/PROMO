import { Link, useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Coins, Wallet, LogOut, ExternalLink, Trophy, Twitter, Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config";

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

          {/* Wallet Connection & Socials */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 mr-4 pr-4 border-r border-white/10 text-muted-foreground">
              <a href={APP_CONFIG.socials.twitter} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={APP_CONFIG.socials.telegram} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                <Send className="w-5 h-5" />
              </a>
              <div className="flex items-center gap-2">
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm" 
                  className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 h-7"
                >
                  <a href={APP_CONFIG.token.buyLinks.pumpFun} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">BUY {APP_CONFIG.token.symbol}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{role}</span>
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
