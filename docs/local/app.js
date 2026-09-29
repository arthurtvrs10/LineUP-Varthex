const menu = document.querySelector('.menu');
const sidebar = document.querySelector('.sidebar');
menu.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.sidebar nav a').forEach(link => link.addEventListener('click', () => {
  if (matchMedia('(max-width:760px)').matches) {
    sidebar.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
    document.querySelector(link.hash)?.focus({ preventScroll: true });
  }
}));
const search = document.querySelector('#search');
search.addEventListener('input', () => {
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normalize(search.value.trim());
  let count = 0;
  document.querySelectorAll('.sidebar nav a').forEach(link => {
    const section = document.querySelector(link.hash);
    const match = normalize(section?.textContent || link.textContent).includes(query);
    link.hidden = !match; if (match) count++;
  });
  document.querySelector('#search-status').textContent = query ? `${count} seções encontradas` : '';
});
document.querySelectorAll('.copy').forEach(button => button.addEventListener('click', async () => {
  const code = button.parentElement.querySelector('code');
  try {
    await navigator.clipboard.writeText(code.textContent);
    button.textContent = 'Copiado';
  } catch {
    const range = document.createRange(); range.selectNodeContents(code);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    button.textContent = 'Selecionado: Ctrl+C';
  }
  setTimeout(() => { button.textContent = 'Copiar'; }, 2200);
}));
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    document.querySelectorAll('.sidebar nav a').forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-10% 0px -65% 0px' });
document.querySelectorAll('main section').forEach(section => observer.observe(section));
