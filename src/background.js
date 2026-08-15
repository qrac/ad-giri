import { updateActionForTab, updateAllActions } from "./action.js";
import { initializeBlocking, toggleBlockingForTab } from "./blocking.js";
import { initializeContextMenu, SETTINGS_MENU_ID } from "./context-menu.js";

/** @param {() => Promise<unknown>} task */
function runSafely(task) {
  void (async () => {
    try {
      await task();
    } catch (error) {
      console.error(error);
    }
  })();
}

chrome.runtime.onInstalled.addListener(() => {
  runSafely(async () => {
    await initializeBlocking();
    await Promise.all([initializeContextMenu(), updateAllActions()]);
  });
});

chrome.runtime.onStartup.addListener(() => {
  runSafely(async () => {
    await initializeBlocking();
    await updateAllActions();
  });
});

chrome.action.onClicked.addListener((tab) => {
  runSafely(async () => {
    await toggleBlockingForTab(tab);
    await updateActionForTab(tab);
  });
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  runSafely(async () => {
    await updateActionForTab(await chrome.tabs.get(tabId));
  });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" || changeInfo.url) {
    runSafely(async () => updateActionForTab(tab));
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.allowedHostnames || changes.targetDomains)) {
    runSafely(updateAllActions);
  }
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === SETTINGS_MENU_ID) {
    runSafely(chrome.runtime.openOptionsPage);
  }
});
