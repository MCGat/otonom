import './styles/tokens.css';
import './styles/base.css';
import './styles/cine.css';
import './styles/sections.css';
import { initScene } from './scene/Scene.js';
import { createTour } from './tour.js';
import { mountSections } from './sections/sections.js';
import { mountCinematic } from './cinematic.js';

const stage = document.getElementById('stage');
const loading = document.getElementById('loading');
const hotspotsEl = document.getElementById('hotspots');
const hero = document.getElementById('hero');

const params = new URLSearchParams(location.search);
const CAPTURE = params.has('capture');
const isMobile = innerWidth < 768 || (matchMedia('(pointer:coarse)').matches && innerWidth < 1024);

// ---------- CAPTURE: deterministic pre-render of the mobile cinematic ----------
if (CAPTURE) {
  document.body.classList.add('is-capture');
  const api = initScene({ stage, hotspotsEl, capture: true });
  loading?.remove();
  window.__cap = { setProgress: (p) => api.setProgress(p), ready: true };

// ---------- MOBILE: pre-rendered scroll cinematic (no live WebGL) ----------
} else if (isMobile) {
  mountCinematic(hero);
  mountSections(document.getElementById('sections'));

// ---------- DESKTOP: live interactive 3D ----------
} else {
  let api;
  try {
    api = initScene({ stage, hotspotsEl });
    loading?.remove();
  } catch (err) {
    console.error(err);
    if (loading) loading.textContent = '3D indisponible sur ce navigateur';
  }

  const btn = document.getElementById('cta-explode');
  const hint = document.getElementById('hero-hint');

  if (api) {
    createTour({ host: hero, scene: api });
    let on = false;
    btn.addEventListener('click', () => {
      on = api.toggleExplode();
      btn.textContent = on ? 'Recomposer le bâtiment' : 'Éclater le bâtiment';
      if (hint) hint.style.opacity = '0';
    });
  }

  mountSections(document.getElementById('sections'));
}
