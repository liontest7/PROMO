# Dropy Solana Escrow Strategy

## Overview
To prevent "centralization" flags and increase trust, Dropy will transition from a direct-payout model to an Escrow-based model. In this model, advertisers deposit rewards into a smart contract, and users withdraw them after off-chain verification by the Dropy server.

## Program Architecture (Solana / Anchor)

### 1. State Structures
- **GlobalConfig**: Platform settings, authority, and protocol fee percentage.
- **CampaignEscrow**: 
  - `authority`: Advertiser's wallet.
  - `mint`: The SPL token mint for rewards.
  - `balance`: Current amount of tokens in escrow.
  - `total_deposited`: Historical total for transparency.
  - `vault_bump`: PDA bump for the token account.

### 2. Instructions
- `initialize_campaign`: 
  - Creates a PDA to hold the tokens.
  - Transfers initial budget from Advertiser to Program Vault.
- `deposit_rewards`: 
  - Allows Advertiser to top up the campaign budget.
- `claim_reward`:
  - Input: `user`, `campaign_escrow`, `server_signature`.
  - Logic: Verifies that the `server_signature` is valid and signed by Dropy's authority.
  - Action: Transfers tokens from Program Vault to User.
- `close_campaign`:
  - Only available after campaign expiry or when budget is empty.
  - Returns remaining tokens to the Advertiser.

### 3. Verification Flow (Off-Chain -> On-Chain)
1. User completes task on Dropy.
2. Dropy server verifies task (Twitter/Telegram API).
3. Server generates an Ed25519 signature containing: `[user_pubkey, campaign_id, amount, nonce]`.
4. User receives signature and calls the Solana program's `claim_reward` instruction.
5. Program verifies signature using `Ed25519Program` or internal logic.

## Technical Requirements
- Language: Rust / Anchor.
- Network: Devnet (initial test), Mainnet-beta.
- Security: Signature verification to prevent unauthorized withdrawals.
