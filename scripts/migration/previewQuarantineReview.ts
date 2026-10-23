import { readFile } from "node:fs/promises";

import { buildQuarantineReview } from "../../server/persistence/kv/liveKvStore.ts";

const [snapshotPath] = process.argv.slice(2);
if (!snapshotPath) {
  throw new Error("Usage: previewQuarantineReview.ts <orders-customers-snapshot.json>");
}

const snapshot = JSON.parse(await readFile(snapshotPath, "utf8")) as {
  orders?: unknown;
  customers?: unknown;
};

console.log(JSON.stringify(buildQuarantineReview(snapshot), null, 2));
