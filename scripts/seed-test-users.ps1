# Roda scripts/seed-test-users.sh no Windows sem precisar trocar de
# terminal ou caçar o caminho do Git Bash na mão.
#
# Uso (PowerShell, a partir da raiz do repositório):
#   .\scripts\seed-test-users.ps1
#   .\scripts\seed-test-users.ps1 seu-email@gmail.com   (promove esse e-mail a SUPER_ADMIN)
#
# Se der erro de "não é possível carregar o arquivo ... políticas de
# execução", rode antes (numa sessão só, não muda nada permanente):
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

$ErrorActionPreference = "Stop"

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCommand) {
    Write-Host "Git não encontrado no PATH. Instale em https://git-scm.com/download/win (inclui o Git Bash) e abra um terminal novo." -ForegroundColor Red
    exit 1
}

# git.exe normalmente fica em <raiz do Git>\cmd\git.exe ou \mingw64\bin\git.exe —
# bash.exe é sempre <raiz do Git>\bin\bash.exe.
$gitRoot = Split-Path (Split-Path $gitCommand.Source)
$bashPath = Join-Path $gitRoot "bin\bash.exe"

if (-not (Test-Path $bashPath)) {
    Write-Host "Git foi encontrado em '$($gitCommand.Source)', mas não achei bash.exe em '$bashPath'." -ForegroundColor Red
    Write-Host "Tente rodar direto: & `"<caminho da sua instalação do Git>\bin\bash.exe`" scripts/seed-test-users.sh" -ForegroundColor Yellow
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$seedScript = Join-Path $scriptDir "seed-test-users.sh"

Push-Location $repoRoot
try {
    & $bashPath $seedScript @args
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
