$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..'
$indexPath = Join-Path $root 'site/index.html'
if (-not (Test-Path $indexPath)) { throw "File not found: $indexPath" }

$text = Get-Content -Path $indexPath -Raw

# Ensure <meta charset="utf-8"> early in <head>
$hasShortMeta = $text -match '<meta\s+charset="?utf-8"?\s*/?>'
if (-not $hasShortMeta) {
  $text = $text -replace '(<head[^>]*>)', '$1<meta charset="utf-8">'
}

# Fix common corrupted French diacritics seen after migration
$replacements = @{
  'Ǹ' = 'é'
  'Ǧ' = 'ê'
  'ǽ' = 'â'
  '�'  = 'é'  # fallback; may over-replace, but better than diamond question
}
foreach ($k in $replacements.Keys) {
  $v = $replacements[$k]
  $text = $text -replace [Regex]::Escape($k), [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $v }
}

# Normalize common HTML: replace multiple spaces before punctuation due to encoding glitches
$text = $text -replace 'Â\s*', ''

Set-Content -Path $indexPath -Value $text -Encoding UTF8
Write-Host "Applied encoding fixes and ensured UTF-8 meta."

