import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CEREBRAL_CORTEX_GLB_FILES } from './cerebralCortexManifest.js';
import cerebralCortexStructures from './cerebralCortexStructures.js';
import { BRAIN_STRUCTURE_META } from './brainStructureMeta.js';
import { BRAINSTEM_DETAIL_GLB_FILES } from './brainstemDetailManifest.js';
import brainstemDetailStructures from './brainstemDetailStructures.js';
import { createViewer, centerSceneOnce, frameObject, disposeScene, resizeViewer } from './viewer.js';
import { THEME_COLORS } from './theme.js';
import { modelUrl } from './paths.js';
import { layerIdForStructure } from './structureUiMeta.js';

const FADED_OPACITY = 0.14;
/** Emissive intensities that drive the interactive look. */
const EMISSIVE_BASE = 0.14;
const EMISSIVE_HOVER = 0.38;
const EMISSIVE_SELECTED = 0.55;

/** Fallback palette when a GLB has no distinctive authored color. */
const CATEGORY_COLORS = {
  Frontal: { dark: 0xd4a574, light: 0xc48a4a },
  Insula: { dark: 0xb07cc8, light: 0x8e5aa8 },
  Limbic: { dark: 0xd4789a, light: 0xc05078 },
  Occipital: { dark: 0x5b8fd9, light: 0x3a6fc0 },
  Parietal: { dark: 0x5cb8a0, light: 0x3a9880 },
  Temporal: { dark: 0xe0a85a, light: 0xc88830 },
  cerebellum: { dark: 0xc9a06a, light: 0xb88848 },
  brainstem: { dark: 0x8f7a9e, light: 0x6f5a7e },
  Midbrain: { dark: 0xc49a5a, light: 0xa87838 },
  Pons: { dark: 0x8f72b5, light: 0x705398 },
  Medulla_oblongata: { dark: 0x638fb8, light: 0x47759e },
  overview: { dark: 0xa090b0, light: 0x807090 },
  cranial_nerves: { dark: 0xf0e6c8, light: 0xd8c898 },
  BasalForebrain: { dark: 0xc46888, light: 0xa84868 },
  Diencephalon: { dark: 0x7a9ad0, light: 0x5a7ab8 },
  Striatum: { dark: 0x6aa8e0, light: 0x4a88c8 },
  Ventricles_WhiteMatter: { dark: 0xd8e6f2, light: 0xb8c8d8 },
  Artery: { dark: 0xd45a5a, light: 0xc04040 },
  Vein: { dark: 0x5a7ad0, light: 0x4060b8 },
  commissures: { dark: 0xe8dcc0, light: 0xd0c0a0 },
  deep_nuclei: { dark: 0xd4c48a, light: 0xc4a84a },
};

