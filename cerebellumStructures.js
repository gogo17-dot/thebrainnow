// Keys match exported .glb filenames (without extension).
// Lookup: cerebellumStructures[clickedObject.name]

const cerebellumStructures = {
  Lingula_of_cerebellum: {
    title: 'LINGULA OF CEREBELLUM',
    description:
      'The lingula is the most anterior lobule of the cerebellar vermis (lobule I), a thin tongue-like leaflet resting against the superior medullary velum. It belongs to the anterior lobe and is continuous laterally with the wing of the central lobule. Though small, it is part of the paleocerebellum involved in postural tone and is a useful landmark when reading mid-sagittal MRI of the cerebellum.',
  },
  Central_lobule: {
    title: 'CENTRAL LOBULE',
    description:
      'The central lobule (lobule II–III of the vermis) sits immediately behind the lingula on the superior vermis and forms part of the anterior lobe. It receives spinocerebellar input related to trunk and proximal limb posture. Laterally it expands into the wing of the central lobule (ala lobuli centralis), linking the midline vermis to the hemispheric anterior lobe.',
  },
  Wing_of_central_lobule: {
    title: 'WING OF CENTRAL LOBULE (ALA LOBULI CENTRALIS)',
    description:
      'The wing of the central lobule is the paired hemispheric extension of the central lobule, flanking the superior vermis in the anterior lobe. It participates in anterior-lobe circuits that regulate antigravity tone and gait. On surface anatomy it helps define the superior cerebellar outline just behind the midbrain and superior medullary velum.',
  },
  Culmen: {
    title: 'CULMEN',
    description:
      'The culmen (lobule IV–V) is the largest and most prominent lobule of the superior vermis, forming the peak of the anterior lobe behind the primary fissure’s anterior side. It is heavily involved in spinocerebellar control of posture and lower-limb coordination. On mid-sagittal imaging the culmen is a key landmark separating anterior from posterior vermian lobules at the primary fissure.',
  },
  Declive: {
    title: 'DECLIVE',
    description:
      'The declive (lobule VI) is the first vermian lobule of the posterior lobe, lying immediately behind the primary fissure and continuous with the superior semilunar / simple lobule laterally. It contributes to coordination of skilled movement and is part of the neocerebellar vermis. Its position just caudal to the culmen makes it easy to identify on mid-sagittal MRI.',
  },
  Folium_of_vermis: {
    title: 'FOLIUM OF VERMIS',
    description:
      'The folium of the vermis (lobule VIIA) is a narrow transverse ridge of the posterior vermis, continuous laterally with the superior semilunar lobule. Together with the tuber it forms much of the visible “crown” of the posterior vermis. It participates in oculomotor and cognitive-affective cerebellar networks of the posterior lobe.',
  },
  Tuber_of_vermis: {
    title: 'TUBER OF VERMIS',
    description:
      'The tuber of the vermis (lobule VIIB) sits just below the folium on the posterior vermis and expands laterally into the inferior semilunar lobule. It is part of the posterior lobe involved in higher-order cerebellar functions including eye-movement control and aspects of cognition. On sagittal views it forms the rounded bulge of the mid-posterior vermis.',
  },
  Pyramis_of_vermis: {
    title: 'PYRAMIS OF VERMIS',
    description:
      'The pyramis (lobule VIII) is a triangular lobule on the inferior vermis, continuous laterally with the biventral (gracile) lobule region. It belongs to the posterior lobe and receives substantial spinal and brainstem input related to limb and axial coordination. It is a reliable inferior vermian landmark above the uvula and tonsils.',
  },
  Uvula_of_vermis: {
    title: 'UVULA OF VERMIS',
    description:
      'The uvula (lobule IX) is a rounded inferior vermian lobule hanging above the cerebellar tonsils and nodule. It is closely linked to vestibular and postural circuits of the vestibulocerebellum. Clinically, uvular and tonsillar descent through the foramen magnum is the hallmark of Chiari type I malformation.',
  },
  Nodule_of_vermis: {
    title: 'NODULE OF VERMIS',
    description:
      'The nodule (lobule X) is the most caudal vermian lobule and the midline component of the flocculonodular lobe — the archicerebellum. Together with the flocculus it is the primary cerebellar centre for vestibular reflexes, gaze stability, and balance. Nodular lesions classically produce truncal ataxia and impaired vestibulo-ocular control.',
  },
  Anterior_quadrangular_lobule: {
    title: 'ANTERIOR QUADRANGULAR LOBULE',
    description:
      'The anterior quadrangular lobule is the hemispheric part of the anterior lobe continuous with the culmen (roughly lobules IV–V). It receives spinocerebellar afferents and contributes to regulation of muscle tone, posture, and gait. Anterior-lobe disease — classically from alcohol-related degeneration — preferentially affects this region and produces a wide-based, unsteady gait.',
  },
  Posterior_quadrangular_lobule: {
    title: 'POSTERIOR QUADRANGULAR LOBULE (SIMPLE LOBULE)',
    description:
      'The posterior quadrangular (simple) lobule is the hemispheric continuation of the declive (lobule VI), lying just behind the primary fissure. It is part of the neocerebellum and participates in coordination of voluntary, skilled movement. It forms much of the superior surface of each cerebellar hemisphere between the anterior lobe and the semilunar lobules.',
  },
  Superior_semilunar_lobule: {
    title: 'SUPERIOR SEMILUNAR LOBULE',
    description:
      'The superior semilunar lobule (crus I) is a large crescentic lobule on the superior–posterior cerebellar hemisphere, continuous with the folium of the vermis. It is a major neocerebellar region linked via pontocerebellar fibres to cerebral association cortex. It contributes to planning and fine coordination of complex limb and oculomotor acts.',
  },
  Inferior_semilunar_lobule: {
    title: 'INFERIOR SEMILUNAR LOBULE',
    description:
      'The inferior semilunar lobule (crus II) occupies much of the inferior–posterior cerebellar hemisphere and is continuous with the tuber of the vermis. Like crus I, it is neocerebellum heavily connected to cerebral cortex through the middle cerebellar peduncle. It supports skilled motor coordination and is implicated in cerebellar cognitive networks.',
  },
  Gracile_lobule: {
    title: 'GRACILE LOBULE',
    description:
      'The gracile lobule is a slender hemispheric lobule of the inferior cerebellum, associated with the pyramis of the vermis (lobule VIII territory). It participates in posterior-lobe coordination of distal limb movement. On surface anatomy it lies between the inferior semilunar lobule and the biventral lobule near the horizontal and posterolateral fissures.',
  },
  Biventral_lobule: {
    title: 'BIVENTRAL LOBULE',
    description:
      'The biventral lobule is a two-bellied lobule on the inferior cerebellar hemisphere, continuous with the pyramis and sitting near the tonsil. It belongs to the posterior lobe and contributes to limb coordination. Its inferior position makes it relevant when interpreting mass effect, tonsillar herniation, and inferior cerebellar infarcts.',
  },
  Tonsil_of_cerebellum: {
    title: 'TONSIL OF CEREBELLUM',
    description:
      'The cerebellar tonsil is a rounded lobule on the inferior medial hemisphere, flanking the uvula beside the foramen magnum. It is clinically critical: downward tonsillar herniation compresses the medulla and can be life-threatening. In Chiari I malformation the tonsils are ectopically low; swelling from infarct or haemorrhage can drive acute tonsillar descent.',
  },
  Flocculus: {
    title: 'FLOCCULUS',
    description:
      'The flocculus is a small, paired lobule of the flocculonodular lobe lying on the inferior cerebellar surface beside the middle cerebellar peduncle. It is the hemispheric partner of the nodule and a core vestibulocerebellar structure controlling gaze holding, smooth pursuit, and vestibulo-ocular reflexes. Floccular lesions produce gaze-evoked nystagmus and impaired visual–vestibular coordination.',
  },
  Peduncle_of_flocculus: {
    title: 'PEDUNCLE OF FLOCCULUS',
    description:
      'The peduncle of the flocculus is the white-matter stalk attaching the flocculus to the inferior cerebellar surface near the middle cerebellar peduncle and lateral recess of the fourth ventricle. It carries the afferent and efferent fibres of flocculonodular vestibular circuits. Identifying it helps separate the flocculus from adjacent hemispheric lobules on dissection and imaging.',
  },
  Superior_cerebellar_peduncle: {
    title: 'SUPERIOR CEREBELLAR PEDUNCLE',
    description:
      'The superior cerebellar peduncle is the primary output pathway of the cerebellum, carrying fibres from the deep cerebellar nuclei (chiefly the dentate nucleus) upward to decussate in the caudal midbrain before reaching the contralateral red nucleus and thalamus. This pathway relays coordinated motor planning information from cerebellum to cerebral cortex. It contrasts with the middle and inferior peduncles, which are predominantly input pathways.',
  },
  Middle_cerebellar_peduncle: {
    title: 'MIDDLE CEREBELLAR PEDUNCLE',
    description:
      'The middle cerebellar peduncle is the principal pathway for pontocerebellar fibres, carrying information from the pontine nuclei into the cerebellar hemispheres. It forms the large lateral bulge of the pons and is the largest of the three cerebellar peduncles. It is critical for coordinating planned, skilled movement by relaying motor planning signals from cortex to cerebellum.',
  },
  Inferior_cerebellar_peduncle: {
    title: 'INFERIOR CEREBELLAR PEDUNCLE',
    description:
      'The inferior cerebellar peduncle is a major cerebellar input pathway, carrying proprioceptive, vestibular, and reticular information from the spinal cord and brainstem into the cerebellum. It connects the medulla and upper spinal cord to the cerebellar hemisphere and vermis, and is essential for balance, posture, and coordination of ongoing movement. Lesions here can produce ipsilateral ataxia and incoordination.',
  },
  Dentate_nucleus: {
    title: 'DENTATE NUCLEUS',
    description:
      'The dentate nucleus is the largest and most lateral of the deep cerebellar nuclei, sitting within the white matter of each cerebellar hemisphere. It is the principal cerebellar output nucleus for planning and timing of skilled, voluntary movement: its neurons project through the superior cerebellar peduncle to the contralateral red nucleus and thalamus, then to motor and premotor cortex. Dentate lesions or degeneration disrupt fine motor coordination and are implicated in many forms of cerebellar ataxia.',
  },
  Interposed_nucleus: {
    title: 'INTERPOSED NUCLEUS (GLOBOSE + EMBOIFORM)',
    description:
      'The interposed nucleus comprises the globose and emboliform nuclei fused into one paired deep grey-mass on each side, lying medial to the dentate and lateral to the fastigial nucleus. It is a key output station for limb coordination and receives input from the intermediate zone of the cerebellar cortex. Clinically, interposed nucleus dysfunction contributes to limb ataxia, dysmetria, and intention tremor — the classic signs of intermediate cerebellar pathway disease.',
  },
  Fastigial_nucleus: {
    title: 'FASTIGIAL NUCLEUS (NUCLEUS FASTIGII)',
    description:
      'The fastigial nucleus is the most medial deep cerebellar nucleus, lying near the midline within the vermis region deep to the cerebellar cortex. It is the primary output of the spinocerebellum and flocculonodular system, sending fibres to the vestibular nuclei and reticular formation to control posture, balance, and eye–head coordination. Fastigial lesions produce truncal ataxia, gait instability, and vestibular signs rather than the distal limb dysmetria typical of lateral hemispheric disease.',
  },
};

export default cerebellumStructures;
