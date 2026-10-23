# shopthaothao

Ứng dụng báo giá và quản lý bán hàng cho Shop Thảo Thảo, nhân bản từ KSHT (Kho Sỉ Huy Thảo) với dữ liệu tách biệt.

## Kiến trúc

- Frontend: React 19 + TypeScript + Vite, GitHub Pages, `https://shopthaothao.khosihuythao.com` (`public/CNAME`). DNS: CNAME `shopthaothao` → `thoitiettxl-cyber.github.io`, DNS-only.
- Backend: một Worker `shopthaothao-api` trên workers.dev (`wrangler.jsonc`, `workers/api/index.ts`). `/api/v1` chạy in-process (`server/persistence/kv/kvRuntime.ts`) trên KV `DB`; `cloudflare_worker.js` lo `/api/data` GET, `/api/login`, `/api/status`.
- Không có MCP Worker, Durable Object, hay Service Binding.
- Thông tin shop (tên, địa chỉ, SĐT, bản đồ, URL API mặc định): `shop.config.ts`.
- URL API: `VITE_API_URL` lúc build, fallback `SHOP.defaultApiUrl` (`https://shopthaothao-api.ngthanhhuy951.workers.dev`).

Phiên quản trị là token ký 8 giờ trong `sessionStorage` (hoặc `localStorage` khi chọn «Ghi nhớ đăng nhập»). Root secret không bao giờ rời Worker.

## Chạy và kiểm tra

```bash
npm ci
npm run typecheck
npm run check:unused
npm test
npm run test:platform
npm run test:frontend
npm run build
npm run worker:dry-run
```

`localhost:3000` không nằm trong `ALLOWED_ORIGINS`; UI local fallback sang dữ liệu mẫu `constants.ts`.

## Cấu hình Worker (`wrangler.jsonc`)

- KV `DB` — **TODO**: điền id KV namespace mới (không dùng KV của KSHT).
- Rate limiter `LOGIN_RATE_LIMITER` — **TODO**: điền `namespace_id` số nguyên mới.
- Biến: `ALLOWED_ORIGINS=https://shopthaothao.khosihuythao.com`
- Secrets: `TK_ADMIN`, `MK_ADMIN`, `SESSION_SIGNING_SECRET`

Không ghi secret vào source, `.env`, hay `VITE_*`. `npx wrangler deploy` và `npm run deploy` (gh-pages) là thao tác production, chỉ chạy khi chủ cho phép.

## Dữ liệu ban đầu

`migrations/catalog/*.json` là catalog KSHT ngày 2026-09-04, dùng làm điểm xuất phát nếu chủ muốn nạp vào KV mới.
