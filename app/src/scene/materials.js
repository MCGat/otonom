// ============================================================
// OTONOM — Matériaux & helpers (Three.js r169)
// DA stylisée premium : palette claire, bords adoucis, env studio.
// ============================================================
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// --- canvas texture helper (kept for the EMS screen / markings) ---
export function canvasTex(w, h, draw, rx, ry) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (rx || ry) t.repeat.set(rx || 1, ry || 1);
  t.anisotropy = 8;
  return t;
}

// Shared premium material set. Lighter than before, tuned for a studio
// environment (RoomEnvironment) so reflections do the heavy lifting.
export function makeMaterials() {
  return {
    clad:    new THREE.MeshStandardMaterial({ color: 0xdfe1e6, roughness: 0.42, metalness: 0.12, envMapIntensity: 1.1 }),
    cladSide: new THREE.MeshStandardMaterial({ color: 0xd4d7dd, roughness: 0.46, metalness: 0.12, envMapIntensity: 1.1 }),
    base:    new THREE.MeshStandardMaterial({ color: 0x3c3e45, roughness: 0.6,  metalness: 0.2,  envMapIntensity: 0.9 }),
    parapet: new THREE.MeshStandardMaterial({ color: 0xf1f2f4, roughness: 0.35, metalness: 0.12, envMapIntensity: 1.2 }),
    roof:    new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.7,  metalness: 0.1,  envMapIntensity: 0.9 }),
    floorSlab: new THREE.MeshStandardMaterial({ color: 0x5a5d65, roughness: 0.6, metalness: 0.15, envMapIntensity: 1.0 }),
    glass:   new THREE.MeshPhysicalMaterial({ color: 0x1a2030, roughness: 0.06, metalness: 0.0, transmission: 0.0, envMapIntensity: 1.8, clearcoat: 1, clearcoatRoughness: 0.08 }),
    mull:    new THREE.MeshStandardMaterial({ color: 0x141620, roughness: 0.4,  metalness: 0.5,  envMapIntensity: 1.0 }),
    litWarm: new THREE.MeshStandardMaterial({ color: 0xeef1f6, emissive: 0xcdd8ee, emissiveIntensity: 0.9 }),
    pvPanel: new THREE.MeshPhysicalMaterial({ color: 0x10141f, roughness: 0.18, metalness: 0.4, envMapIntensity: 1.4, clearcoat: 0.8, clearcoatRoughness: 0.12 }),
    pvFrame: new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.4, metalness: 0.6, envMapIntensity: 1.2 }),
    podium:  new THREE.MeshStandardMaterial({ color: 0x202329, roughness: 0.85, metalness: 0.05, envMapIntensity: 0.7 }),
    asphalt: new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.95, metalness: 0.02, envMapIntensity: 0.5 }),
    steel:   new THREE.MeshStandardMaterial({ color: 0x9fa3ab, roughness: 0.35, metalness: 0.7, envMapIntensity: 1.3 }),
    steelDark: new THREE.MeshStandardMaterial({ color: 0x24272d, roughness: 0.45, metalness: 0.6, envMapIntensity: 1.0 }),
    accent:  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1, emissive: 0x9fb3d6, emissiveIntensity: 0.5 }),
    rubber:  new THREE.MeshStandardMaterial({ color: 0x121317, roughness: 0.85, metalness: 0.1 }),
    glassDark: new THREE.MeshPhysicalMaterial({ color: 0x0c1016, roughness: 0.08, metalness: 0.1, envMapIntensity: 1.4, clearcoat: 1, clearcoatRoughness: 0.1 }),
  };
}

// Geometry cache so we don't rebuild identical rounded boxes.
const _geoCache = new Map();
function roundedGeo(w, h, d) {
  const key = `${w.toFixed(2)}x${h.toFixed(2)}x${d.toFixed(2)}`;
  let g = _geoCache.get(key);
  if (!g) {
    const minDim = Math.min(w, h, d);
    const r = Math.min(0.14, minDim * 0.22);
    g = new RoundedBoxGeometry(w, h, d, 2, r);
    _geoCache.set(key, g);
  }
  return g;
}

// box(): chunky volumes get softened (rounded) edges → instant premium feel;
// thin elements (panels, mullions) stay crisp via plain BoxGeometry.
export function box(w, h, d, mat) {
  const chunky = Math.min(w, h, d) > 0.6;
  const geo = chunky ? roundedGeo(w, h, d) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function cyl(rt, rb, h, mat, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
