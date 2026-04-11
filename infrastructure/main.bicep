// ============== AI COMPASS — INFRASTRUCTURE ==============
// Azure PaaS: Static Web App + App Service + PostgreSQL + Key Vault + App Insights

@allowed(['dev', 'qa', 'prod'])
param environment string = 'dev'
param location string = 'eastus2'
@minLength(3) @maxLength(20)
param projectName string = 'aicompass'
@secure()
param dbAdminPassword string
@secure()
param jwtSecret string
@secure()
param aiApiKey string

// ============== VARIABLES ==============
var commonTags = {
  Owner: 'InovaBiz'
  Client: 'InovaBiz'
  Environment: environment
  Project: projectName
  ManagedBy: 'Bicep'
}

var backendAppName = 'wap-${projectName}-backend-${environment}'
var appServicePlanName = 'asp-${projectName}-${environment}'
var staticWebAppName = 'stapp-${projectName}-${environment}'
var postgresServerName = 'psql-${projectName}-${environment}'
var keyVaultName = 'akv-${projectName}-${environment}'
var appInsightsName = 'appi-${projectName}-${environment}'
var logAnalyticsName = 'log-${projectName}-${environment}'
var databaseName = 'ai_compass'
var dbAdminUser = 'aicompassadmin'

var skuConfig = {
  dev: {
    appServicePlan: 'B1'
    databaseSku: 'Standard_B1ms'
    databaseTier: 'Burstable'
    databaseStorageGB: 32
  }
  qa: {
    appServicePlan: 'S1'
    databaseSku: 'Standard_B2s'
    databaseTier: 'Burstable'
    databaseStorageGB: 64
  }
  prod: {
    appServicePlan: 'P1V2'
    databaseSku: 'Standard_D2s_v3'
    databaseTier: 'GeneralPurpose'
    databaseStorageGB: 128
  }
}

var currentSku = skuConfig[environment]

// ============== LOG ANALYTICS ==============
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: commonTags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// ============== APPLICATION INSIGHTS ==============
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: commonTags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// ============== KEY VAULT ==============
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: commonTags
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

// ============== KEY VAULT SECRETS ==============
resource secretDbUrl 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'database-url'
  properties: {
    value: 'postgresql://${dbAdminUser}:${dbAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${databaseName}?sslmode=require'
  }
}

resource secretJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'jwt-secret'
  properties: { value: jwtSecret }
}

resource secretAiKey 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'ai-api-key'
  properties: { value: aiApiKey }
}

// ============== POSTGRESQL FLEXIBLE SERVER ==============
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: postgresServerName
  location: location
  tags: commonTags
  sku: {
    name: currentSku.databaseSku
    tier: currentSku.databaseTier
  }
  properties: {
    version: '16'
    administratorLogin: dbAdminUser
    administratorLoginPassword: dbAdminPassword
    storage: { storageSizeGB: currentSku.databaseStorageGB }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: { mode: 'Disabled' }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: { charset: 'UTF8', collation: 'en_US.utf8' }
}

resource postgresFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ============== APP SERVICE PLAN ==============
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: commonTags
  kind: 'linux'
  sku: { name: currentSku.appServicePlan }
  properties: { reserved: true }
}

// ============== APP SERVICE (BACKEND) ==============
resource backendApp 'Microsoft.Web/sites@2023-12-01' = {
  name: backendAppName
  location: location
  tags: commonTags
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: environment != 'dev'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'PORT', value: '8080' }
        { name: 'WEBSITE_RUN_FROM_PACKAGE', value: '0' }
        { name: 'DATABASE_URL', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=database-url)' }
        { name: 'JWT_SECRET', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=jwt-secret)' }
        { name: 'AI_API_KEY', value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=ai-api-key)' }
        { name: 'AI_PROVIDER', value: 'gemini' }
        { name: 'AI_MODEL', value: 'gemini-2.5-pro' }
        { name: 'JWT_EXPIRES_IN', value: '24h' }
        { name: 'UPLOAD_DIR', value: '/home/site/uploads' }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
      ]
    }
  }
}

// Key Vault access for App Service managed identity
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, backendApp.id, '4633458b-17de-408a-b874-0445c86b69e6')
  scope: keyVault
  properties: {
    principalId: backendApp.identity.principalId
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
    principalType: 'ServicePrincipal'
  }
}

// ============== STATIC WEB APP (FRONTEND) ==============
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  tags: commonTags
  sku: { name: 'Free', tier: 'Free' }
  properties: {}
}

// ============== OUTPUTS ==============
output backendAppUrl string = 'https://${backendApp.properties.defaultHostName}'
output backendAppName string = backendAppName
output staticWebAppName string = staticWebAppName
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output keyVaultName string = keyVaultName
output appInsightsName string = appInsightsName
output resourceGroupName string = 'rg-${projectName}-${environment}'
