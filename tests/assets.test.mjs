import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { PRODUCTS, STYLES, DESIGNS, UNUSED, WIDTHS, imgSrc } from "../js/data.js";
import { SITE } from "../js/config.js";

const root = new URL("../", import.meta.url);
const exists = (p) => existsSync(new URL(p, root));

test("every product and design has all web image sizes and an original/derived source", () => {
  for (const item of [...PRODUCTS.map((p) => ({ id: p.img })), ...DESIGNS]) {
    for (const w of WIDTHS) assert.ok(exists(imgSrc(item.id, w)), `${imgSrc(item.id, w)} missing`);
  }
  for (const d of DESIGNS) assert.ok(exists(`assets/originals/${d.id}.jpg`), `original ${d.id} missing`);
});

test("ids unique, styles valid, every style used, three products", () => {
  const ids = DESIGNS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  const styles = new Set(STYLES.map((s) => s.id));
  for (const d of DESIGNS) assert.ok(styles.has(d.style), `${d.id}: bad style`);
  for (const s of STYLES) assert.ok(DESIGNS.some((d) => d.style === s.id), `style ${s.id} is empty`);
  for (const id of Object.keys(UNUSED)) assert.ok(!ids.includes(id), `${id} is both used and unused`);
  assert.deepEqual(PRODUCTS.map((p) => p.id), ["organic", "pakistani", "nail"]);
});

test("every visible text has English and Bangla", () => {
  const need = (o, where) => { assert.ok(o.en && o.bn, `${where} needs en+bn`); };
  for (const p of PRODUCTS) { need(p.title, p.id); need(p.blurb, p.id); need(p.alt, p.id); }
  for (const s of STYLES) need(s.title, s.id);
  for (const d of DESIGNS) need(d.title, d.id);
});

test("prices are never invented (null or a positive number)", () => {
  for (const x of [...PRODUCTS, ...DESIGNS]) assert.ok(x.price === null || (typeof x.price === "number" && x.price > 0));
});

test("config shape", () => {
  assert.ok(["en", "bn"].includes(SITE.defaultLang));
  assert.equal(typeof SITE.whatsapp.number, "string");
  assert.equal(typeof SITE.social.facebook, "string");
});

test("every local path referenced in index.html / css exists", () => {
  const html = readFileSync(new URL("index.html", root), "utf8");
  const css = readFileSync(new URL("css/styles.css", root), "utf8");
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href|srcset)="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (u && !/^(#|https?:|mailto:|tel:|data:)/.test(u)) refs.add(u);
    }
  }
  for (const m of css.matchAll(/url\(([^)]+)\)/g)) refs.add(`css/${m[1].replace(/["']/g, "")}`);
  assert.ok(refs.size > 10);
  for (const r of refs) assert.ok(exists(r.replace(/^css\/\.\.\//, "")), `missing: ${r}`);
});

test("hero video files exist for both formats", () => {
  for (const f of ["hero-portrait.mp4", "hero-portrait.webm", "hero-landscape.mp4", "hero-landscape.webm", "hero-portrait-poster.webp", "hero-landscape-poster.webp"]) {
    assert.ok(exists(`assets/video/${f}`), f);
  }
});
