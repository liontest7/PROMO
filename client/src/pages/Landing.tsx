import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Rocket, Coins, ShieldCheck, ArrowRight, Users, Search, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { APP_CONFIG } from "@/config";
import { PLATFORM_CONFIG } from "@shared/config";

function Footer() {
  return (
    <footer className="py-16 bg-black border-t border-white/5" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src={APP_CONFIG.assets.logo} alt="Logo" className="w-10 h-10" />
              <span className="font-display font-black text-2xl tracking-tighter">MEMEDROP</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs font-medium uppercase tracking-widest leading-loose">
              The leading Pay-Per-Action platform for the Solana ecosystem.
            </p>
          </div>
          <div className="flex justify-center gap-12 font-black text-xs uppercase tracking-tighter">
            <Link href="/earn" className="hover:text-primary transition-all" data-testid="footer-link-explore">Explore</Link>
            <Link href="/about" className="hover:text-primary transition-all" data-testid="footer-link-about">About</Link>
            <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer" className="hover:text-primary transition-all" data-testid="footer-link-twitter">Twitter</a>
            <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="hover:text-primary transition-all" data-testid="footer-link-telegram">Telegram</a>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-xs text-muted-foreground font-bold">© 2026 MEMEDROP INC.</p>
            <p className="text-[10px] text-muted-foreground/50">BUILDING ON SOLANA MAINNET-BETA</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function EarnContentOnly() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { isConnected } = useWallet();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[300px] rounded-2xl border border-white/5 bg-white/5 p-6">
            <Skeleton className="h-8 w-3/4 mb-4 bg-white/10" />
            <Skeleton className="h-4 w-full mb-2 bg-white/10" />
            <Skeleton className="h-10 w-full mt-auto bg-white/10 rounded-lg" />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {campaigns?.slice(0, 3).map((campaign) => (
        <CampaignCard 
          key={campaign.id} 
          campaign={campaign} 
          onActionClick={() => {
            if (!isConnected) {
              toast({
                title: "Connection Required",
                description: "Please connect your wallet to participate.",
                variant: "destructive"
              });
            }
          }}
        />
      ))}
    </>
  );
}

export default function Landing() {
  const { connect } = useWallet();
  const { data: campaigns } = useCampaigns();
  const { data: stats } = useQuery({
    queryKey: ["/api/stats/global"],
    queryFn: async () => {
      const res = await fetch("/api/stats/global");
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <header>
        <title>MemeDrop - The #1 Solana Marketing Platform</title>
        <meta name="description" content="Connect, complete tasks, and earn crypto rewards instantly on Solana. The premier engagement platform for real users and authentic growth." />
      </header>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6 uppercase tracking-widest">
              Live on Solana
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-gray-600 bg-clip-text text-transparent">
              Earn Crypto for <br />
              <span className="text-primary neon-text italic">Real Actions</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              MemeDrop is the ultimate engagement platform. Participate in top-tier Solana projects and get paid in native tokens for social tasks and holder verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/earn">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-primary text-primary-foreground font-black hover:bg-primary/90 shadow-2xl transition-all"
                  data-testid="button-start-earning"
                >
                  START EARNING <Coins className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-white/10 hover:bg-white/5 font-black uppercase"
                onClick={() => connect('advertiser')}
                data-testid="button-launch-project"
              >
                Launch Project <Rocket className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Global Stats - Updated UI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
              {[
                { label: "Active Campaigns", value: stats?.activeCampaigns || "0" },
                { label: "Community Members", value: stats?.totalUsers || "1,240" },
                { label: "Verified Projects", value: stats?.totalVerifiedProjects || "0" },
                { label: "Rewards Paid (Tokens)", value: stats ? stats.totalPaid : "450k" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-primary/30 transition-all flex flex-col justify-center min-h-[100px]">
                  <h3 className="text-xl md:text-3xl font-display font-black text-white mb-1 tracking-tighter">{stat.value}</h3>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Campaigns Section - MOVED UP AS REQUESTED */}
      <section className="py-24 border-y border-white/5 bg-black/20" data-testid="section-active-campaigns">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold mb-2">Active Campaigns</h2>
              <p className="text-muted-foreground">Join these top-tier projects and start earning rewards today.</p>
            </div>
            <Link href="/earn">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 group font-bold" data-testid="button-view-all">
                View All Projects <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EarnContentOnly />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[40px] p-8 md:p-16 border border-white/10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-display font-bold mb-8 tracking-tighter italic">Built for the ${PLATFORM_CONFIG.TOKEN_SYMBOL} Ecosystem</h2>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  Our native token powers the entire platform. Every campaign created burns <strong>{PLATFORM_CONFIG.BURN_AMOUNT.toLocaleString()} ${PLATFORM_CONFIG.TOKEN_SYMBOL}</strong>, making it deflationary and rewarding long-term holders.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-3xl font-black text-primary">0%</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Platform Fees</p>
                  </div>
                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-3xl font-black text-secondary">BURN</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">{PLATFORM_CONFIG.BURN_AMOUNT.toLocaleString()} Tokens/Project</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center relative">
                <div className="w-64 h-64 rounded-full bg-primary/20 flex items-center justify-center border-8 border-primary/10 animate-pulse">
                  <img src={APP_CONFIG.assets.logo} alt="Token" className="w-32 h-32 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Updated CTA Section */}
      <section className="py-32 border-t border-white/5" data-testid="section-social-cta">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-5xl font-display font-black tracking-tighter italic uppercase underline decoration-primary decoration-4 underline-offset-8">Follow Our Community</h2>
            <p className="text-xl text-muted-foreground">Join thousands of users and get the latest updates on new high-reward campaigns.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button size="lg" className="h-16 px-12 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-500/20" asChild data-testid="link-telegram">
                <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer">JOIN TELEGRAM</a>
              </Button>
              <Button size="lg" className="h-16 px-12 bg-white text-black hover:bg-gray-100 font-black text-xl rounded-2xl shadow-xl" asChild data-testid="link-twitter">
                <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer">FOLLOW TWITTER (X)</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Clean Footer */}
      <Footer />
    </div>
  );
}
