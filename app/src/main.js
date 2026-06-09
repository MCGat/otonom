import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import { initScene } from './scene/Scene.js';
import { createTour } from './tour.js';
import { mountSections } from './sections/sections.js';

const stage = document.getElementById('stage');
const loading = document.getElementById('loading');
const hotspotsEl = document.getElementById('hotspots');
const hero = document.getElementById('hero');

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
  const tour = createTour({ host: hero, scene: api });

  if (api.isMobile) {
    // On mobile, the primary CTA launches the guided poste-by-poste tour.
    btn.textContent = 'Explorer poste par poste';
    btn.addEventListener('click', () => {
      tour.goTo(0);
      if (hint) hint.style.opacity = '0';
    });
  } else {
    let on = false;
    btn.addEventListener('click', () => {
      on = api.toggleExplode();
      btn.textContent = on ? 'Recomposer le bâtiment' : 'Éclater le bâtiment';
      if (hint) hint.style.opacity = '0';
    });
  }
}

mountSections(document.getElementById('sections'));
