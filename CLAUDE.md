# DTZ Plugin Instructions

DTZ (ddotz) 플러그인은 세션 관리 및 Claude Code 환경 설정을 위한 플러그인입니다.

## Session Start Protocol

매 세션 시작 시 자동으로 `.dtz/handoffs/latest.md` 파일을 확인합니다.
파일이 있으면 이전 세션 정보를 요약하여 표시합니다.

## Available Skills

### /dtz:handoff
세션 컨텍스트 저장 및 복원.

| Command | Description |
|---------|-------------|
| `/dtz:handoff` | 현재 상태 저장 |
| `/dtz:handoff load` | 최신 handoff 로드 |
| `/dtz:handoff list` | 목록 보기 |
| `/dtz:handoff clear` | 기록 정리 |

### /dtz:hud
Claude Code statusline 설정 (ddotz-hud).

| Command | Description |
|---------|-------------|
| `/dtz:hud` | HUD 설치 및 설정 |
| `/dtz:hud setup` | HUD 설치 및 설정 |
| `/dtz:hud update` | 최신 버전으로 업데이트 |
| `/dtz:hud status` | 현재 설정 상태 확인 |
| `/dtz:hud reset` | HUD 설정 제거 |

## Best Practices

1. **긴 작업 전**: `/dtz:handoff`로 현재 상태 저장
2. **작업 중단 시**: `/dtz:handoff`로 진행 상황 저장
3. **새 세션 시작**: 자동 감지된 handoff 확인
4. **HUD 설정**: `/dtz:hud`로 향상된 statusline 설정

---
*DTZ Plugin v2.1.0*
