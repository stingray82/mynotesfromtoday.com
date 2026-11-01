const search = document.querySelector('[data-search]');
const cards = [...document.querySelectorAll('[data-post-card]')];
const filters = [...document.querySelectorAll('[data-topic-filter]')];
const count = document.querySelector('[data-result-count]');
const empty = document.querySelector('[data-empty-results]');

if (search && cards.length) {
  const controls = document.querySelector('[data-filter-controls]');
  if (controls) controls.hidden = false;
  let activeTopic = 'all';
  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      const matchesTopic = activeTopic === 'all' || card.dataset.topic === activeTopic;
      const matchesText = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !(matchesTopic && matchesText);
      if (!card.hidden) visible++;
    }
    if (count) count.textContent = `${visible} ${visible === 1 ? 'note' : 'notes'} found`;
    if (empty) empty.hidden = visible !== 0;
  }
  search.addEventListener('input', update);
  for (const filter of filters) {
    filter.addEventListener('click', () => {
      activeTopic = filter.dataset.topicFilter;
      for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
      update();
    });
  }
  update();
}

const latestNotes = document.querySelector('[data-latest-notes]');
if (latestNotes) {
  fetch('/blog/feed.xml', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error('Could not load the latest notes.');
      return response.text();
    })
    .then((source) => {
      const feed = new DOMParser().parseFromString(source, 'application/xml');
      if (feed.querySelector('parsererror')) return;
      const items = [...feed.querySelectorAll('item')].slice(0, 3);
      const rows = items.map((item) => {
        const title = item.querySelector('title')?.textContent?.trim();
        const href = item.querySelector('link')?.textContent?.trim();
        const excerpt = item.querySelector('description')?.textContent?.trim() || '';
        if (!title || !href) return null;
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return null;

        const article = document.createElement('article');
        article.className = 'note-row';
        const number = document.createElement('span');
        number.className = 'row-number';
        number.setAttribute('aria-hidden', 'true');

        const content = document.createElement('div');
        content.className = 'row-content';
        const meta = document.createElement('div');
        meta.className = 'meta';
        const date = new Date(item.querySelector('pubDate')?.textContent || '');
        if (!Number.isNaN(date.getTime())) {
          const time = document.createElement('time');
          time.dateTime = date.toISOString().slice(0, 10);
          time.textContent = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
          meta.append(time);
        }

        const heading = document.createElement('h3');
        const titleLink = document.createElement('a');
        titleLink.href = url.href;
        titleLink.textContent = title;
        heading.append(titleLink);
        const summary = document.createElement('p');
        summary.textContent = excerpt;
        content.append(meta, heading, summary);

        const arrow = document.createElement('a');
        arrow.className = 'row-arrow';
        arrow.href = url.href;
        arrow.setAttribute('aria-label', `Read ${title}`);
        const symbol = document.createElement('span');
        symbol.setAttribute('aria-hidden', 'true');
        symbol.textContent = '↗';
        arrow.append(symbol);
        article.append(number, content, arrow);
        return article;
      }).filter(Boolean);
      if (rows.length) latestNotes.replaceChildren(...rows);
    })
    .catch(() => {});
}
