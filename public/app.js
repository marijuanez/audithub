const SECTIONS_DATA = [
  {
    id: "imprescindibles",
    number: "01",
    cssClass: "sec-1",
    title: "Imprescindibles",
    subtitle: "Herramientas esenciales ordenadas por prioridad para auditoría técnica, velocidad y datos estructurados",
    tools: [
      {
        name: "PageSpeed Insights",
        url: "https://pagespeed.web.dev/",
        purpose: "Velocidad, Core Web Vitals, renderizado y auditoría rápida de rendimiento móvil/escritorio. Es la herramienta que ya estás usando.",
        priority: "Prioridad #1",
        deepLinkTemplate: (targetUrl) => `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(targetUrl)}`
      },
      {
        name: "Lighthouse / Chrome DevTools",
        url: "https://developer.chrome.com/docs/lighthouse/",
        purpose: "Auditoría local más detallada de rendimiento, accesibilidad, SEO, buenas prácticas y PWA.",
        priority: "Esencial",
        deepLinkTemplate: null
      },
      {
        name: "Google Search Console",
        url: "https://search.google.com/search-console",
        purpose: "Indexación, cobertura, sitemaps, errores, consultas orgánicas y rendimiento real en Google.",
        priority: "Oficial Google",
        deepLinkTemplate: (targetUrl) => `https://search.google.com/search-console?resource_id=${encodeURIComponent(targetUrl)}`
      },
      {
        name: "Screaming Frog SEO Spider",
        url: "https://www.screamingfrog.co.uk/seo-spider/",
        purpose: "Rastreo técnico completo: títulos, metas, canonicals, redirecciones, enlaces rotos, sitemaps y estructura.",
        priority: "Auditoría Técnica",
        deepLinkTemplate: null
      },
      {
        name: "Google Rich Results Test",
        url: "https://search.google.com/test/rich-results",
        purpose: "Comprueba si tus datos estructurados generan resultados enriquecidos válidos.",
        priority: "Rich Snippets",
        deepLinkTemplate: (targetUrl) => `https://search.google.com/test/rich-results?url=${encodeURIComponent(targetUrl)}`
      },
      {
        name: "Schema Markup Validator",
        url: "https://validator.schema.org/",
        purpose: "Valida el JSON-LD y el marcado semántico de tus páginas.",
        priority: "Schema.org",
        deepLinkTemplate: (targetUrl) => `https://validator.schema.org/#url=${encodeURIComponent(targetUrl)}`
      }
    ]
  },
  {
    id: "rendimiento",
    number: "02",
    cssClass: "sec-2",
    title: "Rendimiento y monitorización",
    subtitle: "Análisis avanzado de carga, waterfalls, Core Web Vitals continuos y experiencia de usuario",
    tools: [
      {
        name: "WebPageTest",
        url: "https://www.webpagetest.org/",
        purpose: "Pruebas avanzadas de carga desde distintas ubicaciones, redes y dispositivos.",
        priority: "Test Avanzado",
        deepLinkTemplate: (targetUrl) => `https://www.webpagetest.org/?url=${encodeURIComponent(targetUrl)}`
      },
      {
        name: "GTmetrix",
        url: "https://gtmetrix.com/",
        purpose: "Informes de velocidad con waterfall, métricas y recomendaciones.",
        priority: "Waterfall",
        deepLinkTemplate: null
      },
      {
        name: "DebugBear",
        url: "https://www.debugbear.com/",
        purpose: "Monitorización continua de Core Web Vitals y regresiones de rendimiento.",
        priority: "CWV Continuo",
        deepLinkTemplate: null
      },
      {
        name: "Calibre",
        url: "https://calibreapp.com/",
        purpose: "Vigilancia de rendimiento por página, dispositivo y ubicación.",
        priority: "Monitorización",
        deepLinkTemplate: null
      },
      {
        name: "SpeedCurve",
        url: "https://speedcurve.com/",
        purpose: "Monitorización de rendimiento y experiencia de usuario a lo largo del tiempo.",
        priority: "UX & RUM",
        deepLinkTemplate: null
      }
    ]
  },
  {
    id: "seo-contenido",
    number: "03",
    cssClass: "sec-3",
    title: "SEO y contenido",
    subtitle: "Keywords, backlinks, visibilidad competitiva e indexación en buscadores",
    tools: [
      {
        name: "Ahrefs",
        url: "https://ahrefs.com/",
        purpose: "Keywords, backlinks, competencia, auditoría de sitio y rankings.",
        priority: "Backlinks & SEO",
        deepLinkTemplate: null
      },
      {
        name: "Semrush",
        url: "https://www.semrush.com/",
        purpose: "SEO, contenido, competencia, auditorías técnicas y seguimiento de posiciones.",
        priority: "Suite Todo-en-Uno",
        deepLinkTemplate: null
      },
      {
        name: "Sistrix",
        url: "https://www.sistrix.com/",
        purpose: "Visibilidad SEO, keywords, enlaces y seguimiento competitivo; muy usado en el mercado alemán.",
        priority: "Índice Visibilidad",
        deepLinkTemplate: null
      },
      {
        name: "Google Search Console",
        url: "https://search.google.com/search-console",
        purpose: "La fuente oficial para comprobar cómo Google ve e indexa tu web.",
        priority: "Fuente Oficial",
        deepLinkTemplate: (targetUrl) => `https://search.google.com/search-console?resource_id=${encodeURIComponent(targetUrl)}`
      },
      {
        name: "Bing Webmaster Tools",
        url: "https://www.bing.com/webmasters",
        purpose: "Indexación y rendimiento en Bing, relevante también para algunos flujos de IA.",
        priority: "Bing + IA",
        deepLinkTemplate: null
      }
    ]
  },
  {
    id: "geo-ia",
    number: "04",
    cssClass: "sec-4",
    title: "GEO / visibilidad en IA",
    subtitle: "Seguimiento de menciones, citas de marca y posicionamiento en motores generativos (ChatGPT, Perplexity, Gemini)",
    tools: [
      {
        name: "Profound",
        url: "https://www.profound.com/",
        purpose: "Monitoriza visibilidad, menciones y citas de marca en respuestas de IA.",
        priority: "GEO Monitor",
        deepLinkTemplate: null
      },
      {
        name: "Otterly.ai",
        url: "https://otterly.ai/",
        purpose: "Seguimiento de apariciones de marca en ChatGPT, Perplexity, Gemini y otros motores generativos.",
        priority: "AI Search Tracking",
        deepLinkTemplate: null
      },
      {
        name: "Peec AI",
        url: "https://www.peec.ai/",
        purpose: "Analiza visibilidad y posicionamiento de marca en respuestas de IA.",
        priority: "Brand AI Analytics",
        deepLinkTemplate: null
      },
      {
        name: "Perplexity",
        url: "https://www.perplexity.ai/",
        purpose: "Comprobación manual de si tu web aparece o se cita en respuestas.",
        priority: "Prueba Manual IA",
        deepLinkTemplate: (targetUrl) => `https://www.perplexity.ai/search?q=${encodeURIComponent("site:" + targetUrl + " qué es y análisis")}`
      },
      {
        name: "ChatGPT",
        url: "https://chatgpt.com/",
        purpose: "Prueba manual de consultas reales relacionadas con tu marca y contenidos.",
        priority: "Prueba Manual IA",
        deepLinkTemplate: null
      },
      {
        name: "Google Gemini",
        url: "https://gemini.google.com/",
        purpose: "Prueba manual de visibilidad en respuestas generativas de Google.",
        priority: "Prueba Manual IA",
        deepLinkTemplate: null
      }
    ]
  }
];

