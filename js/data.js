// ============================================================================
//  PRODUCT / DESIGN MANIFEST  (edit this file to change what the site shows)
//
//  PRODUCTS  – the three kinds of henna cones that are sold.
//  DESIGNS   – the mehndi artwork gallery (strongest first). "Reserve this design" books a session.
//  UNUSED    – photos deliberately not on the page (kept in assets/originals).
//
//  - `price`: leave null until the owner confirms it. Prices are never shown when null.
//    Use a number (e.g. 100) to show it as ৳100.
//  - `focus`: CSS object-position so fingertips / centre motifs are never cropped out.
//  - Every text is { en, bn }  (simple English / simple Bangla).
// ============================================================================

export const PRODUCTS = [
  {
    id: "organic", img: "p01", focus: "50% 45%", price: null,
    title: { en: "Organic Henna", bn: "অর্গানিক মেহেদি" },
    blurb: { en: "Henna cones with the Henna Art by Arafa label.", bn: "হেনা আর্ট বাই আরাফা লেবেলের মেহেদি কোন।" },
    alt:   { en: "Henna cones with the Henna Art by Arafa label held in a hand", bn: "হেনা আর্ট বাই আরাফা লেবেলের মেহেদি কোন হাতে ধরা" },
  },
  {
    id: "pakistani", img: "p02", focus: "50% 50%", price: null,
    title: { en: "Pakistani Henna", bn: "পাকিস্তানি মেহেদি" },
    blurb: { en: "Pakistani-style black henna cones.", bn: "পাকিস্তানি ধাঁচের কালো মেহেদির কোন।" },
    alt:   { en: "Green Pakistani henna cones arranged in a circle", bn: "গোল করে সাজানো সবুজ পাকিস্তানি মেহেদির কোন" },
  },
  {
    id: "nail", img: "p03", focus: "50% 45%", price: null,
    title: { en: "Nail Henna", bn: "নখের মেহেদি" },
    blurb: { en: "Henna cones for colouring your nails.", bn: "নখে রং করার মেহেদির কোন।" },
    alt:   { en: "A fan of henna cones for nail henna", bn: "নখের মেহেদির কোন পাখার মতো সাজানো" },
  },
];

// Design styles used by the gallery filter.
export const STYLES = [
  { id: "bridal",  title: { en: "Bridal & Full Hand",   bn: "ব্রাইডাল ও ফুল হ্যান্ড" } },
  { id: "fingers", title: { en: "Back-Hand & Fingers",  bn: "হাতের পিঠ ও আঙুল" } },
  { id: "nail",    title: { en: "Nail Henna",           bn: "নখের মেহেদি" } },
];

const D = (id, style, en, bn, focus) => ({ id, style, title: { en, bn }, focus, price: null });

export const DESIGNS = [
  D("d16", "bridal",  "Rich Palm & Back-Hand Set",   "তালু ও হাতের পিঠের পূর্ণ সেট",    "50% 40%"),
  D("d01", "fingers", "Floral Wrist Cuff & Fingers", "ফুলের কবজি ও আঙুলের ডিজাইন",       "50% 62%"),
  D("d07", "bridal",  "Detailed Palm Design",        "হাতের তালুর বিস্তারিত ডিজাইন",     "55% 55%"),
  D("d10", "fingers", "Lattice Hand & Finger Bands", "জালি ডিজাইন ও আঙুলের বেল্ট",      "50% 68%"),
  D("d03", "bridal",  "Festive Bridal Hands",        "উৎসবের ব্রাইডাল মেহেদি",           "50% 55%"),
  D("d11", "fingers", "Geometric Back-Hand Design",  "জ্যামিতিক নকশার হাতের পিঠ",       "50% 45%"),
  D("d04", "fingers", "Mandala Back-Hand Pair",      "মান্ডালা ডিজাইন (দুই হাত)",       "50% 50%"),
  D("d15", "bridal",  "Full Back-Hand Design",       "হাতের পিঠের পূর্ণ ডিজাইন",         "50% 38%"),
  D("d20", "bridal",  "Bridal Palm Design",          "ব্রাইডাল তালুর ডিজাইন",            "50% 50%"),
  D("d06", "bridal",  "Palm & Back-Hand Showcase",   "তালু ও হাতের পিঠের ডিজাইন",       "50% 55%"),
  D("d17", "fingers", "Finger & Back-Hand Pattern",  "আঙুল ও হাতের পিঠের নকশা",         "56% 45%"),
  D("d19", "bridal",  "Palm Lattice Design",         "তালুর জালি ডিজাইন",                "45% 45%"),
  D("d14", "nail",    "Nail Henna",                  "নখের মেহেদি",                      "50% 25%"),
];

// Not on the page (still in assets/originals). Reasons help the owner re-use them later.
export const UNUSED = {
  d02: "Cone fan photo — replaced by the sharper version p03-nail-cones (used for Nail Henna).",
  d05: "Same design as d04 from another angle (avoid repeating).",
  d08: "Same design as d06/d07, hands small and background blurred.",
  d09: "Used as the wide editorial strip instead of the gallery.",
  d12: "Same design as d11 with a 'Review' badge over the wrist.",
  d13: "Nail photo with a price label burned over the nails.",
  d18: "Same hand and design as d17 (avoid repeating).",
};

export const WIDTHS = [480, 800, 1200];
export const imgSrc = (id, w) => `assets/img/${id}-${w}.webp`;
export const imgSrcset = (id) => WIDTHS.map((w) => `${imgSrc(id, w)} ${w}w`).join(", ");
