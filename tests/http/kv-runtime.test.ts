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
