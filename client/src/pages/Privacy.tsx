import { Link } from "wouter";
import { Navigation as Header } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PLATFORM_CONFIG } from "@shared/config";
import { ShieldCheck, Lock, Globe, Eye, Database, Share2, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-12 pb-24 px-4 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="glass-card p-8 md:p-16 border-white/10 rounded-[32px] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between gap-8 mb-16">
              <div className="flex-1 text-left">
                <h1 className="font-display font-black text-5xl md:text-6xl mb-4 uppercase tracking-tighter italic text-white">
                  Privacy <span className="text-primary">Policy</span>
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground/60 font-black uppercase tracking-[0.2em] text-[10px]">
                  <Eye className="w-3 h-3" />
                  Last Updated: January 13, 2026
                </div>
              </div>
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                <img 
                  src={PLATFORM_CONFIG.ASSETS.PRIVACY_BANNER} 
                  alt="Privacy banner"
                  loading="eager"
                  decoding="async"
                  className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                />
              </div>
            </div>
            
            <div className="space-y-12">
              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">01</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary/50" />
                  DATA COLLECTION PROTOCOLS
                </h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>As a decentralized platform on the Solana blockchain, we prioritize user anonymity and minimize data collection. We only collect essential technical identifiers to facilitate core functionality:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Public Solana wallet addresses",
                      "X (Twitter) profile data via API authorization",
                      "Telegram IDs for task verification",
                      "Anti-bot verification data (Turnstile)",
                      "IP-Wallet association for anti-Sybil detection",
                      "Protocol Reputation and XP progress metrics",
                      "Public on-chain transaction history"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-wide text-white">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">02</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary/50" />
                  PURPOSE OF DATA PROCESSING
                </h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  Your information is processed strictly to: (a) verify marketing task completion through third-party APIs; (b) distribute on-chain rewards via smart contracts; (c) prevent Sybil attacks and automated bot abuse; and (d) maintain ecosystem integrity through our proprietary reputation scoring.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">03</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-primary/50" />
                  X (TWITTER) API INTEGRATION
                </h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  To verify social tasks, we integrate with the X API. We only access public data you explicitly authorize (follows, likes, retweets). We do not store your social credentials, and we never post on your behalf without a direct, user-initiated action. Social verification data is stored temporarily and used solely to authorize reward distributions.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">04</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary/50" />
                  SECURITY & ASSET PROTECTION
                </h2>
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 italic text-sm text-white/90 leading-relaxed">
                  We implement industry-standard encryption. However, you remain the ultimate guardian of your assets. Dropy never requests, stores, or has access to your private keys or seed phrases. All on-chain transaction data is public and immutable by the nature of the Solana blockchain.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">05</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary/50" />
                  DATA RETENTION & RIGHTS
                </h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  We retain minimal technical data required for fraud prevention. Since most protocol data is stored on-chain, it cannot be deleted or modified. You have the right to disconnect your social profiles from our interface at any time through the platform settings or your social media provider's authorized apps section.
                </p>
              </section>
            </div>

            <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <Link href="/">
                <Button variant="ghost" className="font-black uppercase tracking-widest text-xs gap-2 group hover-elevate">
                  <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Back to Platform
                </Button>
              </Link>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Privacy Protected Platform</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
