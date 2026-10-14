// ============================================================================
//  SITE CONFIGURATION  –  the only file the owner needs to edit for contact info
// ============================================================================
//  WhatsApp number: country code + number, digits only. Example (Bangladesh): "8801XXXXXXXXX"
//  Leave "" until the real number is known: ordering buttons then show a friendly
//  "ordering is being set up" notice instead of opening a wrong chat.
// ============================================================================
export const SITE = {
  brand: {
    name: "Henna Art by Arafa",
    nameBn: "হেনা আর্ট বাই আরাফা",
    headline: "Artistry in Every Detail.",
    subline: "Beautiful henna. Thoughtfully created. Uniquely yours.",
  },

  whatsapp: {
    number: "8801604507268",        // <-- OWNER: put the WhatsApp number here, e.g. "8801712345678"
  },

  // Exact official URLs only. Empty string = link not set yet (its button shows "coming soon").
  social: {
    facebook: "https://www.facebook.com/share/1JE4SzuVGE/",       // <-- OWNER: official Facebook page URL
    instagram: "",        // optional
  },

  // "en" or "bn": language shown first to visitors (a visitor's own choice is remembered; Bangla browsers get Bangla).
  defaultLang: "en",

  currencySymbol: "৳",
};
