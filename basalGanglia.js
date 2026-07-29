import { initTheme } from './shared/theme.js';
import { initPopup, showPopup, hidePopup } from './shared/popup.js';
import { BasalGangliaScene } from './BasalGangliaScene.js';
import { getTheme } from './shared/theme.js';

const loadingEl = document.getElementById('loading-banner');

let scene = null;

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

initTheme((theme) => {
  scene?.setTheme(theme);
});

initPopup(() => {
  scene?.clearSelection();
});

scene = new BasalGangliaScene(document.getElementById('scene'), {
  theme: getTheme(),
  onSelect: (data) => showPopup(data.title, data.description),
  onLoadProgress: updateLoading,
});

window.__bgScene = scene;

window.addEventListener('error', (event) => {
  if (!loadingEl) return;
  loadingEl.hidden = false;
  loadingEl.textContent = `Failed to start viewer: ${event.message}`;
});
