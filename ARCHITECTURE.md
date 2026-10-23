# Architecture

One Worker, one KV namespace, one static frontend.

## Frontend

- Vite + React 19 + TS, GitHub Pages of `thoitiettxl-cyber/shopthaothao` (`gh-pages` branch), custom domain `https://shopthaothao.khosihuythao.com` (`public/CNAME`, Vite `base: './'`).
- DNS (Cloudflare zone `khosihuythao.com`): CNAME `shopthaothao` → `thoitiettxl-cyber.github.io`, DNS-only. Do not attach a Worker to this hostname.
- Branding/contact data: `shop.config.ts`. API base: `VITE_API_URL` → `SHOP.defaultApiUrl`.

## API Worker `shopthaothao-api`

- Config `wrangler.jsonc`, entry `workers/api/index.ts` → `server/http/ksht.ts`.
- `/api/v1/*`: session verified in the Worker, then `handleBrowserApiOverKv` (`server/persistence/kv/kvRuntime.ts`) opens `LiveKvStore` over KV `DB` and dispatches to `GiabanApplication`. Requests are serialized per isolate; the pending-publish journal and committed mirror live in isolate memory.
- Compatibility `/api/data` GET, `/api/login`, `/api/status` and fenced whole-key POST (423) stay in `cloudflare_worker.js`.
- Public reads: products, categories, settings (no cost price). Private data needs the signed session.
- CORS allowlist (`ALLOWED_ORIGINS`) is not authentication.
- Secrets: `TK_ADMIN`, `MK_ADMIN`, `SESSION_SIGNING_SECRET`.

## Removed vs KSHT

- `ksht-mcp` Worker, `GiabanShop` Durable Object, `GIABAN` service binding, owner `KSHT_API_KEY` MCP endpoint.
- Trade-off: without the DO, concurrent writes from different isolates are not serialized, and a crash mid multi-key publish is not replayed. Acceptable for a single admin; revisit if multiple staff write at once.
