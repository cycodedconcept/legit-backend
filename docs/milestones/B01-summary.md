# B01 foundation closeout — 2026-10-11

Status: **READY_FOR_REVIEW**. Required local checks passed; owner acceptance remains open. B02 has not started.

Implemented Express/TypeScript boot, validated configuration, safe structured logs and UUID request IDs, central JSON errors, reserved `/api/v1` prefix, `/health`, MySQL-backed `/ready`, bounded DB operations, shutdown, checksummed locked migrations, isolated real-MySQL tests, and GitHub Actions lint/typecheck/build/test/seed workflow. Root probe paths preserve the proposed contract. No business policy was invented. Jobs/outbox and Socket.IO activation are deferred until their consuming milestones.

Changed files: `src/` application/config/logger/server and DB modules; `migrations/001_foundation.sql`; `test/` unit, HTTP, MySQL and isolation helper; `scripts/seed-test.ts`; package manifest/lock, TypeScript/ESLint configs, `.nvmrc`, `.env.example`, `.gitignore`, `compose.test.yml`, `.github/workflows/ci.yml`; README, API/OpenAPI, architecture decision, Postman exports, milestone tracker/reports/evidence and complete B02 prompt. Existing `AGENTS .md` was preserved and its status updated; standard `AGENTS.md` points to those instructions.

Migrations create `schema_migrations` and `service_metadata` only. Migrations run separately with a DDL account; runtime credentials should have minimum necessary grants. MySQL DDL commits implicitly. B01 CREATE is restart-safe and tested after losing history; checksums detect edits. No automated destructive down migration. Recover by fixing connectivity and rerunning, or restore a backup/use a reviewed forward migration. Do not use test cleanup on a real schema. Production schema drift requires operator review.

Executed setup/check commands (password values intentionally omitted):

```sh
node --version
npm --version
docker compose version
npm install --save-exact express@5 pino mysql2 zod
npm install --save-dev --save-exact typescript@5 tsx mocha supertest @types/node@22 @types/express@5 @types/mocha @types/supertest eslint@9 typescript-eslint
npm install --save-dev --save-exact eslint@10
TEST_DB_ROOT_PASSWORD=<disposable> TEST_DB_PASSWORD=<disposable> docker compose -f compose.test.yml up -d --wait
npm run lint
npm run typecheck
npm run build
npm run test:unit
npm run test:api
TEST_DB_PASSWORD=<disposable> npm run test:integration
TEST_DB_PASSWORD=<disposable> npm run seed:test
TEST_DB_PASSWORD=<disposable> npm test
git diff --check
```

Dependency installation initially hit sandbox DNS restrictions and was rerun with authorized access. Docker Desktop was started. HTTP/database tests required authorized local network access. The initial stalled npm process was stopped after successful installation. See B01-test-results.md and evidence/B01 for actual outputs and resolved failures. Final distinct test counts: **14 passed, 0 failed, 0 skipped**; lint/typecheck/build passed. No hosted CI pass or coverage claim.

Postman: import `postman/Legit_Hair_Backend.postman_collection.json` and `postman/Local.postman_environment.json`; select Local (`baseUrl=http://localhost:4000`). Start configured API and MySQL, run Healthy. Stop the test database while API stays running, then run Database unavailable; restart and rerun Healthy for recovery. No auth/body/fixture IDs needed except the explicit malformed JSON request. `npm run seed:test` creates synthetic metadata key `fixture`; no customer identity records exist. Postman runner not executed; matching automated HTTP evidence is recorded.

Open gates: owner acceptance; hosted CI execution/review; production MySQL version and hosting selection; review Node patch updates before deployment. Business decisions listed in AGENTS remain for their dependent milestones. No Paystack, Dojah, email provider, live deployment or financial checks apply to B01.

PR description: Establish the backend foundation with safe boot/configuration, operational probes and consistent JSON responses. Serialize and verify MySQL migrations and add isolated Mocha/Supertest tests plus CI. Validation: lint, typecheck, build and 14 tests passed against real MySQL 8.4.8. Risks: DDL is not transactionally reversible; production parity and owner acceptance remain open.

The complete copy-ready next instruction is [B02-next-prompt.md](B02-next-prompt.md). Use it only after explicit B01 acceptance.
