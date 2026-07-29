/**
 * Clinical related-structure links for the info panel.
 * Keys are GLB basenames; values are other structure keys.
 */
export const STRUCTURE_RELATIONS = {
  Cerebellum: ['Brainstem', 'Pons', 'Medulla_oblongata'],
  Brainstem: ['Cerebellum', 'Midbrain', 'Pons', 'Medulla_oblongata'],
  Midbrain: ['Pons', 'Diencephalon_Thalamus.l', 'Diencephalon_Thalamus.r'],
  Pons: ['Midbrain', 'Medulla_oblongata', 'Cerebellum'],
  Medulla_oblongata: ['Pons', 'Cerebellum'],
  'Corpus callosum': [
    'Anterior commissure',
    'Hippocampal commissure',
    'Fornix.l',
    'Fornix.r',
  ],
  'Anterior commissure': ['Corpus callosum', 'BasalForebrain_Amygdaloid body.l'],
  'Frontal_lobe.l': ['Parietal_lobe.l', 'Temporal_lobe.l', 'Corpus callosum'],
  'Frontal_lobe.r': ['Parietal_lobe.r', 'Temporal_lobe.r', 'Corpus callosum'],
  'Parietal_lobe.l': ['Frontal_lobe.l', 'Occipital_lobe.l', 'Temporal_lobe.l'],
  'Parietal_lobe.r': ['Frontal_lobe.r', 'Occipital_lobe.r', 'Temporal_lobe.r'],
  'Temporal_lobe.l': [
    'Frontal_lobe.l',
    'BasalForebrain_Amygdaloid body.l',
    'Insula.l',
  ],
  'Temporal_lobe.r': [
    'Frontal_lobe.r',
    'BasalForebrain_Amygdaloid body.r',
    'Insula.r',
  ],
  'Occipital_lobe.l': [
    'Parietal_lobe.l',
    'Diencephalon_Lateral geniculate body.l',
  ],
  'Occipital_lobe.r': [
    'Parietal_lobe.r',
    'Diencephalon_Lateral geniculate body.r',
  ],
  'Diencephalon_Thalamus.l': [
    'Diencephalon_Thalamus.r',
    'Diencephalon_Hypothalamus',
    'Striatum_Caudate nucleus.l',
  ],
  'Diencephalon_Thalamus.r': [
    'Diencephalon_Thalamus.l',
    'Diencephalon_Hypothalamus',
    'Striatum_Caudate nucleus.r',
  ],
  'Diencephalon_Hypothalamus': [
    'Diencephalon_Thalamus.l',
    'Diencephalon_Mamillary body.l',
    'BasalForebrain_Septal nuclei',
  ],
  'Striatum_Putamen.l': [
    'Striatum_Caudate nucleus.l',
    'Striatum_Globus pallidus.l',
    'Striatum_Lentiform nucleus.l',
  ],
  'Striatum_Putamen.r': [
    'Striatum_Caudate nucleus.r',
    'Striatum_Globus pallidus.r',
    'Striatum_Lentiform nucleus.r',
  ],
  'Striatum_Caudate nucleus.l': [
    'Striatum_Putamen.l',
    'Ventricles_WhiteMatter_Lateral ventricle.l',
  ],
  'Striatum_Caudate nucleus.r': [
    'Striatum_Putamen.r',
    'Ventricles_WhiteMatter_Lateral ventricle.r',
  ],
  'BasalForebrain_Amygdaloid body.l': [
    'BasalForebrain_Amygdaloid body.r',
    'Temporal_lobe.l',
    'Limbic_lobe.l',
  ],
  'BasalForebrain_Amygdaloid body.r': [
    'BasalForebrain_Amygdaloid body.l',
    'Temporal_lobe.r',
    'Limbic_lobe.r',
  ],
};

export const LAYER_DEFS = [
  { id: 'cortex', label: 'Cortex' },
  { id: 'deep', label: 'Deep nuclei' },
  { id: 'ventricles', label: 'Ventricles' },
  { id: 'overview', label: 'Cerebellum / brainstem' },
  { id: 'nerves', label: 'Nerves' },
];

export function layerIdForStructure(key, meta) {
  if (/^(Midbrain|Pons|Medulla_oblongata)$/i.test(key)) return 'overview';
  if (!meta) return 'deep';
  if (meta.category === 'cortex') return 'cortex';
  if (meta.category === 'overview') return 'overview';
  if (meta.category === 'cranial_nerves') return 'nerves';
  if (
    meta.subgroup === 'Ventricles' ||
    meta.subgroup === 'Ventricles_WhiteMatter' ||
    /Ventricles_WhiteMatter/i.test(key)
  ) {
    return 'ventricles';
  }
  return 'deep';
}

/** First paragraph = overview; remaining = clinical detail. */
export function splitClinicalText(description = '') {
  const parts = String(description)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    overview: parts[0] || '',
    detail: parts.slice(1).join('\n\n'),
  };
}
