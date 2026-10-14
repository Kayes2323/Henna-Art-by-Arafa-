import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNumber, buildMessage, buildUrl, buildGeneralUrl } from "../js/whatsapp.js";

test("normalizeNumber strips formatting and rejects invalid numbers", () => {
  assert.equal(normalizeNumber("+880 1604-507268"), "8801604507268");
  assert.equal(normalizeNumber(""), "");
  assert.equal(normalizeNumber(undefined), "");
  assert.equal(normalizeNumber("12345"), "");
  assert.equal(normalizeNumber("1".repeat(16)), "");
});

test("order message (henna cones) has product, quantity, name and delivery address", () => {
  const m = buildMessage("order", { product: "Pakistani Henna", qty: 3, name: "Maya", address: "House 5, Road 2, Dhaka", notes: "" }, "en");
  assert.match(m, /^Hello Henna Art by Arafa!/);
  assert.match(m, /I would like to order henna cones\./);
  assert.match(m, /Henna type: Pakistani Henna/);
  assert.match(m, /Quantity \(cones\): 3/);
  assert.match(m, /Name: Maya/);
  assert.match(m, /Delivery address: House 5, Road 2, Dhaka/);
  assert.doesNotMatch(m, /Price:|Notes:/);
  assert.match(m, /confirm availability, delivery and the next steps\.$/);
});

test("reservation message includes design/date and omits empty optional lines", () => {
  const m = buildMessage("reservation", { design: "Palm Lattice Design", name: "Maya", date: "12 December 2026", time: "", occasion: "", notes: "" }, "en");
  assert.match(m, /make a henna reservation/);
  assert.match(m, /Design: Palm Lattice Design/);
  assert.match(m, /Preferred date: 12 December 2026/);
  assert.doesNotMatch(m, /Preferred time:|Occasion:|Notes:|Price:/);
});

test("reservation message includes price/time/occasion/notes when present", () => {
  const m = buildMessage("reservation", { design: "X", price: "৳500", name: "A", date: "d", time: "Evening", occasion: "Wedding", notes: "Both hands\nplease" }, "en");
  assert.match(m, /Price: ৳500/);
  assert.match(m, /Preferred time: Evening/);
  assert.match(m, /Occasion: Wedding/);
  assert.match(m, /Notes: Both hands\nplease/);
});

test("reservation falls back to 'not sure' when no design chosen", () => {
  assert.match(buildMessage("reservation", { name: "A", date: "d" }, "en"), /Design: Not sure yet/);
  assert.match(buildMessage("reservation", { name: "A", date: "d" }, "bn"), /ডিজাইন: এখনো ঠিক করিনি/);
});

test("Bangla messages use Bangla labels", () => {
  const m = buildMessage("order", { product: "অর্গানিক মেহেদি", qty: 2, name: "মায়া", address: "ঢাকা" }, "bn");
  assert.match(m, /হ্যালো হেনা আর্ট বাই আরাফা!/);
  assert.match(m, /পরিমাণ \(কোন\): 2/);
  assert.match(m, /ডেলিভারির ঠিকানা: ঢাকা/);
});

test("buildUrl encodes the message and round-trips (English and Bangla)", () => {
  for (const lang of ["en", "bn"]) {
    const msg = buildMessage("order", { product: "Organic & Co #1", qty: 2, name: "Zoë & মায়া", address: "50% off? ✓\nRoad 1" }, lang);
    const url = buildUrl("+880 1604-507268", msg);
    assert.ok(url.startsWith("https://wa.me/8801604507268?text="));
    assert.equal(new URL(url).searchParams.get("text"), msg);
    assert.doesNotMatch(url.split("?text=")[1], /[\s&#]/);
  }
});

test("buildUrl returns empty string when number is not configured", () => {
  assert.equal(buildUrl("", "hi"), "");
  assert.equal(buildGeneralUrl("", "en"), "");
  assert.ok(buildGeneralUrl("8801604507268", "bn").startsWith("https://wa.me/8801604507268?text="));
});