function colorKeyForStructure(key) {
  if (brainstemDetailStructures[key]) return key;

  const meta = BRAIN_STRUCTURE_META[key];
  if (meta) {
    if (meta.category === 'cortex') {
      if (/Frontal/i.test(key) || /frontal lobe/i.test(meta.id)) return 'Frontal';
      if (/Insula/i.test(key) || /insula/i.test(meta.id)) return 'Insula';
      if (/Limbic/i.test(key) || /limbic/i.test(meta.id)) return 'Limbic';
      if (/Occipital/i.test(key) || /occipital/i.test(meta.id)) return 'Occipital';
      if (/Parietal/i.test(key) || /parietal/i.test(meta.id)) return 'Parietal';
      if (/Temporal/i.test(key) || /temporal/i.test(meta.id)) return 'Temporal';
      return 'Frontal';
    }
    if (meta.category === 'overview') {
      if (/Cerebellum/i.test(key)) return 'cerebellum';
      if (/Brainstem/i.test(key)) return 'brainstem';
      return 'overview';
    }
    if (meta.category === 'subcortical' && meta.subgroup) return meta.subgroup;
    if (meta.category === 'vasculature') {
      if (key.startsWith('Artery_') || /artery/i.test(key)) return 'Artery';
      if (key.startsWith('Vein_') || /sinus|vein|jugular/i.test(key)) return 'Vein';
    }
    return meta.category;
  }

  // Filename fallback if meta is missing
  const base = key.endsWith('.l') || key.endsWith('.r') ? key.slice(0, -2) : key;
  if (/Frontal_lobe/i.test(base)) return 'Frontal';
  if (/^Insula$/i.test(base)) return 'Insula';
  if (/Limbic_lobe/i.test(base)) return 'Limbic';
  if (/Occipital_lobe/i.test(base)) return 'Occipital';
  if (/Parietal_lobe/i.test(base)) return 'Parietal';
  if (/Temporal_lobe/i.test(base)) return 'Temporal';
  if (/^Cerebellum$/i.test(base)) return 'cerebellum';
  if (/^Brainstem$/i.test(base)) return 'brainstem';

  const prefixes = [
    'Ventricles_WhiteMatter',
    'BasalForebrain',
    'Diencephalon',
    'Striatum',
    'Cerebellum',
    'Artery',
    'Vein',
  ];
  for (const prefix of prefixes) {
    if (base === prefix || base.startsWith(`${prefix}_`)) {
      if (prefix === 'Cerebellum') return 'cerebellum';
      return prefix;
    }
  }
  if (/nerve/i.test(base)) return 'cranial_nerves';
  if (/commissure|corpus callosum|^Fornix$/i.test(base)) return 'commissures';
  return null;
}

function structureHue(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((hash * 137.508) % 360) / 360;
}

function fallbackColorForStructure(key, theme) {
  const colorKey = colorKeyForStructure(key);
  if (colorKey && CATEGORY_COLORS[colorKey]) {
    const pair = CATEGORY_COLORS[colorKey];
    return new THREE.Color(pair[theme] ?? pair.dark);
  }

  const hue = structureHue(key);
  if (theme === 'light') {
    return new THREE.Color().setHSL(hue, 0.82, 0.5);
  }
  return new THREE.Color().setHSL(hue, 0.7, 0.56);
}

/** True when the authored GLB color looks intentionally painted (not blank white/black). */
function isAuthoredPaintColor(color) {
  if (!color) return false;
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  const sat = max - min;
  const lum = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  if (sat > 0.04) return true;
  return lum > 0.12 && lum < 0.9;
}

function resolveStructurePaint(source, structureKey, theme) {
  const authored = source?.color?.clone?.() ?? null;
  if (source?.map) {
    // Texture carries look — keep authored tint (usually white).
    return authored ?? new THREE.Color(0xffffff);
  }
  if (isAuthoredPaintColor(authored)) return authored;
  return fallbackColorForStructure(structureKey, theme);
}

function forEachMaterial(material, fn) {
  if (Array.isArray(material)) material.forEach(fn);
  else fn(material);
}

function prepareMeshMaterial(material, structureKey, theme) {
  const sources = Array.isArray(material) ? material : [material];
  const meta = BRAIN_STRUCTURE_META[structureKey];
  const isDeepNucleus =
    meta?.category === 'deep_nuclei' ||
    /nucleus|substantia|locus|periaqueductal/i.test(structureKey);

  const prepared = sources.map((source) => {
    const mat = source.clone();
    const baseColor = resolveStructurePaint(source, structureKey, theme);
    mat.side = THREE.DoubleSide;
    mat.color.copy(baseColor);
    mat.emissive = baseColor.clone().multiplyScalar(0.1);
    mat.emissiveIntensity = isDeepNucleus ? 0.24 : EMISSIVE_BASE;
    mat.metalness = 0;
    mat.roughness = 0.78;
    mat.transparent = false;
    mat.opacity = 1;
    mat.depthWrite = true;
    mat.userData.baseColor = baseColor.clone();
    mat.userData.structureKey = structureKey;
    mat.userData.isDeepNucleus = isDeepNucleus;
    mat.userData.baseEmissiveIntensity = mat.emissiveIntensity;
    mat.userData.usesAuthoredPaint =
      Boolean(source?.map) || isAuthoredPaintColor(source?.color);
    return mat;
  });

  return Array.isArray(material) ? prepared : prepared[0];
}

