$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$srcGlb = 'c:\Users\Omar Garagozov\Documents\BrainAnatomy_GLB\Cerebral_Cortex'
$list = Get-ChildItem -LiteralPath $srcGlb -Filter '*.glb' | Sort-Object Name | ForEach-Object { $_.Name }

$descriptions = @{
  'Frontal_Inferior frontal sulcus' = 'The inferior frontal sulcus separates the middle frontal gyrus from the inferior frontal gyrus on the lateral frontal convexity. It is a major landmark for localising the inferior frontal language and motor association territories and for navigating frontal approaches near Broca''s region.'
  'Frontal_Lat_Fis-ant-Horizont' = 'The anterior horizontal ramus of the lateral (Sylvian) fissure is a short frontal branch that helps define the triangular and orbital parts of the inferior frontal gyrus. It is a key sulcal landmark in language-network mapping and opercular anatomy.'
  'Frontal_Lat_Fis-ant-Vertical' = 'The anterior vertical (ascending) ramus of the lateral fissure bounds the triangular part of the inferior frontal gyrus and contributes to the classic M shape of Broca''s region. It separates pars triangularis from pars opercularis and guides cortical language localisation.'
  'Frontal_Middle frontal gyrus' = 'The middle frontal gyrus lies between the superior and inferior frontal sulci and hosts premotor, frontal eye-field, and dorsolateral prefrontal territories. It supports working memory, attentional control, and voluntary eye movements, and is frequently involved in executive-function networks.'
  'Frontal_Olfactory sulcus' = 'The olfactory sulcus runs on the ventral frontal lobe parallel to the gyrus rectus and lodges the olfactory tract. It is an important basal frontal landmark relating orbitofrontal cortex to olfactory pathways and medial orbital gyri.'
  'Frontal_Opercular part of inferior frontal gyrus' = 'Pars opercularis of the inferior frontal gyrus forms the posterior limb of Broca''s region (roughly Brodmann area 44). It participates in speech production, phonological processing, and orofacial motor planning, and abuts the precentral gyrus posteriorly.'
  'Frontal_Orbital gyri (Frontomarginal gyrus and sulcus)' = 'The frontomarginal gyrus and sulcus occupy the frontal pole''s ventral-lateral margin. They belong to orbitofrontal / frontopolar association cortex involved in value-based decision making, social cognition, and integrating sensory cues with goal-directed behaviour.'
  'Frontal_Orbital gyri' = 'The orbital gyri form the corrugated ventral surface of the frontal lobe above the orbit. Orbitofrontal cortex evaluates reward, punishment, and olfactory-gustatory information and is clinically relevant in personality change after basal frontal injury.'
  'Frontal_Orbital part of inferior frontal gyrus' = 'Pars orbitalis is the most anterior division of the inferior frontal gyrus (roughly Brodmann area 47/12). It contributes to semantic control, lexical retrieval, and affective-linguistic integration within the broader Broca network.'
  'Frontal_Orbital sulci (H-shaped orbital sulci)' = 'The H-shaped orbital sulci pattern the orbital surface into medial, anterior, posterior, and lateral orbital gyri. They provide reliable landmarks for orbitofrontal parcellation in imaging and surgical planning along the basal frontal lobe.'
  'Frontal_Orbital sulci (Lateral Orbital sulcus)' = 'The lateral orbital sulcus helps separate lateral orbital cortex from neighbouring frontal opercular and frontomarginal territories. It is part of the ventral frontal sulcal map used to orient within orbitofrontal association cortex.'
  'Frontal_Paracentral gyrus and sulcus' = 'The paracentral lobule straddles the medial hemispheric surface around the end of the central sulcus, combining medial precentral (motor) and postcentral (sensory) cortices for the lower limb and perineum. The paracentral sulcus helps bound this medial sensorimotor territory.'
  'Frontal_Paracentral sulcus' = 'The paracentral sulcus is a medial frontal sulcus that helps demarcate the paracentral lobule from more anterior medial frontal cortex. It is a useful midline landmark when relating medial motor cortex to the cingulate and superior frontal gyrus.'
  'Frontal_Precentral gyrus' = 'The precentral gyrus is the primary motor cortex (Brodmann area 4), organised somatotopically along the motor homunculus. It issues corticospinal and corticonuclear fibres that drive voluntary movement of the contralateral body and face.'
  'Frontal_Precentral sulcus (inferior part)' = 'The inferior precentral sulcus separates premotor cortex from the precentral gyrus in the lower frontal convexity and helps locate the face-hand motor representations. It is a critical landmark for rolandic and opercular surgical approaches.'
  'Frontal_Precentral sulcus (Superior part)' = 'The superior precentral sulcus bounds the upper motor and premotor strip near the hand knob and dorsal premotor cortex. Together with the superior frontal sulcus it frames dorsolateral premotor and frontal eye-field neighbourhoods.'
  'Frontal_Straight gyrus (Gyrus rectus)' = 'The gyrus rectus (straight gyrus) is the medial-most strip of orbitofrontal cortex, flanking the olfactory sulcus. It participates in olfactory and value-related processing and is a classic landmark on the basal frontal surface.'
  'Frontal_Superior frontal gyrus' = 'The superior frontal gyrus occupies the dorsomedial frontal lobe and contains supplementary motor, pre-SMA, and prefrontal territories. It supports motor initiation, cognitive control, and aspects of working memory and social cognition.'
  'Frontal_Superior frontal sulcus' = 'The superior frontal sulcus divides the superior from the middle frontal gyrus and is a major anteroposterior landmark of the dorsolateral frontal lobe. Its posterior end helps localise the frontal eye field and dorsal premotor cortex.'
  'Frontal_Transverse frontopolar gyrus and sulcus' = 'Transverse frontopolar gyrus and sulcus mark the frontal pole''s transition between lateral and orbital surfaces. Frontopolar cortex (roughly area 10) is implicated in multitasking, prospective memory, and the highest levels of cognitive branching.'
  'Frontal_Triangular part of inferior frontal gyrus' = 'Pars triangularis occupies the middle portion of the inferior frontal gyrus (roughly Brodmann area 45) between the anterior rami of the Sylvian fissure. It is central to language production, semantic processing, and syntactic computation in the dominant hemisphere.'
  'Insula_Insula (Subcentral gyrus and ant. and post. sulci)' = 'This insular parcel includes the subcentral gyrus and the anterior and posterior sulci that frame the inferior central region as it tunnels into the Sylvian fissure. Insular cortex integrates interoception, pain, taste, autonomic tone, and speech-motor coordination.'
  'Limbic_Cingulate gyrus (Posteroventral part)' = 'The posteroventral cingulate belongs to the posterior cingulate / retrosplenial neighbourhood on the medial surface. It participates in autobiographical memory, spatial orientation, and the default-mode network, linking limbic and parietal association systems.'
  'Limbic_Cingulate gyrus and sulcus (Middle anterior part)' = 'The mid-anterior cingulate gyrus and sulcus overlie dorsal anterior cingulate cortex involved in conflict monitoring, motivation, and pain affect. This region is a hub of the salience network and a common target in psychiatric neuromodulation research.'
  'Limbic_Cingulate gyrus and sulcus (Middle posterior part)' = 'The mid-posterior cingulate segment bridges anterior executive cingulate cortex with posterior mnemonic cingulate territories. It contributes to attentional shifting, self-referential processing, and cortico-limbic integration along the medial wall.'
  'Limbic_Cingulate gyrus and sulcus (Posterior dorsal part)' = 'The posterior dorsal cingulate gyrus and sulcus sit near the splenium and precuneus interface. They support episodic memory retrieval, visuospatial processing, and dense connectivity within the default-mode network.'
  'Limbic_Cingulate sulcus (Marginal part)' = 'The marginal ramus of the cingulate sulcus ascends behind the paracentral lobule and is a reliable medial landmark separating parietal precuneus from the paracentral sensorimotor cortex. It is widely used in MRI-based medial lobe orientation.'
  'Limbic_Hippocampus' = 'The hippocampus is the archetypal limbic archicortical structure in the medial temporal lobe, essential for forming declarative memories and supporting spatial navigation. It is highly vulnerable in temporal-lobe epilepsy, Alzheimer disease, and hypoxic-ischaemic injury.'
  'Occipital_Calcarine sulcus' = 'The calcarine sulcus is the cardinal landmark of primary visual cortex (V1) on the medial occipital lobe. Upper and lower banks represent the contralateral lower and upper visual fields, making it fundamental to retinotopic organisation and visual-field defects.'
  'Occipital_Cuneus' = 'The cuneus lies above the calcarine sulcus on the medial occipital surface and contains upper-bank V1 plus adjacent early visual areas. It processes the contralateral lower visual field and feeds dorsal and ventral visual streams.'
  'Occipital_Inferior occipital gyrus and sulcus' = 'The inferior occipital gyrus and sulcus occupy the ventral-lateral occipital surface near the transition to the temporal lobe. They contribute to object and face-related visual processing within the ventral visual pathway.'
  'Occipital_Lateral occipital gyrus (Middle occipital gyrus)' = 'Lateral / middle occipital cortex belongs to extrastriate visual areas involved in form, motion, and object recognition. It links early visual cortex to parietal (dorsal) and temporal (ventral) association streams.'
  'Occipital_Lingual gyrus' = 'The lingual gyrus lies below the calcarine sulcus and contains lower-bank primary visual cortex plus adjacent ventral visual areas. It processes the contralateral upper visual field and participates in word-form and complex visual analysis.'
  'Occipital_Lunate sulcus' = 'The lunate sulcus is an occipital sulcal landmark near the boundary of early visual cortex on the lateral-posterior surface. In humans it is variable but still useful for orienting extrastriate and polar occipital territories.'
  'Occipital_Occipital pole' = 'The occipital pole is the most posterior tip of the hemisphere and houses the macular representation of primary visual cortex. Cortical lesions here produce central (macular) visual-field defects with high impact on detailed vision.'
  'Occipital_Superior occipital gyri' = 'Superior occipital gyri form the dorsomedial and dorsolateral occipital convexity adjacent to the parieto-occipital junction. They contribute to early visual association processing and the dorsal stream''s spatial analysis.'
  'Occipital_Transverse occipital sulcus' = 'The transverse occipital sulcus helps parcel superior occipital cortex and often relates to the posterior end of the intraparietal sulcus. It is a useful landmark at the parieto-occipital transition for visual-spatial association cortex.'
  'Parietal_Angular gyrus' = 'The angular gyrus (inferior parietal lobule) sits at the junction of temporal, occipital, and parietal association cortex. It supports reading, calculation, semantic integration, and aspects of spatial attention; dominant lesions can produce alexia, agraphia, or Gerstmann-type deficits.'
  'Parietal_Intraparietal sulcus' = 'The intraparietal sulcus divides the superior and inferior parietal lobules and hosts frontoparietal circuits for spatial attention, saccades, and sensorimotor transformation. It is a core node of the dorsal attention network.'
  'Parietal_Postcentral gyrus' = 'The postcentral gyrus is primary somatosensory cortex (Brodmann areas 3, 1, 2), organised as a sensory homunculus. It receives thalamocortical tactile and proprioceptive input from the contralateral body and face.'
  'Parietal_Postcentral sulcus' = 'The postcentral sulcus separates primary somatosensory cortex from the superior parietal lobule and other posterior parietal areas. It marks the transition from unimodal sensory cortex to higher-order spatial and associative processing.'
  'Parietal_Precuneus' = 'The precuneus occupies the medial parietal lobe between the marginal cingulate ramus and the parieto-occipital sulcus. It is a major default-mode hub involved in mental imagery, episodic memory, and self-referential cognition.'
  'Parietal_Superior parietal lobule' = 'The superior parietal lobule lies above the intraparietal sulcus and mediates visuomotor coordination, spatial awareness, and reaching/grasping transformations. Lesions can cause optic ataxia or aspects of neglect and spatial disorientation.'
  'Parietal_Supramarginal gyrus' = 'The supramarginal gyrus forms the anterior inferior parietal lobule around the end of the Sylvian fissure. It contributes to phonological processing, tool use, and proprioceptive-spatial integration; dominant injury may impair language and praxis.'
  'Temporal_Inferior temporal gyrus' = 'The inferior temporal gyrus belongs to the ventral visual stream (what pathway) along the inferolateral temporal lobe. It supports object recognition, visual memory, and high-level feature binding en route to temporal pole and fusiform territories.'
  'Temporal_Inferior temporal sulcus' = 'The inferior temporal sulcus separates middle from inferior temporal gyri and participates in the lateral temporal association landscape. Nearby cortex contributes to visual motion, biological motion, and multimodal object processing.'
  'Temporal_Lateral occipitotemporal gyrus' = 'The lateral occipitotemporal (fusiform) gyrus on the ventral surface is famous for high-level visual categories, including faces (FFA) and word forms (VWFA). It is a key node of the ventral visual recognition stream.'
  'Temporal_Medial occipitotemporal gyrus (Parahippocampal)' = 'The parahippocampal gyrus flanks the hippocampus on the medial temporal lobe and encodes contextual and spatial scene information. It is central to memory encoding circuits and is often involved in mesial temporal epilepsy.'
  'Temporal_Middle temporal gyrus' = 'The middle temporal gyrus is a broad lateral temporal association region involved in language semantics, biological motion, and multimodal integration. In the dominant hemisphere it supports lexical-semantic networks linking auditory and visual meaning.'
  'Temporal_Occipitotemporal sulcus (Lateral part)' = 'The lateral occipitotemporal sulcus helps separate fusiform / occipitotemporal cortex from neighbouring inferior temporal territories on the ventral surface. It is an important landmark for ventral visual and memory-related cortex.'
  'Temporal_Superior temporal gyrus (Lateral part)' = 'The superior temporal gyrus contains primary and association auditory cortex and, in the dominant hemisphere, critical language comprehension territories (Wernicke neighbourhood). It processes sound, speech, and audiovisual integration along the Sylvian fissure.'
  'Temporal_Superior temporal sulcus' = 'The superior temporal sulcus is a deep lateral temporal sulcus implicated in social perception, biological motion, voice processing, and audiovisual speech. It is a major hub of the social brain and language-related association cortex.'
  'Temporal_Temporal plane' = 'The planum temporale is the superior temporal surface posterior to Heschl''s gyri within the Sylvian fossa. It is strongly linked to auditory association and language lateralisation and is often asymmetric between hemispheres.'
  'Temporal_Temporal pole' = 'The temporal pole is the anterior tip of the temporal lobe and a high-order association region for semantic memory, social-emotional meaning, and olfactory-limbic linkage. It is frequently involved in semantic dementia and temporal-lobe epilepsy networks.'
  'Temporal_Transverse temporal gyri' = 'The transverse temporal (Heschl''s) gyri on the superior temporal plane constitute primary auditory cortex. They contain tonotopic maps of sound frequency and are the first cortical station of the ascending auditory pathway.'
}

