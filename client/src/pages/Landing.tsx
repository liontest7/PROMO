import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Rocket, Coins, ShieldCheck, ArrowRight, Users, Search, Zap, Send, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useCampaigns } from "@/hooks/use-campaigns";
import { CampaignCard } from "@/components/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { PLATFORM_CONFIG } from "@shared/config";
import { AirdropAnimation } from "@/components/AirdropAnimation";

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
    <div className="min-h-screen bg-background text-foreground relative">
      <header>
        <title>{PLATFORM_CONFIG.TOKEN_SYMBOL} - The #1 Solana Marketing Platform</title>
        <meta name="description" content={`Connect, complete tasks, and earn crypto rewards instantly on Solana. The premier engagement platform for real users and authentic growth.`} />
      </header>
      
      <div className="sticky top-0 z-50 w-full">
        <Navigation />
      </div>

      <div className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-20 pb-20 overflow-hidden">
          <AirdropAnimation />
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
                Empower Your Project <br />
                <span className="text-primary neon-text italic">Drive Real Growth</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                {PLATFORM_CONFIG.TOKEN_SYMBOL} is Solana's premier Pay-Per-Action platform. Connect with high-conviction users through verified on-chain holder qualification and social engagement. 
                Built for projects that demand authentic community growth.
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

              {/* Global Stats - Restored */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl mx-auto">
                {[
                  { label: "Active Campaigns", value: stats?.activeCampaigns || "3", mascot: true },
                  { label: "Community Members", value: stats?.totalUsers || "1,240" },
                  { label: "Verified Projects", value: stats?.totalVerifiedProjects || "3" },
                  { label: "Rewards Paid (Tokens)", value: stats ? stats.totalPaid : "450k" },
                  { label: "Total Tokens Burned", value: PLATFORM_CONFIG.STATS.TOTAL_BURNED.toLocaleString(), isBurn: true },
                ].map((stat, i) => (
                  <div key={i} className={`relative text-center p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-primary/30 transition-all flex flex-col justify-center min-h-[100px] ${stat.isBurn ? 'border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50' : ''}`}>
                    {stat.mascot && (
                      <div className="absolute -top-[4.5rem] left-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none z-20">
                        <img 
                          src={PLATFORM_CONFIG.ASSETS.LANDING_MASCOT} 
                          alt="" 
                          className="w-full h-full object-contain drop-shadow-[0_0_18px_rgba(34,197,94,0.65)]" 
                        />
                      </div>
                    )}
                    <h3 className={`text-xl md:text-3xl font-display font-black mb-1 tracking-tighter ${stat.isBurn ? 'text-orange-500' : 'text-white'}`}>{stat.value}</h3>
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
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[40px] p-8 md:p-16 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-5xl font-display font-black mb-8 tracking-tighter italic uppercase underline decoration-primary decoration-4 underline-offset-8">Deflationary by Design</h2>
                  <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
                    We don't just grow communities; we strengthen the entire ecosystem. Every campaign created burns <strong>{PLATFORM_CONFIG.BURN_AMOUNT.toLocaleString()} ${PLATFORM_CONFIG.TOKEN_SYMBOL}</strong>, reducing total supply while rewarding loyal project holders.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 backdrop-blur-md group hover:border-primary/30 transition-all">
                      <p className="text-4xl font-black text-primary mb-2">0%</p>
                      <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Platform Fees</p>
                    </div>
                    <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 backdrop-blur-md group hover:border-secondary/30 transition-all">
                      <p className="text-4xl font-black text-secondary mb-2">BURN</p>
                      <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{PLATFORM_CONFIG.BURN_AMOUNT.toLocaleString()} Tokens/Project</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center relative">
                  <div className="w-[400px] h-[400px] rounded-full bg-primary/20 flex items-center justify-center border-[12px] border-primary/10">
                    <motion.img 
                      src={PLATFORM_CONFIG.ASSETS.DEFLATIONARY_MONK} 
                      alt="Deflationary Monk" 
                      animate={{ y: [0, -30, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-80 h-80 object-contain drop-shadow-[0_0_60px_rgba(34,197,94,0.7)] translate-x-1" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-black/40" data-testid="section-social-cta">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-12">
              <h2 className="text-6xl font-display font-black tracking-tighter italic uppercase underline decoration-primary decoration-8 underline-offset-12">Join the Alpha</h2>
              <p className="text-2xl text-muted-foreground font-medium">Be part of the leading engagement movement on Solana. Get early access to high-reward campaigns and community updates.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                <Button size="lg" className="h-20 px-12 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-black text-2xl rounded-2xl shadow-2xl shadow-blue-500/20 group transition-all hover:scale-105" asChild data-testid="link-telegram">
                  <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TELEGRAM} target="_blank" rel="noreferrer" className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Send className="w-6 h-6 fill-white" />
                    </div>
                    JOIN TELEGRAM
                  </a>
                </Button>
                <Button size="lg" className="h-20 px-12 bg-white text-black hover:bg-gray-100 font-black text-2xl rounded-2xl shadow-2xl group transition-all hover:scale-105" asChild data-testid="link-twitter">
                  <a href={PLATFORM_CONFIG.SOCIAL_LINKS.TWITTER} target="_blank" rel="noreferrer" className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                      <Twitter className="w-6 h-6 fill-black" />
                    </div>
                    FOLLOW TWITTER (X)
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
