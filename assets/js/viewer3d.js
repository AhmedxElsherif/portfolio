// 3D viewer for PCB / enclosure models.
// Supported: .glb .gltf (incl. Draco / Meshopt compressed), .wrl/.vrml (KiCad VRML export), .stl, .obj
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

function ext(url) {
  const clean = url.split('?')[0].split('#')[0];
  return clean.slice(clean.lastIndexOf('.') + 1).toLowerCase();
}

async function loadObject(url, onProgress) {
  const e = ext(url);
  if (e === 'glb' || e === 'gltf') {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);
    loader.setDRACOLoader(draco);
    loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf = await loader.loadAsync(url, onProgress);
    draco.dispose();
    return gltf.scene;
  }
  if (e === 'wrl' || e === 'vrml') {
    const { VRMLLoader } = await import('three/addons/loaders/VRMLLoader.js');
    return new VRMLLoader().loadAsync(url, onProgress);
  }
  if (e === 'stl') {
    const { STLLoader } = await import('three/addons/loaders/STLLoader.js');
    const geo = await new STLLoader().loadAsync(url, onProgress);
    geo.computeVertexNormals();
    const mat = geo.hasColors
      ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.1 })
      : new THREE.MeshStandardMaterial({ color: 0x2f7d4f, roughness: 0.5, metalness: 0.15 });
    return new THREE.Mesh(geo, mat);
  }
  if (e === 'obj') {
    const { OBJLoader } = await import('three/addons/loaders/OBJLoader.js');
    return new OBJLoader().loadAsync(url, onProgress);
  }
  throw new Error(`Unsupported 3D format ".${e}". Use GLB, GLTF, WRL, STL or OBJ.`);
}

/**
 * Create a viewer inside `container`.
 * models: [{ label, url, rotation:[x,y,z] (degrees) }]
 * Returns { dispose() }
 */
export function createViewer(container, models) {
  container.classList.add('v3d');
  container.innerHTML = `
    <div class="v3d-canvas"></div>
    <div class="v3d-status" hidden><div class="v3d-bar"><span></span></div><p>Loading model…</p></div>
    <div class="v3d-tabs"></div>
    <div class="v3d-tools">
      <button type="button" data-act="rotate" title="Auto-rotate" aria-pressed="true">⟳</button>
      <button type="button" data-act="wire" title="Wireframe" aria-pressed="false">▦</button>
      <button type="button" data-act="reset" title="Reset view">⌖</button>
      <button type="button" data-act="full" title="Fullscreen">⛶</button>
    </div>
    <div class="v3d-hint">Drag to rotate · Scroll to zoom · Right-drag to pan</div>`;

  const holder = container.querySelector('.v3d-canvas');
  const status = container.querySelector('.v3d-status');
  const bar = status.querySelector('.v3d-bar span');
  const statusText = status.querySelector('p');
  const tabs = container.querySelector('.v3d-tabs');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  holder.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x223322, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(3, 6, 4);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.addEventListener('start', () => { controls.autoRotate = false; setPressed('rotate', false); });

  let current = null;
  let wire = false;
  let home = null;
  let raf = 0;
  let disposed = false;
  let loadToken = 0;

  function setPressed(act, v) {
    const b = container.querySelector(`[data-act="${act}"]`);
    if (b) b.setAttribute('aria-pressed', String(v));
  }

  function resize() {
    const w = holder.clientWidth || 1, h = holder.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(holder);
  resize();

  function frame(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);
    const radius = Math.max(size.length() / 2, 1e-6);
    const dist = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.95;
    camera.near = dist / 200; camera.far = dist * 50; camera.updateProjectionMatrix();
    const dir = new THREE.Vector3(0.9, 0.85, 1.1).normalize();
    camera.position.copy(dir.multiplyScalar(dist));
    controls.target.set(0, 0, 0);
    controls.minDistance = dist * 0.15; controls.maxDistance = dist * 6;
    controls.update();
    sun.position.set(radius * 3, radius * 6, radius * 4);
    home = { pos: camera.position.clone() };
  }

  function disposeObj(obj) {
    obj.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const m = o.material;
      if (m) (Array.isArray(m) ? m : [m]).forEach((mm) => {
        for (const k in mm) if (mm[k] && mm[k].isTexture) mm[k].dispose();
        mm.dispose();
      });
    });
  }

  function applyWire() {
    if (!current) return;
    current.traverse((o) => {
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.wireframe = wire; });
    });
  }

  async function show(i) {
    const m = models[i];
    if (!m || !m.url) return;
    const token = ++loadToken;
    tabs.querySelectorAll('button').forEach((b, j) => b.classList.toggle('active', j === i));
    status.hidden = false; status.classList.remove('err');
    statusText.textContent = 'Loading model…'; bar.style.width = '0%';
    try {
      const obj = await loadObject(m.url, (ev) => {
        if (ev.lengthComputable) bar.style.width = `${Math.round((ev.loaded / ev.total) * 100)}%`;
      });
      if (disposed || token !== loadToken) { disposeObj(obj); return; }
      if (current) { scene.remove(current); disposeObj(current); }
      const wrap = new THREE.Group();
      const r = (m.rotation || [0, 0, 0]).map((d) => THREE.MathUtils.degToRad(Number(d) || 0));
      obj.rotation.set(r[0], r[1], r[2]);
      wrap.add(obj);
      scene.add(wrap);
      current = wrap;
      frame(wrap);
      applyWire();
      status.hidden = true;
    } catch (err) {
      if (token !== loadToken) return;
      console.error(err);
      status.classList.add('err');
      statusText.textContent = `Could not load model: ${err.message || err}`;
    }
  }

  if (models.length > 1) {
    models.forEach((m, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = m.label || `Model ${i + 1}`;
      b.addEventListener('click', () => show(i));
      tabs.appendChild(b);
    });
  } else {
    tabs.remove();
  }

  container.querySelector('.v3d-tools').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'rotate') { controls.autoRotate = !controls.autoRotate; setPressed('rotate', controls.autoRotate); }
    if (act === 'wire') { wire = !wire; applyWire(); setPressed('wire', wire); }
    if (act === 'reset' && home) { camera.position.copy(home.pos); controls.target.set(0, 0, 0); controls.update(); }
    if (act === 'full') {
      if (document.fullscreenElement) document.exitFullscreen();
      else container.requestFullscreen?.();
    }
  });

  function loop() {
    raf = requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }
  loop();
  show(0);

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      if (current) disposeObj(current);
      envTex.dispose(); pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      container.innerHTML = '';
    },
  };
}
