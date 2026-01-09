import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { ShieldCheck, Rocket, Coins, Users, Zap, Globe, Target, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { APP_CONFIG } from "@/config";

export default function About() {
  const stats = [
    { label: "Active Campaigns", value: "24", icon: BarChart3 },
    { label: "Community Members", value: "1,240", icon: Users },
    { label: "Verified Projects", value: "18+", icon: Target },
    { label: "Rewards Paid", value: "450k MEME", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>About MemeDrop - Solana Engagement Revolution</title>
        <meta name="description" content="Learn how MemeDrop is revolutionizing marketing on Solana by connecting projects with real, verified users." />
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-extrabold mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent"
          >
            Holder Qualification <br />
            <span className="text-primary">The Future of Crypto Growth</span>
          </motion.h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            MemeDrop has officially launched Phase 1: Holder Qualification. This model focuses on building genuine, long-term value by rewarding users who commit to projects through verified on-chain holdings.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <Card key={i} className="glass-card border-white/5 bg-white/[0.02]">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold mb-1">{stat.value}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-4xl font-display font-bold mb-6">Why Choose MemeDrop?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              In a landscape crowded with bots and inorganic growth, MemeDrop stands for authenticity. 
              Our platform helps other projects grow by providing them with a community of verified users 
              who are genuinely interested in their success.
            </p>
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-bold text-primary mb-3">Value for Projects</h3>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Cultivate long-term holders through duration-based rewards.</li>
                <li>Eliminate bot activity with wallet balance requirements.</li>
                <li>Drastically reduce marketing costs by removing social API dependencies.</li>
                <li>Build authentic community value through sustainable token holding.</li>
              </ul>
            </div>
            <div className="space-y-4">
              {[
                { icon: Rocket, title: "Accelerate Growth", desc: "Get high-quality exposure and real social engagement instantly." },
                { icon: ShieldCheck, title: "Verified Actions", desc: "Every task is verified on-chain and through digital signatures." },
                { icon: Zap, title: "Instant Payouts", desc: "No waiting periods. Earn tokens directly to your wallet." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="p-2 h-fit rounded-lg bg-primary/10">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center p-8 group">
              <img 
                src={APP_CONFIG.assets.characterQuestion} 
                alt="About Us" 
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            {/* Abstract glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10" />
          </div>
        </div>

        {/* Token Info Section */}
        <section className="py-20 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">The Platform Token</h2>
            <p className="text-muted-foreground">Powering the MemeDrop ecosystem.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Advertiser Staking</h3>
                <p className="text-muted-foreground">Projects stake our native token to gain priority placement and reduced platform fees.</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5 bg-white/[0.02]">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Governance</h3>
                <p className="text-muted-foreground">Token holders vote on platform parameters and upcoming feature priorities.</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5 bg-white/[0.02]">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Earn Bonus</h3>
                <p className="text-muted-foreground">Holders receive up to 15% extra rewards when completing tasks on the platform.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}