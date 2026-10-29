let currentTargetUrl = "https://munchos.web.app";

// Global state holding the live audit results for the currently tested URL
let liveAuditState = {
  loading: false,
  url: "https://munchos.web.app",
  hostname: "munchos.web.app",
  online: null,
  latencyMs: null,
  dns: { resolved: false, a: [], mx: [], txt: [] },
  htmlFetched: false,
  htmlSizeKb: null,
  seo: {
    title: "",
    titleLen: 0,
    description: "",
    descLen: 0,
    canonical: "",
    robotsMeta: "",
    lang: "",
    viewport: "",
    h1Count: 0,
    h1Text: [],
    h2Count: 0,
    h3Count: 0,
    imgTotal: 0,
    imgMissingAlt: 0,
    internalLinks: 0,
    externalLinks: 0,
    wordCount: 0,
    ogTitle: "",
    ogImage: "",
    scriptsCount: 0,
    cssCount: 0
  },
  schema: {
    jsonLdCount: 0,
    validCount: 0,
    invalidCount: 0,
    types: [],
    microdataCount: 0
  },
  files: {
    robotsTxtFound: null,
    sitemapFound: null,
    llmsTxtFound: null,
    aiBotsBlocked: []
  },
  psi: {
    loaded: false,
    perf: null,
    acc: null,
    bp: null,
    seo: null,
    lcp: null,
    fcp: null,
    cls: null,
    tbt: null
  }
};

