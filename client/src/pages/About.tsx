import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { ShieldCheck, Rocket, Coins, Users, Zap, Globe, Target, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const stats = [
    { label: "Platform Growth", value: "240%", icon: BarChart3 },
    { label: "Community Members", value: "15k+", icon: Users },
    { label: "Verified Projects", value: "85+", icon: Target },
    { label: "Rewards Paid", value: "1.2M", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-extrabold mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent"
          >
            Revolutionizing <br />
            <span className="text-primary">Solana Engagement</span>
          </motion.h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Promotion is the leading pay-per-action marketing platform built exclusively for the Solana ecosystem. 
            We bridge the gap between innovative projects and high-quality community members.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, i) => (
            <Card key={i} className="glass-card border-white/5 bg-white/[0.02]">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-display font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-4xl font-display font-bold mb-6">Why Promotion?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              In a landscape crowded with bots and inorganic growth, Promotion stands for authenticity. 
              Our platform helps other projects grow by providing them with a community of verified users 
              who are genuinely interested in their success. Projects get real engagement, and users get rewarded 
              for their time and effort.
            </p>
            <div className="space-y-4">
              {[
                { icon: Rocket, title: "Accelerate Growth", desc: "Get high-quality exposure and real social engagement instantly." },
                { icon: ShieldCheck, title: "Verified Actions", desc: "Every task is verified on-chain and through social APIs." },
                { icon: Zap, title: "Instant Payouts", desc: "No waiting periods. Earn tokens directly to your wallet." },
                { icon: Globe, title: "Global Reach", desc: "Connect with Solana enthusiasts from every corner of the world." }
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
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center">
              <Rocket className="w-32 h-32 text-primary animate-pulse" />
            </div>
            {/* Abstract glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10" />
          </div>
        </div>

        {/* Token Info Section */}
        <section className="py-20 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">The Platform Token</h2>
            <p className="text-muted-foreground">Powering the Promotion ecosystem.</p>
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