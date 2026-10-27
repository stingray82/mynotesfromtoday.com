import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

async function filesIn(path) {
  const entries = await readdir(path);
  const files = [];
  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(path, entry);
    if ((await stat(full)).isDirectory()) files.push(...await filesIn(full));
    else files.push(full);
  }
  return files;
}

const root = process.cwd();
const pages = (await filesIn(root)).filter((file) => file.endsWith('.html'));
const broken = [];
const archivePages = pages.filter((file) => file === join(root, 'notes', 'index.html') || /[\\/]notes[\\/]page[\\/]\d+[\\/]index\.html$/.test(file));
const archiveLinks = [];
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  if (!html.includes('<main id="main">') || !html.includes('<title>')) broken.push(`${page}: missing page structure`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(https?:|#|mailto:|data:)/.test(target)) continue;
    const clean = target.split(/[?#]/)[0];
    let file = resolve(dirname(page), clean);
    if (clean.endsWith('/')) file = join(file, 'index.html');
    try { await stat(file); } catch { broken.push(`${page}: ${target}`); }
  }
  if (archivePages.includes(page)) {
    const links = [...html.matchAll(/<h3><a href="([^"]+)"/g)].map((match) => resolve(dirname(page), match[1], 'index.html'));
    if (!links.length) broken.push(`${page}: empty archive page`);
    archiveLinks.push(...links);
  }
}
const posts = JSON.parse(await readFile(join(root, 'content', 'posts.json'), 'utf8'));
const expectedLinks = posts.map((post) => join(root, 'notes', post.slug, 'index.html')).sort();
if (JSON.stringify(archiveLinks.sort()) !== JSON.stringify(expectedLinks)) broken.push('Paginated archive is missing, duplicating, or adding notes');
const searchPage = await readFile(join(root, 'notes', 'search', 'index.html'), 'utf8');
const searchLinks = [...searchPage.matchAll(/<h3><a href="([^"]+)"/g)];
if (searchLinks.length !== posts.length) broken.push('Search page does not include every note');
if (broken.length) {
  console.error('Broken pages or local links:\n' + broken.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${pages.length} HTML pages and their local links.`);
}
