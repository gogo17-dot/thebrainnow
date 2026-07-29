$glbDir = 'c:\Users\Omar Garagozov\neural-network-simulator\public\brainstem_glb'
$manifest = Get-Content 'c:\Users\Omar Garagozov\neural-network-simulator\src\cerebellumManifest.js' -Raw
$files = [regex]::Matches($manifest, "'([^']+\.glb)'") | ForEach-Object { $_.Groups[1].Value }
$minX=999; $maxX=-999; $minY=999; $maxY=-999; $minZ=999; $maxZ=-999

foreach ($file in $files) {
  $path = Join-Path $glbDir $file
  $bytes = [IO.File]::ReadAllBytes($path)
  $jsonLen = [BitConverter]::ToUInt32($bytes, 12)
  $json = [Text.Encoding]::UTF8.GetString($bytes, 20, $jsonLen)
  $obj = $json | ConvertFrom-Json
  foreach ($n in $obj.nodes) {
    if ($null -eq $n.mesh) { continue }
    $mesh = $obj.meshes[$n.mesh]
    $prim = $mesh.primitives[0]
    $pos = $obj.accessors[$prim.attributes.POSITION]
    $tx = if ($n.translation) { [double]$n.translation[0] } else { 0 }
    $ty = if ($n.translation) { [double]$n.translation[1] } else { 0 }
    $tz = if ($n.translation) { [double]$n.translation[2] } else { 0 }
    $wx1 = $pos.min[0] + $tx; $wx2 = $pos.max[0] + $tx
    $wy1 = $pos.min[1] + $ty; $wy2 = $pos.max[1] + $ty
    $wz1 = $pos.min[2] + $tz; $wz2 = $pos.max[2] + $tz
    if ($wx1 -lt $minX) { $minX = $wx1 }; if ($wx2 -gt $maxX) { $maxX = $wx2 }
    if ($wy1 -lt $minY) { $minY = $wy1 }; if ($wy2 -gt $maxY) { $maxY = $wy2 }
    if ($wz1 -lt $minZ) { $minZ = $wz1 }; if ($wz2 -gt $maxZ) { $maxZ = $wz2 }
  }
}
Write-Host "Assembly bounds:"
Write-Host "  X: $minX to $maxX"
Write-Host "  Y: $minY to $maxY"
Write-Host "  Z: $minZ to $maxZ"
