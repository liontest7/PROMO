# Dropy - Smart Contract & Platform Technical Documentation

## Overview
Dropy is a marketing platform on Solana where advertisers create campaigns and users earn rewards for social actions.

## Smart Contract (Solana Program)
- **Location:** `smart-contract/dropy_program.rs` (Placeholder for Anchor/Rust code)
- **Status:** Integrated into the platform logic but currently disabled for testing/free creation.
- **Key Functions:**
  - `initialize_campaign`: Escrows tokens and SOL for rewards.
  - `claim_reward`: Validates off-chain verification and distributes tokens.
  - `close_campaign`: Returns remaining budget to the creator.

## Transition to Devnet/Production
To move to Devnet and enable the Smart Contract:
1. **Deploy Program:** Deploy the code in `smart-contract/` to Solana Devnet.
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

## Deployment & Verification
- Use `npm run dev` for local development.
- Database is managed via Drizzle ORM.
- Social actions (Twitter/Telegram) are verified via dedicated services in `server/services/`.
