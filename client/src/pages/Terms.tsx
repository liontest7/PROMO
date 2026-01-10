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
      <main className="flex-1 pt-32 pb-24 px-4 relative overflow-hidden">
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
                  Last Updated: January 10, 2026
                </div>
              </div>
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
                <img 
                  src={PLATFORM_CONFIG.ASSETS.LEGAL_BANNER} 
                  alt="Terms banner"
                  className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                />
              </div>
            </div>
            
            <div className="space-y-12">
              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">01</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  By connecting your Solana wallet and accessing the Dropy Platform (“Platform”), you confirm that you have read, understood, and agree to be bound by these Terms of Service. The Platform provides a decentralized interface for Pay-Per-Action marketing, on-chain verification, and reward distribution.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">02</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">2. Eligibility, Risk & No Advice</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>You must be of legal age in your jurisdiction to access or use the Platform. You acknowledge that participation in blockchain-based systems involves inherent risks, including but not limited to smart contract vulnerabilities, third-party failures, and extreme price volatility.</p>
                  <p className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-sm text-white/100 shadow-inner">
                    The Platform is a technology interface only and does not provide financial, investment, legal, or tax advice.
                  </p>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">03</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">3. No Guarantee of Rewards</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  Rewards are not guaranteed. The Platform reserves the right to modify, delay, reduce, or cancel reward distributions at any time due to technical issues, abuse prevention, verification failure, liquidity limitations, or protocol updates.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">04</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">4. Prohibited Conduct & Enforcement</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>The following activities are strictly prohibited:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Sybil attacks or multi-wallet abuse",
                      "Use of bots, scripts, or automated tools",
                      "Spoofing identities or social actions",
                      "Exploiting bugs or protocol manipulation"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-wide text-white/100">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest pt-2">
                    Violation results in immediate suspension, permanent blacklisting, and forfeiture of all pending rewards.
                  </p>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">05</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">5. Verification & Third-Party Dependencies</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  Action verification (e.g. Twitter, Telegram, on-chain events) relies on third-party APIs and external services. The Platform is not responsible for verification errors, data inaccuracies, service outages, delays, or Solana network congestion.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">06</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">6. Privacy & On-Chain Transparency</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  The Platform only processes public wallet addresses and social identifiers required for action verification. Private keys, seed phrases, or sensitive credentials are never requested or stored. All blockchain interactions are publicly visible and immutable on the Solana network.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">07</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">7. Jurisdiction & Legal Compliance</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  You are solely responsible for ensuring that your use of the Platform complies with all applicable laws and regulations in your jurisdiction. Access to the Platform may be restricted or unavailable in certain regions.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">08</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">8. Limitation of Liability</h2>
                <p className="text-white/90 leading-relaxed font-medium p-6 bg-primary/5 rounded-2xl border border-primary/10 italic text-sm text-white/100">
                  To the maximum extent permitted by law, the Platform and its contributors shall not be liable for any loss of digital assets, data, rewards, or profits arising from the use of the Platform, smart contracts, or third-party services.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">09</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">9. Platform Access</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  Access to core Platform functionality requires connecting a compatible Solana wallet and accepting these Terms. Users who do not agree may not access the Platform engine.
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
