import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Rocket, Coins, ShieldCheck, ArrowRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const { connect } = useWallet();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
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
              Earn Crypto for <br />
              <span className="text-primary neon-text">Real Actions</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              The premier Solana engagement platform. Connect, complete tasks, and get paid instantly in project tokens.
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
              <Link href="/earn">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-lg border-white/10 hover:bg-white/5"
                  onClick={() => connect('advertiser')}
                >
                  Create Campaign <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats / Trust Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl"
          >
            {[
              { label: "Active Campaigns", value: "140+" },
              { label: "Total Paid Out", value: "$2.4M" },
              { label: "Verified Users", value: "85k+" },
              { label: "Avg. ROI", value: "320%" },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <h3 className="text-3xl font-display font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-black/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">Why Choose Promotion?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">The most transparent engagement platform on Solana.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { title: "Real Users", desc: "Anti-bot verification ensures every action comes from a unique Solana wallet.", icon: Users },
              { title: "On-Chain Proof", desc: "Transactions are recorded on Solana for immutable proof of payout.", icon: ShieldCheck },
              { title: "Native Rewards", desc: "Projects pay directly in their own tokens, creating instant holders.", icon: Coins },
              { title: "Instant Growth", desc: "Launch a campaign and see real-time engagement in minutes.", icon: Rocket }
            ].map((item, i) => (
              <Card key={i} className="glass-card border-white/5 bg-white/[0.02] hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">Built for the $PROMO Ecosystem</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our native token $PROMO powers the entire platform. Hold $PROMO to get higher rewards, or stake it as an advertiser to get premium placement.
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
                  <Coins className="w-24 h-24 text-primary" />
                </div>
              </div>
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
          
          {/* We'll use the same grid from Earn page but limited */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Real campaigns will be loaded here in a real app */}
            <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-muted-foreground">Connect wallet to view live campaigns</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
