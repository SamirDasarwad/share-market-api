# Answers

## Approach
I designed a minimal NestJS (Fastify) API with strict DTO validation, a deterministic splitter service, and an in-memory order store. The structure mirrors production readiness: module boundaries, DTOs, validation, interceptors for observability, and Swagger for documentation. Allocation math uses `decimal.js` for predictable rounding.

## Assumptions
- Portfolio weights are provided as decimals summing to `1.0`.
- Amount is in USD; max 2 decimals.
- Orders execute immediately on weekdays; weekend submissions execute next Monday at 09:30 local time.
- Quantity rounding uses `ROUND_HALF_UP` with `SHARE_DECIMALS` configurable via env.

## Challenges
- Balancing simplicity with production-grade rigor (strict validation, rounding precision, and an extensible structure) while keeping scope small.
- Defining an execution schedule when markets are open is ambiguous; I documented a clear, testable assumption.
- A known type mismatch between NestJS Fastify adapter and CORS types surfaced during compilation. I isolated the impact to adapter typings (not runtime) and applied a safe cast + `skipLibCheck` to keep strict typing in our code while avoiding upstream library conflicts.
- Fastify-based e2e tests run without binding to a TCP port (using Fastify's inject) to keep tests hermetic and CI-friendly.

## Production Migration Improvements
- Add persistent storage (PostgreSQL) with migrations; include idempotency keys for order creation.
- Introduce authentication/authorization (JWT or mTLS) and request signing for partner integrations.
- Externalize pricing and portfolio validation to services; add caching for price lookups.
- Add structured logging (JSON), tracing (OpenTelemetry), and metrics (Prometheus) instead of console logs.
- Implement rate limiting per partner and request quotas.
- Add CI with test coverage gates, SAST, dependency scanning, and containerized deployment.
- Add Docker packaging for consistent runtime and a Kubernetes deployment profile (HPA, readiness/liveness probes, resource limits) to support scalable, resilient production operations.

## LLM Usage
I used an LLM to scaffold the NestJS project structure, propose DTO validation rules, and draft README/ANSWERS content. It helped speed up boilerplate creation and ensure all requirements were reflected in documentation.
