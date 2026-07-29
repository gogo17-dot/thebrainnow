# Simple static file server for the Neural Network Simulator (no Node required)
$port = 8088
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$public = Join-Path $root "public"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()

Write-Host "Interactive Brain Anatomy running at http://localhost:$port"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".glb"  = "model/gltf-binary"
  ".json" = "application/json"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
}

function Get-Mime([string]$path) {
  $ext = [System.IO.Path]::GetExtension($path).ToLower()
  if ($mime.ContainsKey($ext)) { return $mime[$ext] }
  return "application/octet-stream"
}

function Send-File(
  [System.Net.HttpListenerRequest]$req,
  [System.Net.HttpListenerResponse]$res,
  [string]$filePath
) {
  $bytes = [System.IO.File]::ReadAllBytes($filePath)
  $res.StatusCode = 200
  $res.ContentType = Get-Mime $filePath
  $res.ContentLength64 = $bytes.Length
  if ($req.HttpMethod -ne 'HEAD') {
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  }
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
    if ($urlPath -eq "/" -or $urlPath -eq "") { $urlPath = "/index.html" }

    $relative = $urlPath.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)

    $candidates = @(
      (Join-Path $root $relative),
      (Join-Path (Join-Path $root 'src') $relative),
      (Join-Path $public $relative)
    )

    $filePath = $null
    foreach ($candidate in $candidates) {
      if (Test-Path -LiteralPath $candidate -PathType Leaf) {
        $filePath = $candidate
        break
      }
    }

    try {
      if ($null -ne $filePath) {
        Send-File $request $response $filePath
      }
      else {
        $notFound = [Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
        $response.StatusCode = 404
        $response.ContentType = "text/plain"
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
      }
    }
    catch {
      try {
        $response.StatusCode = 500
        $msg = [Text.Encoding]::UTF8.GetBytes("500: $($_.Exception.Message)")
        $response.OutputStream.Write($msg, 0, $msg.Length)
      } catch {}
    }
    finally {
      $response.Close()
    }
  }
}
finally {
  $listener.Stop()
}
