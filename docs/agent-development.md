# Agent 개발 및 등록 가이드

AgenticMSP 포털과 개별 Agent는 느슨하게 결합됩니다. 각 담당자는 자기 Agent 디렉터리와 카탈로그 항목을 소유합니다.

## Agent 추가 절차

1. `agents/<agent-id>/` 디렉터리를 만듭니다.
2. `agents/catalog.json`에 Agent 메타데이터를 추가합니다.
3. 구현 전에는 `status`를 `coming-soon`으로 유지합니다.
4. 서비스가 배포되고 헬스 체크가 통과하면 `preview` 또는 `available`로 변경합니다.
5. Pull Request에서 소유자, 권한 범위, 예상 비용, 롤백 방법을 명시합니다.

## 필수 카탈로그 필드

| 필드 | 설명 |
|---|---|
| `id` | URL과 배포 리소스에 사용할 소문자 kebab-case ID |
| `name` | 포털 표시 이름 |
| `description` | 사용자 관점 기능 설명 |
| `owner` | 운영 담당 팀 또는 사용자 |
| `route` | 포털 또는 Agent 진입 경로 |
| `status` | `coming-soon`, `preview`, `available` |
| `version` | 배포 버전 |
| `accent` | `violet` 또는 `cyan` |

## 배포 원칙

- 런타임 인증에는 Managed Identity를 사용합니다.
- 비밀 값과 Azure 자격 증명을 Git에 저장하지 않습니다.
- Agent마다 `/health` 엔드포인트와 최소 테스트를 제공합니다.
- Azure RBAC는 Agent가 수행할 작업에 필요한 최소 범위로 제한합니다.
- Agent 장애가 포털이나 다른 Agent 배포를 막지 않도록 독립 이미지와 Container App/Job을 권장합니다.

## GitHub Actions 설정

`.github/workflows/ci-cd.yml`은 `master` 대상 Pull Request에서 포털 테스트와 Bicep 검증을 수행합니다. `master`에 변경 사항이 병합되면 ACR 원격 빌드, Container Apps 재배포, `/health` 확인까지 이어서 수행합니다. Actions 탭에서 수동 실행할 수도 있으며, 수동 실행은 검증만 수행합니다.

### Azure OIDC 인증

워크플로에는 다음 Azure 식별자가 설정되어 있습니다. 이 값들은 인증 비밀이 아니며, 실제 인증 토큰은 GitHub OIDC를 통해 실행 시점에 발급됩니다.

| 환경 변수 | 값 | 설명 |
|---|---|---|
| `AZURE_CLIENT_ID` | `b4adbc6c-1f73-4f07-8767-eb84282b6325` | `agenticmsp-github-actions` Entra 애플리케이션 Client ID |
| `AZURE_TENANT_ID` | `6144959d-620b-4d3d-9090-c4891f1914ce` | Microsoft Entra Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | `c32029ab-0ba9-4306-8617-32defb900cd0` | 배포 대상 Azure Subscription ID |

Client secret은 저장하지 않습니다. Entra 애플리케이션에 다음 GitHub subject를 사용하는 Federated credential을 추가합니다.

- Pull Request 검증: `repo:wjyoo3572/agenticMSP:pull_request`
- `master` 브랜치 검증: `repo:wjyoo3572/agenticMSP:ref:refs/heads/master`
- 개발 환경 배포: `repo:wjyoo3572/agenticMSP:environment:agenticmsp-development`

`agenticmsp-github-actions` 서비스 주체에는 현재 Subscription 범위 Bicep 배포와 ACR 원격 빌드에 필요한 `Contributor` 역할이 부여되어 있습니다. 이 역할에는 Azure RBAC 역할 할당 권한이 포함되지 않습니다. GitHub 저장소의 **Settings > Environments**에서 자동 생성되는 `agenticmsp-development` 환경에 필요하면 배포 승인 규칙을 설정합니다.
