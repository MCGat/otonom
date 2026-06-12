// ============================================================
// OTONOM — Parvis logistique (devant le bâtiment)
// Flotte (camion / VUL / VP) · bornes DC flotte · ombrières PV +
// recharge VP · stockage BESS · poste de livraison réseau · arbres.
// Renvoie des anchors pour les hotspots.
// ============================================================
import * as THREE from 'three';
import { box, cyl, canvasTex } from './materials.js';

// ---- low-poly vehicles ----
function truck(M) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xe7e9ec, roughness: 0.55, metalness: 0.1 });
  const cab = box(2.6, 2.6, 2.4, body); cab.position.set(0, 1.5, 3.0); g.add(cab);
  const cont = box(2.7, 3.0, 7.2, M.clad); cont.position.set(0, 1.7, -1.4); g.add(cont);
  const wind = box(2.2, 1.0, 0.1, M.glassDark); wind.position.set(0, 2.0, 4.21); g.add(wind);
  wheels(g, M, 1.35, [[-1.4, 0.55, 2.6], [1.4, 0.55, 2.6], [-1.4, 0.55, -3.0], [1.4, 0.55, -3.0], [-1.4, 0.55, -1.2], [1.4, 0.55, -1.2]], 0.55);
  return g;
}
function van(M) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0xd7dade, roughness: 0.55, metalness: 0.1 });
  const b = box(2.1, 2.1, 5.0, body); b.position.set(0, 1.25, 0); g.add(b);
  const nose = box(2.1, 1.3, 1.0, body); nose.position.set(0, 0.85, 2.7); g.add(nose);
  const wind = box(1.8, 0.8, 0.1, M.glassDark); wind.position.set(0, 1.55, 2.2); g.add(wind);
  wheels(g, M, 0.9, [[-1.0, 0.45, 1.7], [1.0, 0.45, 1.7], [-1.0, 0.45, -1.6], [1.0, 0.45, -1.6]], 0.45);
  return g;
}
function car(M, color) {
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.25 });
  const b = box(1.9, 0.9, 4.2, body); b.position.set(0, 0.75, 0); g.add(b);
  const cabin = box(1.7, 0.8, 2.2, body); cabin.position.set(0, 1.35, -0.1); g.add(cabin);
  const wind = box(1.62, 0.62, 2.0, M.glassDark); wind.position.set(0, 1.4, -0.1); wind.scale.z = 1.02; g.add(wind);
  wheels(g, M, 0.62, [[-0.95, 0.36, 1.3], [0.95, 0.36, 1.3], [-0.95, 0.36, -1.3], [0.95, 0.36, -1.3]], 0.36);
  return g;
}
function wheels(g, M, _r, list, rad) {
  list.forEach(([x, y, z]) => {
    const w = cyl(rad, rad, 0.35, M.rubber, 16);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    g.add(w);
  });
}

// ---- charger pedestals ----
function fleetCharger(M) {
  const g = new THREE.Group();
  const post = box(0.8, 2.2, 0.5, M.steel); post.position.y = 1.1; g.add(post);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x0a0c12, emissive: 0x8fb0ff, emissiveIntensity: 0.9, roughness: 0.4 }));
  screen.position.set(0, 1.5, 0.26); g.add(screen);
  const cap = box(0.9, 0.25, 0.6, M.parapet); cap.position.y = 2.3; g.add(cap);
  return g;
}
function acCharger(M) {
  const g = new THREE.Group();
  const post = box(0.4, 1.4, 0.3, M.steelDark); post.position.y = 0.7; g.add(post);
  const led = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x0a0c12, emissive: 0xbfeacb, emissiveIntensity: 0.8, roughness: 0.4 }));
  led.position.set(0, 0.95, 0.16); g.add(led);
  return g;
}

