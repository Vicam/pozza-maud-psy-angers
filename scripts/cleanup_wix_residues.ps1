$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '..'
$indexPath = Join-Path $root 'site/index.html'
if (-not (Test-Path $indexPath)) { throw "File not found: $indexPath" }

$html = Get-Content -Path $indexPath -Raw

# 1) Replace remote favicons with local ones
$html = $html -replace '<link\s+rel="icon"[^>]*>', '<link rel="icon" sizes="192x192" href="./assets/pmpa/favicon-192.png" type="image/png">'
$html = $html -replace '<link\s+rel="shortcut icon"[^>]*>', '<link rel="shortcut icon" href="./assets/pmpa/favicon-32.png" type="image/png">'
$html = $html -replace '<link\s+rel="apple-touch-icon"[^>]*>', '<link rel="apple-touch-icon" href="./assets/pmpa/apple-touch-icon.png" type="image/png">'

# 2) Replace social preview images (OG/Twitter) to local og image if present
$html = $html -replace '<meta\s+property="og:image"\s+content="[^"]*"\s*>', '<meta property="og:image" content="./assets/pmpa/og-image.png">'
$html = $html -replace '<meta\s+name="twitter:image"\s+content="[^"]*"\s*>', '<meta name="twitter:image" content="./assets/pmpa/og-image.png">'

# 3) Remove preload/link tags to Wix/Thunderbolt assets (parastorage/siteassets)
$html = [System.Text.RegularExpressions.Regex]::Replace($html, '<link[^>]+href="https://siteassets\.parastorage\.com/[^"]+"[^>]*>\s*', '', 'IgnoreCase')

# 4) Drop the generator meta from Wix/pmpa builder
$html = [System.Text.RegularExpressions.Regex]::Replace($html, '<meta\s+name="generator"[^>]*>\s*', '', 'IgnoreCase')

# 5) Strip data-url/data-href attributes that point to parastorage from <style> tags while keeping the CSS
$html = [System.Text.RegularExpressions.Regex]::Replace($html, '(?<open><style)(?<attrs>[^>]*?\sdata-(?:url|href)="https://static\.parastorage\.com/[^"]*"[^>]*)(?<rest>>)', '${open}${rest}', 'IgnoreCase')

# 6) Remove commented mask-icon line that still points to pmpastatic
$html = [System.Text.RegularExpressions.Regex]::Replace($html, '<!--\s*<link[^>]+static\.pmpastatic\.com[^>]*>\s*-->', '', 'IgnoreCase')

# 7) Neutralize any CSS background-image that fetches from parastorage CDN
$html = [System.Text.RegularExpressions.Regex]::Replace($html, 'background-image:url\(https://static\.parastorage\.com[^\)]*\)', 'background-image:none', 'IgnoreCase')

Set-Content -Path $indexPath -Value $html -Encoding UTF8
Write-Host 'Cleaned Wix/CDN residues and switched favicons/OG images to local assets.'
