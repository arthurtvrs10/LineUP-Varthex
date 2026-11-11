# Exercises configuration without a real key, network request or project env change.
$ErrorActionPreference = 'Stop'
$taskTempBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$taskTestRoot = Join-Path $taskTempBase ('lineup-sandbox-test-' + [Guid]::NewGuid().ToString('N'))
$taskSource = Join-Path $PSScriptRoot 'configure-asaas-sandbox.ps1'
function Assert-Test([bool]$Condition, [string]$Message) { if (-not $Condition) { throw $Message } }
function Read-Host { param($Prompt,[switch]$AsSecureString) ConvertTo-SecureString '$aact_hmlg_lineup_fake_test_key' -AsPlainText -Force }
function Invoke-RestMethod {
    param($Uri,$Method,$MaximumRedirection,$TimeoutSec,$Headers)
    Assert-Test ($Uri -eq 'https://api-sandbox.asaas.com/v3/myAccount/commercialInfo/') 'Unexpected API host'
    Assert-Test ($Headers.access_token -eq '$aact_hmlg_lineup_fake_test_key') 'Key was changed'
    return @{status='APPROVED'}
}
try {
    $null = New-Item -ItemType Directory -Path (Join-Path $taskTestRoot 'scripts'),(Join-Path $taskTestRoot 'backend')
    $taskScript = Join-Path $taskTestRoot 'scripts/configure-asaas-sandbox.ps1'
    $taskEnv = Join-Path $taskTestRoot 'backend/.env'
    Copy-Item -LiteralPath $taskSource -Destination $taskScript
    [IO.File]::WriteAllText($taskEnv,"KEEP_ME=yes`nASAAS_ENABLED=false`n")
    $taskOutput = (& $taskScript 6>&1 | Out-String)
    $taskContents = [IO.File]::ReadAllText($taskEnv)
    Assert-Test ($taskContents.Contains('KEEP_ME=yes')) 'Unrelated setting lost'
    Assert-Test ($taskContents.Contains("ASAAS_API_KEY='" + '$aact_hmlg_lineup_fake_test_key' + "'")) 'Docker dollar escaping is incorrect'
    Assert-Test (-not $taskOutput.Contains('$aact_hmlg_')) 'Key leaked into output'
    $taskCheck = & $taskScript -CheckOnly
    Assert-Test ($taskCheck.Enabled -and $taskCheck.SandboxKeyPresent -and $taskCheck.WebhookTokenConfigured -and $taskCheck.SandboxActionsEnabled) 'Configuration flags missing'
    $null = & $taskScript -TestConnection 6>&1
    $taskBefore = [IO.File]::ReadAllText($taskEnv)
    $null = & $taskScript 6>&1
    Assert-Test ([IO.File]::ReadAllText($taskEnv) -eq $taskBefore) 'Repeated setup changed token or duplicated settings'
    [IO.File]::WriteAllText($taskEnv,"ASAAS_ENVIRONMENT=production`n")
    $taskRejected=$false
    try { $null = & $taskScript 6>&1 } catch { $taskRejected=$true }
    Assert-Test $taskRejected 'Production configuration was not protected'
    Assert-Test ([IO.File]::ReadAllText($taskEnv) -eq "ASAAS_ENVIRONMENT=production`n") 'Production file was changed'
    Write-Host 'PASS: sandbox setup, hidden key, literal dollar, preserved settings, idempotence and production protection.'
} finally {
    $taskResolved = [IO.Path]::GetFullPath($taskTestRoot)
    if ($taskResolved.StartsWith($taskTempBase,[StringComparison]::OrdinalIgnoreCase) -and
        [IO.Path]::GetFileName($taskResolved) -match '^lineup-sandbox-test-[a-f0-9]{32}$' -and
        (Test-Path -LiteralPath $taskResolved)) {
        Remove-Item -LiteralPath $taskResolved -Recurse -Force
    }
}