function Escape-Js([string]$s) {
  return ($s -replace '\\', '\\' -replace "'", "\'")
}

function Get-PrettyLabel([string]$label) {
  $out = $label
  $out = $out -replace 'Lat_Fis-ant-Horizont', 'Lateral fissure - anterior horizontal ramus'
  $out = $out -replace 'Lat_Fis-ant-Vertical', 'Lateral fissure - anterior vertical ramus'
  return $out.ToUpper()
}

$manifestLines = New-Object System.Collections.Generic.List[string]
$structureBlocks = New-Object System.Collections.Generic.List[string]
$manifestLines.Add('/**')
$manifestLines.Add(' * Cerebral cortex GLB filenames from public/brainstem_glb.')
$manifestLines.Add(' * Loaded at native atlas transforms — no per-structure repositioning.')
$manifestLines.Add(' */')
$manifestLines.Add('export const CEREBRAL_CORTEX_GLB_FILES = [')

foreach ($file in $list) {
  $key = $file -replace '\.glb$', ''
  $hemi = $null
  $base = $key
  if ($key.EndsWith('.l')) { $hemi = 'LEFT'; $base = $key.Substring(0, $key.Length - 2) }
  elseif ($key.EndsWith('.r')) { $hemi = 'RIGHT'; $base = $key.Substring(0, $key.Length - 2) }

  if (-not $descriptions.ContainsKey($base)) {
    throw "Missing description for $base"
  }

  $underscore = $base.IndexOf('_')
  $label = if ($underscore -ge 0) { $base.Substring($underscore + 1) } else { $base }
  $titleCore = Get-PrettyLabel $label
  $title = if ($hemi) { "$titleCore ($hemi)" } else { $titleCore }
  $desc = $descriptions[$base]
  if ($hemi -eq 'LEFT') { $desc += ' This mesh is the left-hemisphere parcel.' }
  elseif ($hemi -eq 'RIGHT') { $desc += ' This mesh is the right-hemisphere parcel.' }

  $manifestLines.Add("  '$(Escape-Js $file)',")
  $structureBlocks.Add(@"
  '$(Escape-Js $key)': {
    title: '$(Escape-Js $title)',
    description:
      '$(Escape-Js $desc)',
  },
"@)
}

$manifestLines.Add('];')
$manifestLines.Add('')

$structures = @(
  '// Keys match exported .glb filenames (without extension).'
  '// Lookup: cerebralCortexStructures[clickedObject.name]'
  ''
  'const cerebralCortexStructures = {'
) + $structureBlocks + @(
  '};'
  ''
  'export default cerebralCortexStructures;'
  ''
)

$manifestPath = Join-Path $root 'src\cerebralCortexManifest.js'
$structuresPath = Join-Path $root 'src\cerebralCortexStructures.js'
[System.IO.File]::WriteAllLines($manifestPath, $manifestLines)
[System.IO.File]::WriteAllLines($structuresPath, $structures)
Write-Output "Wrote $($list.Count) entries"
Write-Output $manifestPath
Write-Output $structuresPath
