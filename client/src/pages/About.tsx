import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { ShieldCheck, Rocket, Coins, Users, Zap, Globe, Target, BarChart3, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { APP_CONFIG } from "@/config";
import { PLATFORM_CONFIG } from "@shared/config";

export default function About() {
  const { data: stats } = useQuery<{
    totalUsers: string;
    totalPaid: string;
    activeCampaigns: number;
    totalVerifiedProjects: number;
  }>({
    queryKey: ["/api/stats/global"],
    refetchInterval: 30000,
  });

  const statsItems = [
    { label: "Active Campaigns", value: stats?.activeCampaigns || "0", icon: Search },
    { label: "Community Members", value: stats?.totalUsers || "1", icon: Users },
    { label: "Verified Projects", value: stats?.totalVerifiedProjects || "0", icon: ShieldCheck },
    { label: "Rewards Paid", value: stats ? `${stats.totalPaid} TOKENS` : "0.03 TOKENS", icon: Coins },
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
            No more high-cost engagement APIs – just pure on-chain verification and real community support. 
            <br/><br/>
            Our mission is to create a deflationary ecosystem where every campaign burns ${PLATFORM_CONFIG.TOKEN_SYMBOL}, rewarding the entire community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {statsItems.map((stat, i) => (
            <Card key={i} className="glass-card border-white/5 bg-white/[0.02] group hover:border-primary/30 transition-all">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity mx-auto mb-4" />
                <h3 className="text-2xl font-display font-black mb-1">{stat.value}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-4xl font-display font-bold mb-6">Phase 1: Pure On-Chain Growth</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              MemeDrop is starting with a focus on high-conviction growth. Our Phase 1 launch brings 100% on-chain holder verification, ensuring that rewards go to real supporters who hold your tokens.
            </p>
            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-bold text-primary mb-3">Phase 1 Features</h3>
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                <li>Verify holdings directly on Solana Mainnet.</li>
                <li>Duration-based rewards for long-term loyalty.</li>
                <li>Bot-resistant participation through balance checks.</li>
                <li>Zero social API dependency for maximum privacy.</li>
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

        {/* Roadmap Section */}
        <section className="py-20 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">MemeDrop Roadmap</h2>
            <p className="text-muted-foreground">Our journey to revolutionizing Solana marketing.</p>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/50 before:to-transparent">
            {[
              { 
                phase: "Phase 1: Foundation", 
                title: "Launch & Holder Qualification", 
                items: ["Secure Platform Launch & UI/UX Audit", "Verified On-chain Holder Model (Phase 1 Live)", "$MEME Burn Utility on Campaign Creation"],
                status: "active"
              },
              { 
                phase: "Phase 2: Growth", 
                title: "Engagement & Expansion", 
                items: ["Social Media API (Twitter/X & Telegram)", "Automated Verified Action Tracking", "Multi-Asset Reward Support"],
                status: "pending"
              },
              { 
                phase: "Phase 3: Ecosystem", 
                title: "DEX & Advanced Tools", 
                items: ["Direct DEX Liquidity Incentives", "Staking Rewards for $MEME Holders", "Permissionless Campaign Factory"],
                status: "pending"
              }
            ].map((step, i) => (
              <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/50 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className={`w-3 h-3 rounded-full ${step.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                </div>
                <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card border-white/5 bg-white/[0.02] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-bold text-sm uppercase tracking-wider">{step.phase}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <ul className="space-y-2">
                    {step.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Token Info Section */}
        <section className="py-20 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">The Deflationary Ecosystem</h2>
            <p className="text-muted-foreground">Powering the MemeDrop economy with real utility.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Deflationary Burn</h3>
                <p className="text-muted-foreground">Every campaign creation removes {PLATFORM_CONFIG.BURN_AMOUNT.toLocaleString()} ${PLATFORM_CONFIG.TOKEN_SYMBOL} from circulation forever, reducing supply.</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5 bg-white/[0.02]">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Governance & Voting</h3>
                <p className="text-muted-foreground">Token holders shape the future of the platform, voting on roadmap priorities and fee structures.</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/5 bg-white/[0.02]">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Priority Access</h3>
                <p className="text-muted-foreground">Holders get first access to high-reward campaigns and exclusive community-only distributions.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}