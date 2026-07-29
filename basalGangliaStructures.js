// Keys match exported .glb filenames (without extension).
// Lookup: basalGangliaStructures[clickedObject.name]

const basalGangliaStructures = {
  Caudate_nucleus: {
    title: 'CAUDATE NUCLEUS',
    description:
      'The caudate nucleus is a C-shaped mass of grey matter forming the medial wall of the lateral ventricle’s body and curving into the temporal horn as the tail. Together with the putamen it makes up the striatum — the main input station of the basal ganglia. It receives dense glutamatergic projections from association cortex and participates in goal-directed action selection, habit learning, and cognitive–motor loops through the direct and indirect pathways. Caudate involvement is prominent in Huntington disease (atrophy) and in some forms of obsessive–compulsive and frontostriatal dysfunction.',
  },
  Putamen: {
    title: 'PUTAMEN',
    description:
      'The putamen is the lateral, lentiform component of the striatum, separated from the caudate by the internal capsule and continuous with it beneath the capsule as the nucleus accumbens region. It is the primary striatal target of sensorimotor and premotor cortex and is central to selecting and scaling voluntary movement. Putaminal lesions or degeneration (for example in multiple-system atrophy or vascular disease) produce contralateral rigidity, bradykinesia, and dystonia; it is also a common site of hypertensive haemorrhage.',
  },
  Globus_pallidus: {
    title: 'GLOBUS PALLIDUS',
    description:
      'The globus pallidus is the medial “pale globe” of the lentiform nucleus, divided into external (GPe) and internal (GPi) segments by the medial medullary lamina. GPe is a key node of the indirect pathway; GPi (with substantia nigra pars reticulata) is the principal basal-ganglia output to thalamus and brainstem, tonically inhibiting unwanted movement. Pallidal deep-brain stimulation and lesioning are used to treat dystonia and Parkinsonian motor symptoms by modulating this inhibitory output.',
  },
  Subthalamic_nucleus: {
    title: 'SUBTHALAMIC NUCLEUS',
    description:
      'The subthalamic nucleus (STN) is a lens-shaped glutamatergic nucleus in the diencephalon–midbrain junction, nestled against the internal capsule and above the substantia nigra. It drives the indirect pathway by exciting GPi/SNr, thereby increasing inhibitory basal-ganglia output and suppressing competing motor programmes. STN hyperactivity contributes to Parkinsonian bradykinesia; STN deep-brain stimulation is a standard therapy for advanced Parkinson disease, reducing motor fluctuations and tremor.',
  },
  Substantia_nigra: {
    title: 'SUBSTANTIA NIGRA',
    description:
      'The substantia nigra occupies the midbrain tegmentum and has two main parts: compacta (SNc) and reticulata (SNr). SNc dopaminergic neurons project to the striatum (nigrostriatal pathway), enabling movement by modulating direct and indirect striatal pathways; their loss is the hallmark of Parkinson disease. SNr is a GABAergic output nucleus homologous to GPi, projecting to thalamus and superior colliculus to gate motor and oculomotor commands.',
  },
  Locus_coeruleus: {
    title: 'LOCUS COERULEUS',
    description:
      'The locus coeruleus is a small bilateral nucleus in the rostral pontine tegmentum and the brain’s principal source of noradrenaline. Its diffuse ascending projections modulate arousal, attention, stress responses, and synaptic plasticity across cortex, hippocampus, and cerebellum. Though not a classical basal-ganglia nucleus, it interfaces with striatal and limbic circuits; early locus coeruleus degeneration is a consistent finding in Parkinson and Alzheimer disease.',
  },
  Periaqueductal_grey: {
    title: 'PERIAQUEDUCTAL GREY',
    description:
      'The periaqueductal grey (PAG) is a sleeve of grey matter surrounding the cerebral aqueduct in the midbrain. It is a central hub for pain modulation, defensive behaviour, autonomic control, and vocalisation, with descending projections that engage brainstem and spinal antinociceptive pathways. The PAG also receives input from limbic and basal-ganglia-related circuits, linking emotional state to motor and autonomic output; it is a target of interest in chronic pain and freeze/flight behavioural research.',
  },
};

export default basalGangliaStructures;
