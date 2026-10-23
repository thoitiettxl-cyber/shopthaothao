import { GiabanApplication } from "../../application/giaban.ts";
import { dispatchBrowserApi, type BrowserApiEnvelope, type BrowserApiResult } from "../../http/browserApi.ts";
import { LiveKvStore, type CoordinatorStorage, type LiveKvNamespace } from "./liveKvStore.ts";

// In-process replacement for the former ksht-mcp Durable Object coordinator.
// Each request opens a LiveKvStore over KV. The coordinator (pending-publish
// journal + last committed mirror) lives in isolate memory only, so Workers KV
// `DB` is the only persistent store; the mirror shields reads from KV edge-cache
// staleness within the same isolate. Requests inside one isolate
// are serialized; concurrent admin writes from different isolates are not
// coordinated (acceptable for a single-owner shop).
const isolateCoordinator = (): CoordinatorStorage => {
  const data = new Map<string, unknown>();
  return {
    async get<T>(key: string): Promise<T | undefined> {
      return data.get(key) as T | undefined;
    },
    async put(key: string, value: unknown): Promise<void> {
      data.set(key, structuredClone(value));
    },
    async delete(key: string): Promise<boolean> {
      return data.delete(key);
    },
  } as CoordinatorStorage;
};

const coordinator = isolateCoordinator();
let tail: Promise<unknown> = Promise.resolve();

export const handleBrowserApiOverKv = (kv: LiveKvNamespace, envelope: BrowserApiEnvelope): Promise<BrowserApiResult> => {
  const run = tail.then(async () => {
    const store = await LiveKvStore.open(coordinator, kv);
    await store.flushPending();
    await store.refreshConsistency();
    return dispatchBrowserApi(new GiabanApplication(store), envelope);
  });
  tail = run.catch(() => undefined);
  return run;
};
