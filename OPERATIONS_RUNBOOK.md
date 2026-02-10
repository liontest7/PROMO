# Dropy Operations Runbook

## Emergency controls
1. Pause payouts immediately:
   - set `REWARDS_PAYOUTS_ENABLED=false`
   - redeploy backend
2. If smart-contract path is unstable but payout must continue:
   - set `SMART_CONTRACT_CLAIMS_FALLBACK_TO_TRANSFER=true`
   - keep `SMART_CONTRACT_ENABLED=true`
3. If chain/RPC is unstable:
   - rotate first RPC to healthy endpoint in `SOLANA_RPC_ENDPOINTS`
   - redeploy backend

## Incident triage
1. Check `/api/health` and `/api/admin/system-health`.
2. Check `/api/admin/payout-health` and `/api/admin/payout-metrics?days=7`.
3. Run `/api/admin/reconciliation` to detect state drift.
4. Inspect admin logs for source `CLAIM`, `ALERT`, `Automation`.

## Recovery flow
1. Fix root cause (RPC/env/key/config).
2. Re-enable payouts (`REWARDS_PAYOUTS_ENABLED=true`).
3. Retry failed weekly winners from admin automation path.
4. Validate with smoke tests and payout-health metrics.

## Post-incident
- Export logs + traceIds.
- Document impact window and affected campaignIds.
- Add preventive action item to backlog.
