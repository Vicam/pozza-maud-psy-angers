$ErrorActionPreference = 'Stop'
$path = Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'site/index.html'
$content = Get-Content -Path $path -Raw
$imgPattern = '<img\b[^>]*>'
$rows = @()
[System.Text.RegularExpressions.Regex]::Matches($content, $imgPattern) | ForEach-Object {
  $tag = $_.Value
  $alt = [System.Text.RegularExpressions.Regex]::Match($tag, 'alt\s*=\s*"([^"]*)"', 'IgnoreCase').Groups[1].Value
  $src = [System.Text.RegularExpressions.Regex]::Match($tag, 'src\s*=\s*"([^"]*)"', 'IgnoreCase').Groups[1].Value
  $id  = [System.Text.RegularExpressions.Regex]::Match($tag, 'id\s*=\s*"([^"]*)"', 'IgnoreCase').Groups[1].Value
  $rows += [PSCustomObject]@{ Alt = $alt; Src = $src; Id = $id }
}
$rows | ForEach-Object { "ALT=`"$($_.Alt)`"`tSRC=`"$($_.Src)`"`tID=`"$($_.Id)`"" } | Set-Content -Path (Join-Path $PSScriptRoot '..' | Join-Path -ChildPath 'tmp_img_map.tsv')
Write-Host ("Found {0} <img> tags" -f $rows.Count)
