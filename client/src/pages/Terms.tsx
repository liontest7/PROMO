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
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">1. DECENTRALIZED PROTOCOL & NON-CUSTODIAL NATURE</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>Dropy is a decentralized technology interface. By using the platform, you acknowledge that we are non-custodial and do not have access to your private keys or assets. You are solely responsible for your own digital security.</p>
                  <ul className="grid grid-cols-1 gap-2">
                    {[
                      "We do not hold or manage user funds",
                      "You are responsible for all Solana network (gas) fees",
                      "Lost private keys cannot be recovered by Dropy",
                      "All on-chain transactions are final and irreversible"
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
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">2. X (TWITTER) VERIFICATION & API DISCLAIMER</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>Our verification system utilizes the X API. We are not responsible for social platform outages or API limitations that may delay rewards. We only access data you explicitly authorize and never store your social credentials.</p>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">03</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">3. ANTI-FRAUD & SYBIL PROTECTION PROTOCOLS</h2>
                <div className="space-y-4 text-white/90 leading-relaxed font-medium">
                  <p>To ensure a fair ecosystem, we implement advanced fraud detection including IP monitoring, wallet associations, and bot behavior analysis. We reserve the right to blacklist any wallet involved in Sybil attacks or fraudulent engagement.</p>
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">04</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">4. INDEMNIFICATION & LIMITATION OF LIABILITY</h2>
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 italic text-sm text-white/90 leading-relaxed">
                  You agree to indemnify and hold harmless Dropy from any claims, damages, or losses arising from your use of the platform. Dropy shall not be liable for any indirect, incidental, or consequential damages resulting from network errors or third-party service failures.
                </div>
              </section>

              <section className="relative pl-12">
                <div className="absolute left-0 top-1 text-primary/40 font-black text-2xl italic tracking-tighter">05</div>
                <h2 className="text-white font-black text-xl mb-4 uppercase tracking-tight">5. TERMINATION & MODIFICATION</h2>
                <p className="text-white/90 leading-relaxed font-medium">
                  We reserve the right to modify these Terms or suspend platform access at any time for any reason, including violation of these terms or conduct harmful to the protocol's integrity.
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
