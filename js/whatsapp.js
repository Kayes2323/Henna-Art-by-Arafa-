// Pure helpers for building the WhatsApp click-to-chat link (unit-tested in tests/).

/** Keep digits only; return "" unless the result looks like an international number (8–15 digits). */
export function normalizeNumber(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : "";
}

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

const L = {
  en: {
    hello: "Hello Henna Art by Arafa!",
    intro: { order: "I would like to order henna cones.", reservation: "I would like to make a henna reservation.", general: "I would like to ask about your henna." },
    product: "Henna type", qty: "Quantity (cones)", design: "Design", price: "Price", name: "Name",
    address: "Delivery address", date: "Preferred date", time: "Preferred time", occasion: "Occasion", notes: "Notes",
    notSure: "Not sure yet – please help me choose",
    closing: { order: "Please confirm availability, delivery and the next steps.", reservation: "Please confirm availability and the next steps.", general: "" },
  },
  bn: {
    hello: "হ্যালো হেনা আর্ট বাই আরাফা!",
    intro: { order: "আমি মেহেদি কোন অর্ডার করতে চাই।", reservation: "আমি মেহেদি রিজার্ভেশন করতে চাই।", general: "আমি আপনাদের মেহেদি সম্পর্কে জানতে চাই।" },
    product: "মেহেদির ধরন", qty: "পরিমাণ (কোন)", design: "ডিজাইন", price: "দাম", name: "নাম",
    address: "ডেলিভারির ঠিকানা", date: "পছন্দের তারিখ", time: "পছন্দের সময়", occasion: "অনুষ্ঠান", notes: "অন্য কিছু",
    notSure: "এখনো ঠিক করিনি – সাহায্য করুন",
    closing: { order: "দয়া করে পাওয়া যাচ্ছে কিনা, ডেলিভারি ও পরের ধাপ জানাবেন।", reservation: "দয়া করে সময় খালি আছে কিনা ও পরের ধাপ জানাবেন।", general: "" },
  },
};

/**
 * Build the plain-text WhatsApp message.
 * kind: "order" (henna cones) | "reservation" (design appointment) | "general".
 * Optional lines are omitted when empty.
 */
export function buildMessage(kind, f = {}, lang = "en") {
  const t = L[lang] || L.en;
  const lines = [t.hello, "", t.intro[kind] || t.intro.general, ""];
  if (kind === "order") {
    lines.push(`${t.product}: ${clean(f.product)}`, `${t.qty}: ${clean(f.qty) || "1"}`);
    if (clean(f.price)) lines.push(`${t.price}: ${clean(f.price)}`);
    lines.push(`${t.name}: ${clean(f.name)}`, `${t.address}: ${clean(f.address)}`);
  } else if (kind === "reservation") {
    lines.push(`${t.design}: ${clean(f.design) || t.notSure}`);
    if (clean(f.price)) lines.push(`${t.price}: ${clean(f.price)}`);
    lines.push(`${t.name}: ${clean(f.name)}`, `${t.date}: ${clean(f.date)}`);
    if (clean(f.time)) lines.push(`${t.time}: ${clean(f.time)}`);
    if (clean(f.occasion)) lines.push(`${t.occasion}: ${clean(f.occasion)}`);
  }
  if (clean(f.notes)) lines.push(`${t.notes}: ${String(f.notes).trim()}`);
  if (t.closing[kind]) lines.push("", t.closing[kind]);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** https://wa.me/<number>?text=<encoded>. Returns "" when the number is missing/invalid. */
export function buildUrl(number, message) {
  const n = normalizeNumber(number);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/** Link without a form (header / footer / contact buttons). */
export function buildGeneralUrl(number, lang = "en") {
  return buildUrl(number, buildMessage("general", {}, lang));
}
