import { SITE } from "./config.js";
import { CATEGORIES, DESIGNS, imgSrc, imgSrcset } from "./data.js";
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

const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const designById = Object.fromEntries(DESIGNS.map((d) => [d.id, d]));
const waNumber = normalizeNumber(SITE.whatsapp.number);
const formatPrice = (d) => (typeof d.price === "number" ? `${SITE.currencySymbol}${d.price.toLocaleString("en-US")}` : "");

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
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}
navToggle.addEventListener("click", () => setNav(navToggle.getAttribute("aria-expanded") !== "true"));
$$("a", nav).forEach((a) => a.addEventListener("click", () => setNav(false)));
addEventListener("keydown", (e) => e.key === "Escape" && setNav(false));

/* ------------------------------------------------------- contact / social */
function wireContacts() {
  const general = buildGeneralUrl(waNumber);
  $$("[data-wa-general]").forEach((a) => {
    if (general) {
      a.href = general;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      // number not configured yet: open the order dialog, which explains the situation
      a.href = "#order";
      a.addEventListener("click", (e) => { e.preventDefault(); openOrder(); });
    }
  });
  if (waNumber) $$("[data-wa-text]").forEach((a) => (a.textContent = `+${waNumber}`));

  const fb = SITE.social.facebook.trim();
  $$("[data-facebook]").forEach((a) => {
    if (fb) a.href = fb;
    else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.removeAttribute("target");
      a.textContent = "Facebook page coming soon";
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

/* ------------------------------------------------------------ category cards */
function renderCategories() {
  const list = $("#category-cards");
  CATEGORIES.forEach((c) => {
    const li = el("li", { class: "card reveal" },
      el("div", { class: "card__img" },
        el("img", { src: imgSrc(c.cover, 800), srcset: imgSrcset(c.cover), sizes: "(min-width: 860px) 30vw, 90vw", alt: `${c.title} henna example`, width: 800, height: 1000, loading: "lazy", decoding: "async",
          style: `object-position:${designById[c.cover]?.focus ?? "50% 50%"}` })),
      el("h3", { class: "card__title" }, c.title, el("span", { lang: "bn", text: c.titleBn })),
      el("p", { class: "card__blurb", text: c.blurb }),
      el("button", { class: "btn btn--outline btn--small", type: "button", onclick: () => { setFilter(c.id); $("#art").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); } }, "Explore designs"),
    );
    list.append(li);
  });
}

/* ------------------------------------------------------------------- gallery */
const PAGE = 9;
let filter = "all";
let shown = PAGE;
const gallery = $("#gallery");
const moreBtn = $("#gallery-more");
const filtersEl = $("#filters");

function visibleDesigns() {
  return DESIGNS.filter((d) => filter === "all" || d.category === filter);
}

function renderFilters() {
  const mk = (id, label) => el("button", { class: "chip", type: "button", "data-filter": id, "aria-pressed": String(id === filter), onclick: () => setFilter(id) }, label);
  filtersEl.replaceChildren(mk("all", "All designs"), ...CATEGORIES.map((c) => mk(c.id, c.title)));
}

function setFilter(id) {
  filter = id;
  shown = PAGE;
  $$(".chip", filtersEl).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
  renderGallery();
}

function tile(d, index) {
  const price = formatPrice(d);
  return el("li", { class: "tile is-entering" },
    el("button", { class: "tile__img", type: "button", "aria-label": `View larger: ${d.title}`, onclick: () => openLightbox(index) },
      el("img", { src: imgSrc(d.id, 800), srcset: imgSrcset(d.id), sizes: "(min-width: 960px) 30vw, 46vw", alt: d.alt, width: 800, height: 1000, loading: index < 3 ? "eager" : "lazy", decoding: "async", style: `object-position:${d.focus}` })),
    el("div", { class: "tile__meta" },
      el("p", { class: "tile__title" }, d.title, el("small", { text: catById[d.category].title })),
      price ? el("span", { class: "tile__price", text: price }) : null),
    el("button", { class: "btn btn--dark btn--small", type: "button", onclick: () => openOrder(d.id) }, "Order Now"),
  );
}

function renderGallery() {
  const list = visibleDesigns();
  gallery.replaceChildren(...list.slice(0, shown).map((d, i) => tile(d, i)));
  const remaining = list.length - shown;
  moreBtn.hidden = remaining <= 0;
  if (remaining > 0) moreBtn.textContent = `View more designs (${remaining})`;
}
moreBtn.addEventListener("click", () => { shown += PAGE; renderGallery(); });

/* ----------------------------------------------------------------- lightbox */
const lb = $("#lightbox");
const lbImg = $("#lightbox-img");
let lbIndex = 0;

function paintLightbox() {
  const list = visibleDesigns();
  const d = list[lbIndex];
  lbImg.src = imgSrc(d.id, 1200);
  lbImg.srcset = imgSrcset(d.id);
  lbImg.sizes = "90vw";
  lbImg.alt = d.alt;
  $("#lightbox-title").textContent = d.title;
  $("#lightbox-order").onclick = () => { lb.close(); openOrder(d.id); };
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

/* -------------------------------------------------------------- order dialog */
const dlg = $("#order-dialog");
const form = $("#order-form");
const summary = $("#order-summary");
const sel = $("#f-design");
const NONE = "__none";

function fillSelect() {
  sel.replaceChildren(
    el("option", { value: NONE, text: "Not sure yet — help me choose" }),
    ...CATEGORIES.map((c) =>
      el("optgroup", { label: c.title }, ...DESIGNS.filter((d) => d.category === c.id).map((d) => el("option", { value: d.id, text: d.title })))),
  );
}

function openOrder(designId) {
  form.hidden = false;
  summary.hidden = true;
  sel.value = designId && designById[designId] ? designId : NONE;
  $("#f-date").min = new Date().toISOString().slice(0, 10);
  const notice = $("#order-notice");
  notice.hidden = !!waNumber;
  if (!waNumber) notice.textContent = "WhatsApp ordering is being set up. You can fill in the form to preview your message, but it can’t be sent yet.";
  dlg.showModal();
  $("#f-name").focus();
}

function collect() {
  const d = designById[sel.value];
  return {
    designTitle: d ? d.title : "",
    price: d ? formatPrice(d) : "",
    name: $("#f-name").value,
    date: $("#f-date").value,
    notes: $("#f-notes").value,
  };
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nameInput = $("#f-name");
  const bad = !nameInput.value.trim();
  nameInput.setAttribute("aria-invalid", String(bad));
  $("#err-name").hidden = !bad;
  if (bad) { nameInput.focus(); return; }

  const msg = buildMessage(collect());
  $("#order-preview").textContent = msg;
  const send = $("#order-send");
  const url = buildUrl(waNumber, msg);
  if (url) {
    send.href = url;
    send.removeAttribute("aria-disabled");
    send.textContent = "Open WhatsApp";
  } else {
    send.removeAttribute("href");
    send.setAttribute("aria-disabled", "true");
    send.textContent = "WhatsApp not set up yet";
  }
  form.hidden = true;
  summary.hidden = false;
  send.focus();
});
$("#order-back").addEventListener("click", () => { summary.hidden = true; form.hidden = false; $("#f-name").focus(); });
$("[data-close]", dlg).addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
$$("[data-order]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); openOrder(); }));

/* ------------------------------------------------------- follow-section peek */
function renderPeek() {
  const ul = $("#follow-peek");
  ["d17", "d10", "d06"].forEach((id) => {
    ul.append(el("li", {}, el("img", { src: imgSrc(id, 480), alt: "", width: 480, height: 640, loading: "lazy", style: `object-position:${designById[id]?.focus ?? "50% 50%"}` })));
  });
}

/* ------------------------------------------------------------------- reveal */
function initReveal() {
  const items = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) { items.forEach((n) => n.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((n) => io.observe(n));
}

/* --------------------------------------------------------------------- boot */
fillSelect();
renderCategories();
renderFilters();
renderGallery();
renderPeek();
wireContacts();
initHero();
initReveal();
$("#year").textContent = new Date().getFullYear();
