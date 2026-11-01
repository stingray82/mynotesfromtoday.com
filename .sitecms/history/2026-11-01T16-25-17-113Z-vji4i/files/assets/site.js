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
