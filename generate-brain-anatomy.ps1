$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$base = 'c:\Users\Omar Garagozov\Documents\BrainAnatomy_GLB'
$folders = @('Cerebral_Cortex', 'Cerebellum', 'Cranial_Nerves', 'Subcortical', 'Vasculature', 'Commissures')

$list = foreach ($d in $folders) {
  Get-ChildItem -LiteralPath (Join-Path $base $d) -Filter '*.glb' | Sort-Object Name | ForEach-Object { $_.Name }
}
$list = $list | Sort-Object -Unique

# Dot-source description tables from companion data file if present; otherwise inline below.
. (Join-Path $PSScriptRoot 'brain-anatomy-descriptions.ps1')

function Escape-Js([string]$s) {
  return ($s -replace '\\', '\\' -replace "'", "\'")
}

function Get-PrettyLabel([string]$label) {
  $out = $label
  $out = $out -replace 'Lat_Fis-ant-Horizont', 'Lateral fissure - anterior horizontal ramus'
  $out = $out -replace 'Lat_Fis-ant-Vertical', 'Lateral fissure - anterior vertical ramus'
  $out = $out -replace 'Ventricles_WhiteMatter_', ''
  return $out.ToUpper()
}

function Get-BaseKey([string]$key) {
  if ($key.EndsWith('.l') -or $key.EndsWith('.r')) { return $key.Substring(0, $key.Length - 2) }
  return $key
}

function Get-DisplayParts([string]$base) {
  $knownPrefixes = @(
    'Ventricles_WhiteMatter',
    'BasalForebrain',
    'Diencephalon',
    'Striatum',
    'Cerebellum',
    'Artery',
    'Vein',
    'Frontal',
    'Insula',
    'Limbic',
    'Occipital',
    'Parietal',
    'Temporal'
  )
  foreach ($p in $knownPrefixes) {
    if ($base.StartsWith($p + '_')) {
      return @{ Prefix = $p; Label = $base.Substring($p.Length + 1) }
    }
  }
  return @{ Prefix = $null; Label = $base }
}

$manifestLines = New-Object System.Collections.Generic.List[string]
$structureBlocks = New-Object System.Collections.Generic.List[string]
$manifestLines.Add('/**')
$manifestLines.Add(' * Brain anatomy GLB filenames from public/brainstem_glb.')
$manifestLines.Add(' * Includes cortex, cerebellum, cranial nerves, subcortical, vasculature, commissures.')
$manifestLines.Add(' * Loaded at native atlas transforms - no per-structure repositioning.')
$manifestLines.Add(' */')
$manifestLines.Add('export const CEREBRAL_CORTEX_GLB_FILES = [')

$missing = New-Object System.Collections.Generic.List[string]

foreach ($file in $list) {
  $key = $file -replace '\.glb$', ''
  $hemi = $null
  $baseKey = Get-BaseKey $key
  if ($key.EndsWith('.l')) { $hemi = 'LEFT' }
  elseif ($key.EndsWith('.r')) { $hemi = 'RIGHT' }

  if (-not $descriptions.ContainsKey($baseKey)) {
    $missing.Add($baseKey) | Out-Null
    continue
  }

  $parts = Get-DisplayParts $baseKey
  $titleCore = Get-PrettyLabel $parts.Label
  $title = if ($hemi) { "$titleCore ($hemi)" } else { $titleCore }
  $desc = $descriptions[$baseKey]
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

if ($missing.Count -gt 0) {
  $uniq = $missing | Sort-Object -Unique
  Write-Host "Missing descriptions ($($uniq.Count)):"
  $uniq | ForEach-Object { Write-Host "  $_" }
  throw "Missing $($uniq.Count) descriptions"
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
Write-Output "Wrote $($list.Count) GLB entries"
Write-Output $manifestPath
Write-Output $structuresPath
