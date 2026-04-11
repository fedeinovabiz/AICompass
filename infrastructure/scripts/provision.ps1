# ============== AI COMPASS — PROVISION AZURE INFRASTRUCTURE ==============
# Ejecutar: .\infrastructure\scripts\provision.ps1 -Environment dev -DbPassword "YourStrongPassword" -JwtSecret "YourJwtSecret" -AiApiKey "YourGeminiKey"

param(
    [ValidateSet('dev', 'qa', 'prod')]
    [string]$Environment = 'dev',
    [Parameter(Mandatory)]
    [string]$DbPassword,
    [Parameter(Mandatory)]
    [string]$JwtSecret,
    [Parameter(Mandatory)]
    [string]$AiApiKey,
    [string]$Location = 'eastus2',
    [string]$SubscriptionId = '6187760c-b370-438e-b3d2-e80a1da5f93e'
)

$ErrorActionPreference = "Stop"
$projectName = "aicompass"
$resourceGroup = "rg-$projectName-$Environment"

Write-Host "=== AI Compass — Provisioning $Environment ===" -ForegroundColor Cyan

# 1. Verificar Azure CLI
Write-Host "[1/6] Verificando Azure CLI..." -ForegroundColor Yellow
az account show --output none 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: No hay sesion activa en Azure CLI. Ejecuta 'az login' primero." -ForegroundColor Red
    exit 1
}
az account set --subscription $SubscriptionId
Write-Host "  Suscripcion: $SubscriptionId" -ForegroundColor Green

# 2. Crear Resource Group
Write-Host "[2/6] Creando Resource Group: $resourceGroup..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $Location --tags Owner=InovaBiz Project=$projectName Environment=$Environment ManagedBy=Bicep --output none
Write-Host "  Resource Group creado" -ForegroundColor Green

# 3. Deploy Bicep
Write-Host "[3/6] Desplegando infraestructura con Bicep..." -ForegroundColor Yellow
$deployResult = az deployment group create `
    --resource-group $resourceGroup `
    --template-file infrastructure/main.bicep `
    --parameters environment=$Environment `
    --parameters projectName=$projectName `
    --parameters dbAdminPassword=$DbPassword `
    --parameters jwtSecret=$JwtSecret `
    --parameters aiApiKey=$AiApiKey `
    --output json | ConvertFrom-Json

$backendUrl = $deployResult.properties.outputs.backendAppUrl.value
$staticUrl = $deployResult.properties.outputs.staticWebAppUrl.value
$postgresHost = $deployResult.properties.outputs.postgresHost.value
$backendAppName = $deployResult.properties.outputs.backendAppName.value
$staticWebAppName = $deployResult.properties.outputs.staticWebAppName.value

Write-Host "  Backend: $backendUrl" -ForegroundColor Green
Write-Host "  Frontend: $staticUrl" -ForegroundColor Green
Write-Host "  PostgreSQL: $postgresHost" -ForegroundColor Green

# 4. Ejecutar migracion SQL
Write-Host "[4/6] Ejecutando migracion SQL..." -ForegroundColor Yellow
$dbUrl = "postgresql://aicompassadmin:${DbPassword}@${postgresHost}:5432/ai_compass?sslmode=require"
$env:PGPASSWORD = $DbPassword
psql "host=$postgresHost port=5432 dbname=ai_compass user=aicompassadmin sslmode=require" -f ai-compass/backend/migrations/001_initial_schema.sql 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Migracion ejecutada" -ForegroundColor Green
} else {
    Write-Host "  Migracion ya ejecutada o error (verificar manualmente)" -ForegroundColor Yellow
}

# 5. Obtener deployment token de Static Web App
Write-Host "[5/6] Obteniendo token de Static Web App..." -ForegroundColor Yellow
$swaToken = az staticwebapp secrets list --name $staticWebAppName --resource-group $resourceGroup --query "properties.apiKey" -o tsv
Write-Host "  Token obtenido (guardar como AZURE_STATIC_WEB_APPS_API_TOKEN en GitHub Secrets)" -ForegroundColor Green

# 6. Resumen
Write-Host ""
Write-Host "=== PROVISION COMPLETADO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recursos creados:" -ForegroundColor White
Write-Host "  Resource Group: $resourceGroup"
Write-Host "  Backend App:    $backendAppName ($backendUrl)"
Write-Host "  Static Web App: $staticWebAppName ($staticUrl)"
Write-Host "  PostgreSQL:     $postgresHost"
Write-Host ""
Write-Host "GitHub Secrets a configurar:" -ForegroundColor Yellow
Write-Host "  AZURE_CREDENTIALS          = (az ad sp create-for-rbac --sdk-auth)"
Write-Host "  AZURE_STATIC_WEB_APPS_API_TOKEN = $swaToken"
Write-Host "  AZURE_BACKEND_APP_NAME     = $backendAppName"
Write-Host "  AZURE_RESOURCE_GROUP       = $resourceGroup"
Write-Host ""
Write-Host "Siguiente paso: Push a main para disparar GitHub Actions" -ForegroundColor Cyan
