import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-12 border-white/10 rounded-2xl">
          <h1 className="font-display font-black text-4xl mb-8 uppercase tracking-tighter italic text-primary">Privacy Policy</h1>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-white font-bold text-xl mb-4">1. Information We Collect</h2>
              <p>
                As a decentralized platform, we minimize data collection. We collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Public Solana wallet addresses.</li>
                <li>Social media handles (Twitter/X, Telegram) only for task verification purposes.</li>
                <li>Anonymous usage analytics to improve the Platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">2. How We Use Data</h2>
              <p>
                Your information is used strictly for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Verifying completion of marketing tasks.</li>
                <li>Distributing token rewards to your wallet.</li>
                <li>Preventing fraud and sybil attacks.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">3. Data Sharing</h2>
              <p>
                We do not sell your personal data. Public blockchain transactions are, by nature, 
                visible to everyone. Verification data may be shared with the relevant advertiser 
                to confirm task completion.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">4. Security</h2>
              <p>
                We implement technical and organizational measures to protect your data, but no 
                system is 100% secure. You are responsible for your own digital security.
              </p>
            </section>

            <section>
              <h2 className="text-white font-bold text-xl mb-4">5. Updates</h2>
              <p>
                We may update this policy periodically. Your continued use of the Platform after 
                changes constitutes acceptance of the new policy.
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
