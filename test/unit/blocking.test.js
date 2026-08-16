import assert from "node:assert/strict";
import test from "node:test";

globalThis.chrome = {};
const {
  createAllowRules,
  createBlockRules,
  getSettings,
  initializeBlocking,
  toggleBlockingForTab,
} = await import("../../src/blocking.js");

test("対象domainごとに通信ブロックruleを作る", () => {
  const rules = createBlockRules(["doubleclick.net", "googlesyndication.com"]);
  const rule = rules[0];
  assert.ok(rule);
  assert.equal(rules.length, 2);
  assert.equal(rule.id, 1);
  assert.equal(rule.priority, 1);
  assert.equal(rule.action.type, "block");
  assert.deepEqual(rule.condition.requestDomains, ["doubleclick.net"]);
  assert.ok(rule.condition.resourceTypes?.includes("script"));
  assert.ok(!rule.condition.resourceTypes?.includes("main_frame"));
});

test("ホワイトリストは高優先度のallowAllRequests ruleにする", () => {
  const [rule] = createAllowRules(["www.example.com"]);
  assert.ok(rule.id > 1_000_000);
  assert.equal(rule.priority, 100);
  assert.equal(rule.action.type, "allowAllRequests");
  assert.deepEqual(rule.condition.requestDomains, ["www.example.com"]);
  assert.deepEqual(rule.condition.resourceTypes, ["main_frame"]);
});

test("初期状態はブロック有効で、クリックしたサイトだけをホワイトリスト化する", async () => {
  /** @type {Record<string, unknown>} */
  const stored = {};
  /** @type {chrome.declarativeNetRequest.Rule[]} */
  let dynamicRules = [];
  /** @type {number[]} */
  const reloadedTabIds = [];

  globalThis.chrome = /** @type {typeof chrome} */ (/** @type {unknown} */ ({
    storage: {
      local: {
        async get(/** @type {string[]} */ keys) {
          const requestedKeys = keys;
          return Object.fromEntries(
            requestedKeys.filter((key) => Object.hasOwn(stored, key)).map((key) => [key, stored[key]]),
          );
        },
        async set(/** @type {Record<string, unknown>} */ values) {
          Object.assign(stored, values);
        },
      },
    },
    declarativeNetRequest: {
      async getDynamicRules() {
        return dynamicRules;
      },
      async updateDynamicRules(
        /** @type {chrome.declarativeNetRequest.UpdateRuleOptions} */ {
          removeRuleIds = [],
          addRules = [],
        },
      ) {
        dynamicRules = dynamicRules
          .filter((rule) => !removeRuleIds.includes(rule.id))
          .concat(addRules);
      },
    },
    tabs: {
      async reload(/** @type {number | undefined} */ tabId) {
        if (tabId !== undefined) reloadedTabIds.push(tabId);
      },
    },
  }));

  await initializeBlocking();
  assert.deepEqual((await getSettings()).targetDomains, [
    "doubleclick.net",
    "googlesyndication.com",
  ]);
  assert.equal(dynamicRules.filter((rule) => rule.action.type === "block").length, 2);
  assert.equal(dynamicRules.filter((rule) => rule.action.type === "allowAllRequests").length, 0);

  assert.equal(
    await toggleBlockingForTab(/** @type {chrome.tabs.Tab} */ (/** @type {unknown} */ ({
      id: 7,
      url: "https://www.example.com/article",
    }))),
    "allowed",
  );
  assert.deepEqual((await getSettings()).allowedHostnames, ["www.example.com"]);
  assert.equal(dynamicRules.filter((rule) => rule.action.type === "allowAllRequests").length, 1);

  assert.equal(
    await toggleBlockingForTab(/** @type {chrome.tabs.Tab} */ (/** @type {unknown} */ ({
      id: 7,
      url: "https://www.example.com/article",
    }))),
    "blocked",
  );
  assert.deepEqual((await getSettings()).allowedHostnames, []);
  assert.deepEqual(reloadedTabIds, [7, 7]);
});
