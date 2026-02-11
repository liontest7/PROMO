# Key Rotation Procedure

## Scope
- `SYSTEM_WALLET_PRIVATE_KEY`
- `SESSION_SECRET`
- Any admin signing keys used by ops scripts

## Procedure
1. Generate new key material in secure vault/HSM.
2. Fund the new system wallet with required SOL for fees.
3. Update secrets in deployment environment (devnet/mainnet separately).
4. Redeploy backend with new secrets.
5. Verify:
   - `/api/health`
   - one controlled payout claim on test wallet
6. Revoke old key access and archive audit record.

## Rollback
- If payout failures occur after rotation:
  1. set `REWARDS_PAYOUTS_ENABLED=false`
  2. revert to previous known-good key from vault version history
  3. redeploy and validate
