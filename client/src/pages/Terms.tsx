import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12 border-white/10 rounded-2xl">
          <h1 className="font-display font-black text-4xl mb-8 uppercase tracking-tighter italic text-primary">Terms of Service</h1>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-white font-bold text-xl mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Dropy platform ("Platform"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, you must not access or use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">2. Platform Description</h2>
              <p>
                Dropy is a decentralized Pay-Per-Action marketing platform on the Solana blockchain. 
                Users earn project tokens by completing verified social actions. Advertisers deposit tokens to reward engagement.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use the Platform.</li>
                <li>You are responsible for the security of your Solana wallet and private keys.</li>
                <li>You agree not to use bots, multiple accounts, or any fraudulent means to claim rewards.</li>
                <li>Violation of these terms may result in account blacklisting and forfeiture of rewards.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">4. Risks & Disclaimers</h2>
              <p>
                Digital assets and blockchain technology involve significant risks. Dropy is not responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Volatility of token prices or project failures.</li>
                <li>Smart contract vulnerabilities or blockchain network congestion.</li>
                <li>Loss of assets due to wallet mismanagement.</li>
              </ul>
              <p className="mt-4">
                THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">5. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Dropy INC. shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5">
            <Link href="/">
              <span className="text-primary hover:underline cursor-pointer font-bold">Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
