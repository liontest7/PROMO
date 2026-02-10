# Dropy Devnet Readiness Checklist

This checklist is the execution plan before enabling smart-contract payouts and moving from internal testing to production hardening.

## 1) Code & Build Health
- [x] TypeScript project compiles with `npm run check`.
- [x] Add CI gate to run `npm run check` and block merges on failure.
- [x] Add lint rules for server + client to prevent regressions.

## 2) Smart Contract Completion (Required before Devnet payout tests)
- [x] Implement on-chain campaign escrow state (campaign PDA + token vault PDA).
- [x] Implement `initialize_campaign` with ownership and mint validation.
- [x] Implement `deposit_rewards` for top-ups.
- [x] Implement `claim_reward` with replay protection (`nonce`) and signature validation.
- [x] Implement `close_campaign` with safe reclaim logic.
- [x] Add positive and negative Rust tests for all critical instructions.

## 3) Backend Blockchain Integration
- [x] Replace `claimFromSmartContract` placeholder with real instruction builder/sender.
- [x] Store claim nonces and claim receipts to prevent replay across API retries.
- [x] Read token mint decimals dynamically instead of assuming `6` decimals.
- [x] Add feature-flagged fallback path for emergency disable of smart-contract claims.

## 4) Security Hardening
- [x] Wallet authentication must require challenge + signature verification.
- [x] Add stricter rate limits for auth, verify, and claim endpoints.
- [x] Add explicit admin-only guards on sensitive routes.
- [x] Enforce environment validation at startup (required secrets, RPC URLs, program IDs).

## 5) Data Integrity & Monitoring
- [x] Add visibility endpoint for payout health metrics (`/api/admin/payout-health`) to monitor failures before full alerting stack.
- [x] Add a reconciliation task to compare DB payout states vs on-chain signatures (admin endpoint: `/api/admin/reconciliation`).
- [x] Track payout status metrics (pending/paid/failed per campaign and per day).
- [x] Add structured log IDs to correlate user action -> claim -> signature (traceId in verify/claim + system logs).
- [x] Add alerting for payout failure rates and RPC error spikes.

## 6) Operational Readiness
- [x] Separate env files/secrets for local, devnet, and mainnet.
- [x] Create rollback and incident runbook (pause payouts, retry strategy, recovery).
- [x] Prepare smoke tests that run after each deploy.
- [x] Document key rotation procedure for system/admin keys.

## 7) Launch Criteria
All items in sections 2, 3, and 4 are mandatory before full Devnet payout testing. Mainnet launch requires all sections complete.
