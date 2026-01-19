const CONTENT_URL = "./assets/data/content.json";
const CACHE_KEY = "centrodiverso_content_v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

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
  return `$${n.toLocaleString("es-CL")}`;
}

// ===================== RENDER =====================
function renderHero(hero) {
  if (!hero) return;

  setText("heroTitle", safeString(hero.title, "Centro Diverso"));
  setText("heroP1", safeString(hero.p1, ""));
  setText("heroP2", safeString(hero.p2, ""));

  const cta = byId("heroCta");
  if (cta) {
    cta.textContent = safeString(hero.ctaText, "Solicita Información");
    if (hero.ctaUrl) {
      cta.setAttribute("href", hero.ctaUrl);
      cta.setAttribute("target", "_blank");
      cta.setAttribute("rel", "noopener");
    }
  }

  const heroContent = byId("heroContent");
  if (heroContent) heroContent.classList.add("is-loaded");
}
  // Bootstrap Carousel: generamos N items, manteniendo título + CTA fijo "dentro" de cada slide
function initHeroCarousel() {
  const carouselEl = document.getElementById("heroCarousel");
  if (!carouselEl || !window.bootstrap?.Carousel) return;

  // Asegura un active válido (solo por seguridad)
  const items = carouselEl.querySelectorAll(".carousel-item");
  if (items.length && !carouselEl.querySelector(".carousel-item.active")) {
    items[0].classList.add("active");
  }

  // Inicializa solo si NO existe instancia
  if (window.bootstrap.Carousel.getInstance(carouselEl)) return;

  new window.bootstrap.Carousel(carouselEl, {
    interval: items.length > 1 ? 4500 : false,
    ride: items.length > 1 ? "carousel" : false,
    wrap: true,
    pause: "hover",
    touch: true
  });
}

/* helpers seguros (si no los tienes) */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/`/g, "&#096;");
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

  // Si quieres setear título desde JSON:
  // setText("planesTitle", planes?.title);

  const items = planes?.items;
  if (!Array.isArray(items)) return;

  grid.innerHTML = "";

  // Para centrar siempre el row (por si el HTML no lo trae)
  grid.classList.add("g-4", "justify-content-center");

  const bgByIndex = ["plan-blue", "plan-peach", "plan-pink"];

  const textToLis = (text) => {
    const raw = safeString(text);

    // separa por líneas, limpia "- " y filtra vacíos
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^-+\s*/, "")); // quita "- " al inicio

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


function renderFooter(footer) {
  if (!footer) return;

  setText("footerPhoneText", footer.phone);
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

(function navbarFix() {
  document.addEventListener("DOMContentLoaded", () => {
    const mainNav = document.getElementById("mainNav");
    const toggler = document.getElementById("navToggler") || document.querySelector(".navbar-toggler");
    if (!mainNav || !toggler || !window.bootstrap) return;
    const collapse = bootstrap.Collapse.getOrCreateInstance(mainNav, { toggle: false });

    toggler.addEventListener("click", (e) => {
      e.preventDefault();
      collapse.toggle();
      const isOpen = mainNav.classList.contains("show");
      toggler.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Cierra al hacer click en un link del menu
    mainNav.querySelectorAll("a.nav-link").forEach((a) => {
      a.addEventListener("click", () => {
        collapse.hide();
        toggler.setAttribute("aria-expanded", "false");
      });
    });
  });
})();

document.addEventListener("DOMContentLoaded", loadContent);

