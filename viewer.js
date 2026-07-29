import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function resizeViewer(camera, renderer, canvas = renderer.domElement) {
  // Let CSS (#scene { width/height: 100% }) own layout — don't stamp px inline sizes.
  canvas.style.width = '';
  canvas.style.height = '';

  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  if (width < 2 || height < 2) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
}

export function createViewer(canvas, sceneBackground) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sceneBackground);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.001, 100);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Milder tone mapping avoids crushing the far side of curved anatomy into dark shade.
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;

  resizeViewer(camera, renderer, canvas);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 0.5;
  controls.maxDistance = 8;

  // Near-flat lighting: strong ambient + mirrored side fills so left/right
  // hemispheres stay evenly lit (no darker "shadow" side).
  scene.add(new THREE.AmbientLight(0xffffff, 1.35));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8dce8, 0.55));
  const left = new THREE.DirectionalLight(0xffffff, 0.35);
  left.position.set(-1, 0.4, 0.35);
  scene.add(left);
  const right = new THREE.DirectionalLight(0xffffff, 0.35);
  right.position.set(1, 0.4, 0.35);
  scene.add(right);
  const front = new THREE.DirectionalLight(0xffffff, 0.28);
  front.position.set(0, 0.2, 1);
  scene.add(front);
  const back = new THREE.DirectionalLight(0xffffff, 0.22);
  back.position.set(0, 0.35, -1);
  scene.add(back);

  return { scene, camera, renderer, controls };
}

/**
 * Center the full anatomy assembly once (all content under assemblyRoot).
 * Does not touch individual GLB roots — only offsets the shared scene root.
 */
export function centerSceneOnce(assemblyRoot, state) {
  if (state?.centered) return false;

  assemblyRoot.position.set(0, 0, 0);
  assemblyRoot.scale.set(1, 1, 1);
  assemblyRoot.updateMatrixWorld(true);

  // precise=true: vertex bounds (needed — striatum nodes use negative scale)
  const box = new THREE.Box3().setFromObject(assemblyRoot, true);
  if (box.isEmpty()) return false;

  const center = box.getCenter(new THREE.Vector3());
  assemblyRoot.position.set(-center.x, -center.y, -center.z);
  assemblyRoot.updateMatrixWorld(true);

  if (state) state.centered = true;
  return true;
}

export function frameObject(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object, true);
  if (box.isEmpty()) return;

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  const fovRad = (camera.fov * Math.PI) / 180;
  const fitDistance = maxDim / (2 * Math.tan(fovRad / 2));
  const distance = fitDistance * 1.85;

  controls.target.copy(center);
  camera.position.set(
    center.x + distance * 0.18,
    center.y + distance * 0.12,
    center.z + distance,
  );

  controls.minDistance = distance * 0.25;
  controls.maxDistance = distance * 4;
  camera.near = Math.max(distance / 1000, 0.001);
  camera.far = distance * 20;
  camera.updateProjectionMatrix();
  controls.update();
}

export function disposeScene(root) {
  root.traverse((child) => {
    if (child.isMesh || child.isLine || child.isLineSegments) {
      child.geometry?.dispose();
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat) => mat?.dispose());
    }
  });
}
