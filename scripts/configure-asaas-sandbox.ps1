[CmdletBinding()]
param([switch]$CheckOnly, [switch]$TestConnection)

$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskEnvPath = Join-Path $taskRoot 'backend/.env.local'
$taskLines = if (Test-Path -LiteralPath $taskEnvPath) { [IO.File]::ReadAllLines($taskEnvPath) } else { @() }
function Read-Setting([string]$Name) {
    $matchesFound = @($taskLines | Where-Object { $_ -match ('^\s*' + [regex]::Escape($Name) + '\s*=') })
    if ($matchesFound.Count -gt 1) { throw "Variavel duplicada: $Name. Corrija antes de continuar." }
    if ($matchesFound.Count -eq 0) { return '' }
    $value = ($matchesFound[0] -split '=',2)[1].Trim()
    if ($value.Length -ge 2 -and (($value.StartsWith("'") -and $value.EndsWith("'")) -or ($value.StartsWith('"') -and $value.EndsWith('"')))) {
        $value = $value.Substring(1,$value.Length-2)
    }
    return $value
}
$taskEnvironment = Read-Setting 'ASAAS_ENVIRONMENT'
if ($taskEnvironment -and $taskEnvironment -ne 'sandbox') { throw 'Configuracao de producao detectada. Use outro ambiente/banco para sandbox.' }
$taskKey = Read-Setting 'ASAAS_API_KEY'
if ($CheckOnly) {
    [pscustomobject]@{
        Environment = $(if ($taskEnvironment) { $taskEnvironment } else { 'sandbox (padrao)' })
        Enabled = ((Read-Setting 'ASAAS_ENABLED') -eq 'true')
        SandboxKeyPresent = $taskKey.StartsWith('$aact_hmlg_')
        WebhookTokenConfigured = ((Read-Setting 'ASAAS_WEBHOOK_TOKEN').Length -ge 32)
        SandboxActionsEnabled = ((Read-Setting 'ASAAS_SANDBOX_ACTIONS_ENABLED') -eq 'true')
    }
    return
}
if (-not $TestConnection) {
    Write-Host 'Crie uma conta em https://sandbox.asaas.com e gere a chave em Integracoes > Chaves API.'
    $taskSecureKey = Read-Host 'Cole a chave SANDBOX (entrada oculta)' -AsSecureString
    $taskKey = [System.Net.NetworkCredential]::new('', $taskSecureKey).Password.Trim()
}
if (-not $taskKey.StartsWith('$aact_hmlg_') -or $taskKey -match "[\s']") {
    throw 'Chave ausente ou invalida para sandbox. A chave esperada comeca com $aact_hmlg_.'
}
try {
    # Only the fixed sandbox host is contacted; provider response and key are never printed.
    $null = Invoke-RestMethod -Uri 'https://api-sandbox.asaas.com/v3/myAccount/commercialInfo/' -Method Get -MaximumRedirection 0 -TimeoutSec 30 -Headers @{access_token=$taskKey; 'User-Agent'='LineUp-Sandbox-Setup/1.0'}
} catch {
    throw 'Nao foi possivel validar a chave no Sandbox. Confira chave, permissoes, conta e conexao. Nenhuma configuracao foi salva.'
}
if ($TestConnection) { Write-Host 'Conexao com Asaas Sandbox validada. Nenhuma cobranca criada.'; return }

$taskToken = Read-Setting 'ASAAS_WEBHOOK_TOKEN'
if ($taskToken.Length -lt 32) {
    $taskBytes = New-Object byte[] 32
    $taskRng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $taskRng.GetBytes($taskBytes) } finally { $taskRng.Dispose() }
    $taskToken = -join ($taskBytes | ForEach-Object { $_.ToString('x2') })
}
$taskSettings = [ordered]@{
    ASAAS_ENABLED='true'
    ASAAS_ENVIRONMENT='sandbox'
    ASAAS_API_KEY=$taskKey
    ASAAS_WEBHOOK_TOKEN=$taskToken
    ASAAS_SANDBOX_ACTIONS_ENABLED='true'
    ASAAS_WORKER_ENABLED='true'
}
$taskOutput = [Collections.Generic.List[string]]::new()
foreach ($line in $taskLines) {
    $setting = ($line -split '=',2)[0].Trim()
    if (-not $taskSettings.Contains($setting)) { $taskOutput.Add($line) }
}
if (-not (Read-Setting 'FRONTEND_URL')) { $taskOutput.Add('FRONTEND_URL=http://localhost:3000') }
foreach ($setting in $taskSettings.Keys) {
    # Single quotes preserve the literal $ in Asaas keys under Docker Compose.
    $taskOutput.Add("${setting}='" + $taskSettings[$setting] + "'")
}
[IO.File]::WriteAllLines($taskEnvPath, $taskOutput, [Text.UTF8Encoding]::new($false))
$taskKey = $null
Write-Host 'Sandbox configurado em backend/.env.local. Chave e token nao foram exibidos.'
Write-Host 'Recrie o backend: docker compose up -d --no-deps --force-recreate backend'
Write-Host 'Para testar o bloqueio inicial, cadastre uma NOVA barbearia de teste.'
