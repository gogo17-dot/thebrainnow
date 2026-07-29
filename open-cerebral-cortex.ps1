# Open the interactive cerebral cortex viewer in your default browser.
$port = 8088
$url = "http://localhost:$port/"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting local server and opening brain anatomy viewer..."
Write-Host ""

$serveScript = Join-Path $root 'serve.ps1'
$serverJob = Start-Job -ScriptBlock {
  param($script)
  powershell -ExecutionPolicy Bypass -File $script
} -ArgumentList $serveScript

Start-Sleep -Seconds 2
Start-Process $url

Write-Host "Opened: $url"
Write-Host "Keep this window open while using the viewer. Press Ctrl+C to stop the server."
Write-Host ""

try {
  Receive-Job $serverJob -Wait
}
finally {
  Stop-Job $serverJob -ErrorAction SilentlyContinue
  Remove-Job $serverJob -ErrorAction SilentlyContinue
}
