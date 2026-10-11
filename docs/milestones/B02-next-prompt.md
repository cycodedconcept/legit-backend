## B02 Authentication and customer accounts

Implement only B02 for the Legit Hair backend under the PRD. Confirm B01 is accepted and inspect its evidence before dependent work.

### Required scope
Implement registration, email verification, login, logout, refresh token rotation and revocation, password reset, roles and saved addresses. Hash passwords with a suitable password hashing library. Use a transactional email adapter with local fake transport and durable retry jobs. Define token storage and cookie or bearer strategy in an architecture decision.

### Acceptance evidence
Reject duplicate registration and invalid input; expired verification and reset tokens fail; reset tokens are single use; rotated refresh tokens cannot be reused; unauthenticated and forbidden access fail; customers cannot read another customer’s addresses.

### Proposed Postman samples
POST /auth/register; POST /auth/login; GET /me. Align the contract with actual implementation and explain any approved change. Include positive and negative requests, fixture IDs and response assertions.

## Scope and engineering rules
- Work on the backend only. Use Node.js supported LTS, Express, proposed TypeScript, Socket.IO and MySQL; record pinned versions in the lockfile and architecture decisions. Use Mocha for backend unit and integration tests and Supertest for HTTP tests. Jest remains the PRD frontend testing choice.
- Inspect the repository, its applicable AGENTS.md files and the PRD before editing. Preserve unrelated work. Never replace existing repository instructions wholesale. If the repository is empty, scaffold only the current milestone.
- Local XAMPP is tooling: standard distributions may use MariaDB. Use separately installed MySQL matching production and point phpMyAdmin to it; Node runs independently. Do not claim MariaDB-only tests prove MySQL compatibility.
- Use modular services, repositories and provider adapters, explicit validation, central errors, versioned API contracts and least privilege. Keep controllers thin. Prefer practical modular architecture; do not introduce microservices without a demonstrated need.
- Apply schema migrations rather than manual production changes. Integration tests use a dedicated disposable MySQL schema; prevent test commands from targeting production. Test transaction locks and races against real MySQL, not an in-memory substitute. Use synthetic fixtures and no live personal identity data.
- NGN is the base settlement currency. Store money as integer minor units, with safe numeric handling and explicit rounding; snapshot prices, delivery allocation and commission rules. USD is indicative display only. Never add real USD settlement, wallets, escrow, coupons, variants, nationwide delivery or other excluded scope.
- Enforce ownership and roles on every protected operation, including sockets and downloads. Protect guest access with unguessable credentials. Hash passwords, rate limit sensitive operations, redact secrets and identity values, and keep auditable financial decisions.
- Use short database transactions, unique constraints and idempotency keys. Keep external network calls outside long transactions. Persist jobs and events; make retries safe and reconcile uncertain payment and transfer outcomes. A browser callback is never proof of payment.
- Mock provider adapters for repeatable local tests. Label provider test mode and live evidence separately. Consult current official Paystack and Dojah documentation before implementing their contracts; never fabricate webhook authentication. Missing credentials block provider acceptance, not independent local work.
- Never mark tests passed unless executed. Do not invent coverage, deployment status or provider results. Implement only this milestone, update its status and stop after closeout. Do not start the next milestone without a new instruction.

## Required milestone closeout
1. Run appropriate lint, type checking, unit tests, API tests and real MySQL integration tests. Resolve failures caused by the change; explicitly report any baseline failure or blocked check. Test meaningful negative, authorisation, concurrency, idempotency and recovery cases relevant to this milestone.
2. Commit no secrets. Update .env.example, migrations, API documentation and an importable Postman collection and environment using placeholders. Include exact request bodies, authentication, expected statuses and assertions, and the seed commands that create IDs. Do not include secret values in exports.
3. Write docs/milestones/Bxx-summary.md: scope completed, changed files, migrations and rollback or recovery, exact commands executed, pass/fail/skipped counts, relevant report paths, Postman evidence, provider checks, unresolved decisions and limitations. Distinguish local verification from acceptance.
4. Write docs/milestones/Bxx-test-results.md with actual evidence. Save automated test output in docs/milestones/evidence/Bxx/. Never substitute a test plan for test results.
5. Update docs/backend-milestones.md and AGENTS.md current milestone status. Allowed states: NOT_STARTED, IN_PROGRESS, LOCAL_VERIFIED, BLOCKED, READY_FOR_REVIEW, ACCEPTED. LOCAL_VERIFIED means required local checks passed; READY_FOR_REVIEW requires documented scope completion and known integration gates. ACCEPTED requires explicit owner acceptance, never infer it from passing tests.
6. Return a concise milestone summary, test summary, Postman usage instructions, migration risks and open gates, and the complete copy-ready prompt for the next milestone. For B12 provide handover instead of inventing B13. Stop here.
