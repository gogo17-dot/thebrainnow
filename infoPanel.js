import {
  STRUCTURE_RELATIONS,
  splitClinicalText,
} from './structureUiMeta.js';
import cerebralCortexStructures from './cerebralCortexStructures.js';
import brainstemDetailStructures from './brainstemDetailStructures.js';
import { BRAIN_STRUCTURE_META } from './brainStructureMeta.js';

let panelEl = null;
let titleEl = null;
let categoryEl = null;
let overviewEl = null;
let detailEl = null;
let detailWrapEl = null;
let relatedEl = null;
let closeBtn = null;
let moreBtn = null;
let onClose = null;
let onRelatedSelect = null;
let detailExpanded = false;

function displayTitle(key, rawTitle) {
  const source = rawTitle || key.replace(/_/g, ' ');
  return source
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .replace(/\bViii\b/g, 'VIII')
    .replace(/\bIi\b/g, 'II')
    .replace(/\bIii\b/g, 'III');
}

function categoryLabel(key) {
  if (brainstemDetailStructures[key]) return 'Brainstem';
  const meta = BRAIN_STRUCTURE_META[key];
  if (!meta) return 'Anatomy';
  if (meta.category === 'cortex') return 'Cerebral cortex';
  if (meta.category === 'overview') return 'Overview';
  if (meta.category === 'commissures') return 'Commissure';
  if (meta.category === 'cranial_nerves') return 'Cranial nerve';
  if (meta.subgroup === 'BasalForebrain') return 'Basal forebrain';
  if (meta.subgroup === 'Diencephalon') return 'Diencephalon';
  if (meta.subgroup === 'Striatum') return 'Basal ganglia';
  if (meta.subgroup === 'Ventricles' || /Ventricles/i.test(key)) {
    return 'Ventricles & white matter';
  }
  return 'Subcortical';
}

function resolveRelated(key) {
  const explicit = STRUCTURE_RELATIONS[key] || [];
  const seen = new Set([key]);
  const out = [];

  const pushKey = (relKey) => {
    if (!relKey || seen.has(relKey)) return;
    const data =
      cerebralCortexStructures[relKey] || brainstemDetailStructures[relKey];
    if (!data) return;
    seen.add(relKey);
    out.push({ key: relKey, title: displayTitle(relKey, data.title) });
  };

  for (const rel of explicit) pushKey(rel);

  // Same anatomical group as soft fallback.
  const meta = BRAIN_STRUCTURE_META[key];
  if (out.length < 4 && meta) {
    for (const [otherKey, otherMeta] of Object.entries(BRAIN_STRUCTURE_META)) {
      if (out.length >= 4) break;
      if (otherKey === key) continue;
      const sameGroup =
        (meta.subgroup && meta.subgroup === otherMeta.subgroup) ||
        (!meta.subgroup && meta.category === otherMeta.category);
      if (sameGroup) pushKey(otherKey);
    }
  }

  return out.slice(0, 4);
}

export function initInfoPanel({ onClose: closeCb, onRelatedSelect: relatedCb } = {}) {
  onClose = closeCb;
  onRelatedSelect = relatedCb;
  panelEl = document.getElementById('info-panel');
  titleEl = document.getElementById('info-title');
  categoryEl = document.getElementById('info-category');
  overviewEl = document.getElementById('info-overview');
  detailEl = document.getElementById('info-detail');
  detailWrapEl = document.getElementById('info-detail-wrap');
  relatedEl = document.getElementById('info-related');
  closeBtn = document.getElementById('info-close');
  moreBtn = document.getElementById('info-more');

  if (!panelEl) return;

  closeBtn?.addEventListener('click', () => {
    hideInfoPanel();
    onClose?.();
  });

  moreBtn?.addEventListener('click', () => {
    detailExpanded = !detailExpanded;
    if (detailWrapEl) detailWrapEl.hidden = !detailExpanded;
    if (moreBtn) {
      moreBtn.textContent = detailExpanded ? 'Show less' : 'Clinical detail';
      moreBtn.setAttribute('aria-expanded', detailExpanded ? 'true' : 'false');
    }
  });
}

export function showInfoPanel({ key, title, description }) {
  if (!panelEl || !titleEl || !overviewEl) return;

  const { overview, detail } = splitClinicalText(description);
  titleEl.textContent = displayTitle(key, title);
  if (categoryEl) categoryEl.textContent = categoryLabel(key);
  overviewEl.textContent = overview || description || '';

  detailExpanded = false;
  if (detailEl) detailEl.textContent = detail;
  if (detailWrapEl) detailWrapEl.hidden = true;
  if (moreBtn) {
    const hasDetail = Boolean(detail);
    moreBtn.hidden = !hasDetail;
    moreBtn.textContent = 'Clinical detail';
    moreBtn.setAttribute('aria-expanded', 'false');
  }

  if (relatedEl) {
    relatedEl.replaceChildren();
    const related = resolveRelated(key);
    const heading = document.getElementById('info-related-heading');
    if (heading) heading.hidden = related.length === 0;

    for (const item of related) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'info-panel__chip';
      btn.textContent = item.title;
      btn.addEventListener('click', () => onRelatedSelect?.(item.key));
      relatedEl.appendChild(btn);
    }
  }

  panelEl.hidden = false;
}

export function hideInfoPanel() {
  if (!panelEl) return;
  panelEl.hidden = true;
}

