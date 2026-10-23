# Repository Instructions

## Project

- Vite + React + TypeScript static frontend on GitHub Pages (`https://shopthaothao.khosihuythao.com`).
- Single API Worker `shopthaothao-api` (`wrangler.jsonc`) with KV `DB`; no MCP Worker, no Durable Object, no service binding. See `ARCHITECTURE.md`.
- Shop branding lives in `shop.config.ts`.

## Working Rules

- Make the smallest coherent change; preserve unrelated changes.
- Treat auth, session tokens, CORS, Worker bindings, and customer/order data as security-sensitive.
- Never print, commit, or log `TK_ADMIN`, `MK_ADMIN`, `SESSION_SIGNING_SECRET`.
- Do not deploy the Worker, run `npm run deploy`, change DNS, or touch KV without an explicit request for that action.
- Do not widen `ALLOWED_ORIGINS`.
- Never point this repo at the KSHT KV namespace or Workers.

## Checks

`npm run typecheck && npm run check:unused && npm test && npm run test:platform && npm run test:frontend && npm run build && npm run worker:dry-run`
