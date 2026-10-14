import { SITE } from "./config.js";
import { PRODUCTS, STYLES, DESIGNS, imgSrc, imgSrcset } from "./data.js";
import { translate, detectLang, LANGS } from "./i18n.js";
import { normalizeNumber, buildMessage, buildUrl, buildGeneralUrl } from "./whatsapp.js";

document.documentElement.classList.add("js");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else if (v === true) node.setAttribute(k, "");
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  kids.flat().forEach((c) => c != null && node.append(c));
  return node;
}

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode: ignore */ } },
};

/* --------------------------------------------------------------- language */
let lang = detectLang(store.get("henna-lang"), navigator.language, SITE.defaultLang);
const t = (key, vars) => translate(lang, key, vars);
const tr = (obj) => obj[lang] ?? obj.en;                     // { en, bn } helper
const waNumber = normalizeNumber(SITE.whatsapp.number);
const formatPrice = (item) => (typeof item.price === "number" ? `${SITE.currencySymbol}${item.price.toLocaleString("en-US")}` : "");
const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const designById = Object.fromEntries(DESIGNS.map((d) => [d.id, d]));
const styleById = Object.fromEntries(STYLES.map((s) => [s.id, s]));

function applyStatic() {
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach((n) => {
    const text = t(n.dataset.i18n, { year: new Date().getFullYear() });
    // keep announced strings that contain a child element (none today) intact
    n.textContent = text;
  });
  $$("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
  $$("[data-i18n-ph]").forEach((n) => n.setAttribute("placeholder", t(n.dataset.i18nPh)));
  $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  navToggle.setAttribute("aria-label", t(navToggle.getAttribute("aria-expanded") === "true" ? "menuClose" : "menuOpen"));
  document.title = lang === "bn" ? "হেনা আর্ট বাই আরাফা — প্রতিটি নকশায় শিল্পের ছোঁয়া" : "Henna Art by Arafa — Artistry in Every Detail";
  wireContacts();
}

function setLang(next) {
  if (!LANGS.includes(next) || next === lang) return;
  lang = next;
  store.set("henna-lang", lang);
  renderAll(false);
  if (lb.open) paintLightbox();
}

/* ------------------------------------------------------------------ header */
const header = $(".site-header");
const navToggle = $(".nav-toggle");
const nav = $("#site-nav");
const onScroll = () => header.classList.toggle("is-stuck", scrollY > 60);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setNav(open) {
  nav.classList.toggle("is-open", open);
  header.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", t(open ? "menuClose" : "menuOpen"));
  document.body.style.overflow = open ? "hidden" : "";
}
navToggle.addEventListener("click", () => setNav(navToggle.getAttribute("aria-expanded") !== "true"));
$$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));
$$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

/* ------------------------------------------------------- contact / social */
function wireContacts() {
  const general = buildGeneralUrl(waNumber, lang);
  $$("[data-wa-general]").forEach((a) => {
    if (general) {
      a.href = general;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      a.href = "#contact";
    }
  });
  if (waNumber) $$("[data-wa-text]").forEach((a) => (a.textContent = `+${waNumber}`));

  const fb = SITE.social.facebook.trim();
  $$("[data-facebook]").forEach((a) => {
    if (fb) {
      a.href = fb;
      a.removeAttribute("aria-disabled");
      a.target = "_blank";
      if (a.hasAttribute("data-fb-text")) a.textContent = "Henna Art by Arafa";
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.removeAttribute("target");
      a.textContent = t("follow.soon");
    }
  });
  const ig = SITE.social.instagram.trim();
  $$("[data-instagram]").forEach((a) => { if (ig) { a.href = ig; a.hidden = false; } });
}

