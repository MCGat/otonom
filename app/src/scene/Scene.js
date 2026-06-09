// ============================================================
// OTONOM — Scène 3D (DA stylisée premium)
// RoomEnvironment + lumière relevée + socle diorama
// + post-traitement : GTAO · Bloom · SMAA · ACES (OutputPass).
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

export function initScene({ stage, hotspotsEl }) {
  let W = stage.clientWidth || 1440;
  let H = stage.clientHeight || 760;
  const isMobile = matchMedia('(pointer:coarse)').matches || window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.6 : 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c0d11, 75, 200);

  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 1000);
  camera.position.set(42, 24, 58);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 5, 9);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 28;
  controls.maxDistance = 95;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  // ---- studio environment (reflections + soft ambient) ----
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // ---- lighting (brighter, sculpted) ----
  scene.add(new THREE.HemisphereLight(0xcfd6e4, 0x14161c, 0.7));
  const sun = new THREE.DirectionalLight(0xfff3e2, 2.5);
  sun.position.set(-42, 64, 40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 240;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xaab8d8, 0.5);
  fill.position.set(50, 30, -28);
  scene.add(fill);
  // cool rim from behind to separate the building from the dark bg
  const rim = new THREE.DirectionalLight(0xbcd0ff, 0.8);
  rim.position.set(-20, 22, -54);
  scene.add(rim);

  const M = makeMaterials();

  // ---- diorama podium (replaces the infinite black ground) ----
  const podium = box(96, 2.4, 84, M.podium);
  podium.position.set(0, -1.2, 2);
  podium.receiveShadow = true;
  scene.add(podium);
  // thin asphalt deck on top of the podium where the scene sits
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
  if (!isMobile) {
    gtao = new GTAOPass(scene, camera, W, H);
    gtao.output = GTAOPass.OUTPUT.Default;
    gtao.updateGtaoMaterial({ radius: 22, screenSpaceRadius: true, scale: 1.0, samples: 16, distanceExponent: 1, thickness: 1, distanceFallOff: 1 });
    composer.addPass(gtao);
  }

  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.32, 0.5, 1.0);
  composer.addPass(bloom);
  composer.addPass(new SMAAPass(W, H));
  composer.addPass(new OutputPass());

  // ---- explode ----
  let exploded = false;
  let explodeT = 0;
  const GAP = 3.6;
  function setExploded(v) { exploded = v; }
  function toggleExplode() { exploded = !exploded; return exploded; }

  // ---- camera fly-to (used by the guided tour) ----
  let fly = null; // {fromPos,toPos,fromTgt,toTgt,t,dur}
  const _wp = new THREE.Vector3();
  function flyToAnchor(anchor, dist = 24) {
    anchor.getWorldPosition(_wp);
    const dir = new THREE.Vector3(0.7, 0.45, 1).normalize();
    const toPos = _wp.clone().add(dir.multiplyScalar(dist));
    fly = { fromPos: camera.position.clone(), toPos, fromTgt: controls.target.clone(), toTgt: _wp.clone(), t: 0, dur: 0.9 };
    controls.autoRotate = false;
  }

  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
    composer.setSize(W, H);
    if (gtao) gtao.setSize(W, H);
    bloom.setSize(W, H);
  }
  window.addEventListener('resize', resize);
  controls.addEventListener('start', () => { controls.autoRotate = false; fly = null; });

  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const target = exploded ? 1 : 0;
    explodeT += (target - explodeT) * Math.min(1, dt * 4.5);
    const e = explodeT < 0.5 ? 2 * explodeT * explodeT : 1 - Math.pow(-2 * explodeT + 2, 2) / 2;
    for (const f of building.floors) {
      f.position.y = f.userData.restY + e * f.userData.index * GAP;
    }
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / fly.dur);
      const k = fly.t < 0.5 ? 2 * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 2) / 2;
      camera.position.lerpVectors(fly.fromPos, fly.toPos, k);
      controls.target.lerpVectors(fly.fromTgt, fly.toTgt, k);
      if (fly.t >= 1) fly = null;
    }
    controls.update();
    hotspots.update(W, H);
    composer.render();
    requestAnimationFrame(tick);
  }
  tick();

  return { renderer, scene, camera, controls, toggleExplode, setExploded, flyToAnchor, anchors, isMobile, hotspots };
}
