$ErrorActionPreference = 'Stop'
$port = 8088
try {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://127.0.0.1:$port/")
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
  Write-Output "STARTED on $port"
  $listener.Stop()
} catch {
  Write-Output ("FAIL: " + $_.Exception.Message)
}