/* ---------------------------------------------------------------- hero video */
function initHero() {
  const hero = $(".hero");
  const video = $(".hero__video");
  const toggle = $(".hero__toggle");
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reduceMotion || saveData) return; // poster only

  const desktop = matchMedia("(min-width: 768px)");
  // Prefer MP4 (H.264, hardware-decoded everywhere); fall back to WebM where H.264 is unavailable.
  const canMp4 = !!video.canPlayType('video/mp4; codecs="avc1.42E01E"');
  const src = () => `assets/video/hero-${desktop.matches ? "landscape" : "portrait"}.${canMp4 ? "mp4" : "webm"}`;
  let loadedFor = "";

  const load = () => {
    if (loadedFor === src()) return;
    loadedFor = src();
    hero.classList.remove("is-playing");
    video.src = loadedFor;
    video.load();
    video.play().catch(() => { /* autoplay blocked: poster stays visible */ });
  };

  video.addEventListener("playing", () => { hero.classList.add("is-playing"); toggle.hidden = false; });
  video.addEventListener("error", () => { hero.classList.remove("is-playing"); toggle.hidden = true; });
  toggle.addEventListener("click", () => {
    const paused = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
    paused ? video.pause() : video.play().catch(() => {});
  });
  desktop.addEventListener("change", load);

  // Start after first paint so the page itself is never blocked by the video.
  const start = () => (document.hidden ? addEventListener("visibilitychange", load, { once: true }) : load());
  if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 400);
}

/* ---------------------------------------------------------- product cards */
function renderProducts(first) {
  const list = $("#product-cards");
  list.replaceChildren(...PRODUCTS.map((p) => {
    const price = formatPrice(p);
    return el("li", { class: `card ${first ? "reveal" : "reveal in"}` },
      el("div", { class: "card__img" },
        el("img", { src: imgSrc(p.img, 800), srcset: imgSrcset(p.img), sizes: "(min-width: 860px) 30vw, 90vw", alt: tr(p.alt), width: 800, height: 1000, loading: "lazy", decoding: "async", style: `object-position:${p.focus}` })),
      el("h3", { class: "card__title" }, tr(p.title), price ? el("span", { text: price }) : null),
      el("p", { class: "card__blurb", text: tr(p.blurb) }),
      el("button", { class: "btn btn--dark btn--small", type: "button", onclick: () => openOrder(p.id) }, t("shop.order")),
    );
  }));
}

/* ------------------------------------------------------------------- gallery */
const PAGE = 9;
let filter = "all";
let shown = PAGE;
const gallery = $("#gallery");
const moreBtn = $("#gallery-more");
const filtersEl = $("#filters");

const visibleDesigns = () => DESIGNS.filter((d) => filter === "all" || d.style === filter);

function renderFilters() {
  const mk = (id, label) => el("button", { class: "chip", type: "button", "data-filter": id, "aria-pressed": String(id === filter), onclick: () => setFilter(id) }, label);
  filtersEl.replaceChildren(mk("all", t("art.all")), ...STYLES.map((s) => mk(s.id, tr(s.title))));
}

