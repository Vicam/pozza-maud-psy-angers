import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import glob from "glob";
import { chromium } from "playwright";

const baseUrl = process.argv[2];
if (!baseUrl) { console.error("Usage: node scripts/scrape.mjs https://www.votre-domaine.com"); process.exit(1); }

const OUT_DIR = path.resolve("out");

function urlToFilePath(urlStr) {
  const u = new URL(urlStr);
  let p = u.pathname;
  if (!p || p === "/") p = "/index";
  if (p.endsWith("/")) p = p + "index";
  p = p.replace(/\/+/g, "/").replace(/[^a-zA-Z0-9/_-]/g, "-");
  return path.join(OUT_DIR, p) + ".html";
}

async function getUrlsFromSitemap() {
  try {
    const { data } = await axios.get(new URL("/sitemap.xml", baseUrl).toString(), { timeout: 15000 });
    const parser = new XMLParser({ ignoreAttributes: false });
    const xml = parser.parse(data);
    const nodes = xml.urlset?.url || [];
    const urls = (Array.isArray(nodes) ? nodes : [nodes]).map(u => u.loc).filter(Boolean);
    if (!urls.includes(baseUrl)) urls.unshift(baseUrl);
    return urls;
  } catch {
    console.warn("Pas de sitemap.xml — on capture la home.");
    return [baseUrl];
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let total = 0;
      const dist = 600;
      const timer = setInterval(() => {
        const sh = document.body.scrollHeight;
        window.scrollBy(0, dist);
        total += dist;
        if (total >= sh - window.innerHeight) { clearInterval(timer); resolve(); }
      }, 200);
    });
  });
}

(async () => {
  const urls = await getUrlsFromSitemap();
  console.log(`Captures: ${urls.length} pages`);
  const browser = await chromium.launch({ headless: true }); // Playwright gère les deps dans l'image Docker
  try {
    for (const url of urls) {
      console.log("→", url);
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle" });
      await autoScroll(page);
      await page.evaluate((base) => {
        // liens internes en relatifs (simple)
        for (const a of document.querySelectorAll("a[href]")) {
          try {
            const u = new URL(a.getAttribute("href"), base);
            if (u.origin === location.origin) a.setAttribute("href", u.pathname + u.search + u.hash);
          } catch {}
        }
      }, baseUrl);
      const html = await page.content();
      const filePath = urlToFilePath(url);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, html, "utf8");
      await page.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`✅ HTML rendu sauvegardé dans: ${OUT_DIR}`);
})();
