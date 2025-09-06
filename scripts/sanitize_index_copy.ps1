$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..'
$indexPath = Join-Path $root 'site/index.html'
$outPath = Join-Path $root 'site/index.static.html'

$html = Get-Content -Path $indexPath -Raw
$imgAttrCleanup = [System.Text.RegularExpressions.Regex]::new('\s+(srcset|sizes)\s*=\s*"[^"]*"', 'IgnoreCase')
$html = $imgAttrCleanup.Replace($html, '')
$scriptBlock = [System.Text.RegularExpressions.Regex]::new('<script\b[\s\S]*?<\/script>', 'IgnoreCase')
$html = $scriptBlock.Replace($html, '')

Set-Content -Path $outPath -Value $html -Encoding UTF8
Write-Host "Wrote sanitized copy: $outPath"
