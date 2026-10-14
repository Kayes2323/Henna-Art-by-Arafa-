import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { STRINGS, translate, detectLang } from "../js/i18n.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");

test("English and Bangla define exactly the same keys", () => {
  const en = Object.keys(STRINGS.en).sort();
  const bn = Object.keys(STRINGS.bn).sort();
  assert.deepEqual(bn, en);
});

test("{placeholders} match between languages and no value is empty", () => {
  const ph = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const k of Object.keys(STRINGS.en)) {
    assert.ok(STRINGS.en[k].trim() && STRINGS.bn[k].trim(), `${k} empty`);
    assert.equal(ph(STRINGS.bn[k]), ph(STRINGS.en[k]), `${k}: placeholder mismatch`);
  }
});

test("Bangla strings contain Bangla script (except brand-name key)", () => {
  for (const [k, v] of Object.entries(STRINGS.bn)) {
    if (k === "hero.eyebrow" || k === "occ.none") continue;
    assert.match(v, /[ঀ-৿]/, `${k} has no Bangla`);
  }
});

test("every data-i18n key used in index.html or main.js exists", () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-aria|-ph)?="([^"]+)"/g)) keys.add(m[1]);
  for (const m of main.matchAll(/\bt\(\s*["'`]([\w.]+)["'`]/g)) keys.add(m[1]);
  for (const k of ["time.any", "time.morning", "time.afternoon", "time.evening", "occ.none", "occ.wedding", "occ.eid", "occ.party", "occ.other"]) keys.add(k);
  assert.ok(keys.size > 40);
  for (const k of keys) assert.ok(k in STRINGS.en, `missing key: ${k}`);
});

test("translate fills variables and falls back to English", () => {
  assert.equal(translate("en", "art.more", { n: 4 }), "View more designs (4)");
  assert.match(translate("bn", "art.more", { n: 4 }), /\(4\)/);
  assert.equal(translate("xx", "art.all"), STRINGS.en["art.all"]);
});

test("detectLang: saved choice wins, Bangla browsers get Bangla, else default", () => {
  assert.equal(detectLang("bn", "en-US"), "bn");
  assert.equal(detectLang("en", "bn-BD"), "en");
  assert.equal(detectLang(null, "bn-BD"), "bn");
  assert.equal(detectLang(null, "en-US", "bn"), "bn");
  assert.equal(detectLang(null, "en-US"), "en");
  assert.equal(detectLang("zz", "fr"), "en");
});
