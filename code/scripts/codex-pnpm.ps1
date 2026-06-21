$ErrorActionPreference = "Stop"

$nodeRoot = Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\node"
$nodeBin = Join-Path $nodeRoot "bin"
$nodeExe = Join-Path $nodeBin "node.exe"
$pnpmCli = Join-Path $nodeRoot "node_modules\pnpm\bin\pnpm.cjs"
$pnpxCli = Join-Path $nodeRoot "node_modules\pnpm\bin\pnpx.cjs"
$repoRoot = Split-Path -Parent $PSScriptRoot
$shimDir = Join-Path $repoRoot ".codex-pnpm-bin"
$pnpmShim = Join-Path $shimDir "pnpm.cmd"
$pnpxShim = Join-Path $shimDir "pnpx.cmd"
$missingPrefixZh = -join ([char[]](0x672A, 0x627E, 0x5230))

if (-not (Test-Path -LiteralPath $nodeExe)) {
  Write-Error "$missingPrefixZh Codex bundled Node runtime: $nodeExe`nCodex bundled Node runtime not found: $nodeExe"
  exit 1
}

if (-not (Test-Path -LiteralPath $pnpmCli)) {
  Write-Error "$missingPrefixZh Codex bundled pnpm CLI: $pnpmCli`nCodex bundled pnpm CLI not found: $pnpmCli"
  exit 1
}

New-Item -ItemType Directory -Force -Path $shimDir | Out-Null
Set-Content -LiteralPath $pnpmShim -Encoding ASCII -Value @(
  "@echo off",
  "`"$nodeExe`" `"$pnpmCli`" %*"
)
Set-Content -LiteralPath $pnpxShim -Encoding ASCII -Value @(
  "@echo off",
  "`"$nodeExe`" `"$pnpxCli`" %*"
)

$env:Path = "$shimDir;$nodeBin;$env:Path"

& $nodeExe $pnpmCli @args
exit $LASTEXITCODE
