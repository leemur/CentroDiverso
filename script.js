// ===================== CONFIG =====================
const CONTENT_URL =
  "https://script.google.com/macros/s/AKfycbwQRrNRJ4fF4kpiyUG4w8HYVp68JbSW2SmpTImz3PCwsP_15nvMoMk-f2sRVdgKYVP1/exec";

// Cache local (para que cargue instantáneo después)
const CACHE_KEY = "centrodiverso_content_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

// ===================== HELPERS =====================
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
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPriceCLP(price) {
  if (price === undefined || price === null) return "";
  if (typeof price === "string") return price;

  const n = Number(price);
  if (!Number.isFinite(n)) return String(price);

  // 19 -> $19.000 (si tu JSON viene como 19, 29, 39)
  return `$${n}.000`;
}

// ===================== RENDER =====================
function renderHero(hero) {
  if (!hero) return;
  setText("heroTitle", hero.title);
  setText("heroP1", hero.p1);
  setText("heroP2", hero.p2);

  const cta = byId("heroCta");
  if (cta) {
    cta.textContent = safeString(hero.ctaText, cta.textContent);
    if (hero.ctaUrl) {
      cta.setAttribute("href", hero.ctaUrl);
      cta.setAttribute("target", "_blank");
      cta.setAttribute("rel", "noopener");
    }
  }
}

function renderHistoria(historia) {
  if (!historia) return;

  setText("historiaTitle", historia.title);

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
          <img src="${imgSrc}" alt="${escapeHtml(safeString(it.badge))}" class="specialty-img">
        </div>

        <div class="specialty-body">
          <p class="specialty-text">${escapeHtml(safeString(it.text))}</p>
        </div>
      </article>
    `;

    grid.appendChild(col);
  });
}

function renderPlanes(planes) {
  const grid = byId("planesGrid");
  if (!grid) return;

  // Si agregaste id="planesTitle" en HTML, descomenta:
  // setText("planesTitle", planes?.title);

  const items = planes?.items;
  if (!Array.isArray(items)) return;

  grid.innerHTML = "";

  items.forEach((it, idx) => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    const planClass =
      idx === 0 ? "plan plan-basic" : idx === 1 ? "plan plan-std" : "plan plan-prem";

    const price = formatPriceCLP(it.price);

    col.innerHTML = `
      <div class="${planClass}">
        <h3>${escapeHtml(safeString(it.name))}</h3>
        <div class="price">${escapeHtml(price)}</div>
        <p>${escapeHtml(safeString(it.text))}</p>
      </div>
    `;
    grid.appendChild(col);
  });
}

function renderFooter(footer) {
  if (!footer) return;

  setText("footerPhone", footer.phone);
  setText("footerAddress", footer.address);
  setText("footerFollowLabel", footer.followLabel);

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

function applyContent(data) {
  renderHero(data.hero);
  renderHistoria(data.historia);
  renderEspecialidades(data.especialidades);
  renderPlanes(data.planes);
  renderFooter(data.footer);

  document.querySelectorAll("[data-content]").forEach(el => el.classList.add("ready"));

  const heroContent = document.getElementById("heroContent");
  if (heroContent) heroContent.classList.add("is-loaded");
}

// ===================== LOAD =====================
async function loadContent() {
  try {
    // 1) pinta desde cache si existe (instantáneo)
    const cachedRaw = localStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (Date.now() - cached.ts < CACHE_TTL_MS && cached.data) {
        applyContent(cached.data);
      }
    }

    // 2) trae contenido fresco
    const res = await fetch(CONTENT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    applyContent(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    const heroContent = document.getElementById("heroContent");
    if (heroContent) heroContent.classList.add("is-loaded");    if (heroContent) {
      heroContent.classList.add("loaded");
    }
    
  } catch (err) {
    console.error("Error cargando contenido desde Google Sheets:", err);
  }
}


document.addEventListener("DOMContentLoaded", loadContent);
