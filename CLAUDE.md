# DTZ Plugin Instructions

DTZ (ddotz) 플러그인은 세션 관리 및 Claude Code 환경 설정을 위한 플러그인입니다.

## Session Start Protocol

매 세션 시작 시 자동으로 `.dtz/handoffs/latest.md` 파일을 확인합니다.
파일이 있으면 이전 세션 정보를 요약하여 표시합니다.

> 💡 자동 로드를 끄려면: `/dtz:handoff autoload off`

## Available Skills

### /dtz:handoff
세션 컨텍스트 저장 및 복원.

| Command | Description |
|---------|-------------|
| `/dtz:handoff` | 현재 상태 저장 |
| `/dtz:handoff load` | 최신 handoff 로드 |
| `/dtz:handoff list` | 목록 보기 |
| `/dtz:handoff clear` | 기록 정리 |
| `/dtz:handoff autoload` | autoload 상태 확인 |
| `/dtz:handoff autoload on` | 자동 로드 활성화 |
| `/dtz:handoff autoload off` | 자동 로드 비활성화 |

### /dtz:hud
Claude Code statusline 설정 (ddotz-hud).

| Command | Description |
|---------|-------------|
| `/dtz:hud` | HUD 설치 및 설정 |
| `/dtz:hud setup` | HUD 설치 및 설정 |
| `/dtz:hud update` | 최신 버전으로 업데이트 |
| `/dtz:hud status` | 현재 설정 상태 확인 |
| `/dtz:hud reset` | HUD 설정 제거 |

### /dtz:fsd (Magic Word: `fsd`)
PDCA 기반 자동화 개발 워크플로우. bkit 플러그인과 연동하여 Plan → Design → Do → Check → Iterate → Report 전체 사이클을 자동으로 진행합니다.

| Command | Description |
|---------|-------------|
| `fsd: {설명}` | FSD 워크플로우 시작 (기존 문서 자동 감지) |
| `fsd status` | 현재 진행 상태 확인 |
| `fsd resume` | 중단된 워크플로우 재개 |
| `fsd cancel` | 진행 중인 워크플로우 취소 |
| `fsd config` | FSD 설정 확인/변경 |
| `fsd doctor` | 연동 상태 진단 및 검증 |
| `fsd detect {feature}` | 특정 feature 문서 감지 테스트 |

> 💡 bkit 플러그인이 필요합니다. `fsd doctor`로 연동 상태를 확인하세요.
> 💡 **Auto-detect**: 기존 PDCA 문서가 있으면 자동 감지하여 다음 단계부터 진행합니다.

## Best Practices

1. **긴 작업 전**: `/dtz:handoff`로 현재 상태 저장
2. **작업 중단 시**: `/dtz:handoff`로 진행 상황 저장
3. **새 세션 시작**: 자동 감지된 handoff 확인
4. **HUD 설정**: `/dtz:hud`로 향상된 statusline 설정

---
*DTZ Plugin v2.3.0*
