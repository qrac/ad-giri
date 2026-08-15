export const SETTINGS_MENU_ID = "open-options";

/** 拡張アイコンの右クリックメニューを1項目だけ作る。 */
export async function initializeContextMenu() {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: SETTINGS_MENU_ID,
    title: "設定",
    contexts: ["action"],
  });
}
