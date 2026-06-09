// ============================================================
// OTONOM — Scène 3D : renderer, caméra iso, lumière soleil, ombres
// douces, contrôles orbit, éclatement vertical, boucle de rendu.
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { makeMaterials } from './materials.js';
import { createBuilding } from './Building.js';
import { createForecourt } from './Forecourt.js';
import { createHotspots } from './Hotspots.js';

export function initScene({ stage, hotspotsEl }) {
  let W = stage.clientWidth || 1440;
  let H = stage.clientHeight || 760;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0d, 60, 180);

  const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 1000);
  camera.position.set(34, 26, 44);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 6, 8);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 30;
  controls.maxDistance = 90;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;

  // ---- lighting ----
  scene.add(new THREE.HemisphereLight(0xa9b3c4, 0x090a0c, 0.36));
  const sun = new THREE.DirectionalLight(0xfff0db, 2.4);
  sun.position.set(-46, 70, 38);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 240;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x8a98bc, 0.32);
  fill.position.set(48, 34, -30);
  scene.add(fill);

  // ---- environment reflections (vertical gradient) ----
  const pmrem = new THREE.PMREMGenerator(renderer);
  {
    const c = document.createElement('canvas'); c.width = 16; c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, '#7b8394'); grd.addColorStop(0.48, '#2c2f37'); grd.addColorStop(1, '#0b0b0e');
    g.fillStyle = grd; g.fillRect(0, 0, 16, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
  }

  // ---- ground ----
  const M = makeMaterials();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M.asphalt);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- content ----
  const root = new THREE.Group();
  // place building toward the back so the parvis reads in front (+z)
  const building = createBuilding(M);
  building.group.position.set(0, 0, -8);
  root.add(building.group);

  const forecourt = createForecourt(M);
  forecourt.group.position.set(0, 0, -8);
  root.add(forecourt.group);
  scene.add(root);

  const anchors = { ...building.anchors, ...forecourt.anchors };
  const hotspots = createHotspots(hotspotsEl, camera, anchors);

  // ---- explode state ----
  let exploded = false;
  let explodeT = 0; // 0..1 eased
  const GAP = 3.6;
  function setExploded(v) { exploded = v; }
  function toggleExplode() { exploded = !exploded; return exploded; }

  // ---- resize ----
  function resize() {
    W = stage.clientWidth; H = stage.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }
  window.addEventListener('resize', resize);

  // pause auto-rotate once the user interacts
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  // ---- loop ----
  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    // ease explodeT toward target
    const target = exploded ? 1 : 0;
    explodeT += (target - explodeT) * Math.min(1, dt * 4.5);
    const e = explodeT < 0.5 ? 2 * explodeT * explodeT : 1 - Math.pow(-2 * explodeT + 2, 2) / 2;
    for (const f of building.floors) {
      const idx = f.userData.index;
      f.position.y = f.userData.restY + e * idx * GAP;
    }
    controls.update();
    hotspots.update(W, H);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  return { renderer, scene, camera, controls, toggleExplode, setExploded, resize };
}
