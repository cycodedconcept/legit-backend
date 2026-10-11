# B01 foundation — 2026-10-11

Status: implemented; pending owner review.

A modular Express 5 / TypeScript application runs independently of XAMPP. Controllers delegate to services, repositories and provider adapters as business modules arrive. No microservices, auth endpoints, Socket.IO listener or speculative job/outbox schema is introduced in B01. Socket.IO remains the B11 choice; durable jobs begin with B02 email delivery.

Node 22 is a supported Maintenance LTS line per the [Node release schedule](https://github.com/nodejs/Release). Local runtime and `.nvmrc` pin 22.15.0; review the patch level before deployment. Exact npm package versions are committed in package.json and package-lock.json. MySQL is pinned to 8.4.8 in Compose and CI; production version selection is an owner gate. MariaDB does not satisfy the database tests.

[Express 5](https://expressjs.com/en/5x/guide/error-handling/) forwards rejected route promises to central error middleware. Public messages are allowlisted; arbitrary exceptions and configuration values are never serialized. Requests receive a fresh server UUID, even when clients supply X-Request-ID. Logs contain only request ID, status and elapsed time, without URLs, bodies, headers or identity values. Pino also redacts common credential fields. Add reviewed, allowlisted diagnostic codes when new modules need them.

`/health` is process liveness; `/ready` checks MySQL with bounded connection/query timeouts. It does not attest to schema currency, provider availability or release acceptance. A reachable database is not required for HTTP boot. Missing required config fails before listening. Production config requires certificate-verified MySQL TLS. Graceful termination drains HTTP, closes the pool and exits within ten seconds.

Business contracts are reserved under `/api/v1`; operational probes retain the proposed root paths. No invented version discovery endpoint is added. Unknown versioned routes return the common 404 envelope.

Migrations are a separate release step under a DDL-capable account. Runtime accounts need only required DML rights (B01 readiness needs connection access). Never run the app as root. A [MySQL advisory lock](https://dev.mysql.com/doc/refman/8.4/en/locking-functions.html) serializes migration runners on one server. Checksums reject changed applied files. MySQL DDL implicitly commits: one restart-safe DDL statement per file, no claim of transactional rollback. B01 creates only migration history and service metadata. Retry recovers a crash after CREATE but before history insertion. Future migrations must explicitly design recovery; do not assume IF NOT EXISTS detects schema drift.

Tests have no configurable production URL: only loopback:3307, `legit_test_b01`, user `legit_test`, and a disposable password. They reject application DB environment variables and NODE_ENV=production, verify actual MySQL 8.4, and reset only B01 tables. Never forward a production database to this port or grant this test user production access.

## Pinned kickoff packages

- express: 5.3.0
- mysql2: 3.24.5
- pino: 10.4.0
- zod: 4.6.5
- @types/express: 5.0.6
- @types/mocha: 10.0.10
- @types/node: 22.20.5
- @types/supertest: 7.2.1
- eslint: 10.12.0
- mocha: 12.0.3
- supertest: 7.3.1
- tsx: 4.23.15
- typescript: 5.9.3
- typescript-eslint: 8.71.1
