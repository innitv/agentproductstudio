<#
.SYNOPSIS
    Запускает Claude Code на бэкенде DeepSeek в отдельной сессии.

.DESCRIPTION
    Переменные ставятся только для текущего процесса и не протекают в основную
    продуктовую сессию. Ключ берётся из окружения или из локального .env и
    никогда не печатается.

    Какие задачи сюда можно отдавать, а какие нельзя —
    docs/architecture/deepseek-delegation.md.

.PARAMETER Pro
    Использовать deepseek-v4-pro как основную модель (дороже, сильнее на
    сложной агентной работе). По умолчанию основная модель — flash.

.EXAMPLE
    ./tooling/scripts/claude-deepseek.ps1
    ./tooling/scripts/claude-deepseek.ps1 -Pro
#>

[CmdletBinding()]
param(
    [switch]$Pro
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# --- Ключ: сначала окружение, потом .env ---
$apiKey = $env:DEEPSEEK_API_KEY

if (-not $apiKey) {
    $envFile = Join-Path $repoRoot '.env'
    if (Test-Path $envFile) {
        $line = Select-String -Path $envFile -Pattern '^\s*DEEPSEEK_API_KEY\s*=' -ErrorAction SilentlyContinue |
                Select-Object -First 1
        if ($line) {
            $apiKey = ($line.Line -split '=', 2)[1].Trim().Trim('"').Trim("'")
        }
    }
}

if (-not $apiKey) {
    Write-Error @"
DEEPSEEK_API_KEY не найден ни в окружении, ни в .env.
Добавьте строку DEEPSEEK_API_KEY=... в .env (файл в .gitignore) и повторите.
"@
    exit 1
}

# --- Модели ---
$mainModel = if ($Pro) { 'deepseek-v4-pro' } else { 'deepseek-v4-flash' }

$env:ANTHROPIC_BASE_URL           = 'https://api.deepseek.com/anthropic'
$env:ANTHROPIC_AUTH_TOKEN         = $apiKey
$env:ANTHROPIC_MODEL              = $mainModel
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = 'deepseek-v4-pro'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = $mainModel
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL  = 'deepseek-v4-flash'
$env:CLAUDE_CODE_SUBAGENT_MODEL     = 'deepseek-v4-flash'

# 🔴 Изоляция конфигурации обязательна, без неё режим не работает.
# Claude Code с активной подпиской игнорирует ANTHROPIC_AUTH_TOKEN и отправляет
# в DeepSeek сохранённые креды подписки; DeepSeek отвечает 401, а до этого
# несколько минут висят ретраи (замерено 2026-08-06). Отдельный CLAUDE_CONFIG_DIR
# лишает клиента сохранённых кредов, и он берёт ключ из переменной.
# Каталог постоянный: иначе onboarding повторяется на каждом запуске.
$env:CLAUDE_CONFIG_DIR = Join-Path $HOME '.claude-deepseek'
New-Item -ItemType Directory -Force -Path $env:CLAUDE_CONFIG_DIR | Out-Null

# Присваивание $null переменную не гасит надёжно — удаляем явно,
# чтобы ключ Anthropic не уехал во внешнего провайдера
Remove-Item Env:\ANTHROPIC_API_KEY -ErrorAction SilentlyContinue

Write-Host ''
Write-Host '  Claude Code -> DeepSeek' -ForegroundColor Cyan
Write-Host "  основная модель: $mainModel, субагенты: deepseek-v4-flash"
Write-Host "  конфиг: $env:CLAUDE_CONFIG_DIR (отдельный от основного)"
Write-Host ''
Write-Host '  НЕ делать в этой сессии:' -ForegroundColor Yellow
Write-Host '    - визуальное (нет vision): гейты 8.5a/8.5b, visual-diff, Figma write'
Write-Host '    - продуктовые стадии со статусом success: research, PRD, copy, screens'
Write-Host '    - external write: Notion, git push, deploy, секреты'
Write-Host '    - клиентские материалы А3'
Write-Host ''
Write-Host '  Раскладка: docs/architecture/deepseek-delegation.md' -ForegroundColor DarkGray
Write-Host ''

Push-Location $repoRoot
try {
    claude @args
}
finally {
    Pop-Location
}
