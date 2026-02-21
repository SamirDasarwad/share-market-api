# Share Market API (Order Splitter)

NestJS + Fastify API that splits model portfolio orders into per-stock allocations and stores them in memory (non-persistent).

## Requirements Met
- RESTful endpoints for order splitting and history.
- Strict validation using DTOs + class-validator.
- Configurable share quantity decimal places via `SHARE_DECIMALS` env var.
- Fixed default price of `100` unless a price is provided per stock.
- Response time instrumentation logged in ms.
- In-memory store (data does not survive restarts).
- Swagger docs at `/docs`.
- Unit tests + coverage configuration.
- Production-grade hardening: rate limiting, security headers, graceful shutdown hooks.
- Build stability: `skipLibCheck` enabled to avoid known type conflicts between Fastify/NestJS/CORS typings.

## Build Notes
- Some NestJS Fastify versions expose a type-level CORS mismatch. We keep strict typing for our code and isolate the workaround with narrow casts at the adapter boundary. Runtime behavior is unaffected.
- Swagger on Fastify requires `@fastify/static`, which is included.

## Setup
```bash
npm install
```

## Run
```bash
npm run start:dev
```

Environment variables:
- `PORT` (default `3000`)
- `SHARE_DECIMALS` (default `3`)

## API
### `POST /orders/split`
Splits a model portfolio order into allocations.

Example request:
```json
{
  "orderType": "BUY",
  "amount": 100,
  "portfolio": [
    { "symbol": "AAPL", "weight": 0.6 },
    { "symbol": "TSLA", "weight": 0.4, "price": 250.25 }
  ]
}
```

Example response:
```json
{
  "id": "ord_...",
  "orderType": "BUY",
  "amount": 100,
  "createdAt": "2026-02-19T14:01:00.000Z",
  "executeAt": "2026-02-19T14:01:00.000Z",
  "allocations": [
    {
      "symbol": "AAPL",
      "weight": 0.6,
      "priceUsed": 100,
      "amount": 60,
      "quantity": 0.6
    },
    {
      "symbol": "TSLA",
      "weight": 0.4,
      "priceUsed": 250.25,
      "amount": 40,
      "quantity": 0.16
    }
  ]
}
```

### `GET /orders`
Returns all historic orders (in-memory).

### `GET /orders/:id`
Returns a single order by id.

## Assumptions
- Portfolio weights are provided as decimals that sum to `1.0`.
- Total amount is USD with 2 decimals max.
- Execution time: if a request arrives Mon-Fri, execute immediately; if on weekend, schedule next Monday at 09:30 local time.
- Quantity rounding uses `ROUND_HALF_UP` to the configured `SHARE_DECIMALS`.

## Tests
```bash
npm test
npm run test:cov
```

## Libraries
- NestJS (Fastify adapter) for performance + structure.
- `class-validator` / `class-transformer` for strict input validation.
- `decimal.js` for safe decimal math.
- `@nestjs/swagger` for OpenAPI docs.
- Jest for unit testing.