function setFilter(id) {
  filter = id;
  shown = PAGE;
  $$(".chip", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
  renderGallery(true);
}

function tile(d, index, animate) {
  const price = formatPrice(d);
  const title = tr(d.title);
  return el("li", { class: `tile${animate ? " is-entering" : ""}` },
    el("button", { class: "tile__img", type: "button", "aria-label": t("tile.view", { title }), onclick: () => openLightbox(index) },
      el("img", { src: imgSrc(d.id, 800), srcset: imgSrcset(d.id), sizes: "(min-width: 960px) 30vw, 46vw", alt: title, width: 800, height: 1000, loading: index < 3 ? "eager" : "lazy", decoding: "async", style: `object-position:${d.focus}` })),
    el("div", { class: "tile__meta" },
      el("p", { class: "tile__title" }, title, el("small", { text: tr(styleById[d.style].title) })),
      price ? el("span", { class: "tile__price", text: price }) : null),
    el("button", { class: "btn btn--dark btn--small", type: "button", onclick: () => openReserve(d.id) }, t("tile.reserve")),
  );
}

function renderGallery(animate = false) {
  const list = visibleDesigns();
  gallery.replaceChildren(...list.slice(0, shown).map((d, i) => tile(d, i, animate)));
  const remaining = list.length - shown;
  moreBtn.hidden = remaining <= 0;
  if (remaining > 0) moreBtn.textContent = t("art.more", { n: remaining });
}
moreBtn.addEventListener("click", () => { shown += PAGE; renderGallery(true); });

/* ----------------------------------------------------------------- lightbox */
const lb = $("#lightbox");
const lbImg = $("#lightbox-img");
let lbIndex = 0;

function paintLightbox() {
  const d = visibleDesigns()[lbIndex];
  if (!d) return;
  lbImg.src = imgSrc(d.id, 1200);
  lbImg.srcset = imgSrcset(d.id);
  lbImg.sizes = "90vw";
  lbImg.alt = tr(d.title);
  $("#lightbox-title").textContent = tr(d.title);
  $("#lightbox-reserve").onclick = () => { lb.close(); openReserve(d.id); };
}
function openLightbox(i) { lbIndex = i; paintLightbox(); lb.showModal(); }
function stepLightbox(n) { const len = visibleDesigns().length; lbIndex = (lbIndex + n + len) % len; paintLightbox(); }
$("[data-prev]", lb).addEventListener("click", () => stepLightbox(-1));
$("[data-next]", lb).addEventListener("click", () => stepLightbox(1));
$("[data-close]", lb).addEventListener("click", () => lb.close());
lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") stepLightbox(-1);
  if (e.key === "ArrowRight") stepLightbox(1);
});

/* ------------------------------------------------- order / reservation flows */
function fillSelects() {
  const keep = (sel, build) => { const v = sel.value; sel.replaceChildren(...build()); if ([...sel.options].some((o) => o.value === v)) sel.value = v; };
  $$("[data-product-select]").forEach((s) => keep(s, () => PRODUCTS.map((p) => el("option", { value: p.id, text: tr(p.title) }))));
  $$("[data-design-select]").forEach((s) => keep(s, () => [
    el("option", { value: "", text: t("res.notSure") }),
    ...STYLES.map((st) => el("optgroup", { label: tr(st.title) }, ...DESIGNS.filter((d) => d.style === st.id).map((d) => el("option", { value: d.id, text: tr(d.title) })))),
  ]));
  $$("[data-time-select]").forEach((s) => keep(s, () => ["any", "morning", "afternoon", "evening"].map((k) => el("option", { value: k, text: t(`time.${k}`) }))));
  $$("[data-occasion-select]").forEach((s) => keep(s, () => ["none", "wedding", "eid", "party", "other"].map((k) => el("option", { value: k, text: t(`occ.${k}`) }))));
}

function prettyDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function makeFlow(dialog, { kind, required, collect }) {
  const form = $("[data-form]", dialog);
  const summary = $("[data-summary]", dialog);
  const send = $("[data-send]", dialog);
  let lastMessage = "";

  const show = (which) => { form.hidden = which !== "form"; summary.hidden = which !== "summary"; };

  function open(prefill = {}) {
    show("form");
    form.reset();
    Object.entries(prefill).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; });
    const date = form.elements.date;
    if (date) date.min = new Date().toISOString().slice(0, 10);
    $$("[data-err]", form).forEach((n) => (n.hidden = true));
    $$("[aria-invalid]", form).forEach((n) => n.removeAttribute("aria-invalid"));
    const notice = $("[data-notice]", dialog);
    notice.hidden = !!waNumber;
    notice.textContent = t("notice.unset");
    dialog.showModal();
  }

  // clear a field's error as soon as the visitor edits it
  form.addEventListener("input", (e) => {
    const field = e.target;
    if (!field.name) return;
    field.removeAttribute("aria-invalid");
    const err = $(`[data-err="${field.name}"]`, form);
    if (err) err.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    required.forEach((name) => {
      const field = form.elements[name];
      const bad = !String(field.value).trim();
      field.setAttribute("aria-invalid", String(bad));
      const err = $(`[data-err="${name}"]`, form);
      if (err) err.hidden = !bad;
      if (bad && !firstBad) firstBad = field;
    });
    if (firstBad) { firstBad.focus(); return; }

    lastMessage = buildMessage(kind, collect(form), lang);
    $("[data-preview]", dialog).textContent = lastMessage;
    paintSend();
    show("summary");
    send.focus();
  });

  function paintSend() {
    const url = buildUrl(waNumber, lastMessage);
    if (url) {
      send.href = url;
      send.removeAttribute("aria-disabled");
      send.textContent = t("sum.open");
    } else {
      send.removeAttribute("href");
      send.setAttribute("aria-disabled", "true");
      send.textContent = t("sum.unset");
    }
  }

  $("[data-back]", dialog).addEventListener("click", () => { show("form"); (form.elements.name || form.elements[0]).focus(); });
  $("[data-close]", dialog).addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  return { open };
}

