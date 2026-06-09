// ============================================================
// OTONOM — Hotspots : pins projetés 3D→2D + cards riches.
// Desktop : popover au survol. Mobile : pilotage par le tour
// (setActive) + ouverture de la bottom-sheet via onSelect.
// ============================================================
import * as THREE from 'three';
import { ZONES, cardHTML } from './data.js';

export function createHotspots(container, camera, anchors, opts = {}) {
  const { interactivePopover = true } = opts;
  let onSelect = opts.onSelect || null;
  const items = [];
  const tmp = new THREE.Vector3();

  ZONES.forEach((z, i) => {
    const anchor = anchors[z.anchor];
    if (!anchor) return;

    const el = document.createElement('div');
    el.className = 'hotspot';
    el.dataset.id = z.id;
    el.innerHTML = `
      <button class="hotspot__pin" aria-label="${z.title}">
        <span class="hotspot__dot"></span>
        <span class="hotspot__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="hotspot__label">${z.title}</span>
      </button>
      ${interactivePopover ? `<div class="hotspot__pop">${cardHTML(z)}</div>` : ''}`;
    container.appendChild(el);

    el.querySelector('.hotspot__pin').addEventListener('click', (e) => {
      e.stopPropagation();
      setActive(z.id, true);
      onSelect && onSelect(z, i);
    });

    items.push({ el, anchor, zone: z, index: i });
  });

  function setActive(id, scrollDim = true) {
    items.forEach((it) => {
      const on = it.zone.id === id;
      it.el.classList.toggle('is-open', on);
      if (scrollDim) it.el.classList.toggle('is-dimmed', !on);
    });
  }
  function clearActive() {
    items.forEach((it) => it.el.classList.remove('is-open', 'is-dimmed'));
  }

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
      // flip popover to the left when near the right edge
      it.el.classList.toggle('flip', x > width * 0.62);
    }
  }

  function setOnSelect(fn) { onSelect = fn; }

  return { update, items, setActive, clearActive, setOnSelect };
}
