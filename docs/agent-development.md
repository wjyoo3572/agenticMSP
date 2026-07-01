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

## Azure DevOps 설정

루트의 `azure-pipelines.yml`은 `master` Pull Request에서 검증하고, `master` 병합 후 ACR 원격 빌드와 Container Apps 재배포를 수행합니다.

Azure DevOps에서 파이프라인을 만들고 `AZURE_SERVICE_CONNECTION` 변수를 Azure Resource Manager 서비스 연결 이름으로 설정해야 합니다. 서비스 연결에는 대상 리소스 배포 권한과 ACR 빌드 권한이 필요합니다.

