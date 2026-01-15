# DROPY - Professional System Specification & Technical Roadmap

Dropy is a decentralized Pay-Per-Action (PPA) marketing infrastructure built on Solana, designed to eliminate bot fraud and reward authentic community engagement.

## 1. System Identity & Vision
- **Brand**: DROPY
- **Mascot**: "Dropy" - A friendly green character representing rewards and community.
- **Mission**: To create a bot-free environment where projects get high-quality engagement and users are fairly rewarded for their time and loyalty.

## 2. Core Functionality & Status Tracking
| Feature | Description | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Wallet Auth** | Phantom/Solana wallet connection (no email/password) | ✅ **Done** | Uses `window.solana` and message signing. |
| **Campaign Creation** | Escrow-based campaign setup for advertisers | ✅ **Done** | Token deposit into platform-managed vaults. |
| **Task Verification** | Automated verification of X/Telegram/Web actions | 🟡 **In-Progress** | Basic logic implemented; full API sync ongoing. |
| **Reward Distribution** | Instant on-chain token distribution | ✅ **Done** | Automated SPL token transfers upon verification. |
| **Deflationary Logic** | Token burn on every campaign creation | ✅ **Done** | 50% burn, 40% rewards, 10% fee. |
| **Anti-Bot Engine** | Multi-layer verification (Wallet age, balance, Turnstile) | 🟡 **In-Progress** | Turnstile added; reputation logic in Phase 2. |
| **Mobile UX** | Full responsive design for mobile earners | ✅ **Done** | Optimized for Phantom mobile browser. |
| **Real-time Stats** | DexScreener integration for growth tracking | ✅ **Done** | Live Market Cap and change percentage in cards. |

## 3. User Roles & Workflows

### A. Earners (Community Members)
- **Discover**: Browse the "Explore" page with high-contrast, readable campaign cards.
- **Verify**: Complete tasks and submit for instant verification.
- **Reputation**: Build a score based on successful completions (Phase 2).

### B. Advertisers (Projects)
- **Dashboard**: Track campaign performance and budget usage.
- **Budget Control**: Funds are locked in escrow and only released for verified actions.
- **Targeting**: Set minimum holder requirements for participation.

### C. Ecosystem ($DROPY Holders)
- **Deflation**: Benefit from the constant burn of the platform token.
- **Governance**: Vote on platform upgrades and fee structures (Phase 3).

## 4. Technical Architecture

### Frontend (Modern Stack)
- **Framework**: React 18 + TypeScript + Vite.
- **Routing**: Wouter (lightweight).
- **UI System**: shadcn/ui + Radix UI + Tailwind CSS.
- **Design Guidelines**: High-contrast dark mode, bold typography, consistent 1.25rem (text-xl) description texts.

### Backend (Secure Infrastructure)
- **Runtime**: Node.js + Express.
- **Persistence**: PostgreSQL + Drizzle ORM.
- **Validation**: Zod (Shared schemas between FE/BE).
- **Anti-Bot**: Cloudflare Turnstile + On-chain wallet analysis.

## 5. Security & Compliance
- **Anti-Sybil**: Limits rewards per wallet/IP and checks account history.
- **Self-Custody**: No private keys are ever stored; all transactions are client-side signed.
- **Transparency**: Every action and reward is verifiable on the Solana explorer.

## 6. Future Roadmap & Improvements

### Immediate Next Steps (To be implemented/improved)
- [ ] **Advanced Analytics**: Detailed charts for advertisers to see engagement over time.
- [ ] **Notification Bot**: Telegram bot to alert users of new high-reward campaigns.
- [ ] **Reputation Tiers**: Locked campaigns that only high-quality users can access.

### Long-term Vision
- **Cross-chain Expansion**: Bringing Dropy to other high-speed L1/L2 networks.
- **Native App**: Dedicated mobile application with push notifications.
- **B2B Integration**: API for projects to embed Dropy tasks directly on their websites.

---
*This document serves as the authoritative specification for the Dropy platform.*
