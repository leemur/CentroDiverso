/* ===================== CONFIG ===================== */
//const CONTENT_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiUVv52XyAWqEul6dT8eOR3GEHNbHmd4oxBwqPNBs6mYiugrBpCj9wDA1BnNtVBTAK51MvEi8UTfwGuuGT-OqtLINxK4VUxHhLUVXbZsR8i3chgnvjQv1hqcN0y_j9cE163kehBtuJBqUNKHXTpvaciL2ZM6verIVGzeWQiuh5X50rENGKdzRKBWJUqc_d4kU7wXb-8u6A4zYsTS-wMvwZZizYhsRDPx-qgnOUArOQKjjoAtteGU7IKT7kjuewnO_QpBoMFHfZ9yJhVMDZq832Ghmuhig&lib=MB3HCBfHz3uGEUm2U78XvlQ8B9ViIiSpe";
const CONTENT_URL = "./assets/data/content.json";
const CACHE_KEY = "centrodiverso_content_v1";
const CACHE_TTL_MS = 10 * 60 * 1000;


/* ===================== HELPERS ===================== */
const byId = (id) => document.getElementById(id);

function setText(id, value) {
  const el = byId(id);
  if (!el) return;
  if (value === undefined || value === null) return;
  el.textContent = String(value);
}
function setHref(id, url) {
  const el = byId(id);
  if (!el) return;
  if (!url) return;
  el.setAttribute("href", String(url));
}
function setHtml(id, html) {
  const el = byId(id);
  if (!el) return;
  el.innerHTML = html;
}
function safeString(v, fallback = "") {
  return v === undefined || v === null ? fallback : String(v);
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeAttr(str) {
  return escapeHtml(String(str)).replace(/`/g, "&#096;");
}
function formatPriceCLP(price) {
  if (price === undefined || price === null) return "";
  if (typeof price === "string") return price;

  const n = Number(price);
  if (!Number.isFinite(n)) return String(price);
  return `$${n.toLocaleString("es-CL")}`;
}

function isMobile() {
  return window.matchMedia("(max-width: 767.98px)").matches;
}

/* Texto -> HTML en párrafos:
   - Respeta \n\n como cambio de párrafo
   - Respeta \n como párrafo si no hay \n\n
*/
function textToParagraphsHtml(text) {
  const raw = safeString(text, "").replace(/\r\n/g, "\n").trim();
  if (!raw) return "";

  let blocks = raw.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length === 1 && raw.includes("\n")) {
    blocks = raw.split(/\n+/).map((b) => b.trim()).filter(Boolean);
  }
  return blocks.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

/* ===================== RENDER: HERO ===================== */
function renderHero(hero) {
  if (!hero) return;

  setText("heroTitle", safeString(hero.title, "Centro Diverso"));
  setText("heroP1", safeString(hero.p1, ""));
  setText("heroP2", safeString(hero.p2, ""));

  const cta = byId("heroCta");
  if (cta) {
    const ctaText = hero.ctaText ?? hero.cta_text;
    const ctaUrl = hero.ctaUrl ?? hero.cta_url;

    cta.textContent = safeString(ctaText, "Solicita Información");
    if (ctaUrl) {
      cta.setAttribute("href", String(ctaUrl).trim());
      cta.setAttribute("target", "_blank");
      cta.setAttribute("rel", "noopener");
    }
  }

  const heroContent = byId("heroContent");
  if (heroContent) heroContent.classList.add("is-loaded");
}

/* ===================== RENDER: HISTORIA ===================== */
function renderHistoria(historia) {
  if (!historia) return;

  setText("historiaTitle", safeString(historia.title, ""));

  if (Array.isArray(historia.paragraphs)) {
    const html = historia.paragraphs
      .filter(Boolean)
      .map((p) => `<p class="historia-text">${escapeHtml(p)}</p>`)
      .join("");
    setHtml("historiaBody", html);
  }

  const img = document.querySelector(".historia-img");
  if (img && historia.imageUrl) {
    img.src = historia.imageUrl;
    img.alt = historia.imageAlt || img.alt || "Historia";
  }
}

/* ===================== RENDER: ESPECIALIDADES ===================== */
function renderEspecialidades(especialidades) {
  const grid = byId("especialidadesGrid");
  if (!grid) return;

  setText("especialidadesTitle", especialidades?.title);
  setText("especialidadesSubtitle", especialidades?.subtitle);

  const items = especialidades?.items;
  if (!Array.isArray(items)) return;

  grid.innerHTML = "";

  items.forEach((it, index) => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    const imgSrc = `assets/images/ImagenEspecialidad${index + 1}.jpeg`;

    col.innerHTML = `
      <article class="specialty-card h-100">
        <header class="specialty-badge">${escapeHtml(safeString(it.badge))}</header>

        <div class="specialty-media">
          <img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(safeString(it.badge))}" class="specialty-img">
        </div>

        <div class="specialty-body">
          <p class="specialty-text">${escapeHtml(safeString(it.text))}</p>
        </div>
      </article>
    `;
    grid.appendChild(col);
  });
}

/* ===================== RENDER: PLANES ===================== */
function renderPlanes(planes) {
  const grid = byId("planesGrid");
  if (!grid) return;

  const items = planes?.items;
  if (!Array.isArray(items)) return;

  grid.innerHTML = "";
  grid.classList.add("g-4", "justify-content-center");

  const bgByIndex = ["plan-blue", "plan-peach", "plan-pink"];

  const textToLis = (text) => {
    const raw = safeString(text);
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^-+\s*/, ""));
    return lines.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  };

  items.forEach((it, idx) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4";

    const price = formatPriceCLP(it.price);
    const bgClass = bgByIndex[idx] || "plan-blue";

    col.innerHTML = `
      <div class="plan-card ${bgClass}">
        <div class="plan-head">
          <h3 class="plan-title">${escapeHtml(safeString(it.name))}</h3>
          <div class="plan-price">${escapeHtml(safeString(price))}</div>
        </div>

        <ul class="plan-list">
          ${textToLis(it.text)}
        </ul>
      </div>
    `;
    grid.appendChild(col);
  });
}

/* ===================== TESTIMONIOS ===================== */

function renderTestimonios(testimonios) {
  setText("testimoniosTitle", testimonios?.title || "Testimonios");
  setText("testimoniosSubtitle", testimonios?.subtitle || "Lo que dicen las familias");

  const track = document.getElementById("testimoniosTrack");
  if (!track) return;

  const items = testimonios?.items;
  if (!Array.isArray(items) || items.length === 0) {
    track.innerHTML = "";
    if (track._tState?.abort) track._tState.abort.abort();
    if (track._tState?.timer) clearInterval(track._tState.timer);
    track._tState = null;
    return;
  }

  const COLOR_CLASS = {
    pink: "t-card--pink",
    peach: "t-card--peach",
    teal: "t-card--teal",
    yellow: "t-card--yellow",
    blue: "t-card--blue",
    green: "t-card--green",
    black: "t-card--blue",
  };
  const FALLBACKS = [
    "t-card--peach",
    "t-card--pink",
    "t-card--teal",
    "t-card--yellow",
    "t-card--blue",
    "t-card--green",
  ];
  const pickColorClass = (c, i) => {
    const key = String(c || "").trim().toLowerCase();
    return COLOR_CLASS[key] || FALLBACKS[i % FALLBACKS.length];
  };

  // blobs random (0 a 4) en esquinas; evita duplicados
  const corners = ["tl", "tr", "bl", "br"];
  const sizes = ["s1", "s2", "s3"];

  track.innerHTML = items
    .map((it, i) => {
      const text = safeString(it.text, "");
      const name = safeString(it.name, "");
      const nombreNino = safeString(it.nombreNino ?? it.nombre_nino ?? it.childName ?? it.nino ?? "", "");
      const colorClass = pickColorClass(it.color, i);

      const blobCount = Math.floor(Math.random() * 5); // 0..4
      const usedCorners = new Set();
      let blobs = "";

      for (let b = 0; b < blobCount; b++) {
        const available = corners.filter((c) => !usedCorners.has(c));
        if (!available.length) break;
        const corner = available[Math.floor(Math.random() * available.length)];
        usedCorners.add(corner);

        const size = sizes[Math.floor(Math.random() * sizes.length)];
        blobs += `<span class="t-blob ${corner} ${size}" aria-hidden="true"></span>`;
      }

      // Texto con párrafos reales
      const paragraphsHtml = textToParagraphsHtml(text);

      // Botón SOLO mobile (se inyecta igual, pero CSS lo oculta en desktop)
      const moreBtn = `
        <button class="t-more" type="button" aria-expanded="false">
          <span>Ver más</span>
        </button>
      `;

      return `
        <div class="t-col">
          <article class="t-card ${colorClass}">
            ${blobs}
            <div class="t-head">
              ${name ? `<div class="t-name">${escapeHtml(name)}</div>` : ""}
              ${nombreNino ? `<div class="t-role">${escapeHtml(nombreNino)}</div>` : ""}
            </div>

            <div class="t-text">
              ${paragraphsHtml}
            </div>

            ${moreBtn}
          </article>
        </div>
      `;
    })
    .join("");

  requestAnimationFrame(() => {
    initTestimoniosSlider();
    initTestimoniosReadMore();
    syncReadMoreState(); // ajusta botones/ocultamiento según ancho
  });
}

function initTestimoniosSlider() {
  const track = document.getElementById("testimoniosTrack");
  if (!track) return;

  const section = track.closest(".testimonios-section") || document;
  const prevBtn = section.querySelector(".t-btn.prev");
  const nextBtn = section.querySelector(".t-btn.next");
  if (!prevBtn || !nextBtn) return;

  const slides = Array.from(track.children);
  if (!slides.length) return;

  if (track._tState?.timer) clearInterval(track._tState.timer);
  if (track._tState?.abort) track._tState.abort.abort();

  const abort = new AbortController();
  const state = { index: 0, timer: null, abort, locked: false };
  track._tState = state;

  const step = () => Math.round(slides[0].getBoundingClientRect().width);
  const maxIndex = () => Math.max(0, slides.length - 1);

  const update = () => {
    const w = step();
    track.style.transform = `translate3d(-${state.index * w}px, 0, 0)`;
  };

  const goNext = () => {
    if (state.locked) return;
    state.locked = true;
    state.index = state.index >= maxIndex() ? 0 : state.index + 1;
    update();
  };

  const goPrev = () => {
    if (state.locked) return;
    state.locked = true;
    state.index = state.index <= 0 ? maxIndex() : state.index - 1;
    update();
  };

  track.addEventListener(
    "transitionend",
    () => {
      state.locked = false;
    },
    { signal: abort.signal }
  );

  const startAuto = () => {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (!state.locked) goNext();
    }, 4500);
  };

  const stopAuto = () => {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  };

  nextBtn.addEventListener(
    "click",
    () => {
      stopAuto();
      goNext();
      startAuto();
    },
    { signal: abort.signal }
  );
  prevBtn.addEventListener(
    "click",
    () => {
      stopAuto();
      goPrev();
      startAuto();
    },
    { signal: abort.signal }
  );

  section.addEventListener("mouseenter", stopAuto, { signal: abort.signal });
  section.addEventListener("mouseleave", startAuto, { signal: abort.signal });

  window.addEventListener(
    "resize",
    () => requestAnimationFrame(() => {
      update();
      syncReadMoreState();
    }),
    { signal: abort.signal }
  );

  requestAnimationFrame(() => {
    state.index = 0;
    track.style.transition = "transform .45s ease";
    update();
    startAuto();
  });
}

function initTestimoniosReadMore() {
  const section = document.getElementById("testimonios");
  if (!section || section._moreInit) return;
  section._moreInit = true;

  section.addEventListener("click", (e) => {
    const link = e.target.closest(".t-more");
    if (!link) return;

    if (!window.matchMedia("(max-width: 767.98px)").matches) return;

    e.preventDefault();

    const card = link.closest(".t-card");
    if (!card) return;

    const expanded = card.classList.toggle("is-expanded");
    card.classList.toggle("is-collapsed", !expanded);

    link.setAttribute("aria-expanded", expanded ? "true" : "false");
    link.textContent = expanded ? "Ver menos" : "Ver más";
  });
}


/* Oculta/activa el botón según:
   - Solo mobile
   - Solo si el texto realmente “se corta” (scrollHeight > clientHeight)
*/
function syncReadMoreState() {
  const section = document.getElementById("testimonios");
  if (!section) return;

  const cards = section.querySelectorAll(".t-card");
  cards.forEach((card) => {
    const text = card.querySelector(".t-text");
    const btn = card.querySelector(".t-more");
    if (!text || !btn) return;

    // Desktop: siempre normal
    if (!isMobile()) {
      card.classList.remove("is-collapsed");
      card.classList.remove("is-expanded");
      btn.setAttribute("aria-expanded", "false");
      btn.querySelector("span").textContent = "Ver más";
      return;
    }

    // Mobile: colapsado por defecto, pero solo si realmente corta
    // (si tu CSS hace clamp/altura fija cuando está colapsado)
    card.classList.add("is-collapsed");
    card.classList.remove("is-expanded");
    btn.setAttribute("aria-expanded", "false");
    btn.querySelector("span").textContent = "Ver más";

    // Espera layout
    requestAnimationFrame(() => {
      const needsMore = text.scrollHeight - text.clientHeight > 6;
      btn.style.display = needsMore ? "" : "none";
      if (!needsMore) {
        card.classList.remove("is-collapsed");
      }
    });
  });
}

/* ===================== RENDER: FOOTER ===================== */
function renderFooter(footer) {
  if (!footer) return;

  setText("footerPhoneText", footer.phone?.trim() || "");
  setText("footerFollowLabel", (footer.followLabel ?? footer.follow_label ?? "").trim());

  if (footer.address) {
    const addressHtml = String(footer.address)
      .split(/\n+/)
      .map((l) => `<div>${escapeHtml(l.trim())}</div>`)
      .join("");
    setHtml("footerAddress", addressHtml);
  }

  setHref("linkWhatsapp", footer.social?.whatsapp);
  setHref("linkFacebook", footer.social?.facebook);
  setHref("linkInstagram", footer.social?.instagram);
  setHref("linkLinkedin", footer.social?.linkedin);

  ["linkWhatsapp", "linkFacebook", "linkInstagram", "linkLinkedin"].forEach((id) => {
    const a = byId(id);
    if (!a) return;

    const href = a.getAttribute("href");
    if (href && href !== "#") {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/* ===================== APPLY + LOAD ===================== */
function applyContent(data) {
  renderHero(data.hero);
  renderHistoria(data.historia);
  renderEspecialidades(data.especialidades);
  renderPlanes(data.planes);
  renderTestimonios(data.testimonios);
  renderFooter(data.footer);

  document.querySelectorAll("[data-content]").forEach((el) => el.classList.add("ready"));

  const heroContent = document.getElementById("heroContent");
  if (heroContent) heroContent.classList.add("is-loaded");
}

async function loadContent() {
  try {
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < CACHE_TTL_MS && cached.data) {
        applyContent(cached.data);
      }
    }

    const res = await fetch(CONTENT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    applyContent(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (err) {
    console.error("Error cargando contenido:", err);
  }
}

/* ===================== NAVBAR FIX ===================== */
(function navbarFix() {
  document.addEventListener("DOMContentLoaded", () => {
    const mainNav = document.getElementById("mainNav");
    const toggler = document.getElementById("navToggler") || document.querySelector(".navbar-toggler");
    if (!mainNav || !toggler || !window.bootstrap) return;

    const collapse = window.bootstrap.Collapse.getOrCreateInstance(mainNav, { toggle: false });

    toggler.addEventListener("click", (e) => {
      e.preventDefault();
      collapse.toggle();
      const isOpen = mainNav.classList.contains("show");
      toggler.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mainNav.querySelectorAll("a.nav-link").forEach((a) => {
      a.addEventListener("click", () => {
        collapse.hide();
        toggler.setAttribute("aria-expanded", "false");
      });
    });
  });
})();

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", loadContent);
