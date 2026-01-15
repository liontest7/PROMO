import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { ShieldCheck, Rocket, Coins, Users, Zap, Globe, Target, BarChart3, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PLATFORM_CONFIG } from "@shared/config";

export default function About() {
  const { data: stats } = useQuery<{
    totalUsers: string;
    totalPaid: string;
    totalBurned: string;
    activeCampaigns: number;
    totalVerifiedProjects: number;
  }>({
    queryKey: ["/api/stats/global"],
    refetchInterval: 5000,
    staleTime: 0,
  });

  const statsItems = [
    { label: "Active Campaigns", value: stats?.activeCampaigns || "0", icon: Search },
    { label: "Community Members", value: stats?.totalUsers || "0", icon: Users },
    { label: "Verified Projects", value: stats?.totalVerifiedProjects || "0", icon: ShieldCheck },
    { label: "Rewards Paid", value: stats?.totalPaid || "0", icon: Coins },
    { label: "Tokens Burned", value: stats?.totalBurned || "0", icon: Zap, isBurn: true },
  ];

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/admin/settings"],
  });

  const burnAmount = settings?.creationFee || PLATFORM_CONFIG.BURN_AMOUNT;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <title>About {PLATFORM_CONFIG.TOKEN_SYMBOL} - Solana Engagement Revolution</title>
        <meta name="description" content={`Learn how ${PLATFORM_CONFIG.TOKEN_SYMBOL} is revolutionizing marketing on Solana by connecting projects with real, verified users.`} />
      </header>
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-extrabold mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent italic uppercase tracking-tighter"
          >
            Dropy <br />
            <span className="text-primary">The Future of Growth</span>
          </motion.h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Dropy is the premier marketing platform built specifically for the Solana ecosystem. We bridge the gap between innovative crypto projects and an engaged community of supporters through a unique, action-based reward system.
            <br/><br/>
            Our mission is to democratize token distribution while providing advertisers with high-quality, verified engagement. We believe that marketing in the Web3 space should be transparent, efficient, and rewarding for everyone involved.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-24">
          {statsItems.map((stat, i) => (
            <Card key={i} className={`glass-card border-white/5 bg-white/[0.02] group transition-all ${stat.isBurn ? 'border-orange-500/20 bg-orange-500/5 hover:border-orange-500/50' : 'hover:border-primary/30'}`}>
              <CardContent className="p-6 text-center">
                <stat.icon className={`w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity mx-auto mb-4 ${stat.isBurn ? 'text-orange-500' : 'text-primary'}`} />
                <h3 className={`text-2xl font-display font-black mb-1 ${stat.isBurn ? 'text-orange-500' : ''}`}>{stat.value}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Value Proposition & Character */}
        <section className="py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center p-8 group">
                <img 
                  src={PLATFORM_CONFIG.ASSETS.CHARACTER_QUESTION} 
                  alt={`${PLATFORM_CONFIG.TOKEN_SYMBOL} Character`} 
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-5xl font-display font-black mb-8 italic uppercase tracking-tighter">Ecosystem Value</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">For Projects & Developers</h4>
                    <p className="text-muted-foreground">Gain massive exposure and build trust. By requiring holder qualification, you ensure your community is composed of real stakeholders, not bots.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                    <Coins className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">For Investors</h4>
                    <p className="text-muted-foreground">Sustainable growth through ${PLATFORM_CONFIG.TOKEN_SYMBOL} burns. Every new campaign increases scarcity, rewarding long-term believers in the {PLATFORM_CONFIG.TOKEN_SYMBOL} vision.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">For Users & Earners</h4>
                    <p className="text-muted-foreground">Turn your time and holdings into tokens. Earn rewards from the most promising projects on Solana through verified participation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-20 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4 italic uppercase tracking-tighter italic text-primary">Strategic Roadmap</h2>
            <p className="text-muted-foreground">The evolution of Dropy and the ${PLATFORM_CONFIG.TOKEN_SYMBOL} ecosystem.</p>
          </div>
          
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/50 before:to-transparent">
            {[
              { 
                phase: "Completed", 
                title: "Engine & Core Infrastructure", 
                items: [
                  "Secure Platform Launch with Solana Escrow",
                  "Verified On-chain Holder Qualification",
                  "Anti-Bot Protection (Cloudflare Turnstile)",
                  "Dynamic Gas Optimization System",
                  "Deflationary 50/40/10 Tokenomics Model"
                ],
                status: "active"
              },
              { 
                phase: "Next Steps", 
                title: "Growth & Ecosystem Expansion", 
                items: [
                  "Social Media API Direct Verification",
                  "DEX Liquidity Boosting Rewards",
                  "Premium Airdrop Tiers for High-Reputation Users",
                  "Advertiser Dashboard & Advanced Analytics",
                  "Cross-Chain Social Identity Integration"
                ],
                status: "active"
              },
              { 
                phase: "Future Vision", 
                title: "Global Scaling & Utility", 
                items: [
                  "Small-Tier Exchange (CEX) Listings",
                  "Automated Permissionless Campaign Factory",
                  "Staking Rewards for $DROPY Long-term Holders",
                  "Governance DAO Implementation",
                  "Strategic Partnerships with Top Solana Protocols"
                ],
                status: "pending"
              }
            ].map((step, i) => (
              <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-primary/50 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <div className={`w-3 h-3 rounded-full ${step.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card border-white/5 bg-white/[0.02] p-6 rounded-2xl hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-bold text-xs uppercase tracking-widest">{step.phase}</span>
                  </div>
                  <h3 className="text-xl font-black mb-4 uppercase italic tracking-tight">{step.title}</h3>
                  <ul className="space-y-3">
                    {step.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                        <span className="leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Token Info Section */}
        <section className="py-20 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-display font-bold mb-4 italic uppercase tracking-tighter">The <span className="text-primary">Dropy</span> Ecosystem</h2>
              <p className="text-muted-foreground">Powering the Dropy economy with real utility.</p>
            </div>
            <div className="w-32 h-32 shrink-0">
              <img 
                src={PLATFORM_CONFIG.ASSETS.ABOUT_MASCOT} 
                alt={`${PLATFORM_CONFIG.TOKEN_SYMBOL} Mascot`} 
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Deflationary Burn</h3>
                <p className="text-muted-foreground">Every campaign creation removes {burnAmount.toLocaleString()} ${PLATFORM_CONFIG.TOKEN_SYMBOL} from circulation forever, reducing supply.</p>
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