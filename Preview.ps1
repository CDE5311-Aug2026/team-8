$ErrorActionPreference = 'Stop'
$taskNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
if (-not (Test-Path -LiteralPath $taskNode)) { $taskNode = (Get-Command node).Source }
Push-Location $PSScriptRoot
try { & $taskNode 'preview.mjs' }
finally { Pop-Location }
