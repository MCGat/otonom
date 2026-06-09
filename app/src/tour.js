// ============================================================
// OTONOM — Tour guidé : navigue poste par poste avec un vol de
// caméra. Barre de contrôle (desktop + mobile) + bottom-sheet
// riche sur mobile. C'est l'interaction "wow" mobile.
// ============================================================
import { ZONES, cardHTML } from './scene/data.js';

export function createTour({ host, scene }) {
  const { anchors, hotspots, flyToAnchor, setExploded, isMobile } = scene;
  let idx = -1;
  let active = false;

  // --- control bar ---
  const bar = document.createElement('div');
  bar.className = 'tour';
  bar.innerHTML = `
    <button class="tour__nav" data-dir="-1" aria-label="Précédent">‹</button>
    <div class="tour__mid">
      <span class="tour__idx">— / ${ZONES.length}</span>
      <span class="tour__title">Visite guidée du site</span>
    </div>
    <button class="tour__nav" data-dir="1" aria-label="Suivant">›</button>`;
  host.appendChild(bar);

  // --- mobile bottom-sheet ---
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.innerHTML = `<button class="sheet__close" aria-label="Fermer">×</button><div class="sheet__inner"></div>`;
  host.appendChild(sheet);
  const sheetInner = sheet.querySelector('.sheet__inner');

  function render() {
    const z = ZONES[idx];
    bar.querySelector('.tour__idx').textContent = `${String(idx + 1).padStart(2, '0')} / ${ZONES.length}`;
    bar.querySelector('.tour__title').textContent = z.title;
    if (isMobile) {
      sheetInner.innerHTML = cardHTML(z);
      sheet.classList.add('is-open');
    }
  }

  function goTo(i) {
    active = true;
    idx = (i + ZONES.length) % ZONES.length;
    const z = ZONES[idx];
    setExploded(true);
    flyToAnchor(anchors[z.anchor], isMobile ? 22 : 26);
    hotspots.setActive(z.id);
    bar.classList.add('is-active');
    render();
  }

  function close() {
    sheet.classList.remove('is-open');
    hotspots.clearActive();
    bar.classList.remove('is-active');
    active = false;
    idx = -1;
    bar.querySelector('.tour__idx').textContent = `— / ${ZONES.length}`;
    bar.querySelector('.tour__title').textContent = 'Visite guidée du site';
  }

  bar.querySelectorAll('.tour__nav').forEach((b) => {
    b.addEventListener('click', () => {
      const dir = Number(b.dataset.dir);
      goTo(active ? idx + dir : 0);
    });
  });
  sheet.querySelector('.sheet__close').addEventListener('click', close);

  // tapping a pin syncs the tour to that zone
  hotspots.setOnSelect((z, i) => goTo(i));

  return { goTo, close, get index() { return idx; } };
}
