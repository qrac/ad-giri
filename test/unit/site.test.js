import assert from "node:assert/strict";
import test from "node:test";
import { getEligibleHostname, normalizeDomain, parseDomainList } from "../../src/site.js";

test("eligible web URLからhostnameだけを取り出す", () => {
  assert.equal(getEligibleHostname("https://WWW.Example.com/article?id=1"), "www.example.com");
  assert.equal(getEligibleHostname("http://localhost:8080/fixture"), "localhost");
});

test("Chrome内部ページとChrome Web Storeを対象外にする", () => {
  assert.equal(getEligibleHostname("chrome://extensions"), null);
  assert.equal(getEligibleHostname("chrome-extension://abc/options.html"), null);
  assert.equal(getEligibleHostname("https://chromewebstore.google.com/detail/example/abc"), null);
  assert.equal(getEligibleHostname("https://chrome.google.com/webstore/detail/example/abc"), null);
  assert.equal(getEligibleHostname("https://chrome.google.com/unrelated"), "chrome.google.com");
  assert.equal(getEligibleHostname(undefined), null);
});

test("domain入力を正規化する", () => {
  assert.equal(normalizeDomain(" Example.COM "), "example.com");
  assert.equal(normalizeDomain("*.ads.example.com"), "ads.example.com");
  assert.equal(normalizeDomain("example.com/path"), null);
  assert.equal(normalizeDomain("https://example.com"), null);
  assert.equal(normalizeDomain("# comment"), null);
});

test("domain一覧は重複排除・ソートし、不正行を返す", () => {
  assert.deepEqual(parseDomainList("b.example\na.example\nb.example\n# memo\nbad/path"), {
    domains: ["a.example", "b.example"],
    invalidLines: [5],
  });
});
