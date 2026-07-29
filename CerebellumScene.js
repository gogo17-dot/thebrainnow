import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CEREBELLUM_GLB_FILES } from './cerebellumManifest.js';
import cerebellumStructures from './cerebellumStructures.js';
import { createViewer, frameObject, disposeScene } from './shared/viewer.js';
import { THEME_COLORS } from './shared/theme.js';
import { modelUrl } from './paths.js';

const FADED_OPACITY = 0.14;

const SPECIAL_COLORS = {
  Superior_cerebellar_peduncle: { dark: 0xc9a86c, light: 0xd4a017 },
  Middle_cerebellar_peduncle: { dark: 0xb8956a, light: 0xc9892e },
  Inferior_cerebellar_peduncle: { dark: 0xa67c52, light: 0xb87a2e },
  Flocculus: { dark: 0x6a9e8a, light: 0x2e7d62 },
  Nodule_of_vermis: { dark: 0x5a8f7a, light: 0x1b7a5a },
  Tonsil_of_cerebellum: { dark: 0xc4785a, light: 0xe07040 },
  Dentate_nucleus: { dark: 0xd4a84a, light: 0xf0b429 },
  Interposed_nucleus: { dark: 0xc9923a, light: 0xe09830 },
  Fastigial_nucleus: { dark: 0xb87a2e, light: 0xd08028 },
};

function structureHue(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((hash * 137.508) % 360) / 360;
}

function baseColorForStructure(key, theme) {
  if (SPECIAL_COLORS[key]) {
    return new THREE.Color(SPECIAL_COLORS[key][theme] ?? SPECIAL_COLORS[key].dark);
  }

  const hue = structureHue(key);
  if (theme === 'light') {
    return new THREE.Color().setHSL(hue, 0.82, 0.5);
  }
  return new THREE.Color().setHSL(hue, 0.7, 0.56);
}

function forEachMaterial(material, fn) {
  if (Array.isArray(material)) material.forEach(fn);
  else fn(material);
}

function prepareMeshMaterial(material, structureKey, theme) {
  const sources = Array.isArray(material) ? material : [material];
  const baseColor = baseColorForStructure(structureKey, theme);
  const isDeepNucleus = structureKey.endsWith('_nucleus');

  const prepared = sources.map((source) => {
    const mat = source.clone();
    mat.side = THREE.DoubleSide;
    mat.color.copy(baseColor);
    mat.emissive = new THREE.Color(isDeepNucleus ? baseColor : 0x000000);
    mat.emissiveIntensity = isDeepNucleus ? 0.22 : 0;
    mat.metalness = isDeepNucleus ? 0.1 : 0.04;
    mat.roughness = isDeepNucleus ? 0.45 : 0.62;
    mat.transparent = false;
    mat.opacity = 1;
    mat.depthWrite = true;
    mat.userData.baseColor = baseColor.clone();
    mat.userData.structureKey = structureKey;
    mat.userData.isDeepNucleus = isDeepNucleus;
    return mat;
  });

  return Array.isArray(material) ? prepared : prepared[0];
}

function resolveStructureName(object, cerebellumGroup) {
  let node = object;
  while (node && node !== cerebellumGroup) {
    if (node.name && cerebellumStructures[node.name]) return node.name;
    node = node.parent;
  }
  return null;
}

export class CerebellumScene {
  constructor(canvas, { onSelect, onLoadProgress, theme = 'dark' } = {}) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    this.onLoadProgress = onLoadProgress;
    this.theme = theme;

    this.cerebellumGroup = new THREE.Group();
    this.cerebellumGroup.name = 'cerebellumGroup';
    this.structures = new Map();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.lastFrontName = null;
    this.clickDepth = 0;
    this.selectedName = null;
    this.pendingLoads = CEREBELLUM_GLB_FILES.length;
    this.loadedCount = 0;
    this.failedLoads = 0;
    this.loader = new GLTFLoader();
    this.disposed = false;

    const colors = THEME_COLORS[theme] ?? THEME_COLORS.dark;
    const viewer = createViewer(canvas, colors.scene);
    this.scene = viewer.scene;
    this.camera = viewer.camera;
    this.renderer = viewer.renderer;
    this.controls = viewer.controls;
    this.scene.add(this.cerebellumGroup);

