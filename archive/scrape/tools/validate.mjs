// Validate internal links in site/**/*.html
// Usage: node tools/validate.mjs

import fs from 'fs/promises';
import path from 'path';

const ROOT = path.resolve('site');

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) yield p;
  }
}

function extractHrefs(html) {
  const hrefs = [];
  const re = /href\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(html))) {
    hrefs.push(m[2] ?? m[3] ?? '');
  }
  return hrefs;
}

function isInternal(href) {
  if (!href) return false;
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
  if (/^https?:\/\//i.test(href)) return false;
  return href.startsWith('/');
}

function checkHref(href) {
  if (href === '/') return null; // ok
  const pathPart = href.split(/[?#]/)[0];
  if (!pathPart.endsWith('/')) return 'missing trailing /';
  if (!href.startsWith('/')) return 'missing leading /';
  return null;
}

async function main() {
  const issues = [];
  let pages = 0;
  for await (const file of walk(ROOT)) {
    pages++;
    const html = await fs.readFile(file, 'utf8');
    const hrefs = extractHrefs(html);
    for (const h of hrefs) {
      if (isInternal(h)) {
        const err = checkHref(h);
        if (err) issues.push({ file: path.relative(process.cwd(), file), href: h, issue: err });
      }
      // quick check: ensure no manual filenames remain
      if (/href\s*=\s*(?:"|')psy[^"']*\.html(?:"|')/i.test(html)) {
        issues.push({ file: path.relative(process.cwd(), file), href: 'psy*.html', issue: 'found manual filename in href' });
      }
    }
  }

  console.log(`Pages scanned: ${pages}`);
  if (issues.length === 0) {
    console.log('OK: no link issues found.');
  } else {
    console.log(`Issues: ${issues.length}`);
    const byFile = new Map();
    for (const i of issues) {
      const arr = byFile.get(i.file) || [];
      arr.push(i);
      byFile.set(i.file, arr);
    }
    for (const [file, arr] of byFile.entries()) {
      console.log(`- ${file}`);
      for (const i of arr) {
        console.log(`  * ${i.issue}: ${i.href}`);
      }
    }
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

