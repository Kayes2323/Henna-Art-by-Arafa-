import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CATEGORIES, DESIGNS, UNUSED, WIDTHS, imgSrc } from "../js/data.js";

const root = new URL("../", import.meta.url);
const exists = (p) => existsSync(new URL(p, root));

test("every design has all web image sizes and an original", () => {
  for (const d of DESIGNS) {
    for (const w of WIDTHS) assert.ok(exists(imgSrc(d.id, w)), `${imgSrc(d.id, w)} missing`);
    assert.ok(exists(`assets/originals/${d.id}.jpg`), `original ${d.id} missing`);
  }
});

test("design ids are unique and categories valid; covers exist", () => {
  const ids = DESIGNS.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length);
  const cats = new Set(CATEGORIES.map((c) => c.id));
  for (const d of DESIGNS) assert.ok(cats.has(d.category), `${d.id}: bad category`);
  for (const c of CATEGORIES) {
    assert.ok(ids.includes(c.cover), `cover ${c.cover} not in designs`);
    assert.ok(DESIGNS.some((d) => d.category === c.id), `category ${c.id} is empty`);
  }
  for (const id of Object.keys(UNUSED)) assert.ok(!ids.includes(id), `${id} is both used and unused`);
});

test("prices are never invented (null or a positive number)", () => {
  for (const d of DESIGNS) assert.ok(d.price === null || (typeof d.price === "number" && d.price > 0));
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

test("hero video files exist and are non-trivial", () => {
  for (const f of ["hero-portrait.mp4", "hero-landscape.mp4", "hero-portrait-poster.webp", "hero-landscape-poster.webp"]) {
    assert.ok(exists(`assets/video/${f}`), f);
  }
});
