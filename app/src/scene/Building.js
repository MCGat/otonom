// ============================================================
// OTONOM — Bâtiment de bureaux R+2 (3 niveaux séparables)
// RDC: Accueil + EMS · R+1: Compta · R+2: RH
// Chaque niveau est un Group indépendant -> éclatement vertical.
// ============================================================
import * as THREE from 'three';
import { box, canvasTex } from './materials.js';

const BW = 22;   // largeur (x)
const BD = 15;   // profondeur (z)
const FH = 4.2;  // hauteur d'un niveau
const SLAB = 0.45;
const PLINTH = 1.1;

// build one storey as a self-contained group centred on its own origin,
// then positioned at restY. Front face (+z) is glazed.
function storey(M, opts) {
  const g = new THREE.Group();
  const litColor = opts.lit;

  // floor slab (bottom of the storey)
  const slab = box(BW + 0.5, SLAB, BD + 0.5, M.floorSlab);
  slab.position.y = SLAB / 2;
  g.add(slab);

  const innerH = FH - SLAB;
  const wallY = SLAB + innerH / 2;

  // back wall (-z) + side walls: ribbed cladding
  const back = box(BW, innerH, 0.4, M.clad);
  back.position.set(0, wallY, -BD / 2 + 0.2);
  g.add(back);
  [-1, 1].forEach((s) => {
    const side = box(0.4, innerH, BD, M.cladSide);
    side.position.set(s * (BW / 2 - 0.2), wallY, 0);
    g.add(side);
  });

  // corner columns (dark) — structure reads through the explode
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx, sz]) => {
    const col = box(0.5, FH, 0.5, M.base);
    col.position.set(sx * (BW / 2 - 0.25), FH / 2, sz * (BD / 2 - 0.25));
    g.add(col);
  });

  // front curtain wall: dark glass + interior backdrop + lit cells + mullions
  const glassW = BW - 1.4, glassH = innerH - 0.6, glassZ = BD / 2 - 0.25;
  const glazing = box(glassW, glassH, 0.16, M.glass);
  glazing.castShadow = false;
  glazing.position.set(0, wallY, glassZ);
  g.add(glazing);

  const interior = box(glassW - 0.3, glassH - 0.3, 0.1, new THREE.MeshStandardMaterial({
    color: 0x1c1f25, roughness: 0.9, emissive: 0x12141a, emissiveIntensity: 0.5,
  }));
  interior.castShadow = false;
  interior.position.set(0, wallY, glassZ - 1.2);
  g.add(interior);

  // warm-lit office cells behind the glass
  const cells = 6;
  for (let i = 0; i < cells; i++) {
    const litMat = new THREE.MeshStandardMaterial({ color: 0xdfe3ea, emissive: litColor, emissiveIntensity: 0.75 });
    const lit = box(2.4, glassH * 0.5, 0.05, litMat);
    lit.castShadow = false;
    lit.position.set(-glassW / 2 + 1.6 + i * ((glassW - 2.6) / (cells - 1)), wallY + glassH * 0.12, glassZ - 1.0);
    g.add(lit);
  }

  // vertical mullions on the front
  const mn = 8;
  for (let m = 0; m <= mn; m++) {
    const mx = -glassW / 2 + (glassW / mn) * m;
    const bar = box(0.13, glassH, 0.22, M.mull);
    bar.castShadow = false;
    bar.position.set(mx, wallY, glassZ + 0.12);
    g.add(bar);
  }
  // horizontal transom
  const tr = box(glassW, 0.13, 0.22, M.mull);
  tr.castShadow = false;
  tr.position.set(0, wallY + glassH * 0.05, glassZ + 0.12);
  g.add(tr);

  g.userData.height = FH;
  return g;
}

