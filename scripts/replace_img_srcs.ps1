$ErrorActionPreference = 'Stop'
$indexPath = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'site/index.html'
if (-not (Test-Path $indexPath)) { throw "File not found: $indexPath" }

$content = Get-Content -Path $indexPath -Raw

$map = @(
  @{ test = { param($alt) $alt -eq 'logo .png' }; new = './assets/pmpa/logo.png' }
  @{ test = { param($alt) $alt -match 'psychologue tenant un crayon' }; new = './assets/pmpa/psy_bureau.jpg' }
  @{ test = { param($alt) $alt -match 'kaplas' }; new = './assets/pmpa/kaplas.jpg' }
  @{ test = { param($alt) $alt -match 'muret' }; new = './assets/pmpa/muret.jpg' }
  @{ test = { param($alt) $alt -match 'pots.*crayons' -or $alt -match 'pots.* crayons' }; new = './assets/pmpa/pot_crayon.jpg' }
  @{ test = { param($alt) $alt -match 'famille' -and $alt -match 'for' }; new = './assets/pmpa/famille_foret.jpg' }
  @{ test = { param($alt) $alt -match 'colored pencil' }; new = './assets/pmpa/colored_pencil.jpg' }
  @{ test = { param($alt) $alt -match 'logo_universite' }; new = './assets/pmpa/logo_universite.jpg' }
  @{ test = { param($alt) $alt -eq 'POZZA Maud psychologue' }; new = './assets/pmpa/maud_pozza.jpg' }
  @{ test = { param($alt) $alt -match 'cabinet de psychologue.*enfant' }; new = './assets/pmpa/cabinet_enfant.jpg' }
)

$imgRegex = [System.Text.RegularExpressions.Regex]::new('<img\b[^>]*>', 'IgnoreCase')
$srcRegex = [System.Text.RegularExpressions.Regex]::new('src\s*=\s*"([^"]*)"', 'IgnoreCase')
$altRegex = [System.Text.RegularExpressions.Regex]::new('alt\s*=\s*"([^"]*)"', 'IgnoreCase')

$changed = 0
$newContent = $imgRegex.Replace($content, [System.Text.RegularExpressions.MatchEvaluator] {
  param($m)
  $tag = $m.Value
  $alt = ($altRegex.Match($tag).Groups[1].Value)
  if (-not $alt) { return $tag }
  foreach ($rule in $map) {
    if (& $rule.test $alt) {
      $newSrc = $rule.new
      if (-not [string]::IsNullOrWhiteSpace($newSrc)) {
        $tag2 = $srcRegex.Replace($tag, { param($m2) 'src="' + $newSrc + '"' }, 1)
        if ($tag2 -ne $tag) { $script:changed++ }
        return $tag2
      }
    }
  }
  return $tag
})

if ($changed -gt 0) {
  Set-Content -Path $indexPath -Value $newContent -Encoding UTF8
}

Write-Host ("Updated {0} <img> src attributes" -f $changed)