const WORKFLOW_STEPS = [
  { step: 1, name: "PageSpeed Insights", url: "https://pagespeed.web.dev/" },
  { step: 2, name: "Lighthouse", url: "https://developer.chrome.com/docs/lighthouse/" },
  { step: 3, name: "Google Search Console", url: "https://search.google.com/search-console" },
  { step: 4, name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/" },
  { step: 5, name: "Rich Results Test", url: "https://search.google.com/test/rich-results" }
];

let currentTargetUrl = "https://munchos.web.app";

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "google.com";
  }
}

function renderSections(filterQuery = "") {
  const container = document.getElementById("sections-container");
  container.innerHTML = "";

  const normalizedFilter = filterQuery.trim().toLowerCase();

  SECTIONS_DATA.forEach((section) => {
    const filteredTools = section.tools.filter((t) => {
      if (!normalizedFilter) return true;
      return (
        t.name.toLowerCase().includes(normalizedFilter) ||
        t.purpose.toLowerCase().includes(normalizedFilter) ||
        t.url.toLowerCase().includes(normalizedFilter) ||
        section.title.toLowerCase().includes(normalizedFilter)
      );
    });

    if (filteredTools.length === 0) return;

    const sectionEl = document.createElement("section");
    sectionEl.className = `section-block ${section.cssClass}`;
    sectionEl.id = section.id;

    // Cards HTML
    const cardsHtml = filteredTools
      .map((tool) => {
        const domain = getDomainFromUrl(tool.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        const directAuditUrl =
          tool.deepLinkTemplate && currentTargetUrl
            ? tool.deepLinkTemplate(currentTargetUrl)
            : null;

        return `
        <article class="tool-card">
          <div class="tool-card-top">
            <div class="tool-title-row">
              <div class="tool-name-wrap">
                <img class="tool-favicon" src="${faviconUrl}" alt="${tool.name}" loading="lazy" />
                <h3 class="tool-name">${tool.name}</h3>
              </div>
              <span class="priority-badge">${tool.priority}</span>
            </div>
            <p class="tool-desc">${tool.purpose}</p>
          </div>
          <div class="tool-card-footer">
            <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="tool-url">${tool.url}</a>
            <div class="tool-actions">
              <button class="btn-copy" data-copy="${tool.url}" title="Copiar enlace">Copiar</button>
              ${
                directAuditUrl
                  ? `<a href="${directAuditUrl}" target="_blank" rel="noopener noreferrer" class="btn-visit" title="Analizar la URL activa directamente">Analizar Web ↗</a>`
                  : `<a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="btn-visit">Abrir ↗</a>`
              }
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // PDF Table HTML
    const rowsHtml = filteredTools
      .map(
        (tool) => `
      <tr>
        <td class="td-tool">${tool.name}</td>
        <td class="td-link"><a href="${tool.url}" target="_blank" rel="noopener noreferrer">${tool.url}</a></td>
        <td class="td-purpose">${tool.purpose}</td>
      </tr>
    `
      )
      .join("");

    sectionEl.innerHTML = `
      <div class="section-header">
        <div class="section-title-group">
          <span class="section-number">${section.number}</span>
          <div>
            <h2 class="section-title">${section.title}</h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">${section.subtitle}</p>
          </div>
        </div>
        <span class="section-count">${filteredTools.length} herramienta${filteredTools.length === 1 ? "" : "s"}</span>
      </div>

      <div class="tools-grid">
        ${cardsHtml}
      </div>

      <div class="pdf-table-wrap">
        <table class="pdf-table">
          <thead>
            <tr>
              <th>Herramienta</th>
              <th>Enlace</th>
              <th>Para qué sirve</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(sectionEl);
  });

  bindCopyButtons();
}

function renderWorkflowChecklist() {
  const listEl = document.getElementById("workflow-checklist");
  const savedState = JSON.parse(localStorage.getItem("audithub_workflow_checks") || "{}");

  listEl.innerHTML = WORKFLOW_STEPS.map((item) => {
    const checked = savedState[item.step] ? "checked" : "";
    return `
      <label class="workflow-item">
        <div class="workflow-left">
          <input type="checkbox" class="workflow-check" data-step="${item.step}" ${checked} />
          <span class="workflow-step-num">${item.step}.</span>
          <span class="workflow-name">${item.name}</span>
        </div>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="workflow-link">Abrir ↗</a>
      </label>
    `;
  }).join("");

  listEl.querySelectorAll(".workflow-check").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const step = e.target.getAttribute("data-step");
      const current = JSON.parse(localStorage.getItem("audithub_workflow_checks") || "{}");
      current[step] = e.target.checked;
      localStorage.setItem("audithub_workflow_checks", JSON.stringify(current));
    });
  });
}

