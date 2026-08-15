import { getEligibleHostname, normalizeDomain } from "./site.js";

export const DEFAULT_TARGET_DOMAINS = ["doubleclick.net", "googlesyndication.com"];

const TARGET_DOMAINS_KEY = "targetDomains";
const ALLOWED_HOSTNAMES_KEY = "allowedHostnames";
const ALLOW_RULE_ID_START = 1_000_001;
const ALLOW_RULE_PRIORITY = 100;
const BLOCK_RULE_PRIORITY = 1;

const BLOCKED_RESOURCE_TYPES = [
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "webtransport",
  "webbundle",
  "other",
];

/** @param {unknown} value */
function normalizeStoredDomains(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => typeof item === "string" ? normalizeDomain(item) : null)
    .filter((item) => item !== null))].sort();
}

/** @param {unknown} value */
function normalizeStoredHostnames(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && normalizeDomain(item) === item))]
    .sort();
}

/** @returns {Promise<{ targetDomains: string[], allowedHostnames: string[] }>} */
export async function getSettings() {
  const stored = await chrome.storage.local.get([TARGET_DOMAINS_KEY, ALLOWED_HOSTNAMES_KEY]);
  const hasTargetDomains = Object.hasOwn(stored, TARGET_DOMAINS_KEY);

  return {
    targetDomains: hasTargetDomains
      ? normalizeStoredDomains(stored[TARGET_DOMAINS_KEY])
      : [...DEFAULT_TARGET_DOMAINS],
    allowedHostnames: normalizeStoredHostnames(stored[ALLOWED_HOSTNAMES_KEY]),
  };
}

/**
 * @param {string[]} targetDomains
 * @returns {chrome.declarativeNetRequest.Rule[]}
 */
export function createBlockRules(targetDomains) {
  return targetDomains.map((domain, index) => ({
    id: index + 1,
    priority: BLOCK_RULE_PRIORITY,
    action: { type: /** @type {chrome.declarativeNetRequest.RuleActionType} */ ("block") },
    condition: {
      requestDomains: [domain],
      resourceTypes: /** @type {chrome.declarativeNetRequest.ResourceType[]} */ (BLOCKED_RESOURCE_TYPES),
    },
  }));
}

/**
 * main frameでallowAllRequestsを成立させ、その配下の通信をまとめて許可する。
 * @param {string[]} allowedHostnames
 * @returns {chrome.declarativeNetRequest.Rule[]}
 */
export function createAllowRules(allowedHostnames) {
  return allowedHostnames.map((hostname, index) => ({
    id: ALLOW_RULE_ID_START + index,
    priority: ALLOW_RULE_PRIORITY,
    action: { type: /** @type {chrome.declarativeNetRequest.RuleActionType} */ ("allowAllRequests") },
    condition: {
      requestDomains: [hostname],
      resourceTypes: [/** @type {chrome.declarativeNetRequest.ResourceType} */ ("main_frame")],
    },
  }));
}

/**
 * @param {{ targetDomains: string[], allowedHostnames: string[] }} settings
 */
async function applySettings(settings) {
  const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
  const rules = [
    ...createBlockRules(settings.targetDomains),
    ...createAllowRules(settings.allowedHostnames),
  ];

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: currentRules.map((rule) => rule.id),
    addRules: rules,
  });
  await chrome.storage.local.set({
    [TARGET_DOMAINS_KEY]: settings.targetDomains,
    [ALLOWED_HOSTNAMES_KEY]: settings.allowedHostnames,
  });
}

/** 保存状態から動的ルールを再構築する。 */
export async function initializeBlocking() {
  await applySettings(await getSettings());
}

/** @param {string[]} targetDomains */
export async function replaceTargetDomains(targetDomains) {
  const settings = await getSettings();
  await applySettings({
    ...settings,
    targetDomains: normalizeStoredDomains(targetDomains),
  });
}

/** @param {string} hostname */
export async function removeAllowedHostname(hostname) {
  const settings = await getSettings();
  await applySettings({
    ...settings,
    allowedHostnames: settings.allowedHostnames.filter((item) => item !== hostname),
  });
}

/**
 * 現在のサイトをホワイトリストへ追加・削除して再読み込みする。
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<"allowed" | "blocked" | "unsupported">}
 */
export async function toggleBlockingForTab(tab) {
  const hostname = getEligibleHostname(tab.url);
  if (!hostname || tab.id === undefined) return "unsupported";

  const settings = await getSettings();
  const isAllowed = settings.allowedHostnames.includes(hostname);
  const allowedHostnames = isAllowed
    ? settings.allowedHostnames.filter((item) => item !== hostname)
    : [...settings.allowedHostnames, hostname].sort();

  await applySettings({ ...settings, allowedHostnames });
  await chrome.tabs.reload(tab.id);
  return isAllowed ? "blocked" : "allowed";
}
