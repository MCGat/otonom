// ============================================================
// OTONOM — Hotspots : pins HTML projetés depuis des anchors 3D.
// Chaque frame, on projette la position monde de l'anchor sur l'écran
// et on déplace le pin. Hover -> carte d'info.
// ============================================================
import * as THREE from 'three';
import { ZONES } from './data.js';

export function createHotspots(container, camera, anchors) {
  const items = [];
  const tmp = new THREE.Vector3();

  ZONES.forEach((z) => {
    const anchor = anchors[z.anchor];
    if (!anchor) return;

    const el = document.createElement('div');
    el.className = 'hotspot';
    el.innerHTML = `
      <div class="hotspot__dot"></div>
      <div class="hotspot__card">
        <p class="hotspot__k">${z.key}</p>
        <p class="hotspot__t">${z.title}</p>
        <p class="hotspot__d">${z.desc}</p>
      </div>`;
    container.appendChild(el);

    // click to pin open (mobile / touch friendly)
    el.addEventListener('click', () => {
      const wasOpen = el.classList.contains('is-open');
      items.forEach((it) => it.el.classList.remove('is-open'));
      if (!wasOpen) el.classList.add('is-open');
    });

    items.push({ el, anchor, zone: z });
  });

  function update(width, height) {
    for (const it of items) {
      it.anchor.getWorldPosition(tmp);
      tmp.project(camera);
      const behind = tmp.z > 1;
      const x = (tmp.x * 0.5 + 0.5) * width;
      const y = (-tmp.y * 0.5 + 0.5) * height;
      it.el.style.left = `${x}px`;
      it.el.style.top = `${y}px`;
      it.el.style.display = behind ? 'none' : 'block';
    }
  }

  return { update, items };
}
