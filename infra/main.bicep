targetScope = 'subscription'

@description('Short AZD environment name used for tags and deterministic naming.')
param environmentName string

@description('Azure region for all resources.')
param location string

@description('Exact resource group selected by the project owner.')
param resourceGroupName string

@description('Optional ACR image reference used in the second deployment phase.')
param applicationImage string = ''

@description('Create the one-time AcrPull role assignment. Set false for routine CI deployments.')
param deployAcrPullRole bool = true

var tags = {
  'azd-env-name': environmentName
  project: 'AgenticMSP'
  environment: 'development'
  managedBy: 'azd'
}

resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module resources './modules/resources.bicep' = {
  name: 'agenticmsp-resources'
  scope: resourceGroup
  params: {
    name: 'agenticmsp'
    environmentName: environmentName
    location: location
    tags: tags
    applicationImage: applicationImage
  }
}

module acrPullRole './modules/acr-pull-role.bicep' = if (deployAcrPullRole) {
  name: 'agenticmsp-acr-pull'
  scope: resourceGroup
  params: {
    acrName: resources.outputs.registryName
    principalId: resources.outputs.portalPrincipalId
  }
}

output AZURE_RESOURCE_GROUP string = resourceGroup.name
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.registryEndpoint
output AZURE_CONTAINER_REGISTRY_NAME string = resources.outputs.registryName
output AZURE_CONTAINER_APP_NAME string = resources.outputs.portalName
output PORTAL_URL string = resources.outputs.portalUrl