const SECTIONS_DATA = [
  {
    id: "imprescindibles",
    number: "01",
    cssClass: "sec-1",
    title: "Imprescindibles",
    subtitle: "Herramientas esenciales ordenadas por prioridad con resultados en vivo para la URL analizada",
    tools: [
      {
        id: "pagespeed",
        name: "PageSpeed Insights",
        url: "https://pagespeed.web.dev/",
        purpose: "Velocidad, Core Web Vitals, renderizado y auditoría rápida de rendimiento móvil/escritorio. Es la herramienta que ya estás usando.",
        priority: "Prioridad #1",
        deepLinkTemplate: (u) => `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Analizando PSI...", detail: `Calculando métricas para ${s.hostname}...` };
          if (s.psi.loaded && s.psi.perf !== null) {
            const st = s.psi.perf >= 90 ? "ok" : s.psi.perf >= 50 ? "warn" : "err";
            return {
              status: st,
              label: `Rendimiento: ${s.psi.perf}/100 · SEO: ${s.psi.seo}/100`,
              detail: `LCP: ${s.psi.lcp || "N/A"} · FCP: ${s.psi.fcp || "N/A"} · CLS: ${s.psi.cls || "N/A"}`
            };
          }
          if (s.online) {
            const st = s.latencyMs < 600 ? "ok" : "warn";
            return {
              status: st,
              label: `Respuesta: ~${s.latencyMs} ms ${s.htmlSizeKb ? `· Peso HTML: ${s.htmlSizeKb} KB` : ""}`,
              detail: `Recursos detectados: ${s.seo.scriptsCount} scripts, ${s.seo.cssCount} CSS, ${s.seo.imgTotal} imágenes.`
            };
          }
          return { status: "warn", label: "Abrir informe PageSpeed", detail: `Haz clic en "Ver Resultado" para ejecutar el análisis de Google.` };
        }
      },
      {
        id: "lighthouse",
        name: "Lighthouse / Chrome DevTools",
        url: "https://developer.chrome.com/docs/lighthouse/",
        purpose: "Auditoría local más detallada de rendimiento, accesibilidad, SEO, buenas prácticas y PWA.",
        priority: "Esencial",
        deepLinkTemplate: (u) => `https://googlechrome.github.io/lighthouse/viewer/?psiurl=${encodeURIComponent(u)}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Auditando DOM...", detail: "Comprobando accesibilidad y buenas prácticas..." };
          if (!s.htmlFetched) {
            return { status: "info", label: `HTTPS: ${s.url.startsWith("https") ? "Sí ✓" : "No ✗"}`, detail: "Abre Lighthouse Viewer para ver el desglose completo." };
          }
          const checksOk =
            (s.seo.viewport ? 1 : 0) +
            (s.seo.lang ? 1 : 0) +
            (s.seo.imgMissingAlt === 0 ? 1 : 0) +
            (s.url.startsWith("https") ? 1 : 0);
          const st = checksOk === 4 ? "ok" : checksOk >= 2 ? "warn" : "err";
          return {
            status: st,
            label: `Checks Técnicos: ${checksOk}/4 superados`,
            detail: `Viewport: ${s.seo.viewport ? "Sí" : "Falta"} · Lang: ${s.seo.lang || "Falta"} · Imágenes sin ALT: ${s.seo.imgMissingAlt}/${s.seo.imgTotal}`
          };
        }
      },
      {
        id: "gsc-1",
        name: "Google Search Console",
        url: "https://search.google.com/search-console",
        purpose: "Indexación, cobertura, sitemaps, errores, consultas orgánicas y rendimiento real en Google.",
        priority: "Oficial Google",
        deepLinkTemplate: (u) => `https://search.google.com/search-console?resource_id=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Comprobando indexación...", detail: "Verificando robots.txt, meta robots y sitemap.xml..." };
          const noindex = (s.seo.robotsMeta || "").toLowerCase().includes("noindex");
          const st = noindex ? "err" : s.files.sitemapFound ? "ok" : "warn";
          return {
            status: st,
            label: noindex ? "⚠️ Bloqueado (noindex)" : "Indexable en Google ✓",
            detail: `Meta Robots: ${s.seo.robotsMeta || "index, follow (por defecto)"} · Sitemap.xml: ${
              s.files.sitemapFound === true ? "Detectado ✓" : s.files.sitemapFound === false ? "No en /sitemap.xml" : "N/D"
            }`
          };
        }
      },
      {
        id: "screaming-frog",
        name: "Screaming Frog SEO Spider",
        url: "https://www.screamingfrog.co.uk/seo-spider/",
        purpose: "Rastreo técnico completo: títulos, metas, canonicals, redirecciones, enlaces rotos, sitemaps y estructura.",
        priority: "Auditoría Técnica",
        deepLinkTemplate: (u) => `https://www.screamingfrog.co.uk/seo-spider/?target=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Rastreando estructura...", detail: "Extrayendo Title, Meta, H1, Canonical y enlaces..." };
          if (!s.htmlFetched) {
            return { status: "warn", label: "Rastreo bloqueado por CORS", detail: "Usa la app de escritorio Screaming Frog para rastrear este dominio." };
          }
          const st = s.seo.titleLen > 0 && s.seo.descLen > 0 && s.seo.h1Count === 1 ? "ok" : "warn";
          return {
            status: st,
            label: `Title (${s.seo.titleLen}c) · Desc (${s.seo.descLen}c) · H1: ${s.seo.h1Count}`,
            detail: `Canonical: ${s.seo.canonical || "No definido"} · Enlaces int: ${s.seo.internalLinks} / ext: ${s.seo.externalLinks}`
          };
        }
      },
      {
        id: "rich-results",
        name: "Google Rich Results Test",
        url: "https://search.google.com/test/rich-results",
        purpose: "Comprueba si tus datos estructurados generan resultados enriquecidos válidos.",
        priority: "Rich Snippets",
        deepLinkTemplate: (u) => `https://search.google.com/test/rich-results?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Buscando Rich Snippets...", detail: "Analizando bloques JSON-LD y Microdata..." };
          if (!s.htmlFetched) {
            return { status: "info", label: "Test directo disponible", detail: "Haz clic en Ver Resultado para abrir el test oficial de Google con tu URL." };
          }
          const total = s.schema.jsonLdCount + s.schema.microdataCount;
          const st = total > 0 && s.schema.invalidCount === 0 ? "ok" : total > 0 ? "warn" : "warn";
          return {
            status: st,
            label: total > 0 ? `${total} elemento(s) estructurados detectados` : "Sin Rich Results en HTML inicial",
            detail: s.schema.types.length > 0 ? `Tipos: ${s.schema.types.join(", ")}` : "Abre Rich Results Test para comprobar renderizado JS."
          };
        }
      },
      {
        id: "schema-validator",
        name: "Schema Markup Validator",
        url: "https://validator.schema.org/",
        purpose: "Valida el JSON-LD y el marcado semántico de tus páginas.",
        priority: "Schema.org",
        deepLinkTemplate: (u) => `https://validator.schema.org/#url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Validando JSON-LD...", detail: "Comprobando sintaxis de Schema.org..." };
          if (!s.htmlFetched) {
            return { status: "info", label: "Validador Schema.org listo", detail: `Enlace directo preconfigurado para ${s.hostname}.` };
          }
          if (s.schema.jsonLdCount === 0) {
            return { status: "warn", label: "0 bloques JSON-LD estáticos", detail: `Microdata: ${s.schema.microdataCount} nodos. Pulsa Ver Resultado para validar.` };
          }
          const st = s.schema.invalidCount === 0 ? "ok" : "err";
          return {
            status: st,
            label: `JSON-LD válidos: ${s.schema.validCount}/${s.schema.jsonLdCount}`,
            detail: `Entidades: ${s.schema.types.join(", ") || "Genérico"}`
          };
        }
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
        id: "webpagetest",
        name: "WebPageTest",
        url: "https://www.webpagetest.org/",
        purpose: "Pruebas avanzadas de carga desde distintas ubicaciones, redes y dispositivos.",
        priority: "Test Avanzado",
        deepLinkTemplate: (u) => `https://www.webpagetest.org/?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Midiendo red y DNS...", detail: "Resolviendo IPs y latencia inicial..." };
          const st = s.dns.resolved ? "ok" : "warn";
          return {
            status: st,
            label: `DNS: ${s.dns.resolved ? "Activo ✓" : "N/D"} · Ping HTTP: ~${s.latencyMs || "--"} ms`,
            detail: `IPs A: ${s.dns.a.slice(0, 2).join(", ") || "Cloud CDN"} · URL pre-cargada para test.`
          };
        }
      },
      {
        id: "gtmetrix",
        name: "GTmetrix",
        url: "https://gtmetrix.com/",
        purpose: "Informes de velocidad con waterfall, métricas y recomendaciones.",
        priority: "Waterfall",
        deepLinkTemplate: (u) => `https://gtmetrix.com/?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Analizando recursos...", detail: "Contando activos de la página..." };
          return {
            status: s.htmlFetched ? "ok" : "info",
            label: s.htmlFetched ? `HTML: ${s.htmlSizeKb} KB · ${s.seo.scriptsCount + s.seo.cssCount + s.seo.imgTotal} recursos` : "Lanzador GTmetrix listo",
            detail: `${s.seo.scriptsCount} JS · ${s.seo.cssCount} CSS · ${s.seo.imgTotal} Imágenes en documento.`
          };
        }
      },
      {
        id: "debugbear",
        name: "DebugBear",
        url: "https://www.debugbear.com/",
        purpose: "Monitorización continua de Core Web Vitals y regresiones de rendimiento.",
        priority: "CWV Continuo",
        deepLinkTemplate: (u) => `https://www.debugbear.com/test/website-speed?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => {
          if (s.loading) return { status: "info", label: "Preparando test CWV...", detail: "Comprobando métricas..." };
          return {
            status: s.psi.loaded ? "ok" : "info",
            label: s.psi.loaded ? `TBT: ${s.psi.tbt || "N/A"} · CLS: ${s.psi.cls || "N/A"}` : `Test gratuito de velocidad listo`,
            detail: `Enlace directo al analizador de velocidad de DebugBear para ${s.hostname}.`
          };
        }
      },
      {
        id: "calibre",
        name: "Calibre",
        url: "https://calibreapp.com/",
        purpose: "Vigilancia de rendimiento por página, dispositivo y ubicación.",
        priority: "Monitorización",
        deepLinkTemplate: (u) => `https://calibreapp.com/tools/core-web-vitals-checker?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => ({
          status: "info",
          label: `CWV Checker para ${s.hostname}`,
          detail: `Comprueba el estado de Core Web Vitals de ${s.hostname} en Calibre.`
        })
      },
      {
        id: "speedcurve",
        name: "SpeedCurve",
        url: "https://speedcurve.com/",
        purpose: "Monitorización de rendimiento y experiencia de usuario a lo largo del tiempo.",
        priority: "UX & RUM",
        deepLinkTemplate: (u) => `https://speedcurve.com/?url=${encodeURIComponent(u)}`,
        getLiveSummary: (s) => ({
          status: s.online ? "ok" : "info",
          label: `Estado RUM: ${s.online ? "Sitio alcanzable" : "Pendiente"}`,
          detail: `Latencia base medida desde tu navegador: ~${s.latencyMs || "--"} ms.`
        })
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
        id: "ahrefs",
        name: "Ahrefs",
        url: "https://ahrefs.com/",
        purpose: "Keywords, backlinks, competencia, auditoría de sitio y rankings.",
        priority: "Backlinks & SEO",
        deepLinkTemplate: (u) => `https://ahrefs.com/backlink-checker/?input=${encodeURIComponent(u)}&mode=subdomains`,
        getLiveSummary: (s) => ({
          status: s.htmlFetched ? "ok" : "info",
          label: s.htmlFetched ? `${s.seo.externalLinks} enlaces salientes · ${s.seo.wordCount} palabras` : `Backlink Checker para ${s.hostname}`,
          detail: `Abre el comprobador de backlinks y autoridad de Ahrefs para ${s.hostname}.`
        })
      },
      {
        id: "semrush",
        name: "Semrush",
        url: "https://www.semrush.com/",
        purpose: "SEO, contenido, competencia, auditorías técnicas y seguimiento de posiciones.",
        priority: "Suite Todo-en-Uno",
        deepLinkTemplate: (u) => `https://www.semrush.com/analytics/overview/?q=${encodeURIComponent(u)}&searchType=domain`,
        getLiveSummary: (s) => ({
          status: s.htmlFetched ? "ok" : "info",
          label: s.htmlFetched ? `Estructura: H1(${s.seo.h1Count}) · H2(${s.seo.h2Count}) · H3(${s.seo.h3Count})` : `Domain Overview: ${s.hostname}`,
          detail: `Enlace directo al panel Domain Overview de Semrush con ${s.hostname}.`
        })
      },
      {
        id: "sistrix",
        name: "Sistrix",
        url: "https://www.sistrix.com/",
        purpose: "Visibilidad SEO, keywords, enlaces y seguimiento competitivo; muy usado en el mercado alemán.",
        priority: "Índice Visibilidad",
        deepLinkTemplate: (u) => `https://app.sistrix.com/es/visibility-index?domain=${encodeURIComponent(getDomainFromUrl(u))}`,
        getLiveSummary: (s) => ({
          status: "info",
          label: `Índice de visibilidad: ${s.hostname}`,
          detail: `Comprueba la visibilidad orgánica del dominio ${s.hostname} en Sistrix.`
        })
      },
      {
        id: "gsc-2",
        name: "Google Search Console",
        url: "https://search.google.com/search-console",
        purpose: "La fuente oficial para comprobar cómo Google ve e indexa tu web.",
        priority: "Fuente Oficial",
        deepLinkTemplate: (u) => `https://www.google.com/search?q=${encodeURIComponent("site:" + getDomainFromUrl(u))}`,
        getLiveSummary: (s) => ({
          status: s.files.robotsTxtFound ? "ok" : "info",
          label: `robots.txt: ${s.files.robotsTxtFound ? "Activo ✓" : "No detectado"}`,
          detail: `Haz clic en Ver Resultado para comprobar qué páginas están indexadas en Google (site:${s.hostname}).`
        })
      },
      {
        id: "bing",
        name: "Bing Webmaster Tools",
        url: "https://www.bing.com/webmasters",
        purpose: "Indexación y rendimiento en Bing, relevante también para algunos flujos de IA.",
        priority: "Bing + IA",
        deepLinkTemplate: (u) => `https://www.bing.com/search?q=${encodeURIComponent("site:" + getDomainFromUrl(u))}`,
        getLiveSummary: (s) => ({
          status: "info",
          label: `Comprobar indexación en Bing (site:${s.hostname})`,
          detail: `Importante: ChatGPT Search y Copilot utilizan el índice de Bing.`
        })
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
        id: "profound",
        name: "Profound",
        url: "https://www.profound.com/",
        purpose: "Monitoriza visibilidad, menciones y citas de marca en respuestas de IA.",
        priority: "GEO Monitor",
        deepLinkTemplate: (u) => `https://www.profound.com/?domain=${encodeURIComponent(getDomainFromUrl(u))}`,
        getLiveSummary: (s) => {
          const blocked = s.files.aiBotsBlocked.length;
          return {
            status: blocked === 0 ? "ok" : "warn",
            label: blocked === 0 ? "Bots de IA permitidos en robots.txt ✓" : `⚠️ ${blocked} bot(s) IA bloqueados`,
            detail: `llms.txt: ${s.files.llmsTxtFound ? "Detectado ✓" : "No presente"} · Schema: ${s.schema.types.length > 0 ? s.schema.types.join(", ") : "Sin Schema"}`
          };
        }
      },
      {
        id: "otterly",
        name: "Otterly.ai",
        url: "https://otterly.ai/",
        purpose: "Seguimiento de apariciones de marca en ChatGPT, Perplexity, Gemini y otros motores generativos.",
        priority: "AI Search Tracking",
        deepLinkTemplate: (u) => `https://otterly.ai/?domain=${encodeURIComponent(getDomainFromUrl(u))}`,
        getLiveSummary: (s) => ({
          status: s.seo.ogTitle ? "ok" : "warn",
          label: `Metadatos de Marca (OG): ${s.seo.ogTitle ? "Configurados ✓" : "Incompletos"}`,
          detail: s.seo.ogTitle ? `OG Title: "${s.seo.ogTitle.slice(0, 50)}"` : "Añade etiquetas Open Graph y Schema Organization para mejorar citas en IA."
        })
      },
      {
        id: "peec",
        name: "Peec AI",
        url: "https://www.peec.ai/",
        purpose: "Analiza visibilidad y posicionamiento de marca en respuestas de IA.",
        priority: "Brand AI Analytics",
        deepLinkTemplate: (u) => `https://www.peec.ai/?domain=${encodeURIComponent(getDomainFromUrl(u))}`,
        getLiveSummary: (s) => ({
          status: s.htmlFetched ? "ok" : "info",
          label: `Claridad semántica: ${s.seo.h1Count > 0 ? "Buena ✓" : "Mejorable"}`,
          detail: `Contenido legible: ${s.seo.wordCount} palabras y ${s.seo.h2Count} subtítulos H2 para extracción LLM.`
        })
      },
      {
        id: "perplexity",
        name: "Perplexity",
        url: "https://www.perplexity.ai/",
        purpose: "Comprobación manual de si tu web aparece o se cita en respuestas.",
        priority: "Prueba Directa IA",
        deepLinkTemplate: (u) =>
          `https://www.perplexity.ai/search?q=${encodeURIComponent(
            `Analiza la web ${u} (${getDomainFromUrl(u)}): ¿qué servicios ofrece, cuál es su reputación y en qué fuentes se cita?`
          )}`,
        getLiveSummary: (s) => ({
          status: "ok",
          label: `Prompt listo para auditar ${s.hostname}`,
          detail: `Pulsa "Ver Resultado" para lanzar la consulta directamente en Perplexity con tu dominio.`
        })
      },
      {
        id: "chatgpt",
        name: "ChatGPT",
        url: "https://chatgpt.com/",
        purpose: "Prueba manual de consultas reales relacionadas con tu marca y contenidos.",
        priority: "Prueba Directa IA",
        deepLinkTemplate: (u) =>
          `https://chatgpt.com/?q=${encodeURIComponent(
            `Busca información sobre ${u} (${getDomainFromUrl(u)}). ¿De qué trata este sitio web, cuáles son sus puntos clave y cómo aparece posicionado?`
          )}`,
        getLiveSummary: (s) => ({
          status: "ok",
          label: `Prompt directo en ChatGPT para ${s.hostname}`,
          detail: `Abre ChatGPT con el prompt ya escrito para comprobar qué sabe de ${s.hostname}.`
        })
      },
      {
        id: "gemini",
        name: "Google Gemini",
        url: "https://gemini.google.com/",
        purpose: "Prueba manual de visibilidad en respuestas generativas de Google.",
        priority: "Prueba Directa IA",
        deepLinkTemplate: (u) =>
          `https://www.google.com/search?udm=14&q=${encodeURIComponent(`"${getDomainFromUrl(u)}" OR site:${getDomainFromUrl(u)}`)}`,
        getLiveSummary: (s) => ({
          status: "ok",
          label: `Visibilidad en Google / Gemini para ${s.hostname}`,
          detail: `Comprueba menciones de marca e indexación semántica en el ecosistema Google.`
        })
      }
    ]
  }
];