function bindCopyButtons() {
  document.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const url = btn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(url);
        const prev = btn.textContent;
        btn.textContent = "¡Copiado!";
        setTimeout(() => {
          btn.textContent = prev;
        }, 1400);
      } catch {
        window.prompt("Copia este enlace:", url);
      }
    });
  });
}

async function checkWebsiteStatus(rawUrl) {
  let formattedUrl = rawUrl.trim();
  if (!formattedUrl) return;
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = "https://" + formattedUrl;
  }

  currentTargetUrl = formattedUrl;
  const urlInput = document.getElementById("target-url-input");
  urlInput.value = formattedUrl;

  const resultBox = document.getElementById("status-result-box");
  const dotEl = document.getElementById("status-dot");
  const textEl = document.getElementById("status-text");
  const metaEl = document.getElementById("status-meta");
  const quickActionsEl = document.getElementById("quick-audit-actions");

  resultBox.classList.add("visible");
  dotEl.className = "pulse-dot warning";
  textEl.textContent = `Comprobando estado y DNS de ${formattedUrl}...`;
  metaEl.textContent = "";

  // Re-render cards so deep-links point to the new target URL
  const searchVal = document.getElementById("tool-search").value;
  renderSections(searchVal);

  let hostname = "";
  try {
    hostname = new URL(formattedUrl).hostname;
  } catch {
    dotEl.className = "pulse-dot error";
    textEl.textContent = "URL no válida. Asegúrate de escribir un dominio válido.";
    return;
  }

  // Update quick audit action buttons for the target URL
  const enc = encodeURIComponent(formattedUrl);
  quickActionsEl.innerHTML = `
    <a class="quick-action-link" href="https://pagespeed.web.dev/analysis?url=${enc}" target="_blank" rel="noopener noreferrer">⚡ PageSpeed Insights ↗</a>
    <a class="quick-action-link" href="https://search.google.com/test/rich-results?url=${enc}" target="_blank" rel="noopener noreferrer">✨ Rich Results Test ↗</a>
    <a class="quick-action-link" href="https://validator.schema.org/#url=${enc}" target="_blank" rel="noopener noreferrer">🧩 Schema Validator ↗</a>
    <a class="quick-action-link" href="https://www.webpagetest.org/?url=${enc}" target="_blank" rel="noopener noreferrer">🚀 WebPageTest ↗</a>
    <a class="quick-action-link" href="${formattedUrl}" target="_blank" rel="noopener noreferrer">🌐 Visitar Web ↗</a>
  `;

  const startTime = performance.now();
  let dnsResolved = false;
  let ipAddresses = [];

  try {
    const dnsResp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`);
    if (dnsResp.ok) {
      const dnsData = await dnsResp.json();
      if (dnsData.Status === 0 && dnsData.Answer && dnsData.Answer.length > 0) {
        dnsResolved = true;
        ipAddresses = dnsData.Answer.filter((a) => a.type === 1).map((a) => a.data);
      }
    }
  } catch {
    // Fallback if DNS API blocked
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    await fetch(formattedUrl, { mode: "no-cors", cache: "no-store", signal: controller.signal });
    clearTimeout(timeoutId);
    const elapsed = Math.round(performance.now() - startTime);

    dotEl.className = "pulse-dot";
    textEl.textContent = `ONLINE — ${hostname} responde correctamente`;
    metaEl.textContent = `Tiempo de respuesta: ~${elapsed} ms ${
      ipAddresses.length ? `| IP DNS: ${ipAddresses.slice(0, 2).join(", ")}` : "| SSL/HTTPS activo"
    }`;
  } catch (err) {
    const elapsed = Math.round(performance.now() - startTime);
    if (dnsResolved) {
      dotEl.className = "pulse-dot warning";
      textEl.textContent = `DNS Activo (${hostname}) — Protegido por CORS o Firewall`;
      metaEl.textContent = `IPs resueltas: ${ipAddresses.slice(0, 2).join(", ")} (${elapsed} ms). Usa los botones de abajo para auditar con PageSpeed o Rich Results.`;
    } else {
      dotEl.className = "pulse-dot error";
      textEl.textContent = `Sin respuesta directa desde ${hostname}`;
      metaEl.textContent = `No se pudo conectar en ${elapsed} ms. Comprueba si el dominio existe o analízalo con PageSpeed Insights.`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSections();
  renderWorkflowChecklist();

  // Search input
  const searchInput = document.getElementById("tool-search");
  searchInput.addEventListener("input", (e) => {
    renderSections(e.target.value);
  });

  // View toggle (Cards vs PDF Table)
  const btnCards = document.getElementById("view-cards-btn");
  const btnTable = document.getElementById("view-table-btn");

  btnCards.addEventListener("click", () => {
    document.body.classList.remove("table-mode");
    btnCards.classList.add("active");
    btnTable.classList.remove("active");
  });

  btnTable.addEventListener("click", () => {
    document.body.classList.add("table-mode");
    btnTable.classList.add("active");
    btnCards.classList.remove("active");
  });

  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle-btn");
  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme === "light") {
      document.documentElement.removeAttribute("data-theme");
      themeBtn.textContent = "☀️ Modo Claro";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      themeBtn.textContent = "🌙 Modo Oscuro";
    }
  });

  // Live URL Checker form
  const checkerForm = document.getElementById("url-checker-form");
  const urlInput = document.getElementById("target-url-input");

  checkerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    checkWebsiteStatus(urlInput.value);
  });

  // Preset chips
  document.querySelectorAll(".chip[data-url]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const target = chip.getAttribute("data-url");
      checkWebsiteStatus(target);
    });
  });

  // Initial check on default URL
  checkWebsiteStatus(currentTargetUrl);
});