// EMS cabinet — the "brain" — a glowing server-ish cabinet placed in the RDC.
function emsCabinet(M) {
  const grp = new THREE.Group();
  const body = box(1.4, 2.2, 0.9, M.steelDark);
  body.position.y = 1.1;
  grp.add(body);
  // glowing face with scrolling-line emissive texture
  const faceTex = canvasTex(128, 200, (g, w, h) => {
    g.fillStyle = '#0a0c12'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#cfe0ff';
    for (let y = 12; y < h - 8; y += 14) {
      const lw = 20 + Math.random() * (w - 50);
      g.globalAlpha = 0.5 + Math.random() * 0.5;
      g.fillRect(12, y, lw, 4);
    }
    g.globalAlpha = 1;
  });
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex, emissive: 0x9fb8e6, emissiveMap: faceTex, emissiveIntensity: 1.2, roughness: 0.4,
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.0), faceMat);
  face.position.set(0, 1.1, 0.46);
  grp.add(face);
  // soft point light to sell the glow
  const pl = new THREE.PointLight(0x9fb8e6, 6, 9, 2);
  pl.position.set(0, 1.6, 1.2);
  grp.add(pl);
  return grp;
}

export function createBuilding(M) {
  const group = new THREE.Group();

  // dark plinth under the whole building
  const plinth = box(BW + 1.2, PLINTH, BD + 1.2, M.base);
  plinth.position.y = PLINTH / 2;
  group.add(plinth);

  // entrance canopy at the RDC front
  const canopy = box(7, 0.25, 2.6, M.parapet);
  canopy.position.set(0, PLINTH + FH - 0.6, BD / 2 + 1.0);
  group.add(canopy);

  const floors = [];
  const litTints = [0xc9d6ef, 0xd0c6b4, 0xc4d2c2]; // RDC cool, R+1 warm, R+2 sage
  for (let i = 0; i < 3; i++) {
    const f = storey(M, { lit: litTints[i] });
    const restY = PLINTH + i * FH;
    f.position.y = restY;
    f.userData.restY = restY;
    f.userData.index = i;
    group.add(f);
    floors.push(f);
  }

  // EMS core lives in the RDC (floor 0)
  const ems = emsCabinet(M);
  ems.position.set(-6.5, SLAB, 3.5);
  floors[0].add(ems);

  // anchor marker for the EMS hotspot (follows the RDC floor when exploded)
  const emsCore = new THREE.Object3D();
  emsCore.position.set(-6.5, 1.4, 4.2);
  floors[0].add(emsCore);

  // ---- roof (its own group, lifts highest on explode) ----
  const roofGrp = new THREE.Group();
  const roofRestY = PLINTH + 3 * FH;
  roofGrp.position.y = roofRestY;
  roofGrp.userData.restY = roofRestY;
  roofGrp.userData.index = 3;

  const roofSlab = box(BW + 0.5, 0.5, BD + 0.5, M.roof);
  roofSlab.position.y = 0.25;
  roofGrp.add(roofSlab);
  // parapet lips
  const lip = (w, d, x, z) => { const l = box(w, 0.7, d, M.parapet); l.position.set(x, 0.6, z); roofGrp.add(l); };
  lip(BW + 0.5, 0.4, 0, -BD / 2);
  lip(BW + 0.5, 0.4, 0, BD / 2);
  lip(0.4, BD + 0.5, -BW / 2, 0);
  lip(0.4, BD + 0.5, BW / 2, 0);
  // HVAC units
  [[6, -4], [-6, 3]].forEach(([x, z]) => {
    const u = box(2.4, 1.1, 1.8, M.steel); u.position.set(x, 0.95, z); roofGrp.add(u);
  });

  // rooftop solar array
  const solarGrp = new THREE.Group();
  const pW = 2.0, pD = 1.15, tilt = -0.26;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const p = box(pW, 0.08, pD, M.pvPanel);
      p.rotation.x = tilt;
      p.position.set(-BW / 2 + 3 + c * (pW + 0.5), 0.85, -BD / 2 + 3 + r * (pD + 1.0));
      solarGrp.add(p);
    }
  }
  roofGrp.add(solarGrp);
  group.add(roofGrp);
  floors.push(roofGrp); // roof participates in the explode

  // anchor for the solar hotspot (centre of the array, in roof space)
  const roofSolar = new THREE.Object3D();
  roofSolar.position.set(0, 1.1, 0);
  roofGrp.add(roofSolar);

  return {
    group,
    floors,                 // [rdc, r1, r2, roof] — each has userData.restY/index
    anchors: { emsCore, roofSolar },
    footprint: { BW, BD, FH, PLINTH },
  };
}
