// ============================================================================
//  DESIGN / CATEGORY MANIFEST
//  Photographs live in assets/img (web-optimised) and assets/originals (untouched).
//  To change what appears on the site, edit this file only.
//
//  - `price`: leave null until the owner confirms it. Prices are never shown when null.
//  - `title`: neutral descriptive names – rename freely.
//  - `focus`: CSS object-position so important parts of the artwork are never cropped out.
// ============================================================================

export const CATEGORIES = [
  {
    id: "nail",
    title: "Nail Henna",
    titleBn: "নখের মেহেদি",
    blurb: "Simple, elegant henna colour for your nails.",
    cover: "d14",
  },
  {
    id: "bridal",
    title: "Bridal & Full Hand",
    titleBn: "ব্রাইডাল ও ফুল হ্যান্ড",
    blurb: "Rich, detailed designs for weddings and celebrations.",
    cover: "d03",
  },
  {
    id: "fingers",
    title: "Back-Hand & Fingers",
    titleBn: "হাতের পিঠ ও আঙুল",
    blurb: "Delicate patterns, finger bands and modern cuffs.",
    cover: "d11",
  },
];

// Ordered strongest-first. Similar looking designs are deliberately kept apart.
export const DESIGNS = [
  { id: "d16", category: "bridal",  title: "Rich Palm & Back-Hand Set",    alt: "Henna on both hands with floral and lattice patterns in soft window light", focus: "50% 40%", price: null },
  { id: "d01", category: "fingers", title: "Floral Wrist Cuff & Fingers",  alt: "Hand with a floral wrist cuff and finger henna against a sheer embroidered curtain", focus: "50% 62%", price: null },
  { id: "d07", category: "bridal",  title: "Detailed Palm Design",         alt: "Open palm covered in deep red henna with paisley and floral motifs", focus: "55% 55%", price: null },
  { id: "d10", category: "fingers", title: "Lattice Hand & Finger Bands",  alt: "Back of hand with a lattice pattern and finger bands wearing a gold bracelet", focus: "50% 68%", price: null },
  { id: "d03", category: "bridal",  title: "Festive Bridal Hands",         alt: "Both hands in dense bridal henna, styled with flowers and festive fabric", focus: "50% 55%", price: null },
  { id: "d11", category: "fingers", title: "Geometric Back-Hand Design",   alt: "Back of hand with a boxed paisley motif, scalloped border and lattice fingers", focus: "50% 45%", price: null },
  { id: "d04", category: "fingers", title: "Mandala Back-Hand Pair",       alt: "Two raised hands showing round floral mandala designs and leafy finger patterns", focus: "50% 50%", price: null },
  { id: "d15", category: "bridal",  title: "Full Back-Hand Design",        alt: "Intricately henna-ed hand resting in another hand, with a gold bangle", focus: "50% 38%", price: null },
  { id: "d20", category: "bridal",  title: "Bridal Palm Design",           alt: "Bride's hands with detailed palm henna, bangles and a red festive saree", focus: "50% 50%", price: null },
  { id: "d06", category: "bridal",  title: "Palm & Back-Hand Showcase",    alt: "One palm and one back-hand with bold henna in rich red-brown", focus: "50% 55%", price: null },
  { id: "d17", category: "fingers", title: "Finger & Back-Hand Pattern",   alt: "Henna on a hand reaching out over green grass, with a pearl bracelet", focus: "56% 45%", price: null },
  { id: "d19", category: "bridal",  title: "Palm Lattice Design",          alt: "Open palm with lattice and geometric henna, a floral wrist design and pearl bracelet", focus: "45% 45%", price: null },
  { id: "d14", category: "nail",    title: "Nail Henna",                   alt: "Fingers with deep red henna applied to the nails", focus: "50% 25%", price: null },
];

// Not on the page (kept in assets/originals). Reasons help the owner re-use them later.
export const UNUSED = {
  d02: "Henna cones with third-party packaging – not the brand's own artwork.",
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