function resolveStructureName(object, cortexGroup) {
  let node = object;
  while (node && node !== cortexGroup) {
    if (
      node.name &&
      (cerebralCortexStructures[node.name] || brainstemDetailStructures[node.name])
    ) {
      return node.name;
    }
    node = node.parent;
  }
  return null;
}

function displayTitleForKey(key, rawTitle) {
  const source = rawTitle || key.replace(/_/g, ' ');
  return source
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .replace(/\bViii\b/g, 'VIII')
    .replace(/\bIi\b/g, 'II')
    .replace(/\bIii\b/g, 'III');
}

function groupIdForKey(key, meta) {
  if (brainstemDetailStructures[key]) return 'brainstem_detail';
  if (!meta) return 'other';
  if (meta.category === 'cortex') return 'cortex';
  if (meta.category === 'overview') return 'overview';
  if (meta.category === 'commissures') return 'commissures';
  if (meta.category === 'cranial_nerves') return 'cranial_nerves';
  if (meta.subgroup === 'BasalForebrain') return 'BasalForebrain';
  if (meta.subgroup === 'Diencephalon') return 'Diencephalon';
  if (meta.subgroup === 'Striatum') return 'Striatum';
  if (meta.subgroup === 'Ventricles' || meta.subgroup === 'Ventricles_WhiteMatter') {
    return 'Ventricles';
  }
  return meta.category || 'other';
}

function groupLabelForKey(key, meta) {
  const id = groupIdForKey(key, meta);
  const labels = {
    cortex: 'Cerebral cortex',
    overview: 'Overview',
    commissures: 'Commissures',
    BasalForebrain: 'Basal forebrain',
    Diencephalon: 'Diencephalon',
    Striatum: 'Basal ganglia / striatum',
    Ventricles: 'Ventricles & white matter',
    cranial_nerves: 'Cranial nerves',
    brainstem_detail: 'Brainstem parts',
    other: 'Other',
  };
  return labels[id] || 'Other';
}

export class CerebralCortexScene {
  constructor(canvas, {
    onSelect,
    onLoadProgress,
    onSelectionChange,
    onReady,
    theme = 'dark',
  } = {}) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    this.onLoadProgress = onLoadProgress;
    this.onSelectionChange = onSelectionChange;
    this.onReady = onReady;
    this.theme = theme;

    this.assemblyRoot = new THREE.Group();
    this.assemblyRoot.name = 'assemblyRoot';
    this.cortexGroup = new THREE.Group();
    this.cortexGroup.name = 'cerebralCortexGroup';
    this.assemblyRoot.add(this.cortexGroup);
    this.brainstemDetailGroup = new THREE.Group();
    this.brainstemDetailGroup.name = 'brainstemDetailGroup';
    this.brainstemDetailGroup.visible = false;
    this.cortexGroup.add(this.brainstemDetailGroup);
    this.structures = new Map();
    this.brainstemDetailStructures = new Map();
    this.brainstemDetailActive = false;
    this.pendingBrainstemDetailLoads = BRAINSTEM_DETAIL_GLB_FILES.length;
    this.centerState = { centered: false };
    this.explodeAmount = 0;
    this.explodeReady = false;
    this.labelEl = null;
    this._labelWorld = new THREE.Vector3();
    this._labelNdc = new THREE.Vector3();
    this.mainLoadDone = false;
    this._readyNotified = false;
    this.homeView = null;
    this.layerVisibility = {
      cortex: true,
      deep: true,
      ventricles: true,
      overview: true,
      nerves: true,
    };

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.lastFrontName = null;
    this.clickDepth = 0;
    this.selectedName = null;
    this.hoveredName = null;
    this.pendingHoverEvent = null;
    this.hoverDirty = false;
    this.pendingLoads = CEREBRAL_CORTEX_GLB_FILES.length;
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
    this.scene.add(this.assemblyRoot);

