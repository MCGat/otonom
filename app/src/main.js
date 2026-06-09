import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import { initScene } from './scene/Scene.js';
import { mountSections } from './sections/sections.js';

const stage = document.getElementById('stage');
const loading = document.getElementById('loading');
const hotspotsEl = document.getElementById('hotspots');

let api;
try {
  api = initScene({ stage, hotspotsEl });
  loading?.remove();
} catch (err) {
  console.error(err);
  if (loading) loading.textContent = '3D indisponible sur ce navigateur';
}

// Explode toggle
const btn = document.getElementById('cta-explode');
const hint = document.getElementById('hero-hint');
btn?.addEventListener('click', () => {
  if (!api) return;
  const now = api.toggleExplode();
  btn.textContent = now ? 'Recomposer le bâtiment' : 'Éclater le bâtiment';
  if (hint) hint.style.opacity = '0';
});

// Marketing sections below the hero
mountSections(document.getElementById('sections'));
