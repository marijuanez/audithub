# AuditHub — Centro de Control y Estado de Webs (`audithub.web.app`)

Aplicación web interactiva para consultar, comprobar el estado en tiempo real y lanzar auditorías sobre sitios web, organizada por secciones:

1. **Imprescindibles** (PageSpeed Insights, Lighthouse, Google Search Console, Screaming Frog, Rich Results Test, Schema Markup Validator)
2. **Rendimiento y monitorización** (WebPageTest, GTmetrix, DebugBear, Calibre, SpeedCurve)
3. **SEO y contenido** (Ahrefs, Semrush, Sistrix, Google Search Console, Bing Webmaster Tools)
4. **GEO / visibilidad en IA** (Profound, Otterly.ai, Peec AI, Perplexity, ChatGPT, Google Gemini)
5. **Mi recomendación mínima** (Checklist interactivo del flujo de trabajo en 5 pasos + GEO)

## Despliegue en Firebase Hosting

```bash
npx -y firebase-tools@latest deploy --only hosting
```
