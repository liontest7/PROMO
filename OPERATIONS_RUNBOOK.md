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

## Backup and restore operations

### Daily backup job
- Run `db:backup` once daily:
  - `npm run db:backup`
- Store output from `backups/` in external object storage.
- Keep at least:
  - 30 daily backups
  - 12 weekly backups
  - 12 monthly backups

### Restore procedure
1. Provision empty PostgreSQL instance.
2. Export target `DATABASE_URL`.
3. Restore selected snapshot:
   - `npm run db:restore -- backups/dropy_YYYYMMDD_HHMMSS.sql.gz`
4. Start backend and validate:
   - `/api/health`
   - sample campaign reads
   - admin payout-health/reconciliation

### Restore drill policy
- Run restore drill at least once per month in staging.
- Document RTO/RPO and any data gaps.

## Post-incident
- Export logs + traceIds.
- Document impact window and affected campaignIds.
- Add preventive action item to backlog.
