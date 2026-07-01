# AgenticMSP

Azure 운영 업무를 전문 Agent로 확장하기 위한 Container Apps 기반 포털입니다.

## 현재 구성

- AgenticMSP 기본 포털
- 비용 모니터링 Agent 등록 자리
- 구성도 현행화 Agent 등록 자리
- Azure Container Apps 및 ACR Bicep
- AZD 기반 검증·배포 구성

## 로컬 실행

```powershell
$env:AGENT_CATALOG_PATH = "..\..\agents\catalog.json"
Set-Location src\portal
node app.js
```

브라우저에서 `http://localhost:8080`을 확인합니다. 헬스 체크는 `http://localhost:8080/health`입니다. Azure Container Apps에서는 외부 HTTP 80/HTTPS 443 ingress가 내부 8080 포트로 전달됩니다.

Agent 추가 방법은 [Agent 개발 및 등록 가이드](docs/agent-development.md)를 참고하세요.
