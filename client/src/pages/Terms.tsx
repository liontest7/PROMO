import { Link } from "wouter";
import { Navigation as Header } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PLATFORM_CONFIG } from "@shared/config";
import { ShieldCheck, Scale, AlertCircle, Lock, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
                  Terms of <span className="text-primary">Service</span>
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground/60 font-black uppercase tracking-[0.2em] text-[10px]">
                  <FileText className="w-3 h-3" />
                  Last Updated: January 13, 2026
                </div>
              </div>
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                <img 
                  src={PLATFORM_CONFIG.ASSETS.LEGAL_BANNER} 
                  alt="Terms banner"
                  loading="eager"
                  decoding="async"
                  className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                />
              </div>
            </div>
            
            <div className="space-y-12">
              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">01</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">1. Decentralized Nature & Wallet Control</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  Dropy operates as a non-custodial interface. We do not hold, manage, or have access to your private keys or seed phrases. All interactions are executed directly between your wallet and the Solana blockchain or third-party project smart contracts. You are solely responsible for all transaction fees (gas) and any assets lost due to incorrect wallet usage.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">02</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">2. X (Twitter) API & Verification</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>Our verification engine utilizes the X (Twitter) API to confirm task completion. By using the platform, you acknowledge that:</p>
                  <ul className="grid grid-cols-1 gap-3">
                    {[
                      "We only access public engagement data (likes, retweets, follows)",
                      "Social platform outages may delay reward distribution",
                      "Manipulation of social signals via bots is strictly prohibited",
                      "Dropy does not post on your profile without your explicit on-site action"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-wide text-white/100">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">03</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">3. Anti-Sybil & Reputation Systems</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  To protect advertisers and legitimate users, Dropy employs a proprietary reputation scoring system. We monitor for Sybil attacks (the use of multiple wallets by one user), automated scripts, and spoofed social identities. We reserve the right to blacklist any wallet address and withhold rewards if suspicious patterns are identified.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">04</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">4. Token Volatility & Financial Disclaimer</h2>
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 italic text-sm text-white/100">
                  Cryptocurrency tokens earned as rewards are highly volatile. Dropy makes no guarantees regarding the liquidity, market value, or future utility of tokens distributed via campaigns. The platform is not a financial service provider and does not provide investment advice.
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">05</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">5. User Prohibitions</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Reverse engineering the verification engine",
                    "Scraping platform campaign data",
                    "Promoting illegal content via social tasks",
                    "Bypassing geographical restrictions via VPN"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-wide text-white/100">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">06</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">6. Limitation of Liability</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  To the fullest extent permitted by law, Dropy, its developers, and contributors shall not be liable for any indirect, incidental, or consequential damages, including loss of profits or digital assets, resulting from platform downtime, Solana network errors, or third-party service failures.
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Verified Legal Framework</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