const WORKFLOW_STEPS = [
  {
    step: 1,
    name: "PageSpeed Insights",
    baseUrl: "https://pagespeed.web.dev/",
    deepLink: (u) => `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(u)}`
  },
  {
    step: 2,
    name: "Lighthouse",
    baseUrl: "https://developer.chrome.com/docs/lighthouse/",
    deepLink: (u) => `https://googlechrome.github.io/lighthouse/viewer/?psiurl=${encodeURIComponent(u)}&strategy=mobile`
  },
  {
    step: 3,
    name: "Google Search Console",
    baseUrl: "https://search.google.com/search-console",
    deepLink: (u) => `https://search.google.com/search-console?resource_id=${encodeURIComponent(u)}`
  },
  {
    step: 4,
    name: "Screaming Frog",
    baseUrl: "https://www.screamingfrog.co.uk/seo-spider/",
    deepLink: (u) => `https://www.screamingfrog.co.uk/seo-spider/`
  },
  {
    step: 5,
    name: "Rich Results Test",
    baseUrl: "https://search.google.com/test/rich-results",
    deepLink: (u) => `https://search.google.com/test/rich-results?url=${encodeURIComponent(u)}`
  }
];

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "google.com";
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Fetch helper with CORS proxy fallbacks so we can inspect almost any public URL in the browser
async function fetchTextWithFallback(targetUrl, timeoutMs = 7000) {
  const attempts = [
    targetUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
  ];

  for (const endpoint of attempts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text && text.length > 0) {
          return { ok: true, text };
        }
      }
    } catch {
      // Try next proxy
    }
  }
  return { ok: false, text: "" };
}

