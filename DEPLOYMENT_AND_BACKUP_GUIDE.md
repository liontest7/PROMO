# Dropy Deployment & Backup Guide (Production)

This guide explains how to launch Dropy safely on Replit or a dedicated host, how to connect PostgreSQL, and how to keep reliable backups.

## 1) Recommended architecture

### Preferred for production (recommended)
- **App server:** Railway / Render / VPS (Node.js)
- **Database:** Managed PostgreSQL (Railway Postgres / Neon / Supabase / AWS RDS)
- **Domain + TLS:** Cloudflare + provider-managed TLS
- **Object/log storage (optional):** S3-compatible bucket for logs/backups

### Replit-compatible setup
- Replit can run the app server, but for production reliability use an **external managed PostgreSQL**.
- Keep secrets in Replit Secrets, never in source files.

### Netlify note
- Netlify is good for static frontends/functions, but this project includes a full backend API.
- If using Netlify for frontend delivery, the backend must run separately (Railway/Render/VPS) and frontend should point to that API origin.

## 2) Minimum production environment variables

Required baseline:
- `DATABASE_URL`
- `SESSION_SECRET`
- `SOLANA_RPC_ENDPOINTS`
- `SMART_CONTRACT_ENABLED`
- `SMART_CONTRACT_PROGRAM_ID` (when enabled)
- `REWARDS_PAYOUTS_ENABLED`

Strongly recommended:
- `TURNSTILE_SECRET_KEY`
- `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` (if social verification enabled)
- `TELEGRAM_BOT_TOKEN` (if Telegram verification enabled)

## 3) Pre-launch checklist (must pass)

1. `npm run check`
2. `npm run lint`
3. `npm run smoke:test` (against a running production-like environment)
4. Verify `/api/health` returns healthy
5. Verify admin endpoints:
   - `/api/admin/system-health`
   - `/api/admin/payout-health`
   - `/api/admin/payout-metrics?days=7`
6. Confirm payout controls:
   - `REWARDS_PAYOUTS_ENABLED=true`
   - `SMART_CONTRACT_CLAIMS_FALLBACK_TO_TRANSFER` policy is set intentionally
7. Confirm DB migrations/schema are applied
8. Confirm log retention and alerting are configured

## 4) Backup policy (PostgreSQL)

### Schedule
- **Daily full backup** (retain 30 days)
- **Weekly backup snapshot** (retain 12 weeks)
- **Monthly backup snapshot** (retain 12 months)

### Storage
- Store backups in an external bucket/storage account, not only on app host.
- Enable server-side encryption.

### Restore drills
- Run a restore drill at least once per month to a staging database.
- Verify:
  - campaigns exist
  - users/sessions integrity
  - claim receipts + payouts integrity

## 5) Lightweight backup command examples

Create backup:
```bash
./script/backup-postgres.sh
```

Restore backup:
```bash
./script/restore-postgres.sh backups/dropy_YYYYMMDD_HHMMSS.sql.gz
```

Both scripts require `DATABASE_URL` in environment.

## 6) Launch recommendation summary

For a stable long-term setup:
1. Host backend on Railway/Render/VPS
2. Use managed PostgreSQL with automated snapshots
3. Run backups daily to external storage
4. Add uptime monitoring + alerting
5. Keep a tested restore runbook

If all checks pass and backups/restore are validated, the system is in strong shape for production rollout.


## 7) Two-stage release model (required)

Operate with exactly two environments:
- **Staging** for testing and validation
- **Production** for live traffic

Use branch-to-environment mapping:
- `staging` branch -> Railway staging service
- `main` branch -> Railway production service

Detailed setup is documented in `RAILWAY_TWO_STAGE_RELEASE.md`.


## 8) Database + Smart Contract environment model (recommended)

For long-term stability, use strict environment separation:

- **Staging DB**: used by staging app and developer testing.
- **Production DB**: used only by production app.
- Never allow local/Replit development to write directly to production DB.

For smart contracts, use separate deployments:

- **Devnet Program ID** for staging/testing flows.
- **Mainnet Program ID** for production flows.

This means you can work on the same codebase while each environment points to its own chain + DB safely.

## 9) Seeing real production data while developing (safe approach)

If you need real visibility during development, use one of these patterns:

1. **Read-only production replica (preferred)**
   - replicate production DB to a read-only analytics/staging replica.
   - staging can read realistic data without risking production writes.

2. **Periodic sanitized snapshot copy**
   - copy production data into staging on schedule (daily/weekly).
   - remove sensitive values as needed.

3. **Feature-flagged shadow checks**
   - production remains source of truth.
   - compare staging behavior against production metrics/logs without direct writes.

Do **not** share a writable DB between staging and production.
