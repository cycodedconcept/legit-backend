# B01 actual test results — 2026-10-11

Local environment: macOS, Node v22.15.0, npm 10.9.2; Docker MySQL **8.4.8**, loopback:3307, dedicated schema `legit_test_b01`. No MariaDB, production data or provider credentials used.

| Command | Passed | Failed | Skipped | Evidence |
| --- | ---: | ---: | ---: | --- |
| `npm run lint` | check passed | 0 | 0 | evidence/B01/lint.txt |
| `npm run typecheck` | check passed | 0 | 0 | evidence/B01/typecheck.txt |
| `npm run build` | check passed | 0 | 0 | evidence/B01/build.txt |
| `npm run test:unit` | 5 | 0 | 0 | evidence/B01/unit.txt |
| `npm run test:api` | 5 | 0 | 0 | evidence/B01/api.txt |
| `TEST_DB_PASSWORD=<disposable> npm run test:integration` | 4 | 0 | 0 | evidence/B01/integration.txt |
| `TEST_DB_PASSWORD=<disposable> npm test` | 14 | 0 | 0 | evidence/B01/npm-test.txt |
| `TEST_DB_PASSWORD=<disposable> npm run seed:test` | command passed | 0 | 0 | evidence/B01/seed.txt |

The aggregate run repeats the same 14 cases; it is not 28 distinct tests. No coverage percentage is claimed.

Unit: missing required settings, invalid ports, production TLS requirement, actual failed boot without secret echo, and refusal of unsafe test targets. HTTP: successful probes/envelope, generated IDs, database failure/recovery, versioned 404, malformed and oversized bodies, and log redaction. MySQL: empty-schema migration, concurrent replay serialization, checksum tampering, crash recovery between DDL/history, actual reachable and refused MySQL readiness.

Initial failures are retained: lint-initial.txt (one unused parameter); unit-initial.txt (4 passed, 1 default-timeout failure); api-initial.txt (0 passed, 5 sandbox EPERM failures); integration-initial.txt (database connection denied by sandbox); integration-first-mysql.txt (1 passed, 3 failed due to string lock result and dependent missing history). Fixed lint and timeout; reran network tests with authorized local access; corrected lock-result handling while preserving safe numeric database configuration. These are resolved development failures, not baseline failures; the repository had no baseline application.

Postman: collection and environment supplied with executable status/envelope/error assertions. Equivalent HTTP scenarios were executed with Mocha/Supertest. The Postman GUI/collection runner was **not executed**; do not treat this as Postman runner evidence. Healthy and database-unavailable folders must be run separately with the documented database state.

Not applicable: protected-route authorization, business idempotency, provider checks and sockets (none implemented in B01). Migration concurrency and recovery were executed. Hosted GitHub Actions, deployment, production database parity, load testing and owner acceptance are not proven by local results.
