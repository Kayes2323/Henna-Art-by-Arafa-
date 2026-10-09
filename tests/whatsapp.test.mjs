import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNumber, buildMessage, buildUrl, buildGeneralUrl } from "../js/whatsapp.js";

test("normalizeNumber strips formatting and rejects invalid numbers", () => {
  assert.equal(normalizeNumber("+880 1712-345678"), "8801712345678");
  assert.equal(normalizeNumber(""), "");
  assert.equal(normalizeNumber(undefined), "");
  assert.equal(normalizeNumber("12345"), "");
  assert.equal(normalizeNumber("1".repeat(16)), "");
});

test("buildMessage includes required lines and omits empty optional ones", () => {
  const m = buildMessage({ designTitle: "Palm Lattice Design", name: "Maya", date: "", notes: "", price: "" });
  assert.match(m, /^Hello Henna Art by Arafa!/);
  assert.match(m, /Selected design: Palm Lattice Design/);
  assert.match(m, /Name: Maya/);
  assert.doesNotMatch(m, /Price:|Preferred date:|Notes:/);
  assert.match(m, /Please confirm availability and the next steps\.$/);
});

test("buildMessage includes price/date/notes when present", () => {
  const m = buildMessage({ designTitle: "X", price: "৳500", name: "A", date: "2026-12-01", notes: "Both hands\nplease" });
  assert.match(m, /Price: ৳500/);
  assert.match(m, /Preferred date: 2026-12-01/);
  assert.match(m, /Notes: Both hands\nplease/);
});

test("buildMessage falls back when no design chosen", () => {
  assert.match(buildMessage({ name: "A" }), /Selected design: Not sure yet/);
});

test("buildUrl encodes the message and round-trips", () => {
  const msg = buildMessage({ designTitle: "Bridal & Full Hand #1", name: "Zoë & Co", notes: "50% off? ✓" });
  const url = buildUrl("+880 1712-345678", msg);
  assert.ok(url.startsWith("https://wa.me/8801712345678?text="));
  const text = new URL(url).searchParams.get("text");
  assert.equal(text, msg);
  assert.doesNotMatch(url.split("?text=")[1], /[\s&#]/);
});

test("buildUrl returns empty string when number is not configured", () => {
  assert.equal(buildUrl("", "hi"), "");
  assert.equal(buildGeneralUrl(""), "");
  assert.ok(buildGeneralUrl("8801712345678").startsWith("https://wa.me/8801712345678?text="));
});
