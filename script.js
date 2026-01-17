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
  return `$${n.toLocaleString("es-CL")}`;
}

// ===================== RENDER =====================
function renderHero(hero) {
  if (!hero) return;

  // Fijos
  setText("heroTitle", safeString(hero.title, "Centro Diverso"));

  const cta = byId("heroCta");
  if (cta) {
    cta.textContent = safeString(hero.ctaText, cta.textContent);
    if (hero.ctaUrl) {
      cta.setAttribute("href", hero.ctaUrl);
      cta.setAttribute("target", "_blank");
      cta.setAttribute("rel", "noopener");
    }
  }

  // Slides (texto variable)
  const slides = Array.isArray(hero.slides) && hero.slides.length
    ? hero.slides
    : [{ p1: hero.p1, p2: hero.p2 }];

  const carouselEl = document.getElementById("heroCarousel"); // agrega id a tu carousel wrapper
  const slidesWrap = document.getElementById("heroSlides");   // agrega id a tu .carousel-inner

  // Si no tienes carousel markup para multiples items, hacemos "rotación de texto" simple
  // (mantiene tu HTML tal cual)
  if (!carouselEl || !slidesWrap || !window.bootstrap || !window.bootstrap.Carousel) {
    // Set initial
    setText("heroP1", safeString(slides[0]?.p1));
    setText("heroP2", safeString(slides[0]?.p2));

    // Rotación simple si hay más de 1
    if (slides.length > 1) {
      if (window.__heroInterval) clearInterval(window.__heroInterval);
      let i = 0;
      window.__heroInterval = setInterval(() => {
        i = (i + 1) % slides.length;
        setText("heroP1", safeString(slides[i]?.p1));
        setText("heroP2", safeString(slides[i]?.p2));
      }, 4500);
    }
    return;
  }

  // Bootstrap Carousel: generamos N items, manteniendo título + CTA fijo "dentro" de cada slide
  slidesWrap.innerHTML = slides.map((s, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <div class="hero-content">
        <div class="hero-real">
          <h1 class="hero-title">${escapeHtml(safeString(hero.title, "Centro Diverso"))}</h1>
          ${s?.p1 ? `<p class="hero-sub">${escapeHtml(safeString(s.p1))}</p>` : ""}
          ${s?.p2 ? `<p class="hero-sub">${escapeHtml(safeString(s.p2))}</p>` : ""}
          <a href="${escapeAttr(safeString(hero.ctaUrl, "#"))}"
             target="_blank" rel="noopener"
             class="btn btn-cta">
            ${escapeHtml(safeString(hero.ctaText, "Solicita Información"))}
          </a>
        </div>
      </div>
    </div>
  `).join("");

  // Ocultamos el contenido original (el que tenía heroP1/heroP2), porque ahora vive en items
  const heroContent = byId("heroContent");
  const heroReal = byId("heroReal");
  if (heroReal) heroReal.style.display = "none";

  // Re-inicializar carrusel
  const instance = window.bootstrap.Carousel.getInstance(carouselEl);
  if (instance) instance.dispose();

  new window.bootstrap.Carousel(carouselEl, {
    interval: slides.length > 1 ? 4500 : false,
    ride: slides.length > 1 ? "carousel" : false,
    pause: "hover",
    touch: true,
    wrap: true
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

