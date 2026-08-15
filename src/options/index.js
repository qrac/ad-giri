import { getSettings, removeAllowedHostname, replaceTargetDomains } from "../blocking.js";
import { parseDomainList } from "../site.js";

const list = document.querySelector("#site-list");
const emptyMessage = document.querySelector("#empty-message");
const form = document.querySelector("#domain-form");
const input = document.querySelector("#domain-input");
const status = document.querySelector("#domain-status");

if (!(list instanceof HTMLUListElement)) throw new Error("site-list is missing");
if (!(emptyMessage instanceof HTMLParagraphElement)) throw new Error("empty-message is missing");
if (!(form instanceof HTMLFormElement)) throw new Error("domain-form is missing");
if (!(input instanceof HTMLTextAreaElement)) throw new Error("domain-input is missing");
if (!(status instanceof HTMLOutputElement)) throw new Error("domain-status is missing");

const siteList = list;
const noSitesMessage = emptyMessage;
const domainForm = form;
const domainInput = input;
const domainStatus = status;

/** @param {string[]} hostnames */
function renderAllowedSites(hostnames) {
  siteList.replaceChildren();
  noSitesMessage.hidden = hostnames.length > 0;

  for (const hostname of hostnames) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const button = document.createElement("button");

    label.textContent = hostname;
    button.type = "button";
    button.textContent = "削除";
    button.setAttribute("aria-label", `${hostname}をホワイトリストから削除`);
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await removeAllowedHostname(hostname);
        renderAllowedSites((await getSettings()).allowedHostnames);
      } catch (error) {
        console.error(error);
        button.disabled = false;
      }
    });

    item.append(label, button);
    siteList.append(item);
  }
}

domainForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  domainStatus.classList.remove("error");

  const { domains, invalidLines } = parseDomainList(domainInput.value);
  if (invalidLines.length > 0) {
    domainStatus.textContent = `${invalidLines.join(", ")}行目を確認してください。`;
    domainStatus.classList.add("error");
    return;
  }

  const button = domainForm.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) return;
  button.disabled = true;
  domainStatus.textContent = "保存中…";

  try {
    await replaceTargetDomains(domains);
    domainInput.value = domains.join("\n");
    domainStatus.textContent = `${domains.length}件を保存しました。`;
  } catch (error) {
    console.error(error);
    domainStatus.textContent = "保存できませんでした。もう一度お試しください。";
    domainStatus.classList.add("error");
  } finally {
    button.disabled = false;
  }
});

async function initialize() {
  const settings = await getSettings();
  renderAllowedSites(settings.allowedHostnames);
  domainInput.value = settings.targetDomains.join("\n");
}

void (async () => {
  try {
    await initialize();
  } catch (error) {
    console.error(error);
    domainStatus.textContent = "設定を読み込めませんでした。";
    domainStatus.classList.add("error");
  }
})();
