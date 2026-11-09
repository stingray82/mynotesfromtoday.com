import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';

const siteUrl = 'https://mynotesfromtoday.com';
const siteName = 'My Notes from Today';
const PAGE_SIZE = 2;
const posts = JSON.parse(await readFile('content/posts.json', 'utf8')).sort((a, b) => b.date.localeCompare(a.date));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const formatDate = (date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
const urlFor = (post) => `/notes/${post.slug}/`;
const linkFor = (post, root) => `${root}notes/${post.slug}/`;

function layout({ title, description, path, root, current, content, scripts = '', noindex = false }) {
  const fullTitle = title === siteName ? siteName : `${title} | ${siteName}`;
  const nav = [
    ['Notes', `${root}notes/`, 'notes'],
    ['About', `${root}about/`, 'about'],
    ['Contact', `${root}contact/`, 'contact']
  ];
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f8f6f0">
  <meta name="description" content="${escapeHtml(description)}">
  ${noindex ? '<meta name="robots" content="noindex,follow">' : ''}
  <meta property="og:type" content="${current === 'article' ? 'article' : 'website'}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${siteUrl}${path}">
  <meta property="og:image" content="${siteUrl}/assets/social-card.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${siteUrl}${path}">
  <link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" href="${root}feed.xml" type="application/rss+xml" title="${siteName} RSS feed">
  <link rel="stylesheet" href="${root}assets/site.css">
  <title>${escapeHtml(fullTitle)}</title>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="container header-inner">
    <a class="brand" href="${root}" aria-label="${siteName}, home"><span class="brand-main">my notes<span class="brand-dot">.</span></span><span class="brand-sub">FROM TODAY</span></a>
    <nav class="site-nav" aria-label="Main navigation">${nav.map(([label, href, key]) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}${current === 'article' && key === 'notes' ? ' class="nav-parent"' : key === 'contact' ? ' class="nav-contact"' : ''}>${label}</a>`).join('')}</nav>
  </div></header>
  <main id="main">${content}</main>
  <footer class="site-footer"><div class="container">
    <div class="footer-top"><div><a class="brand brand-footer" href="${root}" aria-label="${siteName}, home"><span class="brand-main">my notes<span class="brand-dot">.</span></span><span class="brand-sub">FROM TODAY</span></a><p>Curiosity, experiments and considered opinions. Written one note at a time.</p></div>
      <nav class="footer-links" aria-label="Footer navigation"><a href="${root}notes/">All notes</a><a href="${root}about/">About</a><a href="${root}contact/">Contact</a><a href="${root}feed.xml">RSS</a><a href="https://techarticles.co.uk/" rel="noopener noreferrer">TechArticles ↗</a></nav>
    </div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} ${siteName}</span><span>Made for reading, wherever you are.</span></div>
  </div></footer>
  ${scripts}
</body>
</html>`;
}

function meta(post) {
  return `<div class="meta"><span class="topic">${escapeHtml(post.topic)}</span><time datetime="${post.date}">${formatDate(post.date)}</time><span>${post.readMinutes} min read</span></div>`;
}

function row(post, root, index, data = false) {
  return `<article class="note-row"${data ? ` data-post-card data-topic="${escapeHtml(post.topic)}"` : ''}><span class="row-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><div class="row-content">${meta(post)}<h3><a href="${linkFor(post, root)}">${escapeHtml(post.title)}</a></h3><p>${escapeHtml(post.excerpt)}</p></div><a class="row-arrow" href="${linkFor(post, root)}" aria-label="Read ${escapeHtml(post.title)}"><span aria-hidden="true">↗</span></a></article>`;
}

function renderBody(blocks) {
  return blocks.map(({ type, text }) => {
    const tag = type === 'h2' ? 'h2' : type === 'blockquote' ? 'blockquote' : 'p';
    return `<${tag}>${escapeHtml(text)}</${tag}>`;
  }).join('\n');
}

async function output(path, content) {
  await mkdir(join(process.cwd(), path.substring(0, path.lastIndexOf('/')) || '.'), { recursive: true });
  await writeFile(path, content, 'utf8');
}

const recent = posts.slice(0, 8);
await output('index.html', layout({
  title: siteName, description: 'A personal notebook for tinkering, things worth trying, and opinions still taking shape.', path: '/', root: './', current: 'home',
  content: `<section class="hero"><div class="container hero-grid"><div><p class="eyebrow"><span class="eyebrow-mark" aria-hidden="true"></span> A personal notebook</p><h1>Notes from <em>today.</em></h1></div><div class="hero-aside"><p class="lead">What I’m making, testing, reading and thinking about. A place for ideas in motion and opinions with room to change.</p><a class="text-link" href="./about/">More about this space <span aria-hidden="true">↗</span></a></div></div></section>
    <section class="section listing-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">The latest</p><h2>Recent notes<span class="heading-period">.</span></h2></div><a class="text-link" href="./notes/">View the full archive <span aria-hidden="true">↗</span></a></div><div class="note-list">${recent.map((post, index) => row(post, './', index)).join('')}</div><div class="list-end"><span>More to come, one note at a time.</span><a href="./notes/">Browse all notes <span aria-hidden="true">↗</span></a></div></div></section>
    <section class="about-strip"><div class="container about-strip-inner"><p class="eyebrow">A little context</p><p>Detailed technical guides live over at <a href="https://techarticles.co.uk/" rel="noopener noreferrer">TechArticles ↗</a>. Here, the smaller observations get space to breathe.</p><a class="round-arrow" href="./about/" aria-label="Read more about this site"><span aria-hidden="true">↗</span></a></div></section>`
}));

const topics = ['all', ...new Set(posts.map((post) => post.topic))];
const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
const archiveUrl = (page) => page === 1 ? '/notes/' : `/notes/page/${page}/`;
const archiveFile = (page) => page === 1 ? 'notes/index.html' : `notes/page/${page}/index.html`;
const archiveRoot = (page) => page === 1 ? '../' : '../../../';
function pagination(currentPage, root) {
  if (pageCount < 2) return '';
  const pageLink = (page) => `${root}${archiveUrl(page).slice(1)}`;
  return `<nav class="pagination" aria-label="Notes pages"><div class="pagination-direction">${currentPage > 1 ? `<a href="${pageLink(currentPage - 1)}" rel="prev">← Newer notes</a>` : '<span aria-hidden="true"></span>'}</div><div class="pagination-numbers">${Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => page === currentPage ? `<span class="pagination-current" aria-current="page" aria-label="Page ${page}">${page}</span>` : `<a href="${pageLink(page)}" aria-label="Page ${page}">${page}</a>`).join('')}</div><div class="pagination-direction pagination-next">${currentPage < pageCount ? `<a href="${pageLink(currentPage + 1)}" rel="next">Older notes →</a>` : '<span aria-hidden="true"></span>'}</div></nav>`;
}

const generatedPages = resolve('notes/page');
const expectedPages = resolve(process.cwd(), 'notes', 'page');
if (generatedPages !== expectedPages || !generatedPages.startsWith(resolve(process.cwd()) + sep)) throw new Error('Unsafe pagination output path');
await rm(generatedPages, { recursive: true, force: true });
for (let page = 1; page <= pageCount; page++) {
  const root = archiveRoot(page);
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);
  await output(archiveFile(page), layout({
    title: page === 1 ? 'All notes' : `All notes, page ${page}`,
    description: 'Browse the notes on tinkering, experiments and considered opinions.',
    path: archiveUrl(page), root, current: 'notes',
    content: `<section class="page-intro"><div class="container"><p class="eyebrow">The archive</p><h1>All notes<span class="heading-period">.</span></h1><p class="lead">A running collection of small experiments, useful discoveries and thoughts worth keeping.</p></div></section><section class="section archive-section"><div class="container"><div class="archive-tools"><p>Showing ${posts.length ? start + 1 : 0}–${Math.min(start + PAGE_SIZE, posts.length)} of ${posts.length} notes</p><a class="text-link" href="${root}notes/search/">Search every note <span aria-hidden="true">↗</span></a></div><div class="note-list">${pagePosts.map((post, index) => row(post, root, start + index)).join('')}</div>${pagination(page, root)}</div></section>`
  }));
}

await output('notes/search/index.html', layout({
  title: 'Search notes', description: 'Search and filter every note in the archive.', path: '/notes/search/', root: '../../', current: 'notes', noindex: true, scripts: '<script src="../../assets/site.js" defer></script>',
  content: `<section class="page-intro"><div class="container"><p class="eyebrow">The archive</p><h1>Find a note<span class="heading-period">.</span></h1><p class="lead">Search across the entire notebook or narrow it down by topic.</p></div></section><section class="section archive-section"><div class="container"><div class="archive-tools"><p>${posts.length} notes in the archive</p><a class="text-link" href="../">Back to paginated notes <span aria-hidden="true">↗</span></a></div><div data-filter-controls hidden><div class="filter-bar" role="group" aria-label="Filter notes by topic">${topics.map((topic) => `<button type="button" class="filter-button" data-topic-filter="${escapeHtml(topic)}" aria-pressed="${topic === 'all'}">${topic === 'all' ? 'All topics' : escapeHtml(topic)}</button>`).join('')}</div><div class="search-wrap"><label for="note-search">Search notes</label><input id="note-search" data-search type="search" placeholder="Search by title or subject" autocomplete="off"><p class="result-count" data-result-count aria-live="polite"></p></div></div><div class="note-list">${posts.map((post, index) => row(post, '../../', index, true)).join('')}</div><p class="empty-results" data-empty-results hidden>No notes match that search. Try another word or topic.</p></div></section>`
}));

for (const post of posts) {
  await output(`notes/${post.slug}/index.html`, layout({
    title: post.title, description: post.excerpt, path: urlFor(post), root: '../../', current: 'article',
    content: `<div class="container"><header class="article-header"><p class="eyebrow">From the notebook</p><h1>${escapeHtml(post.title)}</h1><p class="lead">${escapeHtml(post.excerpt)}</p>${meta(post)}</header><div class="article-layout"><article class="prose">${renderBody(post.body)}<a class="back-link" href="../">← Back to all notes</a></article><aside class="article-aside" aria-label="About this note"><p><strong>${escapeHtml(post.topic)}</strong><br>${formatDate(post.date)}<br>${post.readMinutes} minute read</p><p>Have a thought about this note? <a href="../../contact/">Get in touch</a>.</p></aside></div></div>`
  }));
}

await output('about/index.html', layout({
  title: 'About', description: 'The idea behind My Notes from Today and what you can expect to read here.', path: '/about/', root: '../', current: 'about',
  content: `<section class="page-intro"><div class="container"><p class="eyebrow">A little introduction</p><h1>About this notebook</h1><p class="lead">A place for the thoughts that happen between the big projects.</p></div></section><section class="section" style="padding-top:0"><div class="container"><div class="prose"><p>My Notes from Today is a personal blog about what I am exploring, trying and thinking about. Some entries will be quick observations; others will take the time to work through an idea.</p><p>The common thread is curiosity. I want to share what I learn while an idea is still alive, including the questions and changes of mind along the way.</p><h2>Here and elsewhere</h2><p>My more detailed technical writing lives at <a href="https://techarticles.co.uk/" rel="noopener noreferrer">TechArticles</a>. This notebook gives me room to write more freely about tools, projects and the things that catch my attention.</p><p>If a note starts a conversation, I would love to hear from you. <a href="../contact/">Send a message</a>.</p></div></div></section>`
}));

await output('contact/index.html', layout({
  title: 'Contact', description: 'Send a message to My Notes from Today.', path: '/contact/', root: '../', current: 'contact',
  content: `<section class="page-intro"><div class="container"><p class="eyebrow">Say hello</p><h1>Get in touch</h1><p class="lead">A question, a recommendation, or a thought sparked by a note? I would like to hear it.</p></div></section><div class="container"><div class="contact-panel"><p>Use the form below to send a message.</p><div data-craftforms-embed="aHR0cHM6Ly9hdXRvbWF0aW9uLnRoYW5ldGRpZ2l0YWwuZGV2.mCnx1DGxvAc" data-lang="en-GB"></div><noscript><p>This contact form needs JavaScript. Please enable it to send a message.</p></noscript></div></div>`,
  scripts: '<script src="https://automation.thanetdigital.dev/wp-content/plugins/craftforms-premium/build/webcomponents/embed.js" defer></script>'
}));

await output('404.html', layout({
  title: 'Page not found', description: 'That page could not be found.', path: '/404.html', root: './', current: 'none',
  content: '<section class="page-intro"><div class="container"><p class="eyebrow">A missing page</p><h1>That note is not here.</h1><p class="lead">The link might have changed, or the page might have moved.</p><div class="hero-actions"><a class="button button-primary" href="./">Go home</a><a class="button button-secondary" href="./notes/">Browse notes</a></div></div></section>'
}));

const xml = (value) => escapeHtml(value);
const lastBuild = posts[0]?.date || new Date().toISOString().slice(0, 10);
await output('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${siteName}</title><link>${siteUrl}/</link><description>Curiosity, experiments and considered opinions.</description><language>en-gb</language>${posts.map((post) => `<item><title>${xml(post.title)}</title><link>${siteUrl}${urlFor(post)}</link><guid>${siteUrl}${urlFor(post)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${xml(post.excerpt)}</description></item>`).join('')}</channel></rss>`);
await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...Array.from({ length: pageCount }, (_, index) => archiveUrl(index + 1)), '/about/', '/contact/', ...posts.map(urlFor)].map((path) => `<url><loc>${siteUrl}${path}</loc><lastmod>${lastBuild}</lastmod></url>`).join('')}</urlset>`);
await output('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`Built ${posts.length} notes and site pages.`);
