# Dropy - System Specification & Documentation

Dropy is a premier marketing platform built specifically for the Solana ecosystem, utilizing a Pay-Per-Action (PPA) model to drive authentic engagement.

## Core Architecture

### 1. Frontend (React 18 + Vite + Tailwind CSS)
- **Framework**: React with TypeScript.
- **Routing**: `wouter` for lightweight and efficient routing.
- **State Management**: `TanStack React Query` for server state and data fetching.
- **Styling**: `Tailwind CSS` with `shadcn/ui` components for a modern, high-contrast dark theme.
- **Animations**: `Framer Motion` for smooth transitions and interactive elements.
- **Wallet Integration**: Custom hook `useWallet` for Solana Phantom wallet connection.

### 2. Backend (Node.js + Express)
- **API**: RESTful API endpoints defined in `server/routes.ts`.
- **Validation**: `Zod` for strict request/response schema validation.
- **Database**: `PostgreSQL` with `Drizzle ORM` for type-safe database operations.
- **Security**: Message signing for wallet ownership verification and Cloudflare Turnstile for anti-bot protection.

### 3. Data Models (shared/schema.ts)
- **Users**: Tracks wallet address, role (user/advertiser), reputation score, and balances.
- **Campaigns**: Stores campaign metadata (title, token address, budget, social links).
- **Actions**: Defines specific tasks (Twitter follow, Telegram join, Website visit) and rewards.
- **Executions**: Records user task completions and reward distributions.

## How It Works

### For Users (Earners)
1. **Connect Wallet**: Users connect their Phantom wallet.
2. **Explore**: Browse active campaigns with verified project tokens.
3. **Engage**: Complete social media or web tasks.
4. **Verify**: Tasks are verified via API or on-chain checks.
5. **Earn**: Rewards are distributed directly to the user's wallet upon verification.

### For Advertisers (Projects)
1. **Connect as Advertiser**: Register with project details.
2. **Launch Campaign**: Deposit project tokens into the escrow-managed campaign.
3. **Set Requirements**: Define task types and reward amounts.
4. **Drive Growth**: Real users engage with the project to earn rewards.

## Tokenomics ($DROPY)

Dropy features a deflationary model designed for long-term ecosystem health:
- **Campaign Creation Fee**: 10,000 $DROPY (adjustable via admin settings).
- **Distribution**:
    - **50% (Burn)**: Permanently removed from circulation.
    - **40% (Rewards)**: Distributed to active community members.
    - **10% (System Fees)**: Allocated for platform maintenance and development.

## Maintenance & Future Development

### Ongoing Maintenance
- **API Monitoring**: Monitor social media API integrations for rate limits or breaking changes.
- **Security Audits**: Regularly review smart contract and escrow logic for Solana integrations.
- **Database Backups**: Automated backups of the PostgreSQL database.

### Future Roadmap (Phases)

#### Phase 1: Foundation (Completed)
- Core engine and infrastructure.
- Solana escrow integration.
- Anti-bot protection.
- Social Media API verification.

#### Phase 2: Growth (In Progress)
- **Liquidity Boosting**: Rewards for providing DEX liquidity.
- **Premium Tiers**: Exclusive airdrops for high-reputation users.
- **Analytics Dashboard**: Advanced metrics for advertisers.

#### Phase 3: Ecosystem (Vision)
- **CEX Listings**: Expanding to centralized exchanges.
- **DAO Governance**: Handing platform control to $DROPY holders.
- **Strategic Partnerships**: Integrating with top Solana protocols.

## Technical Maintenance Tips
- **Migrations**: Use `npm run db:push` for schema updates.
- **Environment Variables**: Managed through Replit Secrets for security.
- **Vite Config**: Path aliases (`@/` for client/src) should be maintained for clean imports.
