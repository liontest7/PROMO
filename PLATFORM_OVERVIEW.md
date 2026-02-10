# Dropy - Smart Contract & Platform Technical Documentation

## Overview
Dropy is a marketing platform on Solana where advertisers create campaigns and users earn rewards for social actions.

## Smart Contract (Solana Program)
- **Location:** `smart-contract/` (Rust crate skeleton for the program)
- **Status:** Integrated into the platform logic but currently disabled for testing/free creation.
- **Key Functions:**
  - `initialize_campaign`: Escrows tokens and SOL for rewards.
  - `claim_reward`: Validates off-chain verification and distributes tokens.
  - `close_campaign`: Returns remaining budget to the creator.

## Campaign Payment Model (Planned for Devnet/Mainnet)
- **All-in SOL fee:** Campaign creation uses a single SOL payment that covers gas buffer, DROPY buy pressure, and system fee.
- **Escrowed rewards:** Campaign SPL tokens are escrowed per campaign and distributed only through the smart contract.
- **Rewards distribution:** Users receive campaign token rewards; DROPY rewards are allocated from the weekly system pool.

### Campaign Creation (Advertiser Flow)
1. **Transfer SPL tokens to Campaign Vault** (escrowed per campaign).
2. **Single SOL payment** (covers gas buffer, swap budget, and system fee).

### SOL Allocation (Planned)
- **Gas Buffer:** Sized by `Max Participants × Avg Claims × Avg Gas` + margin.
- **Swap Budget:** Fixed SOL amount to buy DROPY and send to Rewards Master Contract.
- **System Fee:** Retained in SOL for maintenance and internal operations.

### DROPY Distribution (Weekly)
- **Task leaderboard:** 40%
- **Referral leaderboard:** 40%
- **System reserve:** 20%

### Referral System (Planned)
- Each user has a referral link.
- A referral is considered valid when the invited user completes at least **1 task** and **1 claim**.
- Weekly referral rewards are distributed proportionally by share of valid referrals.

### Security & Recovery (Planned)
- Campaign Vaults are isolated per campaign for SPL tokens and SOL gas buffers.
- Rewards Master Contract holds DROPY only.
- Safety controls: pause/unpause, emergencyWithdraw, and refund to advertiser.
- Admin operations are intended to be controlled via multi-sig.

## Transition to Devnet/Production
To move to Devnet and enable the Smart Contract:
1. **Build & Deploy Program:** Build and deploy the code in `smart-contract/` to Solana Devnet.
2. **Update Config:** In `shared/config.ts`, update:
   - `SMART_CONTRACT.ENABLED: true`
   - `SMART_CONTRACT.PROGRAM_ID: "YOUR_DEPLOYED_PROGRAM_ID"`
3. **RPC Setup:** Ensure `SOLANA_RPC_ENDPOINTS` includes Devnet/Mainnet RPCs.

## Project Structure
- `server/services/solana.ts`: Handles all blockchain interactions. Includes `claimFromSmartContract` placeholder.
- `server/services/campaign.ts`: Manages campaign creation logic. Currently sets `creationFeePaid: true` automatically for testing.
- `server/services/automation.ts`: Handles weekly prize distributions and retries.
- `shared/schema.ts`: Database definitions (PostgreSQL).
- `shared/config.ts`: Central platform configuration.

## Execution Checklist
- Use `DEVNET_READINESS_CHECKLIST.md` as the step-by-step go-live checklist for Devnet and Mainnet readiness.

## Deployment & Verification
- Use `npm run dev` for local development.
- Database is managed via Drizzle ORM.
- Social actions (Twitter/Telegram) are verified via dedicated services in `server/services/`.
