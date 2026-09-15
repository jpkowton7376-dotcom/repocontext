# Guía de envío de sitemap (una página)

**Objetivo:** que Google / Bing descubran e indexen `https://www.repocontext.dev` rápido.
El sitemap ya existe en **`/sitemap.xml`** (Next.js `app/sitemap.ts`; incluye todas las páginas + las 6 entradas del blog). Envíalo a cada motor una vez y listo.

## Antes de empezar
- [ ] El sitio está en línea en `https://www.repocontext.dev` (no localhost).
- [ ] `https://www.repocontext.dev/sitemap.xml` devuelve XML válido (ábrelo en el navegador).
- [ ] `robots.txt` permite el rastreo (ya debería referenciar el sitemap).

## 1. Google Search Console (lo más importante)
- [ ] Ve a https://search.google.com/search-console/
- [ ] **Añadir propiedad** → elige **Dominio** → introduce `repocontext.dev` (cubre www + subdominios).
- [ ] Verifica la propiedad: copia el **registro TXT** que da GSC → Cloudflare → DNS → añade TXT. Espera unos minutos y haz clic en Verificar.
- [ ] Menú izquierdo → **Sitemaps** → introduce `sitemap.xml` → **Enviar**.
- [ ] Tras unos días: revisa **Indexación → Páginas** para ver cuántas URLs están indexadas.
- [ ] Opcional: usa **Inspección de URL** para solicitar indexación de las 6 entradas del blog una por una (rastreo más rápido).

## 2. Bing Webmaster Tools (alimenta Bing + los rastreadores de ChatGPT/IA)
- [ ] Ve a https://www.bing.com/webmasters/
- [ ] Añade el sitio `https://www.repocontext.dev` y verifícalo igual (TXT o importando desde GSC).
- [ ] **Sitemaps** → envía `https://www.repocontext.dev/sitemap.xml`.

## 3. Alcance extra opcional
- [ ] **Yandex** (ru) — https://webmaster.yandex.com/ (enviar sitemap).
- [ ] **Naver** (kr) — https://searchadvisor.naver.com/ (si apuntas a Corea).
- [ ] **Cloudflare Indexing** (si usas el plan Free) — no requerido.

## 4. Después del envío
- [ ] Reenvía el sitemap cada vez que **añadas una entrada al blog** (el archivo se actualiza solo; solo pulsa "Enviar" de nuevo en GSC/Bing).
- [ ] Monitoriza **Search Console → Rendimiento** cada semana: impresiones/clics de "AGENTS.md generator", "CLAUDE.md private repo", etc.
- [ ] Si una página muestra "Descubierto pero no indexado" durante >2 semanas, mejora los enlaces internos desde la portada o el índice del blog.

## Verificar que funcionó
```
# ¿El sitemap es accesible?
curl -s https://www.repocontext.dev/sitemap.xml | head

# ¿Cuántas URLs contiene?
curl -s https://www.repocontext.dev/sitemap.xml | grep -c "<loc>"
```
Espera un recuento igual a: portada + todas las rutas (precios, docs, blog, etc.) + 6 entradas del blog.
