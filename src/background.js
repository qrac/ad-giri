import { updateActionForTab } from "./action.js";
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
    await initializeContextMenu();
  });
});

chrome.runtime.onStartup.addListener(() => {
  runSafely(async () => {
    await initializeBlocking();
  });
});

// activeTabでURLへアクセスできるのは、actionを直接クリックした直後のtabだけ。
// 全タブを列挙してアイコン状態を常時同期する処理は行わない。
chrome.action.onClicked.addListener((tab) => {
  runSafely(async () => {
    await toggleBlockingForTab(tab);
    await updateActionForTab(tab);
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === SETTINGS_MENU_ID) {
    runSafely(chrome.runtime.openOptionsPage);
  }
});
