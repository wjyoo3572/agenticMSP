# Azure Deployment Plan

> **Status:** Validated

Generated: 2026-07-01

## 1. Project Overview

**Goal:** Deploy a public AgenticMSP starter portal to Azure Container Apps. Future agent owners can add independently owned agents through repository commits and pull requests.

**Path:** New Project

## 2. Requirements

| Attribute | Value |
|---|---|
| Classification | Development / MVP |
| Scale | Small |
| Budget | Cost-Optimized |
| Subscription | Current subscription `c32029ab-0ba9-4306-8617-32defb900cd0` (confirmed by user) |
| Location | `koreacentral` (confirmed by user) |
| Resource group | `RG-YWJ-AgenticMSP-20260701` |
| Availability | At least one externally reachable Container App |

No subscription-level Azure Policy assignments were returned on 2026-07-01.

## 3. Components

| Component | Type | Technology | Path |
|---|---|---|---|
| portal | Web/API | Node.js 22, dependency-free HTTP server | `src/portal` |
| agent catalog | Registration contract | JSON | `agents/catalog.json` |

## 4. Recipe Selection

**Selected:** Standalone Bicep with Azure CLI; `azure.yaml` is retained for future AZD/CI adoption

**Rationale:** Azure-only greenfield project and repeatable infrastructure. The workstation does not have AZD or a running Docker engine, so Azure CLI plus ACR remote build avoids local tool installation while preserving a clean future CI/CD path.

## 5. Architecture

**Stack:** Containers

| Component | Azure Service | SKU / configuration |
|---|---|---|
| portal | Azure Container Apps | Consumption, 0.25 vCPU, 0.5 GiB, min 1, max 2 |
| image registry | Azure Container Registry | Basic |
| runtime environment | Container Apps managed environment | Consumption workload profile |
| logs | Log Analytics | PerGB2018, 30-day retention |

The portal has external HTTPS ingress, system-assigned managed identity, health probes, and no application secrets. ACR pull uses the built-in `AcrPull` role at registry scope.

### Repository extension model

```text
src/portal/                 shared portal shell
agents/catalog.json         agent registration catalog
agents/<agent-id>/          future agent-owned implementation
infra/                      Bicep infrastructure
pipelines/                  future Azure DevOps pipeline templates
docs/agent-development.md   contribution contract
azure.yaml
```

## 6. Provisioning Limit Checklist

| Resource Type | Number to Deploy | Total After Deployment | Limit/Quota | Notes |
|---|---:|---:|---:|---|
| `Microsoft.App/managedEnvironments` | 1 | 1 | 50 | Azure quota CLI: `ManagedEnvironmentCount`, current usage 0 |
| `Microsoft.App/containerApps` | 1 | 1 in environment | 300 per environment | Platform documented limit; deployment preview validates availability |
| `Microsoft.ContainerRegistry/registries` | 1 | 1 new registry | 100 per subscription by default | Platform documented limit; deployment preview validates availability |
| `Microsoft.OperationalInsights/workspaces` | 1 | 1 new workspace | Not subscription quota gated | Provider registered; ARM validation used |
| `Microsoft.Resources/resourceGroups` | 1 | 1 new resource group | Not region capacity gated | Exact user-specified resource group name |

**Status:** All planned resources are within known limits.

## 7. Execution Checklist

### Phase 1: Planning

- [x] Analyze workspace
- [x] Gather requirements
- [x] Confirm subscription and location
- [x] Scan codebase
- [x] Select recipe and architecture
- [x] Validate Container Apps managed environment quota
- [x] User approved deployment

### Phase 2: Execution

- [x] Generate portal and agent registration contract
- [x] Generate Dockerfile, deployment configuration, and Bicep
- [x] Run local functional verification
- [x] Set status to Ready for Validation

### Phase 3: Validation

- [x] Node.js syntax and test validation
- [x] Bicep build, ARM validation, and deployment what-if
- [x] ACR remote-build Docker context reviewed (`package-lock.json` present)
- [x] Static RBAC review (`AcrPull`, service principal, registry scope)
- [x] Record validation proof

### Phase 4: Deployment

- [x] Provision resource group and Azure resources
- [x] Confirm AcrPull propagation
- [x] Deploy portal image
- [x] Verify Container App and HTTPS endpoint
- [x] Record live role verification

### Deployment result

- Resource group: `RG-YWJ-AgenticMSP-20260701`
- Container App: `ca-agenticmsp-sii4hl`
- Revision: `ca-agenticmsp-sii4hl--0000001`
- Image: `acragenticmspsii4hl.azurecr.io/agenticmsp-portal:20260701.1`
- Portal: `https://ca-agenticmsp-sii4hl.happydune-ae36efa2.koreacentral.azurecontainerapps.io`
- Runtime state: Healthy / Running / 1 replica
- HTTPS checks: `/`, `/health`, and `/api/agents` passed

### Live role verification

- Identity principal: `40d97e8f-ab9f-4898-aaaf-72fdfc13a410`
- Role: `AcrPull`
- Scope: `acragenticmspsii4hl` registry
- Status: Pass

## 8. Validation Proof

| Check | Command Run | Result | Timestamp |
|---|---|---|---|
| Node syntax | `node --check src/portal/app.js` | Pass | 2026-07-01 16:09 KST |
| Node tests | `npm test` | Pass | 2026-07-01 16:09 KST |
| Local health | `curl http://127.0.0.1:3000/health` | HTTP 200 | 2026-07-01 16:09 KST |
| Agent catalog | `curl http://127.0.0.1:3000/api/agents` | HTTP 200, 2 agents | 2026-07-01 16:09 KST |
| Bicep compilation | `az bicep build --file infra/main.bicep` | Pass | 2026-07-01 16:12 KST |
| ARM validation | `az deployment sub validate ...` | Succeeded | 2026-07-01 16:12 KST |
| What-if | `az deployment sub what-if ...` | Succeeded, create-only | 2026-07-01 16:11 KST |
| Bicep lint | `az bicep lint --file infra/main.bicep` | Pass | 2026-07-01 16:13 KST |
| Port-change local health | `curl http://127.0.0.1:8080/health` | HTTP 200 | 2026-07-01 16:33 KST |
| Port-change Bicep build | `az bicep build --file infra/main.bicep` | Pass | 2026-07-01 16:34 KST |
| Port-change ARM validation | `az deployment sub validate ...` | Succeeded | 2026-07-01 16:34 KST |
| CI least-privilege ARM validation | `az deployment sub validate ... deployAcrPullRole=false` | Succeeded | 2026-07-01 16:39 KST |

Validated by: azure-validate workflow

## 9. Files to Generate

| File | Purpose | Status |
|---|---|---|
| `.azure/deployment-plan.md` | Deployment source of truth | Complete |
| `azure.yaml` | Future AZD service configuration | Complete |
| `infra/main.bicep` | Subscription deployment entry point | Complete |
| `infra/modules/resources.bicep` | Container Apps resources | Complete |
| `infra/modules/acr-pull-role.bicep` | Managed identity ACR authorization | Complete |
| `src/portal/*` | Portal application | Complete |
| `agents/catalog.json` | Agent registry | Complete |
| `docs/agent-development.md` | Agent contribution guide | Complete |

## 10. Next Step

Validate the internal port change and CI RBAC fix, push them to `master`, and verify the Azure DevOps pipeline deploys a healthy revision. Routine CI deployments reuse the existing AcrPull role and do not require role-assignment write permission. External access remains on standard HTTP 80 / HTTPS 443 through Container Apps ingress.
