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
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <header>
        <title>MemeDrop - The #1 Solana Marketing Platform</title>
        <meta name="description" content="Connect, complete tasks, and earn crypto rewards instantly on Solana. The premier engagement platform for real users and authentic growth." />
        <meta property="og:title" content="MemeDrop - Earn Crypto for Real Actions" />
        <meta property="og:description" content="Participate in top-tier Solana projects and get paid in native tokens for social engagement." />
        <meta property="og:type" content="website" />
      </header>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
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
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
              The #1 Solana Marketing Platform
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter mb-8 bg-gradient-to-br from-white via-white to-gray-600 bg-clip-text text-transparent">
              Hold & Win <br />
              <span className="text-primary neon-text">Passive Rewards</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              The premier Solana marketing platform. Secure your project's growth with our new Holder Qualification model. Connect, hold, and earn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/earn">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all"
                >
                  Start Earning <Coins className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-white/10 hover:bg-white/5"
                onClick={() => connect('advertiser')}
              >
                Create Campaign <Rocket className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl"
          >
            {[
              { label: "Active Campaigns", value: campaigns?.length || "0" },
              { label: "Total Distributed", value: stats ? `${Number(stats.totalPaid).toLocaleString()} MEME` : "450k MEME" },
              { label: "Verified Users", value: stats ? stats.totalUsers : "1,240" },
              { label: "Avg. ROI", value: "320%" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <h3 className="text-2xl font-display font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-black/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose MemeDrop?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The most transparent engagement platform on Solana.</p>
          </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { title: "Passive Rewards", desc: "Hold tokens to qualify for rewards without active engagement.", icon: Coins },
              { title: "On-Chain Proof", desc: "Verifications are handled directly on the Solana blockchain for maximum transparency.", icon: ShieldCheck },
              { title: "Anti-Bot Verification", desc: "Our holding requirements ensure rewards go to real project supporters, not bots.", icon: Users },
              { title: "Instant Qualification", desc: "Start your holding period instantly and track your progress in real-time.", icon: Zap }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card border-white/5 bg-white/[0.02] hover:border-primary/20 transition-all h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">Built for the ${APP_CONFIG.token.symbol} Ecosystem</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our native token ${APP_CONFIG.token.symbol} powers the entire platform. Hold ${APP_CONFIG.token.symbol} to get higher rewards, or stake it as an advertiser to get premium placement.
                </p>
                <div className="flex gap-4">
                  <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5 flex-1">
                    <p className="text-2xl font-bold text-primary">15%</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Reward Boost</p>
                  </div>
                  <div className="text-center p-4 bg-black/20 rounded-2xl border border-white/5 flex-1">
                    <p className="text-2xl font-bold text-secondary">Low</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Platform Fees</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                  <img src={APP_CONFIG.assets.logo} alt="Token" className="w-24 h-24 object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Character Hello Section */}
      <section className="py-24 border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 text-center md:text-left relative z-10">
              <h2 className="text-3xl font-display font-bold mb-4 italic">Ready to start earning?</h2>
              <p className="text-muted-foreground mb-8">Join thousands of users who are already earning rewards for supporting the best projects on Solana.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button size="lg" className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 px-8 shadow-lg shadow-primary/20" asChild>
                  <a href="/earn">Start Earning Now</a>
                </Button>
              </div>
            </div>
            <div className="w-48 h-48 md:w-64 md:h-64 relative z-10">
              <img 
                src={APP_CONFIG.assets.characterHello} 
                alt="Meme Character" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

          {/* Featured Campaigns */}
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-4xl font-display font-bold mb-2">Active Campaigns</h2>
                  <p className="text-muted-foreground">Join these top-tier projects and start earning.</p>
                </div>
                <Link href="/earn">
                  <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                    View All Campaigns <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <EarnContentOnly />
              </div>
            </div>
          </section>
    </div>
  );
}
