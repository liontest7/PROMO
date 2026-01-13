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
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">1. DECENTRALIZED PROTOCOL & WALLET SECURITY</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>Dropy operates as a decentralized technology interface for the Solana blockchain. By using the platform, you acknowledge that we are non-custodial and do not have access to your private keys, seed phrases, or digital assets. You are solely responsible for:</p>
                  <ul className="grid grid-cols-1 gap-2">
                    {[
                      "Maintaining the confidentiality of your private keys",
                      "Verifying all transaction details before on-chain execution",
                      "Paying all required network fees (SOL gas)",
                      "Securing your hardware and software from unauthorized access"
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
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">2. X (TWITTER) INTEGRATION & THIRD-PARTY APIs</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>Our verification engine utilizes the X API to confirm task completion. You acknowledge that Dropy is not affiliated with X (formerly Twitter) and that platform outages, API changes, or account restrictions on X may interfere with your ability to claim rewards. We only access public engagement data as authorized by you during the connection process.</p>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">03</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">3. ANTI-FRAUD & SYBIL PROTECTION POLICY</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>To ensure a fair distribution of rewards, Dropy implements advanced fraud detection, including but not limited to:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "IP address monitoring and geo-fencing",
                      "Wallet-to-Social identity mapping",
                      "Reputation scoring based on on-chain history",
                      "Bot behavior detection algorithms"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 text-xs font-bold uppercase tracking-wide text-white">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-bold text-destructive uppercase tracking-widest pt-2">
                    SUSPECTED FRAUD RESULTS IN PERMANENT BLACKLISTING AND TOTAL REWARD FORFEITURE.
                  </p>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">04</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">4. INDEMNIFICATION & LIABILITY</h2>
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 italic text-sm text-white/90 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Dropy, its developers, and affiliates from and against any and all claims, liabilities, damages, losses, or expenses, including legal fees, arising out of or in any way connected with your access to or use of the platform, your violation of these Terms, or your infringement of any intellectual property or other rights of any third party.
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">05</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">5. DISCLAIMER OF WARRANTIES</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. DROPY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">06</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">6. MODIFICATIONS TO TERMS</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  We reserve the right to modify these Terms at any time. Updates will be reflected in the "Last Updated" date at the top of this page. Your continued use of the platform after any such changes constitutes your acceptance of the new Terms.
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
