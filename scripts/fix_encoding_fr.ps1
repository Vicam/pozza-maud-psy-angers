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

# Fix common corrupted French diacritics seen after migration using code points
$replacements = @{}
# Sequences like "Ã©" (C3 A9) that should be a single 'é'
$replacements[[string]([char]0x00C3) + [char]0x00A9] = [string][char]0x00E9 # Ã© -> é
$replacements[[string]([char]0x00C3) + [char]0x00A8] = [string][char]0x00E8 # Ã¨ -> è
$replacements[[string]([char]0x00C3) + [char]0x00AA] = [string][char]0x00EA # Ãª -> ê
$replacements[[string]([char]0x00C3) + [char]0x00AB] = [string][char]0x00EB # Ã« -> ë
$replacements[[string]([char]0x00C3) + [char]0x00A0] = [string][char]0x00E0 # Ã  -> à
$replacements[[string]([char]0x00C3) + [char]0x00A2] = [string][char]0x00E2 # Ã¢ -> â
$replacements[[string]([char]0x00C3) + [char]0x00B4] = [string][char]0x00F4 # Ã´ -> ô
$replacements[[string]([char]0x00C3) + [char]0x00B9] = [string][char]0x00F9 # Ã¹ -> ù
$replacements[[string]([char]0x00C3) + [char]0x00BB] = [string][char]0x00FB # Ã» -> û
$replacements[[string]([char]0x00C3) + [char]0x00A7] = [string][char]0x00E7 # Ã§ -> ç
$replacements[[string]([char]0x00C3) + [char]0x0089] = [string][char]0x00C9 # Ã	? -> É (guard for console)
$replacements[[string]([char]0x00C3) + [char]0x0088] = [string][char]0x00C8 # Ã? -> È
$replacements[[string]([char]0x00C3) + [char]0x0094] = [string][char]0x00D4 # Ã? -> Ô

# Smart quotes and dashes commonly mangled
$replacements[[string]([char]0x00E2) + [char]0x0080 + [char]0x0099] = [string][char]0x2019 # â€™ -> ’
$replacements[[string]([char]0x00E2) + [char]0x0080 + [char]0x009C] = [string][char]0x201C # â€œ -> “
$replacements[[string]([char]0x00E2) + [char]0x0080 + [char]0x009D] = [string][char]0x201D # â€� -> ”
$replacements[[string]([char]0x00E2) + [char]0x0080 + [char]0x0098] = [string][char]0x2018 # â€˜ -> ‘
$replacements[[string]([char]0x00E2) + [char]0x0080 + [char]0x0093] = [string][char]0x2013 # â€“ -> –
$replacements[[string]([char]0x00E2) + [char]0x0080 + [char]0x0094] = [string][char]0x2014 # â€” -> —

# Ellipsis, Euro, Zero-width space (mis-decoded sequences)
$replacements['â€¦'] = [string][char]0x2026   # ellipsis
$replacements['â‚¬'] = [string][char]0x20AC   # euro sign
$replacements['â€‹'] = ''                    # zero-width space -> remove

# Rare stray characters seen
$replacements[[string][char]0x01F8] = [string][char]0x00E9  # Ǹ -> é (seen in console render)
$replacements[[string][char]0x01E6] = [string][char]0x00EA  # Ǧ -> ê
$replacements[[string][char]0x01FD] = [string][char]0x00E2  # ǽ -> â

foreach ($k in $replacements.Keys) {
  $v = $replacements[$k]
  $text = $text.Replace($k, $v)
}

# Remove stray 'Â' that sometimes appears before punctuation when mis-decoded
$text = $text.Replace([string][char]0x00C2, '')

Set-Content -Path $indexPath -Value $text -Encoding UTF8
Write-Host "Applied encoding fixes and ensured UTF-8 meta."
