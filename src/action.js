import { getSettings } from "./blocking.js";
import { getEligibleHostname } from "./site.js";

const ICONS = {
  blocked: {
    16: chrome.runtime.getURL("icons/on/icon-16.png"),
    32: chrome.runtime.getURL("icons/on/icon-32.png"),
  },
  allowed: {
    16: chrome.runtime.getURL("icons/off/icon-16.png"),
    32: chrome.runtime.getURL("icons/off/icon-32.png"),
  },
};

/**
 * @param {chrome.tabs.Tab} tab
 */
export async function updateActionForTab(tab) {
  if (tab.id === undefined) return;

  const hostname = getEligibleHostname(tab.url);
  const settings = hostname ? await getSettings() : null;
  const isAllowed = hostname !== null && settings?.allowedHostnames.includes(hostname) === true;

  await Promise.all([
    chrome.action.setIcon({ tabId: tab.id, path: isAllowed ? ICONS.allowed : ICONS.blocked }),
    chrome.action.setTitle({
      tabId: tab.id,
      title: isAllowed
        ? "このサイトの通信ブロックを有効にする"
        : hostname
          ? "このサイトの通信ブロックを解除する"
          : "このページでは使用できません",
    }),
    hostname ? chrome.action.enable(tab.id) : chrome.action.disable(tab.id),
  ]);
}

/** 全タブのaction状態を更新する。 */
export async function updateAllActions() {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map(updateActionForTab));
}
