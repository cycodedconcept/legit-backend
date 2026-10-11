# Legit Hair backend

B01 foundation only. See docs/milestones/B01-summary.md for verification and open gates.

Use Node from `.nvmrc`, then `npm ci`. Copy `.env.example` to `.env`, replace database placeholders with credentials for a separately installed MySQL 8.4 instance, and create the configured empty schema. Use a migration account for `npm run migrate`, then a least-privilege runtime account for `npm run dev`. Build with `npm run build`; `npm start` runs compiled output. Node does not run inside XAMPP; point phpMyAdmin to the separate MySQL server rather than the bundled MariaDB.

For disposable integration tests:

```sh
export TEST_DB_ROOT_PASSWORD='choose-a-disposable-root-password'
export TEST_DB_PASSWORD='choose-a-disposable-test-password'
docker compose -f compose.test.yml up -d --wait
npm run lint
npm run typecheck
npm run build
npm test
npm run seed:test
docker compose -f compose.test.yml down
```

The container binds only loopback:3307 and stores its database in tmpfs. Stopping it loses all test data. Tests require the fixed schema `legit_test_b01` and user `legit_test`; do not load `.env` into the test shell. CI runs lint, type checking, build, all tests and the synthetic seed against MySQL 8.4.8. Provider and socket tests are not applicable to B01.

To run the API against the test database for Postman, set `.env` DB_HOST=127.0.0.1, DB_PORT=3307, DB_NAME=legit_test_b01, DB_USER=legit_test and your disposable password; run migrations, then `npm run dev`. Keep `.env` out of version control. Import both JSON files in `postman/`. Select Local, run the Healthy folder, then stop MySQL and run the Database unavailable folder while the API stays running. Restart MySQL and rerun Healthy. Requests have no auth and no bodies except deliberate malformed-JSON checks. No fixture IDs are required; `npm run seed:test` creates only `service_metadata.name=fixture` for future harness checks.

Migration recovery: fix connectivity and rerun `npm run migrate`. Never edit an applied SQL file. Restore a backup or ship a forward migration for production recovery. B01 tables can be removed only in a confirmed disposable schema; tests do this automatically. Review docs/decisions/001-foundation.md and docs/api/B01.md before adding endpoints.