export function createForecourt(M) {
  const group = new THREE.Group();

  // ground markings for the parking bays (front area)
  const markTex = canvasTex(1024, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = 'rgba(225,228,232,0.5)'; g.lineWidth = 3;
    const bays = 10, bw = w / bays;
    for (let i = 0; i <= bays; i++) { g.beginPath(); g.moveTo(i * bw, 0); g.lineTo(i * bw, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.5); g.stroke();
  });
  const marks = new THREE.Mesh(new THREE.PlaneGeometry(34, 16),
    new THREE.MeshBasicMaterial({ map: markTex, transparent: true, opacity: 0.55 }));
  marks.rotation.x = -Math.PI / 2; marks.position.set(-9, 0.03, 18); group.add(marks);

  // =========================================================
  // RIGHT: fleet depot — DC chargers + truck + van  (priorité)
  // =========================================================
  const fleet = new THREE.Group();
  fleet.position.set(8.5, 0, 13);
  const chargers = new THREE.Group();
  [-5.4, -1.8, 1.8, 5.4].forEach((x) => { const c = fleetCharger(M); c.position.set(x, 0, 0); chargers.add(c); });
  fleet.add(chargers);
  // a real depot row: two trucks + two vans nosed in at the DC chargers
  const tr  = truck(M); tr.position.set(-5.0, 0, 6.6);  tr.rotation.y = Math.PI; fleet.add(tr);
  const tr2 = truck(M); tr2.position.set(5.0, 0, 6.8);  tr2.rotation.y = Math.PI; fleet.add(tr2);
  const vn  = van(M);   vn.position.set(-1.6, 0, 4.4);  vn.rotation.y = Math.PI; fleet.add(vn);
  const vn2 = van(M);   vn2.position.set(1.8, 0, 4.4);  vn2.rotation.y = Math.PI; fleet.add(vn2);
  group.add(fleet);

  const fleetChargers = new THREE.Object3D();
  fleetChargers.position.set(10, 2.4, 15);
  group.add(fleetChargers);

  // =========================================================
  // LEFT: ombrières PV over VP parking + AC chargers
  // =========================================================
  const carport = new THREE.Group();
  carport.position.set(-11, 0, 19);
  // posts
  [[-5, -3], [5, -3], [-5, 3], [5, 3]].forEach(([x, z]) => {
    const p = box(0.4, 4.2, 0.4, M.steel); p.position.set(x, 2.1, z); carport.add(p);
  });
  // tilted PV canopy
  const canopy = new THREE.Group();
  const pW = 2.0, pD = 1.2;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    const p = box(pW, 0.08, pD, M.pvPanel);
    p.position.set(-5 + c * (pW + 0.2), 0, -2.4 + r * (pD + 0.2));
    canopy.add(p);
  }
  const beam = box(11, 0.3, 7, M.steelDark); beam.position.y = -0.25; canopy.add(beam);
  canopy.position.set(0, 4.3, 0); canopy.rotation.x = -0.12; carport.add(canopy);
  // cars + AC chargers under it
  const carColors = [0x3a3d44, 0x9aa0a8, 0x2a2c31, 0x44484f, 0xb7bcc4];
  [-4.6, -2.3, 0, 2.3, 4.6].forEach((x, i) => {
    const c = car(M, carColors[i]); c.position.set(x, 0, 0.5); carport.add(c);
    const ch = acCharger(M); ch.position.set(x, 0, -2.6); carport.add(ch);
  });
  group.add(carport);

  const carportAnchor = new THREE.Object3D();
  carportAnchor.position.set(-11, 4.6, 19);
  group.add(carportAnchor);

  // =========================================================
  // BESS — battery storage container (near building, right)
  // =========================================================
  const bessGrp = new THREE.Group();
  bessGrp.position.set(11, 0, 8);
  const container = box(5, 2.6, 2.4, M.steel); container.position.y = 1.3; bessGrp.add(container);
  // ribbed door lines
  for (let i = -2; i <= 2; i++) {
    const ln = box(0.06, 2.2, 2.42, M.steelDark); ln.position.set(i * 1.0, 1.3, 0); bessGrp.add(ln);
  }
  const status = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x0a0c12, emissive: 0x8fb0ff, emissiveIntensity: 0.9 }));
  status.position.set(2.0, 1.9, 1.21); bessGrp.add(status);
  group.add(bessGrp);

  const bess = new THREE.Object3D();
  bess.position.set(11, 2.8, 8);
  group.add(bess);

  // =========================================================
  // Grid delivery box — poste de livraison (near building, left)
  // =========================================================
  const gridGrp = new THREE.Group();
  gridGrp.position.set(-11, 0, 8);
  const cab = box(2.2, 2.4, 1.6, M.steelDark); cab.position.y = 1.2; gridGrp.add(cab);
  const vent = box(1.6, 0.1, 1.4, M.steel);
  for (let i = 0; i < 5; i++) { const v = vent.clone(); v.position.set(0, 0.6 + i * 0.3, 0.81); gridGrp.add(v); }
  group.add(gridGrp);

  const gridBox = new THREE.Object3D();
  gridBox.position.set(-11, 2.6, 8);
  group.add(gridBox);

  // =========================================================
  // trees (low-poly) for life
  // =========================================================
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a241d, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x20281c, roughness: 1 });
  [[-18, 26], [18, 27], [-22, 6], [22, 22], [0, 30]].forEach(([x, z]) => {
    const t = new THREE.Group();
    const trunk = cyl(0.2, 0.28, 1.6, trunkMat, 8); trunk.position.y = 0.8; t.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), leafMat);
    crown.position.y = 2.4; crown.castShadow = true; crown.scale.y = 1.2; t.add(crown);
    t.position.set(x, 0, z); group.add(t);
  });

  return {
    group,
    anchors: { fleetChargers, carport: carportAnchor, bess, gridBox },
  };
}