    this.loadAllModels();
    this.loadBrainstemDetails();
    this.bindInteraction();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('beforeunload', () => this.dispose());
  }

  getStructureEntry(name) {
    return this.structures.get(name) ?? this.brainstemDetailStructures.get(name) ?? null;
  }

  getStructureCatalog() {
    const items = [];

    for (const key of this.structures.keys()) {
      const data = cerebralCortexStructures[key];
      if (!data) continue;
      const meta = BRAIN_STRUCTURE_META[key];
      items.push({
        key,
        title: displayTitleForKey(key, data.title),
        groupId: groupIdForKey(key, meta),
        groupLabel: groupLabelForKey(key, meta),
      });
    }

    for (const key of this.brainstemDetailStructures.keys()) {
      const data = brainstemDetailStructures[key];
      if (!data) continue;
      items.push({
        key,
        title: displayTitleForKey(key, data.title),
        groupId: 'brainstem_detail',
        groupLabel: 'Brainstem parts',
      });
    }

    const groupRank = (id) => {
      const order = [
        'cortex',
        'overview',
        'commissures',
        'BasalForebrain',
        'Diencephalon',
        'Striatum',
        'Ventricles',
        'cranial_nerves',
        'brainstem_detail',
        'other',
      ];
      const i = order.indexOf(id);
      return i < 0 ? order.length : i;
    };

    items.sort((a, b) => {
      const g = groupRank(a.groupId) - groupRank(b.groupId);
      if (g !== 0) return g;
      return a.title.localeCompare(b.title);
    });

    return items;
  }

  getLabelText(name) {
    if (!name) return '';
    const data =
      cerebralCortexStructures[name] ?? brainstemDetailStructures[name];
    return displayTitleForKey(name, data?.title);
  }

  captureExplodeBases() {
    this.assemblyRoot.updateMatrixWorld(true);
    // Non-precise bounds: fast enough for isolate directions (avoid vertex scan freeze).
    const assemblyBox = new THREE.Box3().setFromObject(this.assemblyRoot, false);
    if (assemblyBox.isEmpty()) {
      this.explodeReady = false;
      return;
    }

    const assemblyCenter = assemblyBox.getCenter(new THREE.Vector3());
    const span = assemblyBox.getSize(new THREE.Vector3()).length();
    const maxDist = Math.max(span * 0.28, 0.15);
    const parentInv = new THREE.Matrix4();
    const worldDir = new THREE.Vector3();
    const localDir = new THREE.Vector3();
    const center = new THREE.Vector3();

    const capture = (map) => {
      for (const [, entry] of map) {
        const root = entry.root;
        const parent = root.parent;
        if (!parent) continue;
        parent.updateMatrixWorld(true);
        parentInv.copy(parent.matrixWorld).invert();

        const box = new THREE.Box3().setFromObject(root, false);
        if (box.isEmpty()) continue;
        box.getCenter(center);

        worldDir.copy(center).sub(assemblyCenter);
        if (worldDir.lengthSq() < 1e-10) worldDir.set(0, 1, 0);
        else worldDir.normalize();

        localDir.copy(worldDir).transformDirection(parentInv).normalize();
        root.userData.restPosition = root.position.clone();
        root.userData.explodeDirLocal = localDir.clone();
        root.userData.explodeDistance = maxDist;
      }
    };

    capture(this.structures);
    capture(this.brainstemDetailStructures);
    this.explodeReady = true;
    this.setExplodeAmount(this.explodeAmount);
  }

  setExplodeAmount(amount) {
    this.explodeAmount = Math.max(0, Math.min(1, Number(amount) || 0));
    if (!this.explodeReady) return;

    const apply = (map) => {
      for (const [, entry] of map) {
        const root = entry.root;
        const rest = root.userData.restPosition;
        const dir = root.userData.explodeDirLocal;
        const dist = root.userData.explodeDistance ?? 0;
        if (!rest || !dir) continue;
        root.position.copy(rest).addScaledVector(dir, dist * this.explodeAmount);
      }
    };

    apply(this.structures);
    apply(this.brainstemDetailStructures);
  }

  setLayerVisible(layerId, visible) {
    if (!(layerId in this.layerVisibility)) return;
    this.layerVisibility[layerId] = Boolean(visible);
    this.applyLayerVisibility();

    if (
      this.selectedName &&
      this.layerIdForKey(this.selectedName) === layerId &&
      !visible
    ) {
      this.clearSelection();
    }
  }

  layerIdForKey(key) {
    if (brainstemDetailStructures[key]) return 'overview';
    return layerIdForStructure(key, BRAIN_STRUCTURE_META[key]);
  }

  applyLayerVisibility() {
    for (const [key, entry] of this.structures) {
      const layerOn = this.layerVisibility[this.layerIdForKey(key)] !== false;
      if (key === 'Brainstem' && this.brainstemDetailActive) {
        entry.root.visible = false;
      } else {
        entry.root.visible = layerOn;
      }
    }

    const overviewOn = this.layerVisibility.overview !== false;
    this.brainstemDetailGroup.visible = this.brainstemDetailActive && overviewOn;
    for (const [key, entry] of this.brainstemDetailStructures) {
      entry.root.visible = overviewOn;
    }
  }

  saveHomeView() {
    this.homeView = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
      minDistance: this.controls.minDistance,
      maxDistance: this.controls.maxDistance,
      near: this.camera.near,
      far: this.camera.far,
    };
  }

  resetView() {
    this.exitBrainstemDetail();
    this.selectedName = null;
    this.hoveredName = null;
    this.lastFrontName = null;
    this.clickDepth = 0;

    for (const id of Object.keys(this.layerVisibility)) {
      this.layerVisibility[id] = true;
    }
    this.applyLayerVisibility();
    this.setExplodeAmount(0);

    if (this.homeView) {
      this.camera.position.copy(this.homeView.position);
      this.controls.target.copy(this.homeView.target);
      this.controls.minDistance = this.homeView.minDistance;
      this.controls.maxDistance = this.homeView.maxDistance;
      this.camera.near = this.homeView.near;
      this.camera.far = this.homeView.far;
      this.camera.updateProjectionMatrix();
      this.controls.update();
    } else {
      frameObject(this.camera, this.controls, this.assemblyRoot);
    }

    this.applySelectionVisuals();
    this.notifySelectionChange();
  }

  frameStructure(name) {
    const entry = this.getStructureEntry(name);
    if (!entry?.root?.visible) {
      frameObject(this.camera, this.controls, this.assemblyRoot);
      return;
    }
    frameObject(this.camera, this.controls, entry.root);
  }

  notifySelectionChange() {
    this.onSelectionChange?.(this.selectedName);
  }

  projectStructureToCanvas(name, out = this._labelNdc) {
    const entry = this.getStructureEntry(name);
    if (!entry?.root || (entry.root.visible === false && name !== 'Brainstem')) {
      return null;
    }

    // Prefer a visible root; brainstem overview may be hidden in detail mode.
    let target = entry.root;
    if (name === 'Brainstem' && this.brainstemDetailActive) {
      target = this.brainstemDetailGroup;
    }
    if (!target.visible) return null;

    const box = new THREE.Box3().setFromObject(target, true);
    if (box.isEmpty()) return null;

    this._labelWorld.set(
      (box.min.x + box.max.x) * 0.5,
      box.max.y,
      (box.min.z + box.max.z) * 0.5,
    );
    out.copy(this._labelWorld).project(this.camera);
    if (out.z > 1) return null;

    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (out.x * 0.5 + 0.5) * rect.width,
      y: (-out.y * 0.5 + 0.5) * rect.height,
      rect,
    };
  }

  updateFloatingLabel(labelEl) {
    if (!labelEl) return;
    const name = this.hoveredName || this.selectedName;
    if (!name) {
      labelEl.hidden = true;
      return;
    }

    const projected = this.projectStructureToCanvas(name);
    if (!projected) {
      labelEl.hidden = true;
      return;
    }

    labelEl.hidden = false;
    labelEl.textContent = this.getLabelText(name);
    labelEl.style.transform = `translate(${projected.x}px, ${projected.y}px) translate(-50%, -130%)`;
  }

  setTheme(theme) {
    this.theme = theme;
    const colors = THEME_COLORS[theme] ?? THEME_COLORS.dark;
    this.scene.background = new THREE.Color(colors.scene);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.applyThemeColors();
    this.applySelectionVisuals();
  }

  applyThemeColors() {
    const allStructures = [
      ...this.structures,
      ...this.brainstemDetailStructures,
    ];
    for (const [key, entry] of allStructures) {
      for (const mesh of entry.meshes) {
        forEachMaterial(mesh.material, (mat) => {
          // Keep GLB-authored paints; only theme-swap synthetic fallbacks.
          if (!mat.userData.usesAuthoredPaint) {
            const baseColor = fallbackColorForStructure(key, this.theme);
            mat.userData.baseColor = baseColor.clone();
            mat.color.copy(baseColor);
          }
          const base = mat.userData.baseColor ?? mat.color;
          if (this.selectedName !== key) {
            mat.emissive.copy(base).multiplyScalar(0.1);
            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? EMISSIVE_BASE;
          }
        });
      }
    }
    this.applySelectionVisuals();
  }

  loadBrainstemDetails() {
    for (const file of BRAINSTEM_DETAIL_GLB_FILES) {
      const key = file.replace(/\.glb$/i, '');
      this.loader.load(
        modelUrl(file),
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

          this.brainstemDetailStructures.set(key, { root, meshes });
          this.brainstemDetailGroup.add(root);
          this.onBrainstemDetailSettled();
        },
        undefined,
        () => this.onBrainstemDetailSettled(),
      );
    }
  }

  onBrainstemDetailSettled() {
    this.pendingBrainstemDetailLoads -= 1;
    if (this.pendingBrainstemDetailLoads === 0 && this.brainstemDetailActive) {
      this.applySelectionVisuals();
    }
    this.tryFinalizeReady();
  }

  loadAllModels() {
    this.onLoadProgress?.(0, CEREBRAL_CORTEX_GLB_FILES.length);

    for (const file of CEREBRAL_CORTEX_GLB_FILES) {
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
          try {
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
            this.cortexGroup.add(root);
            finish(true);
          } catch (err) {
            console.error('Failed to prepare model', key, err);
            this.failedLoads += 1;
            finish(false);
          }
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
    // Full scene content under assemblyRoot — once only; never per-GLB / per-group.
    centerSceneOnce(this.assemblyRoot, this.centerState);
  }

  onModelLoaded(success) {
    this.pendingLoads -= 1;
    if (success) this.loadedCount += 1;
    this.onLoadProgress?.(this.loadedCount, CEREBRAL_CORTEX_GLB_FILES.length, false, this.failedLoads);

    if (this.pendingLoads > 0) return;

    this.centerAssembly();
    frameObject(this.camera, this.controls, this.assemblyRoot);
    resizeViewer(this.camera, this.renderer, this.canvas);
    frameObject(this.camera, this.controls, this.assemblyRoot);

    const box = new THREE.Box3().setFromObject(this.assemblyRoot, true);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    window.__cortexDebug = {
      assemblyPos: this.assemblyRoot.position.toArray(),
      centered: this.centerState.centered,
      bboxCenter: center.toArray(),
      bboxSize: size.toArray(),
      cameraPos: this.camera.position.toArray(),
      target: this.controls.target.toArray(),
      aspect: this.camera.aspect,
      canvas: [this.canvas.clientWidth, this.canvas.clientHeight],
      meshCounts: Object.fromEntries(
        [...this.structures].map(([k, v]) => [k, v.meshes.length]),
      ),
    };

    this.onLoadProgress?.(
      CEREBRAL_CORTEX_GLB_FILES.length,
      CEREBRAL_CORTEX_GLB_FILES.length,
      true,
      this.failedLoads,
    );

    this.mainLoadDone = true;
    this.applySelectionVisuals();
    this.tryFinalizeReady();
  }

  tryFinalizeReady() {
    if (this._readyNotified) return;
    if (!this.mainLoadDone || this.pendingBrainstemDetailLoads > 0) return;

    this._readyNotified = true;

    try {
      this.applyLayerVisibility();
      this.saveHomeView();
      this.onReady?.(this.getStructureCatalog());
    } catch (err) {
      console.error('Ready finalize failed', err);
      this.onReady?.([]);
    }

    // Heavy bounds work — defer so the UI (tip, list, clicks) stays responsive.
    window.setTimeout(() => {
      if (this.disposed) return;
      try {
        this.captureExplodeBases();
      } catch (err) {
        console.warn('Explode setup skipped', err);
        this.explodeReady = false;
      }
    }, 0);
  }

  emitSelect(name) {
    const data =
      cerebralCortexStructures[name] ?? brainstemDetailStructures[name];
    if (!data) return;

    let description = data.description;
    if (name === 'Brainstem') {
      description = `${data.description}\n\nDetailed segments are shown: select midbrain, pons, or medulla for a closer look. Close the panel or click empty space to return.`;
    }

    this.onSelect?.({
      key: name,
      title: data.title,
      description,
    });
  }

  selectStructure(name, { frame = false, emit = true } = {}) {
    if (brainstemDetailStructures[name]) {
      if (!this.brainstemDetailActive) this.enterBrainstemDetail({ emit: false });
      this.selectedName = name;
      this.applySelectionVisuals();
      this.notifySelectionChange();
      if (frame) this.frameStructure(name);
      if (emit) this.emitSelect(name);
      return;
    }

    if (name === 'Brainstem') {
      this.enterBrainstemDetail({ emit });
      if (frame) frameObject(this.camera, this.controls, this.brainstemDetailGroup);
      return;
    }

    if (this.brainstemDetailActive) this.exitBrainstemDetail();
    this.selectedName = name;
    this.applySelectionVisuals();
    this.notifySelectionChange();
    if (frame) this.frameStructure(name);
    if (emit) this.emitSelect(name);
  }

  enterBrainstemDetail({ emit = true } = {}) {
    this.brainstemDetailActive = true;
    this.selectedName = 'Brainstem';
    const overview = this.structures.get('Brainstem');
    if (overview) overview.root.visible = false;
    this.applyLayerVisibility();
    this.applySelectionVisuals();
    this.notifySelectionChange();
    if (emit) this.emitSelect('Brainstem');
  }

  exitBrainstemDetail() {
    if (!this.brainstemDetailActive) return;
    this.brainstemDetailActive = false;
    this.applyLayerVisibility();
  }

  clearSelection() {
    this.exitBrainstemDetail();
    this.selectedName = null;
    this.lastFrontName = null;
    this.clickDepth = 0;
    this.applySelectionVisuals();
    this.notifySelectionChange();
  }

  applySelectionVisuals() {
    for (const [key, { meshes }] of this.structures) {
      const isSelected = key === this.selectedName;
      const isHovered = key === this.hoveredName && !isSelected;
      const isFaded = this.selectedName != null && !isSelected && !isHovered;

      for (const mesh of meshes) {
        forEachMaterial(mesh.material, (mat) => {
          const base = mat.userData.baseColor ?? mat.color;

          if (isSelected) {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
            mat.emissive.copy(base);
            mat.emissiveIntensity = EMISSIVE_SELECTED;
          } else if (isHovered) {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
            mat.emissive.copy(base);
            mat.emissiveIntensity = EMISSIVE_HOVER;
          } else if (isFaded) {
            mat.transparent = true;
            mat.opacity = FADED_OPACITY;
            mat.depthWrite = false;
            mat.emissive.copy(base).multiplyScalar(0.08);
            mat.emissiveIntensity = 0.08;
          } else {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
            mat.emissive.copy(base).multiplyScalar(0.1);
            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? EMISSIVE_BASE;
          }
        });
      }
    }

    for (const [key, { meshes }] of this.brainstemDetailStructures) {
      const isSelected = key === this.selectedName;
      const isHovered = key === this.hoveredName && !isSelected;
      const showAllDetails =
        this.brainstemDetailActive && this.selectedName === 'Brainstem';
      const isFaded =
        this.brainstemDetailActive && !showAllDetails && !isSelected && !isHovered;

      for (const mesh of meshes) {
        forEachMaterial(mesh.material, (mat) => {
          const base = mat.userData.baseColor ?? mat.color;
          mat.transparent = isFaded;
          mat.opacity = isFaded ? FADED_OPACITY : 1;
          mat.depthWrite = !isFaded;
          if (isSelected) {
            mat.emissive.copy(base);
            mat.emissiveIntensity = EMISSIVE_SELECTED;
          } else if (isHovered) {
            mat.emissive.copy(base);
            mat.emissiveIntensity = EMISSIVE_HOVER;
          } else {
            mat.emissive.copy(base).multiplyScalar(0.1);
            mat.emissiveIntensity = mat.userData.baseEmissiveIntensity ?? EMISSIVE_BASE;
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

    const hitTarget = this.brainstemDetailActive
      ? this.brainstemDetailGroup
      : this.cortexGroup;
    const intersections = this.raycaster.intersectObject(hitTarget, true);
    const hits = [];

    for (const hit of intersections) {
      const name = resolveStructureName(hit.object, this.cortexGroup);
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

    const data =
      cerebralCortexStructures[selected.name] ??
      brainstemDetailStructures[selected.name];
    if (!data) return;

    this.selectStructure(selected.name, { frame: false, emit: true });
  }

  bindInteraction() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.handleClick(e);
    });
    // Defer the actual raycast to the render loop so we hover at most once per frame.
    this.canvas.addEventListener('pointermove', (e) => {
      this.pendingHoverEvent = e;
      this.hoverDirty = true;
    });
    this.canvas.addEventListener('pointerleave', () => {
      this.pendingHoverEvent = null;
      this.hoverDirty = false;
      this.setHovered(null);
      this.canvas.style.cursor = '';
    });
  }

  processHover() {
    if (!this.hoverDirty || !this.pendingHoverEvent) return;
    this.hoverDirty = false;
    const hits = this.getHits(this.pendingHoverEvent);
    const name = hits[0]?.name ?? null;
    this.canvas.style.cursor = name ? 'pointer' : '';
    this.setHovered(name);
  }

  setHovered(name) {
    if (this.hoveredName === name) return;
    this.hoveredName = name;
    this.applySelectionVisuals();
  }

  onResize() {
    resizeViewer(this.camera, this.renderer, this.canvas);
  }

  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    this.processHover();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateFloatingLabel(this.labelEl);
  }

  setLabelElement(el) {
    this.labelEl = el;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    disposeScene(this.assemblyRoot);
    this.renderer.dispose();
  }
}