    this.loadAllModels();
    this.bindInteraction();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('beforeunload', () => this.dispose());
  }

  setTheme(theme) {
    this.theme = theme;
    const colors = THEME_COLORS[theme] ?? THEME_COLORS.dark;
    this.scene.background = new THREE.Color(colors.scene);
    this.renderer.toneMappingExposure = theme === 'light' ? 1.38 : 1.2;
    this.applyThemeColors();
    this.applySelectionVisuals();
  }

  applyThemeColors() {
    for (const [key, entry] of this.structures) {
      const baseColor = baseColorForStructure(key, this.theme);
      for (const mesh of entry.meshes) {
        forEachMaterial(mesh.material, (mat) => {
          mat.color.copy(baseColor);
          mat.userData.baseColor = baseColor.clone();
        });
      }
    }
  }

  loadAllModels() {
    this.onLoadProgress?.(0, CEREBELLUM_GLB_FILES.length);

    for (const file of CEREBELLUM_GLB_FILES) {
      const key = file.replace(/\.glb$/i, '');
      const url = modelUrl(file);
      let settled = false;

      const finish = (success) => {
        if (settled || this.disposed) return;
        settled = true;
        window.clearTimeout(loadTimeout);
        this.onModelLoaded(success);
      };

      const loadTimeout = window.setTimeout(() => {
        this.failedLoads += 1;
        finish(false);
      }, 45000);

      this.loader.load(
        url,
        (gltf) => {
          const root = gltf.scene;
          root.name = key;
          const meshes = [];

          root.traverse((child) => {
            if (!child.isMesh) return;
            child.material = prepareMeshMaterial(child.material, key, this.theme);
            child.frustumCulled = false;
            meshes.push(child);
          });

          this.structures.set(key, { root, meshes });
          this.cerebellumGroup.add(root);
          finish(true);
        },
        undefined,
        () => {
          this.failedLoads += 1;
          finish(false);
        },
      );
    }
  }

  centerAssembly() {
    this.cerebellumGroup.position.set(0, 0, 0);
    this.cerebellumGroup.scale.set(1, 1, 1);
    this.cerebellumGroup.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(this.cerebellumGroup);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    this.cerebellumGroup.position.set(-center.x, -center.y, -center.z);
    this.cerebellumGroup.updateMatrixWorld(true);
  }

  onModelLoaded(success) {
    this.pendingLoads -= 1;
    if (success) this.loadedCount += 1;
    this.onLoadProgress?.(this.loadedCount, CEREBELLUM_GLB_FILES.length, false, this.failedLoads);

    if (this.pendingLoads > 0) return;

    this.centerAssembly();
    frameObject(this.camera, this.controls, this.cerebellumGroup);
    this.onLoadProgress?.(
      CEREBELLUM_GLB_FILES.length,
      CEREBELLUM_GLB_FILES.length,
      true,
      this.failedLoads,
    );
  }

  selectStructure(name) {
    this.selectedName = name;
    this.applySelectionVisuals();
  }

  clearSelection() {
    this.selectedName = null;
    this.lastFrontName = null;
    this.clickDepth = 0;
    this.applySelectionVisuals();
  }

  applySelectionVisuals() {
    for (const [key, { meshes }] of this.structures) {
      const isSelected = key === this.selectedName;
      const isFaded = this.selectedName != null && !isSelected;

      for (const mesh of meshes) {
        forEachMaterial(mesh.material, (mat) => {
          const base = mat.userData.baseColor ?? mat.color;

          if (isSelected) {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
            mat.emissive.copy(base);
            mat.emissiveIntensity = mat.userData.isDeepNucleus ? 0.75 : 0.55;
          } else if (isFaded) {
            mat.transparent = true;
            mat.opacity = FADED_OPACITY;
            mat.depthWrite = false;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          } else {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
            if (mat.userData.isDeepNucleus) {
              mat.emissive.copy(base);
              mat.emissiveIntensity = 0.22;
            } else {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          }
        });
      }
    }
  }

  getHits(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const intersections = this.raycaster.intersectObject(this.cerebellumGroup, true);
    const hits = [];

    for (const hit of intersections) {
      const name = resolveStructureName(hit.object, this.cerebellumGroup);
      if (!name) continue;
      hits.push({ name, distance: hit.distance, point: hit.point });
    }

    return hits;
  }

  handleClick(event) {
    const hits = this.getHits(event);
    if (!hits.length) {
      this.clearSelection();
      return;
    }

    const frontName = hits[0].name;
    let selected;

    if (frontName === this.lastFrontName) {
      this.clickDepth += 1;
      selected = hits[this.clickDepth % hits.length];
    } else {
      this.clickDepth = 0;
      this.lastFrontName = frontName;
      selected = hits[0];
    }

    const data = cerebellumStructures[selected.name];
    if (!data) return;

    this.selectStructure(selected.name);
    this.onSelect?.(data);
  }

  bindInteraction() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.handleClick(e);
    });
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    disposeScene(this.cerebellumGroup);
    this.renderer.dispose();
  }
}
