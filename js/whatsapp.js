// Pure helpers for building the WhatsApp click-to-chat link (unit-tested in tests/).

/** Keep digits only; return "" unless the result looks like an international number (8–15 digits). */
export function normalizeNumber(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : "";
}

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

/** Build the plain-text message. Optional lines are omitted when empty. */
export function buildMessage({ designTitle, price, name, date, notes } = {}) {
  const lines = [
    "Hello Henna Art by Arafa!",
    "",
    "I am interested in ordering a henna design.",
    "",
    `Selected design: ${clean(designTitle) || "Not sure yet – please help me choose"}`,
  ];
  if (clean(price)) lines.push(`Price: ${clean(price)}`);
  lines.push(`Name: ${clean(name)}`);
  if (clean(date)) lines.push(`Preferred date: ${clean(date)}`);
  if (clean(notes)) lines.push(`Notes: ${String(notes).trim()}`);
  lines.push("", "Please confirm availability and the next steps.");
  return lines.join("\n");
}

/** https://wa.me/<number>?text=<encoded>. Returns "" when the number is missing/invalid. */
export function buildUrl(number, message) {
  const n = normalizeNumber(number);
  if (!n) return "";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

/** Link without a prefilled form (header / footer / hero buttons). */
export function buildGeneralUrl(number) {
  return buildUrl(number, "Hello Henna Art by Arafa! I would like to ask about your henna designs.");
}
