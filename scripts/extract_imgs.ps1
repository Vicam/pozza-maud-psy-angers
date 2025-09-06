$ErrorActionPreference = 'Stop'
$path = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'site/index.html'
if (-not (Test-Path $path)) {
  Write-Error "File not found: $path"
}
$content = Get-Content -Path $path -Raw
$imgPattern = '<img\b[^>]*>'
$alts = @()
[System.Text.RegularExpressions.Regex]::Matches($content, $imgPattern) | ForEach-Object {
  $tag = $_.Value
  $alt = [System.Text.RegularExpressions.Regex]::Match($tag, 'alt\s*=\s*"([^"]*)"', 'IgnoreCase').Groups[1].Value
  $src = [System.Text.RegularExpressions.Regex]::Match($tag, 'src\s*=\s*"([^"]*)"', 'IgnoreCase').Groups[1].Value
  $id  = [System.Text.RegularExpressions.Regex]::Match($tag, 'id\s*=\s*"([^"]*)"', 'IgnoreCase').Groups[1].Value
  $alts += [PSCustomObject]@{ Alt = $alt; Src = $src; Id = $id; Tag = $tag }
}
$out = $alts | ForEach-Object { "ALT=`"$($_.Alt)`"`tSRC=`"$($_.Src)`"`tID=`"$($_.Id)`"`tTAG=`"$($_.Tag)`"" }
$out | Set-Content -Path (Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'tmp_img_tags.tsv')
Write-Host ("Found {0} <img> tags" -f $alts.Count)
