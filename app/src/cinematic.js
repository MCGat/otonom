// ============================================================
// OTONOM — Cinématique mobile pré-rendue, pilotée au scroll.
// Remplace le 3D interactif sur mobile : une séquence d'images
// (rendue au build) défile dans un canvas épinglé, avec des
// chapitres de texte synchronisés. Zéro WebGL → fluide + sobre.
// ============================================================
import { ZONES, cardHTML } from './scene/data.js';

const FRAME_COUNT = 36;
const BASE = import.meta.env.BASE_URL;
const frameURL = (i) => `${BASE}cinematic/frame-${String(i).padStart(2, '0')}.webp`;

export function mountCinematic(hero) {
  hero.classList.add('hero--cine');
  hero.innerHTML = `
    <nav class="nav cine__nav">
      <a class="nav__logo" href="#hero">OTONOM</a>
      <a href="#contact" class="nav__cta">Parler à un expert</a>
    </nav>

    <div class="cine">
      <div class="cine__sticky">
        <canvas class="cine__canvas"></canvas>
        <div class="cine__veil"></div>

        <div class="cine__stage">
          <article class="cine__chapter" data-from="0" data-to="0.30">
            <p class="eyebrow">Énergie pilotée · sites &amp; flottes</p>
            <h1 class="display cine__title">Votre site devient<br/>une <em>centrale qui pense</em>.</h1>
            <p class="cine__sub">Production solaire, stockage, recharge de flotte et pilotage EMS — orchestrés en un seul système.</p>
          </article>

          <article class="cine__chapter" data-from="0.36" data-to="0.66">
            <p class="eyebrow">Un seul système</p>
            <h2 class="display cine__title">Trois niveaux,<br/>un seul <em>cerveau énergétique</em>.</h2>
            <p class="cine__sub">L'EMS arbitre en temps réel production, stockage et recharge, étage par étage.</p>
          </article>

          <article class="cine__chapter cine__chapter--end" data-from="0.74" data-to="1.01">
            <h2 class="display cine__title">Prêt à orchestrer<br/>votre <em>site</em> ?</h2>
            <div class="cine__actions">
              <a class="btn btn--primary" href="#contact">Parler à un expert</a>
              <a class="btn btn--ghost" href="#orchestration">Voir l'orchestration</a>
            </div>
          </article>
        </div>

        <div class="cine__progress"><i></i></div>
        <div class="cine__hint">Faites défiler pour explorer ↓</div>
      </div>
      <div class="cine__track" aria-hidden="true"></div>
    </div>

    <section class="cine__postes">
      <p class="eyebrow">Les 6 postes orchestrés</p>
      <div class="cine__cards">${ZONES.map(cardHTML).join('')}</div>
    </section>`;

  const cine = hero.querySelector('.cine');
  const canvas = hero.querySelector('.cine__canvas');
  const ctx = canvas.getContext('2d');
  const chapters = [...hero.querySelectorAll('.cine__chapter')];
  const progressBar = hero.querySelector('.cine__progress > i');
  const hint = hero.querySelector('.cine__hint');

  // --- preload frames ---
  const imgs = new Array(FRAME_COUNT);
  const ready = (im) => im && im.complete && im.naturalWidth > 0;
  let currentIdx = 0;
  for (let i = 0; i < FRAME_COUNT; i++) {
    const im = new Image();
    im.decoding = 'async';
    im.src = frameURL(i);
    // when a frame arrives, (re)draw if it's the one we currently need
    im.onload = () => { if (i === currentIdx || lastIdx < 0) renderIdx(currentIdx); };
    imgs[i] = im;
  }

  // --- canvas sizing (DPR-aware) ---
  let cw = 0, ch = 0, dpr = 1;
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawCover(img) {
    if (!img || !img.complete || !img.naturalWidth) return;
    const ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    let w, h;
    if (ir > cr) { h = ch; w = ch * ir; } else { w = cw; h = cw / ir; }
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  let lastIdx = -1;
  function renderIdx(idx) {
    idx = Math.max(0, Math.min(FRAME_COUNT - 1, idx));
    if (idx === lastIdx) return;
    // fall back to the nearest already-decoded frame to avoid blanks
    let img = ready(imgs[idx]) ? imgs[idx] : null;
    if (!img) {
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (ready(imgs[idx - d])) { img = imgs[idx - d]; break; }
        if (ready(imgs[idx + d])) { img = imgs[idx + d]; break; }
      }
    }
    if (!img) return;                 // nothing decoded yet → keep waiting
    if (!cw || !ch) sizeCanvas();
    drawCover(img);
    lastIdx = idx;                    // only cache after a real draw
  }
  function draw(p) {
    currentIdx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1))));
    renderIdx(currentIdx);
  }

  // smooth 0→1→0 fade for a chapter given scroll progress
  function chapterOpacity(p, from, to) {
    const fade = 0.06;
    if (p < from - fade || p > to + fade) return 0;
    if (p < from) return (p - (from - fade)) / fade;
    if (p > to) return 1 - (p - to) / fade;
    return 1;
  }

  function progress() {
    const r = cine.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = progress();
      draw(p);
      for (const ch of chapters) {
        const o = chapterOpacity(p, parseFloat(ch.dataset.from), parseFloat(ch.dataset.to));
        ch.style.opacity = o.toFixed(3);
        ch.style.transform = `translateY(${(1 - o) * 14}px)`;
        ch.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      }
      if (progressBar) progressBar.style.transform = `scaleX(${p})`;
      if (hint) hint.style.opacity = p > 0.04 ? '0' : '1';
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { sizeCanvas(); lastIdx = -1; onScroll(); });
  sizeCanvas();
  onScroll();
}
