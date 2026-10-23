import assert from "node:assert/strict";
import test from "node:test";

import { handleKshtApi } from "../../server/http/ksht.ts";
import { createPublicCatalogStore } from "../../server/http/publicCatalogCache.ts";
import { LIVE_STATE_KEY } from "../../server/persistence/kv/liveKvStore.ts";

class MemoryKv {
  values = new Map<string, string>();
  async get(key: string, type?: "json") {
    const value = this.values.get(key);
    if (value === undefined) return null;
    return type === "json" ? JSON.parse(value) : value;
  }
  async put(key: string, value: string) {
    this.values.set(key, value);
  }
}

test("shopthaothao-api serves /api/v1 from KV without a GIABAN binding", async () => {
  const kv = new MemoryKv();
  const env = {
    SESSION_SIGNING_SECRET: "sign",
    TK_ADMIN: "admin",
    MK_ADMIN: "pw",
    ALLOWED_ORIGINS: "",
    LOGIN_RATE_LIMITER: { async limit() { return { success: true }; } },
    DB: kv,
    PUBLIC_CATALOG_CACHE: createPublicCatalogStore(),
  };
  const login = await handleKshtApi(new Request("https://w.example/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "pw" }),
  }), env);
  const { token } = await login.json() as { token: string };

  const created = await handleKshtApi(new Request("https://w.example/api/v1/categories", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "idempotency-key": "k1" },
    body: JSON.stringify({ label: "Cọ", value: "PAINT" }),
  }), env);
  assert.ok(created.status < 300, `create status ${created.status}: ${await created.clone().text()}`);
  assert.ok(kv.values.has(LIVE_STATE_KEY));

  const listed = await handleKshtApi(new Request("https://w.example/api/v1/public/categories", {
    headers: { "cache-control": "no-cache" },
  }), env);
  assert.equal(listed.status, 200);
  assert.match(await listed.text(), /Cọ/);

  const anon = await handleKshtApi(new Request("https://w.example/api/v1/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ label: "X", value: "X" }),
  }), env);
  assert.equal(anon.status, 401);
});

test("production KV path (no GIABAN hook): every non-public route is 401 without a valid token", async () => {
  const { API_V1_ROUTES } = await import("../../server/http/adapter.ts");
  const kv = new MemoryKv();
  const env = {
    SESSION_SIGNING_SECRET: "sign", TK_ADMIN: "admin", MK_ADMIN: "pw", ALLOWED_ORIGINS: "",
    LOGIN_RATE_LIMITER: { async limit() { return { success: true }; } },
    DB: kv, PUBLIC_CATALOG_CACHE: createPublicCatalogStore(),
  };
  for (const route of API_V1_ROUTES.filter((r) => !r.public)) {
    const path = typeof route.path === "string" ? route.path : route.path.source.replace(/^\^/, "").replace(/\$$/, "").replace(/\\\//g, "/").replace("([^/]+)", "x");
    for (const headers of [{}, { Authorization: "Bearer forged.token" }]) {
      const response = await handleKshtApi(new Request(`https://w.example${path}`, {
        method: route.method, headers, body: route.method === "GET" ? undefined : "{}",
      }), env);
      assert.equal(response.status, 401, `${route.method} ${path}`);
    }
  }
  assert.equal(kv.values.size, 0, "rejected requests must not touch KV");
});
