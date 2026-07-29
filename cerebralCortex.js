import { initTheme, getTheme } from './shared/theme.js';
import { initInfoPanel, showInfoPanel, hideInfoPanel } from './shared/infoPanel.js';
import { CerebralCortexScene } from './CerebralCortexScene.js';
import { LAYER_DEFS } from './structureUiMeta.js';

const TIP_KEY = 'atlas-viewer-tip-v1';

const loadingEl = document.getElementById('loading-banner');
const listEl = document.getElementById('structure-list');
const searchEl = document.getElementById('structure-search');
const explodeSlider = document.getElementById('explode-slider');
const explodeValue = document.getElementById('explode-value');
const labelEl = document.getElementById('structure-label');
const layerTogglesEl = document.getElementById('layer-toggles');
const resetBtn = document.getElementById('reset-view');
const tipEl = document.getElementById('viewer-tip');
const tipDismiss = document.getElementById('tip-dismiss');

let scene = null;
let catalog = [];

function updateLoading(loaded, total, done = false, failed = 0) {
  if (!loadingEl) return;

  if (done) {
    if (failed >= total || loaded === 0) {
      loadingEl.hidden = false;
      loadingEl.textContent =
        'Could not load 3D models. Ensure public/brainstem_glb/ is committed and pushed to GitHub.';
      return;
    }
    loadingEl.hidden = true;
    return;
  }

  loadingEl.hidden = false;
  loadingEl.textContent = `Loading anatomical models… ${loaded}/${total}`;
}

function dismissTip(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (tipEl) {
    tipEl.hidden = true;
    tipEl.classList.remove('is-visible');
  }
  try {
    localStorage.setItem(TIP_KEY, '1');
  } catch {
    /* ignore */
  }
}

function maybeShowTip() {
  if (!tipEl) return;
  try {
    if (localStorage.getItem(TIP_KEY) === '1') return;
  } catch {
    /* ignore */
  }
  tipEl.hidden = false;
  tipEl.classList.add('is-visible');
}

function renderStructureList(filter = '') {
  if (!listEl) return;

  const q = filter.trim().toLowerCase();
  const filtered = catalog.filter((item) => {
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.groupLabel.toLowerCase().includes(q)
    );
  });

  listEl.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'structure-browser__empty';
    empty.textContent = 'No matching structures.';
    listEl.appendChild(empty);
    return;
  }

  let currentGroup = null;
  const selected = scene?.selectedName ?? null;

  for (const item of filtered) {
    if (item.groupId !== currentGroup) {
      currentGroup = item.groupId;
      const group = document.createElement('div');
      group.className = 'structure-group';
      const label = document.createElement('div');
      label.className = 'structure-group__label';
      label.textContent = item.groupLabel;
      group.appendChild(label);
      listEl.appendChild(group);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'structure-item';
    btn.dataset.key = item.key;
    btn.textContent = item.title;
    if (item.key === selected) btn.classList.add('is-active');
    btn.addEventListener('click', () => {
      scene?.selectStructure(item.key, { frame: true, emit: true });
    });

    const lastGroup = listEl.lastElementChild;
    if (lastGroup?.classList.contains('structure-group')) {
      lastGroup.appendChild(btn);
    } else {
      listEl.appendChild(btn);
    }
  }
}

function syncListSelection(selectedName) {
  if (!listEl) return;
  for (const btn of listEl.querySelectorAll('.structure-item')) {
    btn.classList.toggle('is-active', btn.dataset.key === selectedName);
  }
  if (!selectedName) hideInfoPanel();
}

function syncExplodeUi(amount = 0) {
  const pct = Math.round(amount * 100);
  if (explodeSlider) {
    explodeSlider.value = String(pct);
    explodeSlider.setAttribute('aria-valuenow', String(pct));
  }
  if (explodeValue) explodeValue.textContent = `${pct}%`;
}

function syncLayerToggleUi() {
  if (!layerTogglesEl || !scene) return;
  for (const btn of layerTogglesEl.querySelectorAll('.layer-toggle')) {
    const id = btn.dataset.layer;
    const on = scene.layerVisibility[id] !== false;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

function renderLayerToggles() {
  if (!layerTogglesEl) return;
  layerTogglesEl.replaceChildren();

  for (const layer of LAYER_DEFS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layer-toggle is-on';
    btn.dataset.layer = layer.id;
    btn.textContent = layer.label;
    btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', () => {
      const next = !(scene?.layerVisibility[layer.id] !== false);
      scene?.setLayerVisible(layer.id, next);
      syncLayerToggleUi();
    });
    layerTogglesEl.appendChild(btn);
  }
}

function bindBrowserUi() {
  searchEl?.addEventListener('input', () => {
    renderStructureList(searchEl.value);
  });

  explodeSlider?.addEventListener('input', () => {
    const pct = Number(explodeSlider.value) || 0;
    if (explodeValue) explodeValue.textContent = `${pct}%`;
    explodeSlider.setAttribute('aria-valuenow', String(pct));
    scene?.setExplodeAmount(pct / 100);
  });

  resetBtn?.addEventListener('click', () => {
    scene?.resetView();
    syncExplodeUi(0);
    syncLayerToggleUi();
    hideInfoPanel();
    syncListSelection(null);
  });

  tipDismiss?.addEventListener('click', dismissTip);
  tipDismiss?.addEventListener('pointerup', dismissTip);
}

initTheme((theme) => {
  scene?.setTheme(theme);
});

initInfoPanel({
  onClose: () => scene?.clearSelection(),
  onRelatedSelect: (key) => {
    scene?.selectStructure(key, { frame: true, emit: true });
  },
});

bindBrowserUi();
renderLayerToggles();

scene = new CerebralCortexScene(document.getElementById('scene'), {
  theme: getTheme(),
  onSelect: (data) => showInfoPanel(data),
  onLoadProgress: updateLoading,
  onSelectionChange: (name) => syncListSelection(name),
  onReady: (items) => {
    catalog = items;
    renderStructureList(searchEl?.value ?? '');
    syncLayerToggleUi();
    maybeShowTip();
  },
});

scene.setLabelElement(labelEl);

window.__cortexScene = scene;

window.addEventListener('error', (event) => {
  if (!loadingEl) return;
  loadingEl.hidden = false;
  loadingEl.textContent = `Failed to start viewer: ${event.message}`;
});