function parseHtmlAndAudit(htmlString, baseUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const title = (doc.querySelector("title")?.textContent || "").trim();
  const description = (
    doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
    ""
  ).trim();
  const canonical = (doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || "").trim();
  const robotsMeta = (doc.querySelector('meta[name="robots"]')?.getAttribute("content") || "").trim();
  const lang = (doc.documentElement?.getAttribute("lang") || "").trim();
  const viewport = (doc.querySelector('meta[name="viewport"]')?.getAttribute("content") || "").trim();

  const h1Els = Array.from(doc.querySelectorAll("h1"));
  const h1Text = h1Els.map((el) => el.textContent.trim()).filter(Boolean);
  const h2Count = doc.querySelectorAll("h2").length;
  const h3Count = doc.querySelectorAll("h3").length;

  const imgs = Array.from(doc.querySelectorAll("img"));
  const imgTotal = imgs.length;
  const imgMissingAlt = imgs.filter((img) => {
    const alt = img.getAttribute("alt");
    return alt === null || alt.trim() === "";
  }).length;

  const links = Array.from(doc.querySelectorAll("a[href]"));
  let internalLinks = 0;
  let externalLinks = 0;
  const baseHost = getDomainFromUrl(baseUrl);

  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }
    try {
      const resolved = new URL(href, baseUrl);
      if (resolved.hostname === baseHost || resolved.hostname.endsWith("." + baseHost)) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      internalLinks++;
    }
  });

  const bodyText = (doc.body?.textContent || "").replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").length : 0;

  const ogTitle = (doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || "").trim();
  const ogImage = (doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "").trim();

  const scriptsCount = doc.querySelectorAll("script").length;
  const cssCount = doc.querySelectorAll('link[rel="stylesheet"]').length;

  // Schema / JSON-LD parsing
  const jsonLdScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  let validCount = 0;
  let invalidCount = 0;
  const typesSet = new Set();

  function collectTypes(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(collectTypes);
      return;
    }
    if (obj["@type"]) {
      if (Array.isArray(obj["@type"])) {
        obj["@type"].forEach((t) => typesSet.add(t));
      } else {
        typesSet.add(obj["@type"]);
      }
    }
    if (obj["@graph"] && Array.isArray(obj["@graph"])) {
      obj["@graph"].forEach(collectTypes);
    }
  }

  jsonLdScripts.forEach((scr) => {
    const raw = (scr.textContent || "").trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      validCount++;
      collectTypes(parsed);
    } catch {
      invalidCount++;
    }
  });

  const microdataCount = doc.querySelectorAll("[itemscope]").length;

  return {
    seo: {
      title,
      titleLen: title.length,
      description,
      descLen: description.length,
      canonical,
      robotsMeta,
      lang,
      viewport,
      h1Count: h1Els.length,
      h1Text,
      h2Count,
      h3Count,
      imgTotal,
      imgMissingAlt,
      internalLinks,
      externalLinks,
      wordCount,
      ogTitle,
      ogImage,
      scriptsCount,
      cssCount
    },
    schema: {
      jsonLdCount: jsonLdScripts.length,
      validCount,
      invalidCount,
      types: Array.from(typesSet),
      microdataCount
    }
  };
}

