// Convert out_manual/*.html into site/ tree with normalized internal links
// Usage: node tools/convert-manual-html.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve source directory relative to this script location so it works from archive/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '..', 'out_manual');
const DEST_DIR = path.resolve('site');
const ORIGIN = 'https://www.pozza-maud-psy-angers.com';

function mapFilenameToRoute(filename) {
  // input examples: psy.html, psy__consultations.html, psy__foo__bar.html
  let base = filename.replace(/\.html$/i, '');
  if (base.startsWith('psy')) {
    base = base.slice(3); // remove 'psy'
    if (base.startsWith('__')) base = base.slice(2);
  }
  if (base.startsWith('__')) base = base.replace(/^__+/, '');
  let route = base.replace(/__+/g, '/');
  // normalize
  if (!route || route === '') return '/';
  if (!route.startsWith('/')) route = '/' + route;
  if (!route.endsWith('/')) route = route + '/';
  return route;
}

function routeToDestPath(route) {
  if (route === '/') return path.join(DEST_DIR, 'index.html');
  const rel = route.replace(/^\//, '').replace(/\/$/, '');
  return path.join(DEST_DIR, rel, 'index.html');
}

function toInternalRouteFromHref(href) {
  // Do not touch special schemes or anchors
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return null; // means leave as is
  }

  try {
    // 1) Manual file references like psy*.html
    if (/^psy(?:__[^\s"'>]+)?\.html$/i.test(href)) {
      const route = mapFilenameToRoute(href);
      return route;
    }

    // 2) Absolute links to origin
    if (/^https?:\/\//i.test(href)) {
      const u = new URL(href);
      const originNorm = new URL(ORIGIN).origin;
      if (u.origin === originNorm) {
        // Convert to internal path
        let p = u.pathname || '/';
        // Ensure trailing slash (except '/')
        if (p !== '/' && !p.endsWith('/')) p = p + '/';
        // Re-attach search/hash if any
        return p + (u.search || '') + (u.hash || '');
      }
      return null; // external, leave as is
    }

    // 3) Root-relative internal paths
    if (href.startsWith('/')) {
      // keep query/hash but add trailing slash before them
      const m = href.match(/^[^?##]*/);
      const pathPart = m ? m[0] : href;
      const suffix = href.slice(pathPart.length);
      if (pathPart === '/') return '/';
      const withSlash = pathPart.endsWith('/') ? pathPart : pathPart + '/';
      return withSlash + suffix;
    }
  } catch {
    // fallthrough: keep as is
  }
  return null; // keep as is
}

function rewriteAnchors(html) {
  return html.replace(/href\s*=\s*("([^"]*)"|'([^']*)')/gi, (m, _q, d1, d2) => {
    const val = d1 ?? d2 ?? '';
    const newVal = toInternalRouteFromHref(val);
    if (newVal === null) return m; // unchanged
    const quote = m.trim().startsWith("href=") && m.includes('\"') ? '"' : (m.includes("'") ? "'" : '"');
    return `href=${quote}${newVal}${quote}`;
  });
}

async function main() {
  // Ensure dest dir exists and is clean (do not delete, just create)
  await fs.mkdir(DEST_DIR, { recursive: true });
  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true });
  const htmlFiles = entries.filter(e => e.isFile() && e.name.toLowerCase().endsWith('.html')).map(e => e.name);
  if (htmlFiles.length === 0) {
    console.warn(`No HTML files found in ${SRC_DIR}`);
  }

  const generated = [];
  for (const name of htmlFiles) {
    const route = mapFilenameToRoute(name);
    const dest = routeToDestPath(route);
    const srcPath = path.join(SRC_DIR, name);
    const html = await fs.readFile(srcPath, 'utf8');
    const rewritten = rewriteAnchors(html);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, rewritten, 'utf8');
    generated.push({ src: name, route, dest: path.relative(process.cwd(), dest) });
  }

  // Simple log
  console.log(`Generated ${generated.length} page(s):`);
  for (const g of generated) {
    console.log(`- ${g.src} -> ${g.route} -> ${g.dest}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

