# Club Control Player TEST: curated public PWA export, excludes source tests and real athlete archives.
param([Parameter(Mandatory=$true)][string]$Destination)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$source=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$target=[IO.Path]::GetFullPath($Destination)
$sep=[IO.Path]::DirectorySeparatorChar
if($target.Equals($source,[StringComparison]::OrdinalIgnoreCase) -or
 $target.StartsWith($source.TrimEnd([char[]]@('/','\'))+$sep,[StringComparison]::OrdinalIgnoreCase)){
 throw 'Destination cannot be inside source Player repository'
}
if(Test-Path -LiteralPath $target){
 $existing=@(Get-ChildItem -LiteralPath $target -Force | Where-Object {$_.Name -ne '.git'})
 if($existing.Count){throw 'Target must be empty except the .git directory'}
}else{New-Item -ItemType Directory -Path $target -Force | Out-Null}
$files=@(
 'index.html','config.js','app.js','sw.js','manifest.webmanifest',
 'styles.css','statistics.css','statistics.js','competition-context-catalog.js',
 'scripts/verify-test-isolation.cjs',
 '.github/workflows/cc-test-pages.yml'
)
foreach($relative in $files){
 $in=Join-Path $source $relative
 if(-not(Test-Path -LiteralPath $in -PathType Leaf)){throw "Missing static file: $relative"}
 $to=Join-Path $target $relative
 New-Item -ItemType Directory -Path (Split-Path -Parent $to) -Force | Out-Null
 Copy-Item -LiteralPath $in -Destination $to -Force
}
foreach($dir in @('icons','assets')){
 $from=Join-Path $source $dir
 if(-not(Test-Path $from -PathType Container)){throw "Missing $dir"}
 Copy-Item -LiteralPath $from -Destination (Join-Path $target $dir) -Recurse -Force
}
Set-Content -LiteralPath (Join-Path $target 'README.md') -Encoding UTF8 -Value @'
# CC PLAYER TEST
Isolated demo PWA for testing. No production Supabase/API connection.
No real personal athlete data or server authorization is included.
'@
Write-Output 'PASS: Player TEST static-only files exported; original Git history, archived protocols and private project sources excluded.'
Write-Output $target