function renderLiveDashboard() {
  const s = liveAuditState;
  const dashboardEl = document.getElementById("live-dashboard");
  const dotEl = document.getElementById("status-dot");
  const textEl = document.getElementById("status-text");
  const metaEl = document.getElementById("status-meta");
  const quickActionsEl = document.getElementById("quick-audit-actions");
  const gridEl = document.getElementById("live-results-grid");

  dashboardEl.classList.add("visible");

  if (s.loading) {
    dotEl.className = "pulse-dot warning";
    textEl.textContent = `Analizando en vivo todos los indicadores de ${s.url}...`;
    metaEl.textContent = "Consultando DNS, HTML, SEO, Schema, Robots y PageSpeed...";
  } else if (s.online) {
    dotEl.className = "pulse-dot";
    textEl.textContent = `ONLINE — Resultados en vivo para ${s.url}`;
    metaEl.textContent = `Latencia: ~${s.latencyMs} ms | DNS IPs: ${s.dns.a.slice(0, 2).join(", ") || "Activas"} | HTML: ${
      s.htmlFetched ? `${s.htmlSizeKb} KB analizados` : "Protegido por CORS"
    }`;
  } else {
    dotEl.className = "pulse-dot error";
    textEl.textContent = `Sin respuesta directa de ${s.hostname}`;
    metaEl.textContent = "Revisa los enlaces directos de auditoría externa debajo.";
  }

  // Quick 1-click links bar with the tested URL pre-loaded
  const enc = encodeURIComponent(s.url);
  const dom = encodeURIComponent(s.hostname);
  quickActionsEl.innerHTML = `
    <a class="quick-action-link" href="https://pagespeed.web.dev/analysis?url=${enc}" target="_blank" rel="noopener noreferrer">⚡ PageSpeed Insights (${s.hostname}) ↗</a>
    <a class="quick-action-link" href="https://search.google.com/test/rich-results?url=${enc}" target="_blank" rel="noopener noreferrer">✨ Rich Results Test ↗</a>
    <a class="quick-action-link" href="https://validator.schema.org/#url=${enc}" target="_blank" rel="noopener noreferrer">🧩 Schema Validator ↗</a>
    <a class="quick-action-link" href="https://www.webpagetest.org/?url=${enc}" target="_blank" rel="noopener noreferrer">🚀 WebPageTest ↗</a>
    <a class="quick-action-link" href="https://gtmetrix.com/?url=${enc}" target="_blank" rel="noopener noreferrer">📊 GTmetrix ↗</a>
    <a class="quick-action-link" href="https://ahrefs.com/backlink-checker/?input=${enc}&mode=subdomains" target="_blank" rel="noopener noreferrer">🔗 Ahrefs Backlinks ↗</a>
    <a class="quick-action-link" href="https://www.semrush.com/analytics/overview/?q=${enc}&searchType=domain" target="_blank" rel="noopener noreferrer">📈 Semrush ↗</a>
    <a class="quick-action-link" href="https://www.perplexity.ai/search?q=${encodeURIComponent("Analiza la web " + s.url)}" target="_blank" rel="noopener noreferrer">🤖 Perplexity IA ↗</a>
    <a class="quick-action-link" href="https://chatgpt.com/?q=${encodeURIComponent("Analiza la web " + s.url)}" target="_blank" rel="noopener noreferrer">💬 ChatGPT ↗</a>
    <a class="quick-action-link" href="https://www.google.com/search?q=site:${dom}" target="_blank" rel="noopener noreferrer">🔍 Google site:${s.hostname} ↗</a>
  `;

  // Compute heuristic or PSI scores for Panel 1
  const perfScore = s.psi.loaded && s.psi.perf !== null
    ? s.psi.perf
    : s.online
    ? Math.max(55, Math.min(99, 100 - Math.round((s.latencyMs || 300) / 45)))
    : "--";
  const accScore = s.psi.loaded && s.psi.acc !== null
    ? s.psi.acc
    : s.htmlFetched
    ? Math.max(60, 100 - s.seo.imgMissingAlt * 8 - (s.seo.lang ? 0 : 12))
    : "--";
  const bpScore = s.psi.loaded && s.psi.bp !== null
    ? s.psi.bp
    : s.url.startsWith("https")
    ? 96
    : 65;
  const seoScore = s.psi.loaded && s.psi.seo !== null
    ? s.psi.seo
    : s.htmlFetched
    ? Math.max(
        50,
        100 -
          (s.seo.titleLen > 0 ? 0 : 20) -
          (s.seo.descLen > 0 ? 0 : 15) -
          (s.seo.h1Count === 1 ? 0 : 10) -
          (s.seo.viewport ? 0 : 15)
      )
    : "--";

  const scoreClass = (val) => {
    if (typeof val !== "number") return "";
    return val >= 90 ? "score-good" : val >= 50 ? "score-avg" : "score-poor";
  };

  gridEl.innerHTML = `
    <!-- Panel 1: PageSpeed & Lighthouse -->
    <div class="result-panel">
      <div class="result-panel-header">
        <span class="result-panel-title">⚡ 1. PageSpeed & Lighthouse</span>
        <span class="status-pill ${s.psi.loaded ? "pill-ok" : "pill-info"}">
          ${s.psi.loaded ? "API Google Oficial" : s.loading ? "Calculando..." : "Estimación DOM + Red"}
        </span>
      </div>
      <div class="gauges-row">
        <div class="gauge-box">
          <div class="gauge-score ${scoreClass(perfScore)}">${perfScore}</div>
          <div class="gauge-label">Rendimiento</div>
        </div>
        <div class="gauge-box">
          <div class="gauge-score ${scoreClass(accScore)}">${accScore}</div>
          <div class="gauge-label">Accesibilidad</div>
        </div>
        <div class="gauge-box">
          <div class="gauge-score ${scoreClass(bpScore)}">${bpScore}</div>
          <div class="gauge-label">Buenas Práct.</div>
        </div>
        <div class="gauge-box">
          <div class="gauge-score ${scoreClass(seoScore)}">${seoScore}</div>
          <div class="gauge-label">SEO</div>
        </div>
      </div>
      <div class="kv-list">
        <div class="kv-row">
          <span class="kv-key">Core Web Vitals</span>
          <span class="kv-val">${
            s.psi.loaded
              ? `LCP: ${s.psi.lcp} · FCP: ${s.psi.fcp} · CLS: ${s.psi.cls}`
              : `Respuesta inicial: ~${s.latencyMs || "--"} ms`
          }</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Recursos en página</span>
          <span class="kv-val">${
            s.htmlFetched
              ? `${s.htmlSizeKb} KB HTML · ${s.seo.scriptsCount} JS · ${s.seo.cssCount} CSS · ${s.seo.imgTotal} IMG`
              : "Analizable en PageSpeed"
          }</span>
        </div>
      </div>
      <div class="panel-links">
        <a class="mini-link" href="https://pagespeed.web.dev/analysis?url=${enc}" target="_blank" rel="noopener noreferrer">Abrir PageSpeed ↗</a>
        <a class="mini-link" href="https://www.webpagetest.org/?url=${enc}" target="_blank" rel="noopener noreferrer">WebPageTest ↗</a>
        <a class="mini-link" href="https://gtmetrix.com/?url=${enc}" target="_blank" rel="noopener noreferrer">GTmetrix ↗</a>
      </div>
    </div>

    <!-- Panel 2: Screaming Frog / Rastreo Técnico SEO -->
    <div class="result-panel">
      <div class="result-panel-header">
        <span class="result-panel-title">🐸 2. Rastreo Técnico (Screaming Frog)</span>
        <span class="status-pill ${s.htmlFetched ? (s.seo.titleLen > 0 && s.seo.h1Count === 1 ? "pill-ok" : "pill-warn") : "pill-info"}">
          ${s.htmlFetched ? (s.seo.titleLen > 0 && s.seo.h1Count === 1 ? "Estructura OK" : "Revisar Etiquetas") : "Rastreo Externo"}
        </span>
      </div>
      <div class="kv-list">
        <div class="kv-row">
          <span class="kv-key">Title (${s.seo.titleLen} car.)</span>
          <span class="kv-val">${escapeHtml(s.seo.title || (s.loading ? "Extrayendo..." : "No detectado"))}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Meta Desc (${s.seo.descLen} car.)</span>
          <span class="kv-val">${escapeHtml(
            s.seo.description ? s.seo.description.slice(0, 90) + (s.seo.description.length > 90 ? "…" : "") : "No definida"
          )}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Encabezados</span>
          <span class="kv-val">H1: ${s.seo.h1Count} (${escapeHtml(s.seo.h1Text[0]?.slice(0, 35) || "ninguno")}) · H2: ${s.seo.h2Count} · H3: ${s.seo.h3Count}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Canonical & Enlaces</span>
          <span class="kv-val">${s.seo.canonical ? "Canonical ✓" : "Sin canonical"} · Int: ${s.seo.internalLinks} · Ext: ${s.seo.externalLinks}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Imágenes sin ALT</span>
          <span class="kv-val">${s.seo.imgMissingAlt} de ${s.seo.imgTotal} imágenes</span>
        </div>
      </div>
      <div class="panel-links">
        <a class="mini-link" href="https://www.screamingfrog.co.uk/seo-spider/" target="_blank" rel="noopener noreferrer">Screaming Frog ↗</a>
        <a class="mini-link" href="https://ahrefs.com/backlink-checker/?input=${enc}&mode=subdomains" target="_blank" rel="noopener noreferrer">Ahrefs ↗</a>
        <a class="mini-link" href="https://www.semrush.com/analytics/overview/?q=${enc}&searchType=domain" target="_blank" rel="noopener noreferrer">Semrush ↗</a>
      </div>
    </div>

    <!-- Panel 3: Rich Results & Schema Markup Validator -->
    <div class="result-panel">
      <div class="result-panel-header">
        <span class="result-panel-title">🧩 3. Rich Results & Schema.org</span>
        <span class="status-pill ${s.schema.jsonLdCount > 0 && s.schema.invalidCount === 0 ? "pill-ok" : "pill-warn"}">
          ${s.schema.jsonLdCount > 0 ? `${s.schema.validCount} JSON-LD Válido(s)` : "0 JSON-LD en HTML"}
        </span>
      </div>
      <div class="kv-list">
        <div class="kv-row">
          <span class="kv-key">Scripts JSON-LD</span>
          <span class="kv-val">${s.schema.jsonLdCount} encontrado(s) (${s.schema.invalidCount} con error de sintaxis)</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Tipos @type</span>
          <span class="kv-val">${s.schema.types.length > 0 ? escapeHtml(s.schema.types.join(", ")) : "Ninguno detectado"}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Microdata / OpenGraph</span>
          <span class="kv-val">${s.schema.microdataCount} itemscope · OG Title: ${s.seo.ogTitle ? "Sí ✓" : "No"} · OG Image: ${s.seo.ogImage ? "Sí ✓" : "No"}</span>
        </div>
      </div>
      <div class="panel-links">
        <a class="mini-link" href="https://search.google.com/test/rich-results?url=${enc}" target="_blank" rel="noopener noreferrer">Probar en Rich Results Test ↗</a>
        <a class="mini-link" href="https://validator.schema.org/#url=${enc}" target="_blank" rel="noopener noreferrer">Validar en Schema.org ↗</a>
      </div>
    </div>

    <!-- Panel 4: Indexación (Search Console, Bing, GEO & IA) -->
    <div class="result-panel">
      <div class="result-panel-header">
        <span class="result-panel-title">🤖 4. Indexación & GEO (Visibilidad IA)</span>
        <span class="status-pill ${s.files.aiBotsBlocked.length === 0 ? "pill-ok" : "pill-warn"}">
          ${s.files.aiBotsBlocked.length === 0 ? "IA & Buscadores OK" : "Bots IA Restringidos"}
        </span>
      </div>
      <div class="kv-list">
        <div class="kv-row">
          <span class="kv-key">Meta Robots</span>
          <span class="kv-val">${escapeHtml(s.seo.robotsMeta || "index, follow (por defecto)")}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">robots.txt & sitemap</span>
          <span class="kv-val">robots.txt: ${s.files.robotsTxtFound ? "Sí ✓" : "No"} · sitemap.xml: ${s.files.sitemapFound ? "Sí ✓" : "No"} · llms.txt: ${s.files.llmsTxtFound ? "Sí ✓" : "No"}</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">Acceso Bots IA (GEO)</span>
          <span class="kv-val">${
            s.files.aiBotsBlocked.length === 0
              ? "GPTBot, PerplexityBot y Google-Extended permitidos ✓"
              : `Bloqueados: ${escapeHtml(s.files.aiBotsBlocked.join(", "))}`
          }</span>
        </div>
        <div class="kv-row">
          <span class="kv-key">DNS / Servidores Correo</span>
          <span class="kv-val">IPs: ${s.dns.a.slice(0, 2).join(", ") || "N/D"} · MX: ${s.dns.mx.length} reg.</span>
        </div>
      </div>
      <div class="panel-links">
        <a class="mini-link" href="https://www.google.com/search?q=site:${dom}" target="_blank" rel="noopener noreferrer">Google site:${s.hostname} ↗</a>
        <a class="mini-link" href="https://www.bing.com/search?q=site:${dom}" target="_blank" rel="noopener noreferrer">Bing site:${s.hostname} ↗</a>
        <a class="mini-link" href="https://www.perplexity.ai/search?q=${encodeURIComponent("Analiza la web " + s.url)}" target="_blank" rel="noopener noreferrer">Perplexity ↗</a>
        <a class="mini-link" href="https://chatgpt.com/?q=${encodeURIComponent("Analiza la web " + s.url)}" target="_blank" rel="noopener noreferrer">ChatGPT ↗</a>
      </div>
    </div>
  `;
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
            : tool.url;

        const liveInfo = tool.getLiveSummary ? tool.getLiveSummary(liveAuditState) : null;

        return `
        <article class="tool-card">
          <div class="tool-card-top">
            <div class="tool-title-row">
              <div class="tool-name-wrap">
                <img class="tool-favicon" src="${faviconUrl}" alt="${escapeHtml(tool.name)}" loading="lazy" />
                <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
              </div>
              <span class="priority-badge">${escapeHtml(tool.priority)}</span>
            </div>
            <p class="tool-desc">${escapeHtml(tool.purpose)}</p>
            ${
              liveInfo
                ? `
              <div class="tool-live-box ${liveInfo.status}">
                <div class="tool-live-header">
                  <span>Resultado para ${escapeHtml(liveAuditState.hostname)}:</span>
                  <span>${escapeHtml(liveInfo.label)}</span>
                </div>
                <div class="tool-live-detail">${escapeHtml(liveInfo.detail)}</div>
              </div>
            `
                : ""
            }
          </div>
          <div class="tool-card-footer">
            <a href="${directAuditUrl}" target="_blank" rel="noopener noreferrer" class="tool-url" title="Enlace directo con la URL analizada">${escapeHtml(directAuditUrl)}</a>
            <div class="tool-actions">
              <button class="btn-copy" data-copy="${directAuditUrl}" title="Copiar enlace de prueba">Copiar</button>
              <a href="${directAuditUrl}" target="_blank" rel="noopener noreferrer" class="btn-visit">Ver Resultado ↗</a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");

    // PDF Table HTML (with live column!)
    const rowsHtml = filteredTools
      .map((tool) => {
        const directAuditUrl =
          tool.deepLinkTemplate && currentTargetUrl
            ? tool.deepLinkTemplate(currentTargetUrl)
            : tool.url;
        const liveInfo = tool.getLiveSummary ? tool.getLiveSummary(liveAuditState) : null;
        return `
      <tr>
        <td class="td-tool">${escapeHtml(tool.name)}</td>
        <td class="td-link"><a href="${directAuditUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(directAuditUrl)}</a></td>
        <td class="td-purpose">${escapeHtml(tool.purpose)}</td>
        <td class="td-live">
          ${
            liveInfo
              ? `<strong>${escapeHtml(liveInfo.label)}</strong><br/><span style="color:var(--text-secondary)">${escapeHtml(liveInfo.detail)}</span>`
              : "-"
          }
        </td>
      </tr>
    `;
      })
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
              <th>Enlace Directo (con URL)</th>
              <th>Para qué sirve</th>
              <th>Resultado en Vivo (${escapeHtml(liveAuditState.hostname)})</th>
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
    const targetHref = item.deepLink ? item.deepLink(currentTargetUrl) : item.baseUrl;
    return `
      <label class="workflow-item">
        <div class="workflow-left">
          <input type="checkbox" class="workflow-check" data-step="${item.step}" ${checked} />
          <span class="workflow-step-num">${item.step}.</span>
          <span class="workflow-name">${item.name}</span>
        </div>
        <a href="${targetHref}" target="_blank" rel="noopener noreferrer" class="workflow-link">Probar URL ↗</a>
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

async function runFullUrlAudit(rawUrl) {
  let formattedUrl = (rawUrl || "").trim();
  if (!formattedUrl) return;
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = "https://" + formattedUrl;
  }

  let hostname = "";
  try {
    const u = new URL(formattedUrl);
    hostname = u.hostname;
    formattedUrl = u.href;
  } catch {
    alert("Por favor, introduce una URL o dominio válido (por ejemplo: https://munchos.web.app)");
    return;
  }

  currentTargetUrl = formattedUrl;
  const urlInput = document.getElementById("target-url-input");
  if (urlInput) urlInput.value = formattedUrl;

  // Reset state to loading
  liveAuditState = {
    loading: true,
    url: formattedUrl,
    hostname,
    online: null,
    latencyMs: null,
    dns: { resolved: false, a: [], mx: [], txt: [] },
    htmlFetched: false,
    htmlSizeKb: null,
    seo: {
      title: "",
      titleLen: 0,
      description: "",
      descLen: 0,
      canonical: "",
      robotsMeta: "",
      lang: "",
      viewport: "",
      h1Count: 0,
      h1Text: [],
      h2Count: 0,
      h3Count: 0,
      imgTotal: 0,
      imgMissingAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
      wordCount: 0,
      ogTitle: "",
      ogImage: "",
      scriptsCount: 0,
      cssCount: 0
    },
    schema: {
      jsonLdCount: 0,
      validCount: 0,
      invalidCount: 0,
      types: [],
      microdataCount: 0
    },
    files: {
      robotsTxtFound: null,
      sitemapFound: null,
      llmsTxtFound: null,
      aiBotsBlocked: []
    },
    psi: {
      loaded: false,
      perf: null,
      acc: null,
      bp: null,
      seo: null,
      lcp: null,
      fcp: null,
      cls: null,
      tbt: null
    }
  };

  const searchVal = document.getElementById("tool-search")?.value || "";
  renderLiveDashboard();
  renderSections(searchVal);
  renderWorkflowChecklist();

  const originUrl = new URL(formattedUrl).origin;

  // 1. DNS Check (A, MX)
  const dnsPromise = (async () => {
    try {
      const [aRes, mxRes] = await Promise.all([
        fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`),
        fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=MX`)
      ]);
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.Status === 0 && aData.Answer) {
          liveAuditState.dns.resolved = true;
          liveAuditState.dns.a = aData.Answer.filter((x) => x.type === 1).map((x) => x.data);
        }
      }
      if (mxRes.ok) {
        const mxData = await mxRes.json();
        if (mxData.Status === 0 && mxData.Answer) {
          liveAuditState.dns.mx = mxData.Answer.map((x) => x.data);
        }
      }
    } catch {
      // Ignore DNS errors
    }
  })();

  // 2. Direct HTTP reachability & latency
  const pingPromise = (async () => {
    const start = performance.now();
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 7000);
      await fetch(formattedUrl, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      clearTimeout(tid);
      liveAuditState.online = true;
      liveAuditState.latencyMs = Math.round(performance.now() - start);
    } catch {
      liveAuditState.latencyMs = Math.round(performance.now() - start);
      liveAuditState.online = liveAuditState.dns.resolved;
    }
  })();

  // 3. Fetch HTML & run Screaming Frog / Rich Results / Schema / Lighthouse DOM checks
  const htmlPromise = (async () => {
    const res = await fetchTextWithFallback(formattedUrl, 8000);
    if (res.ok && res.text) {
      liveAuditState.htmlFetched = true;
      liveAuditState.online = true;
      liveAuditState.htmlSizeKb = Math.max(1, Math.round(new Blob([res.text]).size / 1024));
      const parsed = parseHtmlAndAudit(res.text, formattedUrl);
      liveAuditState.seo = parsed.seo;
      liveAuditState.schema = parsed.schema;
    }
  })();

  // 4. Fetch robots.txt, sitemap.xml, llms.txt for Search Console & GEO AI audit
  const filesPromise = (async () => {
    const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
      fetchTextWithFallback(`${originUrl}/robots.txt`, 5500),
      fetchTextWithFallback(`${originUrl}/sitemap.xml`, 5500),
      fetchTextWithFallback(`${originUrl}/llms.txt`, 5500)
    ]);

    if (robotsRes.ok && robotsRes.text && !robotsRes.text.trim().startsWith("<!DOCTYPE")) {
      liveAuditState.files.robotsTxtFound = true;
      const txt = robotsRes.text.toLowerCase();
      const aiBots = ["gptbot", "chatgpt-user", "perplexitybot", "google-extended", "claudebot", "anthropic-ai"];
      const blocked = [];
      aiBots.forEach((bot) => {
        const idx = txt.indexOf(`user-agent: ${bot}`);
        if (idx !== -1) {
          const slice = txt.slice(idx, idx + 180);
          if (slice.includes("disallow: /")) {
            blocked.push(bot);
          }
        }
      });
      liveAuditState.files.aiBotsBlocked = blocked;
    } else {
      liveAuditState.files.robotsTxtFound = false;
    }

    liveAuditState.files.sitemapFound =
      sitemapRes.ok && (sitemapRes.text.includes("<urlset") || sitemapRes.text.includes("<sitemapindex"));
    liveAuditState.files.llmsTxtFound =
      llmsRes.ok && llmsRes.text.length > 10 && !llmsRes.text.trim().startsWith("<!DOCTYPE");
  })();

  await Promise.all([dnsPromise, pingPromise, htmlPromise, filesPromise]);

  liveAuditState.loading = false;
  renderLiveDashboard();
  renderSections(document.getElementById("tool-search")?.value || "");
  renderWorkflowChecklist();

  // 5. Also trigger asynchronous Google PageSpeed Insights v5 API request in background
  try {
    const psiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      formattedUrl
    )}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=mobile`;
    const psiRes = await fetch(psiEndpoint);
    if (psiRes.ok) {
      const psiData = await psiRes.json();
      const cats = psiData.lighthouseResult?.categories;
      const audits = psiData.lighthouseResult?.audits;
      if (cats && liveAuditState.url === formattedUrl) {
        liveAuditState.psi = {
          loaded: true,
          perf: Math.round((cats.performance?.score || 0) * 100),
          acc: Math.round((cats.accessibility?.score || 0) * 100),
          bp: Math.round((cats["best-practices"]?.score || 0) * 100),
          seo: Math.round((cats.seo?.score || 0) * 100),
          lcp: audits?.["largest-contentful-paint"]?.displayValue || null,
          fcp: audits?.["first-contentful-paint"]?.displayValue || null,
          cls: audits?.["cumulative-layout-shift"]?.displayValue || null,
          tbt: audits?.["total-blocking-time"]?.displayValue || null
        };
        renderLiveDashboard();
        renderSections(document.getElementById("tool-search")?.value || "");
      }
    }
  } catch {
    // Fallback heuristic metrics already displayed
  }
}

document.addEventListener("DOMContentLoaded", () => {
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

  // Single URL Box form
  const checkerForm = document.getElementById("url-checker-form");
  const urlInput = document.getElementById("target-url-input");

  checkerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runFullUrlAudit(urlInput.value);
  });

  // Paste & Analyze button
  const pasteBtn = document.getElementById("paste-analyze-btn");
  if (pasteBtn) {
    pasteBtn.addEventListener("click", async () => {
      try {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          urlInput.value = clipText.trim();
          runFullUrlAudit(clipText.trim());
        } else {
          urlInput.focus();
        }
      } catch {
        urlInput.focus();
      }
    });
  }

  // Preset chips
  document.querySelectorAll(".chip[data-url]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const target = chip.getAttribute("data-url");
      runFullUrlAudit(target);
    });
  });

  // Run initial full audit on the default URL
  runFullUrlAudit(currentTargetUrl);
});
