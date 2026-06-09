// ============================================================
// OTONOM — Matériaux & helpers partagés (Three.js r169, modules ES)
// Monochrome, lumière du soleil, ombres douces.
// ============================================================
import * as THREE from 'three';

// --- canvas texture helper ---
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

// ribbed metal cladding (horizontal ribs)
function ribbed(base, hi, lo) {
  return canvasTex(8, 48, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 6) {
      g.fillStyle = hi; g.fillRect(0, y, w, 1.2);
      g.fillStyle = lo; g.fillRect(0, y + 3, w, 1.4);
    }
  });
}

// A reusable set of materials. Created once, shared across modules.
export function makeMaterials() {
  const matClad = new THREE.MeshStandardMaterial({ color: 0xcdd0d4, roughness: 0.62, metalness: 0.18 });
  matClad.map = ribbed('#c9ccd1', '#dfe2e6', '#a9adb4');

  return {
    clad:    matClad,
    cladSide: matClad.clone(),
    base:    new THREE.MeshStandardMaterial({ color: 0x34353a, roughness: 0.8,  metalness: 0.05 }),
    parapet: new THREE.MeshStandardMaterial({ color: 0xe9ebee, roughness: 0.5,  metalness: 0.1  }),
    roof:    new THREE.MeshStandardMaterial({ color: 0x202227, roughness: 0.92, metalness: 0.02 }),
    floorSlab: new THREE.MeshStandardMaterial({ color: 0x4a4c52, roughness: 0.8, metalness: 0.05 }),
    glass:   new THREE.MeshStandardMaterial({ color: 0x121620, roughness: 0.07, metalness: 0.0, envMapIntensity: 1.5 }),
    mull:    new THREE.MeshStandardMaterial({ color: 0x0d0e11, roughness: 0.5,  metalness: 0.3  }),
    litWarm: new THREE.MeshStandardMaterial({ color: 0xdfe3ea, emissive: 0xb9c2d4, emissiveIntensity: 0.85 }),
    pvPanel: new THREE.MeshStandardMaterial({ color: 0x0c0e16, roughness: 0.22, metalness: 0.45, envMapIntensity: 1.1 }),
    pvFrame: new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.5, metalness: 0.6 }),
    asphalt: new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 0.98 }),
    steel:   new THREE.MeshStandardMaterial({ color: 0x303338, roughness: 0.45, metalness: 0.7 }),
    steelDark: new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.5, metalness: 0.6 }),
    accent:  new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.4, metalness: 0.1, emissive: 0x6a7180, emissiveIntensity: 0.25 }),
    rubber:  new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.9 }),
    glassDark: new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.1, metalness: 0.2, envMapIntensity: 1.2 }),
  };
}

// box mesh that casts + receives shadows
export function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

// rounded-ish cylinder helper
export function cyl(rt, rb, h, mat, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
