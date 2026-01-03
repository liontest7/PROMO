import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useWallet } from "@/hooks/use-wallet";
import { Rocket, Coins, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent">
              Earn Crypto for <br />
              <span className="text-primary neon-text">Real Engagement</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect your wallet, discover emerging Solana projects, and earn tokens for simple tasks.
              Transparent, automated, and secure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => connect('user')}
                className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all"
              >
                Start Earning <Coins className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => connect('advertiser')}
                className="h-14 px-8 text-lg border-white/10 hover:bg-white/5"
              >
                Create Campaign <Rocket className="ml-2 w-5 h-5" />
              </Button>
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
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Simple steps to start earning or growing your project.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Coins className="w-8 h-8 text-primary" />,
                title: "1. Connect Wallet",
                desc: "Link your Solana wallet safely. No deposits required for earners."
              },
              { 
                icon: <ShieldCheck className="w-8 h-8 text-secondary" />,
                title: "2. Complete Actions",
                desc: "Verify tasks like Twitter follows, Telegram joins, or website visits."
              },
              { 
                icon: <Rocket className="w-8 h-8 text-blue-500" />,
                title: "3. Get Paid Instantly",
                desc: "Rewards are automatically sent to your wallet upon verification."
              },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-all hover:-translate-y-1">
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
