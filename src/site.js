/**
 * URLからAD切りの対象となる正規化済みhostnameを返す。
 * @param {string | undefined} value
 * @returns {string | null}
 */
export function getEligibleHostname(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname === "chromewebstore.google.com") return null;
    if (url.hostname === "chrome.google.com" && url.pathname.startsWith("/webstore")) return null;
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * textareaの1行をdeclarativeNetRequestで扱えるdomainへ正規化する。
 * @param {string} value
 * @returns {string | null}
 */
export function normalizeDomain(value) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const candidate = trimmed.startsWith("*.") ? trimmed.slice(2) : trimmed;
  if (candidate.includes(":")) return null;
  if (/[/?#@\s]/u.test(candidate)) return null;

  try {
    const url = new URL(`https://${candidate}`);
    if (!url.hostname || url.hostname !== url.host) return null;
    if (url.hostname.startsWith(".") || url.hostname.endsWith(".")) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * 1行1domainの入力を検証する。
 * @param {string} text
 * @returns {{ domains: string[], invalidLines: number[] }}
 */
export function parseDomainList(text) {
  const domains = [];
  const invalidLines = [];

  for (const [index, line] of text.split(/\r?\n/u).entries()) {
    const domain = normalizeDomain(line);
    if (domain) {
      domains.push(domain);
    } else if (line.trim() && !line.trim().startsWith("#")) {
      invalidLines.push(index + 1);
    }
  }

  return {
    domains: [...new Set(domains)].sort(),
    invalidLines,
  };
}
