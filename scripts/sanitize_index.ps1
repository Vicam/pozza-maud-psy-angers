$ErrorActionPreference = 'Stop'
$indexPath = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'site/index.html'
if (-not (Test-Path $indexPath)) { throw "File not found: $indexPath" }

$html = Get-Content -Path $indexPath -Raw

# 1) Remove srcset and sizes from all <img> so browser uses local src
$imgAttrCleanup = [System.Text.RegularExpressions.Regex]::new('\s+(srcset|sizes)\s*=\s*"[^"]*"', 'IgnoreCase')
$html = $imgAttrCleanup.Replace($html, '')

# 2) Strip Wix/Thunderbolt scripts to prevent runtime from rewriting DOM
# Remove all <script>...</script> blocks
$scriptBlock = [System.Text.RegularExpressions.Regex]::new('<script\b[\s\S]*?<\/script>', 'IgnoreCase')
$html = $scriptBlock.Replace($html, '')

Set-Content -Path $indexPath -Value $html -Encoding UTF8
Write-Host 'Sanitized index.html: removed srcset/sizes and script tags.'
