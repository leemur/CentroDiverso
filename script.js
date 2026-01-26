/* ===================== CONFIG ===================== */
//const CONTENT_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLjEvM2G2yKb_gmEz8Vqd6W4lvYIpucCrneEGHxmyh2BVEvivi88VqcbIVqR4o19GWTOVT56HVZ3fC6WUP7kyquCf8Zj-lGX309AfOpNuXAUwdte6x1oY5VT7jmjYak5f10zIoZONFWy_zBrAOlAVIxG_GA6L4GnMESN2pL2ONj3MwJy9Smk33weJzQ1GIc1qab4w52KH9H4VByPFx2DXhvelmkx438n3tfk158tCRtdhE2gOQ5RYp0zVewrsDrFR8SOrW-oyBU66PoB9AmKQdVeG0YL5w&lib=MB3HCBfHz3uGEUm2U78XvlQ8B9ViIiSpe";
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
          <img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(
      safeString(it.badge)
    )}" class="specialty-img">
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

function renderTestimonios(testimonios) {
  // Título / subtítulo (tu HTML ya los tiene)
  setText("testimoniosTitle", testimonios?.title || "Testimonios");
  setText("testimoniosSubtitle", testimonios?.subtitle || "Lo que dicen las familias");

  const track = document.getElementById("testimoniosTrack");
  if (!track) return;

  const items = testimonios?.items;
  if (!Array.isArray(items) || items.length === 0) {
    track.innerHTML = "";
    return;
  }

  // ✅ Colores permitidos + fallback si viene cualquier cosa
  const COLOR_CLASS = {
    pink: "t-card--pink",
    peach: "t-card--peach",
    teal: "t-card--teal",
    yellow: "t-card--yellow",
    blue: "t-card--blue",
    green: "t-card--green",
    black: "t-card--blue" // por si ponen "black" en el excel
  };

  const FALLBACKS = ["t-card--peach", "t-card--pink", "t-card--teal", "t-card--yellow", "t-card--blue", "t-card--green"];
  const pickColorClass = (c, i) => {
    const key = String(c || "").trim().toLowerCase();
    return COLOR_CLASS[key] || FALLBACKS[i % FALLBACKS.length];
  };

  track.innerHTML = items
    .map((it, i) => {
      const name = safeString(it.name, "");
      const role = safeString(it.role, "");
      const text = safeString(it.text, "");
      const img  = safeString(it.img, "");
      const colorClass = pickColorClass(it.color, i);

      return `
        <div class="t-col">
          <article class="t-card ${colorClass}">
            <div class="t-avatar">
              ${
                img
                  ? `<img src="${escapeAttr(img)}" alt="${escapeAttr(name || "Testimonio")}" />`
                  : `<div class="t-avatar-fallback"></div>`
              }
            </div>

            <div class="t-quote">“</div>

            <p class="t-text">${escapeHtml(text)}</p>

            <div class="t-person">
              <div class="t-name">${escapeHtml(name)}</div>
              <div class="t-role">${escapeHtml(role)}</div>
            </div>
          </article>
        </div>
      `;
    })
    .join("");

  // Deja que el DOM pinte antes de calcular anchos
  requestAnimationFrame(() => initTestimoniosSlider());
}

function initTestimoniosSlider() {
  const track = document.getElementById("testimoniosTrack");
  if (!track) return;

  const section = track.closest(".testimonios-section") || document;
  const prev = section.querySelector(".t-btn.prev");
  const next = section.querySelector(".t-btn.next");
  if (!prev || !next) return;

  const cards = Array.from(track.children);
  if (!cards.length) return;

  // ✅ Evita que se dupliquen listeners si renderizas 2 veces (cache + fetch)
  prev.replaceWith(prev.cloneNode(true));
  next.replaceWith(next.cloneNode(true));
  const prevBtn = section.querySelector(".t-btn.prev");
  const nextBtn = section.querySelector(".t-btn.next");

  let index = 0;

  const getVisible = () => {
    const w = window.innerWidth;
    if (w < 768) return 1;
    if (w < 992) return 2;
    return 4;
  };

  const getGap = () => {
    const style = window.getComputedStyle(track);
    return parseFloat(style.gap || style.columnGap || "0") || 0;
  };

  const getStep = () => {
    const gap = getGap();
    const cardW = cards[0].getBoundingClientRect().width;
    return cardW + gap;
  };

  const update = () => {
    const visible = getVisible();
    const maxIndex = Math.max(0, cards.length - visible);

    if (index > maxIndex) index = 0;
    if (index < 0) index = maxIndex;

    track.style.transform = `translateX(-${index * getStep()}px)`;
  };

  nextBtn.addEventListener("click", () => {
    const visible = getVisible();
    const maxIndex = Math.max(0, cards.length - visible);
    index++;
    if (index > maxIndex) index = 0; // 🔁 vuelve al inicio
    update();
  });

  prevBtn.addEventListener("click", () => {
    const visible = getVisible();
    const maxIndex = Math.max(0, cards.length - visible);
    index--;
    if (index < 0) index = maxIndex; // 🔁 va al final
    update();
  });

  // Recalcular cuando cargan imágenes / resize
  track.querySelectorAll("img").forEach((img) => img.addEventListener("load", update, { once: true }));
  window.addEventListener("resize", () => requestAnimationFrame(update));

  update();
}


/* ===================== RENDER: FOOTER ===================== */
function renderFooter(footer) {
  if (!footer) return;

  setText("footerPhoneText", footer.phone);
  setText("footerAddress", footer.address);
  setText("footerFollowLabel", footer.followLabel ?? footer.follow_label);

  setHref("linkWhatsapp", footer.social?.whatsapp);
  setHref("linkFacebook", footer.social?.facebook);
  setHref("linkInstagram", footer.social?.instagram);
  setHref("linkLinkedin", footer.social?.linkedin);

  ["linkWhatsapp", "linkFacebook", "linkInstagram", "linkLinkedin"].forEach((id) => {
    const a = byId(id);
    if (a && a.getAttribute("href") && a.getAttribute("href") !== "#") {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
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
    // 1) cache
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < CACHE_TTL_MS && cached.data) {
        applyContent(cached.data);
      }
    }

    // 2) fetch fresh
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
