// ============================================================
// OTONOM — Scène 3D (DA stylisée premium, perf adaptative)
// Tier auto (high/mid/low) · render-on-demand · ombres figées ·
// intro temporisée. Post : GTAO (high) · Bloom · SMAA · ACES.
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { makeMaterials, box } from './materials.js';
import { createBuilding } from './Building.js';
import { createForecourt } from './Forecourt.js';
import { createHotspots } from './Hotspots.js';

// Quality tier from device capabilities. Mobile stays light by default.
function detectTier(isMobile) {
  if (isMobile) return 'low';
  const cores = navigator.hardwareConcurrency || 4;
  const mem = navigator.deviceMemory || 4;
  if (cores >= 8 && mem >= 8) return 'high';
  if (cores >= 4) return 'mid';
  return 'low';
}

const TIER = {
  high: { dpr: 2,   shadow: 2048, gtao: true,  bloom: 0.32, smaa: true },
  mid:  { dpr: 1.5, shadow: 1536, gtao: false, bloom: 0.30, smaa: true },
  low:  { dpr: 1.5, shadow: 1024, gtao: false, bloom: 0.26, smaa: false },
};

export function initScene({ stage, hotspotsEl, capture = false }) {
  let W = stage.clientWidth || 1440;
  let H = stage.clientHeight || 760;
  const isMobile = matchMedia('(pointer:coarse)').matches || window.innerWidth < 768;
  const tier = detectTier(isMobile);
  const Q = TIER[tier];

  const renderer = new THREE.WebGLRenderer({ antialias: !Q.smaa, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q.dpr));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // shadows are static; updated on demand
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c0d11, 78, 210);

  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 1000);
  camera.position.set(40, 19, 56);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 4, 12);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 26;
  controls.maxDistance = 95;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.45;

  // ---- studio environment ----
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---- lighting ----
  scene.add(new THREE.HemisphereLight(0xcfd6e4, 0x14161c, 0.7));
  const sun = new THREE.DirectionalLight(0xfff3e2, 2.5);
  sun.position.set(-42, 64, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(Q.shadow, Q.shadow);
  const sc = sun.shadow.camera;
  sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 240;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xaab8d8, 0.5);
  fill.position.set(50, 30, -28);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xbcd0ff, 0.8);
  rim.position.set(-20, 22, -54);
  scene.add(rim);

  const M = makeMaterials();

  // ---- diorama podium ----
  const podium = box(96, 2.4, 84, M.podium);
  podium.position.set(0, -1.2, 2);
  podium.receiveShadow = true;
  scene.add(podium);
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(96, 84), M.asphalt);
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(0, 0.01, 2);
  deck.receiveShadow = true;
  scene.add(deck);

  // ---- content ----
  const root = new THREE.Group();
  const building = createBuilding(M);
  building.group.position.set(0, 0, -8);
  root.add(building.group);
  const forecourt = createForecourt(M);
  forecourt.group.position.set(0, 0, -8);
  root.add(forecourt.group);
  scene.add(root);

  const anchors = { ...building.anchors, ...forecourt.anchors };
  const hotspots = createHotspots(hotspotsEl, camera, anchors, { interactivePopover: !isMobile });

  // ---- post-processing ----
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));

  let gtao = null;
  if (Q.gtao) {
    gtao = new GTAOPass(scene, camera, W, H);
    gtao.output = GTAOPass.OUTPUT.Default;
    gtao.updateGtaoMaterial({ radius: 22, screenSpaceRadius: true, scale: 1.0, samples: 16, distanceExponent: 1, thickness: 1, distanceFallOff: 1 });
    composer.addPass(gtao);
  }
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), Q.bloom, 0.5, 1.0);
  composer.addPass(bloom);
  if (Q.smaa) composer.addPass(new SMAAPass(W, H));
  composer.addPass(new OutputPass());

  // ---- render-on-demand plumbing ----
  let dirty = true;
  let shadowDirty = true;
  const invalidate = () => { dirty = true; };
  const invalidateShadow = () => { shadowDirty = true; dirty = true; };
  controls.addEventListener('change', invalidate);

  // ---- explode ----
  let exploded = false;
  let explodeT = 0;
  const GAP = 3.6;
  function applyExplode() {
    const e = explodeT < 0.5 ? 2 * explodeT * explodeT : 1 - Math.pow(-2 * explodeT + 2, 2) / 2;
    for (const f of building.floors) f.position.y = f.userData.restY + e * f.userData.index * GAP;
  }
  function setExploded(v) { exploded = v; invalidate(); }
  function toggleExplode() { exploded = !exploded; invalidate(); return exploded; }

  // ---- camera fly-to ----
  let fly = null;
  const _wp = new THREE.Vector3();
  function flyToAnchor(anchor, dist = 24) {
    anchor.getWorldPosition(_wp);
    const dir = new THREE.Vector3(0.7, 0.45, 1).normalize();
    const toPos = _wp.clone().add(dir.multiplyScalar(dist));
    fly = { fromPos: camera.position.clone(), toPos, fromTgt: controls.target.clone(), toTgt: _wp.clone(), t: 0, dur: 0.9 };
    controls.autoRotate = false;
    invalidate();
  }

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    composer.setSize(W, H);
    if (gtao) gtao.setSize(W, H);
    bloom.setSize(W, H);
    invalidateShadow();
  }
  window.addEventListener('resize', resize);

  // stop the intro spin on first interaction
  let introActive = true;
  const INTRO_MS = 6500;
  function stopIntro() { introActive = false; controls.autoRotate = false; }
  controls.addEventListener('start', () => { stopIntro(); fly = null; });

  // ---- deterministic capture (pre-rendered mobile cinematic) ----
  // progress 0→1 drives a tasteful camera sweep + the explode reveal.
  function setProgress(p) {
    p = Math.max(0, Math.min(1, p));
    const az = THREE.MathUtils.degToRad(-30 + p * 60);     // -30°..+30° sweep
    const radius = 72 - p * 8;
    const y = 18 + Math.sin(p * Math.PI) * 7;              // gentle vertical arc
    const tx = 0, ty = 5, tz = 2;
    camera.position.set(Math.sin(az) * radius + tx, y, Math.cos(az) * radius + tz);
    controls.target.set(tx, ty, tz);
    camera.lookAt(tx, ty, tz);
    explodeT = Math.max(0, Math.min(1, (p - 0.42) / 0.46)); // ramp 0.42→0.88
    applyExplode();
    camera.updateMatrixWorld();
    renderer.shadowMap.needsUpdate = true;
    hotspots.update(W, H);
    composer.render();
  }

  if (capture) {
    introActive = false;
    controls.autoRotate = false;
    controls.enabled = false;
    setProgress(0);
    return { renderer, scene, camera, controls, setProgress, toggleExplode, setExploded, flyToAnchor, anchors, isMobile, hotspots, tier, invalidate };
  }

  const clock = new THREE.Clock();
  const t0 = performance.now();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    let animating = false;

    if (introActive && performance.now() - t0 > INTRO_MS) stopIntro();
    if (introActive) animating = true;

    const target = exploded ? 1 : 0;
    if (Math.abs(explodeT - target) > 0.0006) {
      explodeT += (target - explodeT) * Math.min(1, dt * 4.5);
      applyExplode(); animating = true; shadowDirty = true;
    } else if (explodeT !== target) {
      explodeT = target; applyExplode(); shadowDirty = true; animating = true;
    }

    if (fly) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const k = fly.t < 0.5 ? 2 * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 2) / 2;
      camera.position.lerpVectors(fly.fromPos, fly.toPos, k);
      controls.target.lerpVectors(fly.fromTgt, fly.toTgt, k);
      animating = true;
      if (fly.t >= 1) fly = null;
    }

    const changed = controls.update();
    if (changed || animating) dirty = true;

    if (dirty) {
      if (shadowDirty) { renderer.shadowMap.needsUpdate = true; shadowDirty = false; }
      hotspots.update(W, H);
      composer.render();
      dirty = false;
    }
    requestAnimationFrame(tick);
  }
  tick();

  return { renderer, scene, camera, controls, toggleExplode, setExploded, flyToAnchor, anchors, isMobile, hotspots, tier, invalidate };
}
