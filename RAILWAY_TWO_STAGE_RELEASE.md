# Railway Two-Stage Release Flow (Staging + Production)

This project should run with exactly two environments:

1. **Staging** (safe testing)
2. **Production** (live users)

## 1) Repository and branch strategy

Use one repository with two protected branches:

- `staging` -> deploys only to Railway Staging
- `main` -> deploys only to Railway Production

Recommended workflow:
1. Open feature branch from `staging`.
2. Merge feature branch into `staging`.
3. Validate staging (smoke test + admin checks).
4. Promote `staging` into `main` only after approval.

This keeps production safe while allowing continuous work in Replit/local.

## 2) Railway project layout

Create two Railway services from the same repository:

- `dropy-staging` service
- `dropy-production` service

Use `railway.json` from this repo for both services:
- Start command: `npm run start`
- Healthcheck: `/api/health`

## 3) Environment separation (critical)

Use different values per environment:

- `DATABASE_URL` -> separate DB for staging and production
- `SESSION_SECRET` -> unique secret per environment
- `SYSTEM_WALLET_PRIVATE_KEY` -> use dedicated keys per environment
- `REWARDS_PAYOUTS_ENABLED` -> usually `false` in staging
- `SOLANA_CLUSTER` -> devnet for staging, mainnet-beta for production

Reference files:
- `.env.staging.example`
- `.env.production.example`

## 4) Deploy controls

### Staging deploys
- Auto-deploy from `staging` branch.
- Run smoke tests against staging URL:
  - `SMOKE_BASE_URL=https://<staging-domain> npm run smoke:test`

### Production deploys
- Deploy from `main` branch only.
- Manual approval required before merge to `main`.
- After deploy, run:
  - `SMOKE_BASE_URL=https://<prod-domain> npm run smoke:test`
  - `/api/admin/system-health`
  - `/api/admin/payout-health`

## 5) Local/Replit development without harming production

You can continue to work in local or Replit safely by following this rule:

- Default to local/staging database only.
- Never point local or Replit directly to production `DATABASE_URL`.

Safe practice:
- Use `.env.local` (or Replit Secrets) mapped to staging DB when you need realistic data.
- Keep production secrets only in Railway production environment.

## 6) Backup and rollback policy

- Run daily backups:
  - `npm run db:backup`
- Keep backups outside app host storage.
- Test restore monthly in staging:
  - `npm run db:restore -- backups/dropy_YYYYMMDD_HHMMSS.sql.gz`

If a production release fails:
1. Roll back to previous Railway deployment.
2. Keep payouts paused until health checks pass.
3. Re-run smoke + admin health checks.

## 7) Smart contract and chain mapping

Use different chain/program settings per environment:

- **Staging**
  - `SOLANA_CLUSTER=devnet`
  - `SMART_CONTRACT_PROGRAM_ID=<devnet-program-id>`

- **Production**
  - `SOLANA_CLUSTER=mainnet-beta`
  - `SMART_CONTRACT_PROGRAM_ID=<mainnet-program-id>`

Never point staging to mainnet signing keys.

## 8) Real data visibility without production risk

If your team wants to see realistic data while developing:

- Keep production DB private to production service.
- Expose a read-only replica or scheduled sanitized copy to staging.
- Keep all staging write operations isolated from production.

This gives realistic dashboards without risking live-user data integrity.
=======

