import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* walk(full);
    } else if (full.endsWith('.html')) {
      yield full;
    }
  }
}

const badDomains = ['static.wixstatic.com', 'parastorage.com'];
let hasBad = false;
for (const file of walk('site')) {
  const content = readFileSync(file, 'utf8');
  const patterns = [
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/gi,
    /<script[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+src=["']([^"']+)["']/gi
  ];
  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(content))) {
      const url = match[1];
      if (badDomains.some(d => url.includes(d))) {
        console.error(`${file}: ${url}`);
        hasBad = true;
      }
    }
  }
}
if (hasBad) {
  console.error('Found disallowed Wix URLs');
  process.exit(1);
}
