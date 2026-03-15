---
name: hud
description: Configure Claude Code statusline with ddotz-hud
triggers:
  - hud
  - statusline
  - 상태표시줄
  - HUD
---

# DTZ HUD Skill

Claude Code의 statusline을 ddotz-hud로 설정합니다.

## Commands

| Command | Description |
|---------|-------------|
| `/dtz:hud` | HUD 설치 및 설정 (setup과 동일) |
| `/dtz:hud setup` | HUD 설치 및 설정 |
| `/dtz:hud update` | 최신 버전으로 업데이트 |
| `/dtz:hud status` | 현재 설정 상태 확인 |
| `/dtz:hud reset` | HUD 설정 제거 |

## Setup Procedure

`/dtz:hud` 또는 `/dtz:hud setup` 실행 시:

### 1. 환경 확인
```bash
which node && which npm && which git
```
- 하나라도 없으면 설치 안내 후 중단

### 2. 디렉토리 준비
```bash
mkdir -p ~/.claude/hud
```

### 3. 저장소 클론 또는 업데이트
```bash
# 이미 존재하는지 확인
if [ -d ~/.claude/hud/ddotz-hud ]; then
  cd ~/.claude/hud/ddotz-hud && git pull
else
  git clone https://github.com/ddotz/ddotz-hud.git ~/.claude/hud/ddotz-hud
fi
```

### 4. 의존성 설치 및 빌드
```bash
cd ~/.claude/hud/ddotz-hud && npm install && npm run build
```

### 5. API 인증 정보 설정 (Rate Limits용)
- AskUserQuestion: "API Rate Limits(5시간/주간 사용량) 표시를 위해 Session Key와 Organization ID를 설정하시겠습니까?"
  - Options: "네", "아니오 (skip)"
  - "네" 선택 시:
    - TextInput: "Claude Session Key (sk-ant-...):"
    - TextInput: "Organization ID (UUID):"
    - 입력받은 값을 JSON 형식으로 `~/.claude/ddotz-hud-config.json` 에 쓰기
```json
{
  "sessionKey": "{입력한_세션키}",
  "orgId": "{입력한_조직ID}"
}
```

### 6. 설정 백업
```bash
mkdir -p ~/.claude/hud/.backup
cp ~/.claude/settings.json ~/.claude/hud/.backup/settings.json.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
```

### 7. settings.json 업데이트
- Read `~/.claude/settings.json`
- JSON 파싱
- `statusLine` 키를 다음으로 설정:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/hud/ddotz-hud/dist/index.js",
    "padding": 0
  }
}
```
- 파일 저장

### 8. 완료 메시지
```text
✅ HUD 설정 완료!

설치 위치: ~/.claude/hud/ddotz-hud
설정 파일: ~/.claude/settings.json
(선택 사항인 API 키가 입력된 경우 `~/.claude/ddotz-hud-config.json`에 저장됨)

⚠️ Claude Code를 재시작하면 새 statusline이 적용됩니다.
```

## Update Procedure

`/dtz:hud update` 실행 시:

### 1. 설치 확인
```bash
ls ~/.claude/hud/ddotz-hud/package.json
```
- 없으면: "HUD가 설치되지 않았습니다. `/dtz:hud setup`을 먼저 실행하세요."

### 2. 업데이트
```bash
cd ~/.claude/hud/ddotz-hud && git pull
```

### 3. 재빌드
```bash
cd ~/.claude/hud/ddotz-hud && npm install && npm run build
```

### 4. 버전 확인
- Read `~/.claude/hud/ddotz-hud/package.json`
- version 필드 추출

### 5. 완료 메시지
```
✅ HUD 업데이트 완료!

버전: {version}

⚠️ Claude Code를 재시작하면 업데이트가 적용됩니다.
```

## Status Procedure

`/dtz:hud status` 실행 시:

### 1. 설치 상태 확인
```bash
ls ~/.claude/hud/ddotz-hud/package.json 2>/dev/null && echo "INSTALLED" || echo "NOT_INSTALLED"
```

### 2. 버전 확인 (설치된 경우)
- Read `~/.claude/hud/ddotz-hud/package.json`

### 3. 설정 확인
- Read `~/.claude/settings.json`
- statusLine 키 확인

### 4. 상태 출력
```
📊 HUD Status
─────────────────────────────────────
Installation: ✅ Installed (또는 ❌ Not Installed)
Version: {version}
Location: ~/.claude/hud/ddotz-hud

Settings: ✅ Configured (또는 ❌ Not Configured)
Command: {statusLine.command}
─────────────────────────────────────
```

## Reset Procedure

`/dtz:hud reset` 실행 시:

### 1. 사용자 확인
- AskUserQuestion: "HUD 설정을 제거하시겠습니까?"
  - Options: "설정만 제거", "설정 + 파일 모두 삭제", "취소"

### 2. 설정 제거
- Read `~/.claude/settings.json`
- `statusLine` 키 삭제
- 파일 저장

### 3. 파일 삭제 (선택한 경우)
```bash
rm -rf ~/.claude/hud/ddotz-hud
```

### 4. 완료 메시지
```
✅ HUD 설정이 제거되었습니다.

⚠️ Claude Code를 재시작하면 기본 statusline으로 돌아갑니다.
```

## Error Messages

| 상황 | 메시지 |
|------|--------|
| Node.js 없음 | "❌ Node.js가 필요합니다. https://nodejs.org 에서 설치하세요." |
| Git 없음 | "❌ Git이 필요합니다." |
| 클론 실패 | "❌ 저장소 클론 실패. 네트워크 연결을 확인하세요." |
| 빌드 실패 | "❌ 빌드 실패. 에러 로그를 확인하세요." |
| 설정 파일 오류 | "❌ settings.json 파싱 오류. 파일 형식을 확인하세요." |

## HUD Layout Reference

설치 후 statusline 레이아웃:

```
Opus 4.5 | ⎇ main v1.2.0 | ~/project
  default | 5h:45% wk:23% | 58.4% | $2.34 | 1hr 26m | agents:2 | bg:1/5
```

**Line 1**: 모델 | Git 브랜치 + 프로젝트 버전 | 현재 디렉토리
**Line 2**: 프로필 | Rate Limit | Context % | 비용 | 시간 | 에이전트 | 백그라운드

---
*DTZ HUD Skill v1.0.0*
