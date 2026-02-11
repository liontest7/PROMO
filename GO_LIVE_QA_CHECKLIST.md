# Dropy Go-Live QA Checklist (Staging -> Production)

Use this checklist before every production promotion.

## A) Release gate (must pass in Staging)
- [ ] `npm run check`
- [ ] `npm run lint`
- [ ] `SMOKE_BASE_URL=https://<staging-domain> npm run smoke:test`
- [ ] `SMOKE_BASE_URL=https://<staging-domain> npm run smoke:staging`
- [ ] `READINESS_BASE_URL=https://<staging-domain> npm run readiness:check`

## B) Auth & Session
- [ ] Connect wallet as normal user and verify protected routes.
- [ ] Connect wallet as admin and verify `/admin` loads data.
- [ ] Logout clears session and admin routes are blocked.

## C) Admin panel data visibility
- [ ] Users list is visible.
- [ ] Campaigns list is visible.
- [ ] Executions/logs are visible.
- [ ] System controls load and update endpoints respond.

## D) Claims & payouts
- [ ] Claim flow works once and does not duplicate on retries.
- [ ] Same claim nonce cannot be replayed.
- [ ] `/api/admin/payout-health` returns healthy metrics.
- [ ] `/api/admin/reconciliation` completes without critical drift.

## E) UI & readability checks
- [ ] Header nav labels/icons are readable on dark background.
- [ ] Buy dropdown opens/closes correctly on hover.
- [ ] Identity Sync buttons show clear CTA text.
- [ ] Footer links and policy text are high-contrast and readable.

## F) Backup & recovery
- [ ] Daily DB backup job is configured.
- [ ] Last backup artifact exists in external storage.
- [ ] Monthly restore drill recorded in ops notes.

## G) Production promotion
- [ ] Merge approved from `staging` -> `main`.
- [ ] Production deploy completed.
- [ ] `SMOKE_BASE_URL=https://<prod-domain> npm run smoke:test`
- [ ] `SMOKE_BASE_URL=https://<prod-domain> npm run smoke:staging`
- [ ] `READINESS_BASE_URL=https://<prod-domain> npm run readiness:check`
- [ ] Monitor logs/alerts for 30 minutes post-deploy.

## H) Final sign-off (realistic expectations)
- [ ] No release is considered “100% error free”; risk acceptance owner is assigned.
- [ ] Rollback trigger thresholds are documented (error rate, payout failure rate, auth failure rate).
- [ ] On-call owner and communication channel are active for launch window.