const orderFlow = makeFlow($("#order-dialog"), {
  kind: "order",
  required: ["name", "address"],
  collect: (f) => {
    const p = productById[f.elements.product.value];
    const qty = Math.min(99, Math.max(1, parseInt(f.elements.qty.value, 10) || 1));
    return { product: tr(p.title), qty, price: formatPrice(p), name: f.elements.name.value, address: f.elements.address.value, notes: f.elements.notes.value };
  },
});

const reserveFlow = makeFlow($("#reserve-dialog"), {
  kind: "reservation",
  required: ["name", "date"],
  collect: (f) => {
    const d = designById[f.elements.design.value];
    const time = f.elements.time.value;
    const occ = f.elements.occasion.value;
    return {
      design: d ? tr(d.title) : "",
      price: d ? formatPrice(d) : "",
      name: f.elements.name.value,
      date: prettyDate(f.elements.date.value),
      time: time === "any" ? "" : t(`time.${time}`),
      occasion: occ === "none" ? "" : t(`occ.${occ}`),
      notes: f.elements.notes.value,
    };
  },
});

function openOrder(productId) { orderFlow.open(productId ? { product: productId } : {}); }
function openReserve(designId) { reserveFlow.open(designId ? { design: designId } : {}); }

// quantity stepper
$$(".stepper").forEach((s) => {
  const input = $("input", s);
  $$("button", s).forEach((b) => b.addEventListener("click", () => {
    input.value = Math.min(99, Math.max(1, (parseInt(input.value, 10) || 1) + Number(b.dataset.step)));
  }));
});

$$("[data-order]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openOrder(); }));
$$("[data-reserve]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openReserve(); }));

/* ------------------------------------------------------- follow-section peek */
function renderPeek() {
  const ul = $("#follow-peek");
  ["d17", "d10", "d06"].forEach((id) => {
    ul.append(el("li", {}, el("img", { src: imgSrc(id, 480), alt: "", width: 480, height: 640, loading: "lazy", style: `object-position:${designById[id]?.focus ?? "50% 50%"}` })));
  });
}

/* --------------------------------------------------- mobile quick action bar */
function initQuickbar() {
  const bar = $("#quickbar");
  const hero = $(".hero");
  const contact = $("#contact");
  if (!("IntersectionObserver" in window)) return;
  let heroVisible = true;
  let contactVisible = false;
  const update = () => { bar.hidden = heroVisible || contactVisible; document.body.classList.toggle("has-quickbar", !bar.hidden); };
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }, { threshold: 0.3 }).observe(hero);
  new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; update(); }, { threshold: 0.1 }).observe(contact);
}

/* ------------------------------------------------------------------- reveal */
function initReveal() {
  const items = $$(".reveal:not(.in)");
  if (reduceMotion || !("IntersectionObserver" in window)) { items.forEach((n) => n.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((n) => io.observe(n));
}

/* --------------------------------------------------------------------- boot */
function renderAll(first) {
  applyStatic();
  fillSelects();
  renderProducts(first);
  renderFilters();
  renderGallery(false);
}

renderAll(true);
renderPeek();
initHero();
initQuickbar();
initReveal();
