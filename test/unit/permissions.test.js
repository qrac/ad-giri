import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(await readFile(resolve(rootDirectory, "manifest.json"), "utf8"));
const backgroundSource = await readFile(resolve(rootDirectory, "src/background.js"), "utf8");

test("manifestはtabsではなくactiveTabを要求する", () => {
  assert.ok(manifest.permissions.includes("activeTab"));
  assert.ok(!manifest.permissions.includes("tabs"));
});

test("背景処理は全タブのURL同期APIを使わない", () => {
  assert.match(backgroundSource, /chrome\.action\.onClicked\.addListener\(\(tab\)/u);
  assert.doesNotMatch(backgroundSource, /chrome\.tabs\.(get|query|onActivated|onUpdated)/u);
  assert.doesNotMatch(backgroundSource, /updateAllActions/u);
});
