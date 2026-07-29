$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$manifestPath = 'c:\Users\Omar Garagozov\Documents\BrainAnatomy_GLB\brain_manifest.json'
$dst = Join-Path $root 'public\brainstem_glb'
if (-not (Test-Path -LiteralPath $dst)) {
  New-Item -ItemType Directory -Path $dst | Out-Null
}

. (Join-Path $PSScriptRoot 'brain-anatomy-descriptions.ps1')
. (Join-Path $PSScriptRoot 'comprehensive-descriptions.ps1')

$json = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
# Default viewer set: status === "primary" only (excluded / legacy_excluded stay on disk).
$primary = @($json.structures | Where-Object { $_.status -eq 'primary' })

# Sync public copies for primary assets only — never delete source GLBs under BrainAnatomy_GLB / Desktop.
# Stale public copies of excluded structures are left in place but are not loaded by the app.
function Escape-Js([string]$s) {
  if ($null -eq $s) { return '' }
  $out = $s -replace '\\', '\\'
  $out = $out -replace "'", "\'"
  $out = $out -replace "`r`n", "`n"
  $out = $out -replace "`r", "`n"
  # Keep paragraph breaks as real newlines inside the JS string literal.
  $out = $out -replace "`n", "\n"
  return $out
}

function Get-Title([object]$s) {
  # Prefer the anatomical leaf name from the file so folder prefixes
  # (e.g. Ventricles_WhiteMatter_…) do not get baked into display titles.
  $leaf = [IO.Path]::GetFileNameWithoutExtension([string]$s.file)
  if ($leaf.EndsWith('.l') -or $leaf.EndsWith('.r')) {
    $leaf = $leaf.Substring(0, $leaf.Length - 2)
  }

  $prefixes = @(
    'Ventricles_WhiteMatter_',
    'BasalForebrain_',
    'Diencephalon_',
    'Striatum_'
  )
  $core = $leaf
  foreach ($prefix in $prefixes) {
    if ($core.StartsWith($prefix, [StringComparison]::OrdinalIgnoreCase)) {
      $core = $core.Substring($prefix.Length)
      break
    }
  }

  $core = ($core -replace '_', ' ').Trim().ToUpper()
  switch ([string]$s.hemisphere) {
    'left' { return "$core (LEFT)" }
    'right' { return "$core (RIGHT)" }
    default { return $core }
  }
}

function Get-Description([object]$s) {
  $name = [string]$s.name
  $leaf = [IO.Path]::GetFileNameWithoutExtension($s.file)
  $base = $leaf
  if ($base.EndsWith('.l') -or $base.EndsWith('.r')) {
    $base = $base.Substring(0, $base.Length - 2)
  }

  $text = $null
  if ($comprehensiveDescriptions -and $comprehensiveDescriptions.ContainsKey($name)) {
    $text = $comprehensiveDescriptions[$name].Trim()
  }
  elseif ($descriptions.ContainsKey($base)) { $text = $descriptions[$base] }
  elseif ($descriptionsByName.ContainsKey($name)) { $text = $descriptionsByName[$name] }

  if (-not $text) {
    $cat = ([string]$s.category) -replace '_', ' '
    $sub = if ($s.subgroup) { " ($($s.subgroup))" } else { '' }
    $text = "$name is a $cat structure$sub in this interactive atlas. Select surrounding structures to explore anatomical relationships."
  }

  switch ([string]$s.hemisphere) {
    'left' { $text += ' This mesh shows the left-hemisphere component.' }
    'right' { $text += ' This mesh shows the right-hemisphere component.' }
  }
  return $text
}

$copied = 0
$missingFiles = New-Object System.Collections.Generic.List[string]
foreach ($s in $primary) {
  $leaf = Split-Path $s.file -Leaf
  if (-not (Test-Path -LiteralPath $s.file)) {
    $missingFiles.Add("$($s.id) => $($s.file)") | Out-Null
    continue
  }
  Copy-Item -LiteralPath $s.file -Destination (Join-Path $dst $leaf) -Force
  $copied++
}

if ($missingFiles.Count -gt 0) {
  $missingFiles | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
  throw "Missing $($missingFiles.Count) source GLB files"
}

$manifestLines = New-Object System.Collections.Generic.List[string]
$structureBlocks = New-Object System.Collections.Generic.List[string]
$metaLines = New-Object System.Collections.Generic.List[string]

$manifestLines.Add('/**')
$manifestLines.Add(' * Brain anatomy GLB filenames from public/brainstem_glb.')
$manifestLines.Add(' * Generated from Documents/BrainAnatomy_GLB/brain_manifest.json (primary only).')
$manifestLines.Add(' * Loaded at native atlas transforms - no per-structure repositioning.')
$manifestLines.Add(' */')
$manifestLines.Add('export const CEREBRAL_CORTEX_GLB_FILES = [')

$metaLines.Add('/** Per-structure metadata keyed by GLB basename (no extension). */')
$metaLines.Add('export const BRAIN_STRUCTURE_META = {')

foreach ($s in ($primary | Sort-Object { Split-Path $_.file -Leaf })) {
  $leaf = Split-Path $s.file -Leaf
  $key = [IO.Path]::GetFileNameWithoutExtension($leaf)
  $title = Get-Title $s
  $desc = Get-Description $s
  $category = [string]$s.category
  $subgroup = if ($s.subgroup) { [string]$s.subgroup } else { '' }

  $manifestLines.Add("  '$(Escape-Js $leaf)',")
  $structureBlocks.Add(@"
  '$(Escape-Js $key)': {
    title: '$(Escape-Js $title)',
    description:
      '$(Escape-Js $desc)',
  },
"@)
  $metaLines.Add("  '$(Escape-Js $key)': { id: '$(Escape-Js $s.id)', category: '$(Escape-Js $category)', subgroup: '$(Escape-Js $subgroup)', hemisphere: '$(Escape-Js ([string]$s.hemisphere))' },")
}

$manifestLines.Add('];')
$manifestLines.Add('')
$metaLines.Add('};')
$metaLines.Add('')

$structures = @(
  '// Keys match exported .glb filenames (without extension).'
  '// Generated from brain_manifest.json primary structures.'
  '// Lookup: cerebralCortexStructures[clickedObject.name]'
  ''
  'const cerebralCortexStructures = {'
) + $structureBlocks + @(
  '};'
  ''
  'export default cerebralCortexStructures;'
  ''
)

$manifestPathOut = Join-Path $root 'src\cerebralCortexManifest.js'
$structuresPathOut = Join-Path $root 'src\cerebralCortexStructures.js'
$metaPathOut = Join-Path $root 'src\brainStructureMeta.js'
[System.IO.File]::WriteAllLines($manifestPathOut, $manifestLines, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllLines($structuresPathOut, $structures, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllLines($metaPathOut, $metaLines, [System.Text.UTF8Encoding]::new($false))

Write-Output "primary=$($primary.Count) copied=$copied"
Write-Output $manifestPathOut
Write-Output $structuresPathOut
Write-Output $metaPathOut
