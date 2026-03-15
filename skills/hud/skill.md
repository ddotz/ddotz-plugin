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
node -v && npm -v && git --version
```
- 실패 시 설치 안내 후 중단

### 2. 디렉토리 준비
- 사용자의 홈 디렉토리 하위에 `.claude/hud` 폴더를 생성합니다. (Windows의 경우 `%USERPROFILE%\.claude\hud`)

### 3. 저장소 클론 또는 업데이트
- 해당 경로에 `ddotz-hud` 폴더가 존재하면 `git pull`을 실행합니다.
- 존재하지 않으면 `git clone https://github.com/ddotz/ddotz-hud.git`을 수행합니다.

### 4. 의존성 설치 및 빌드
- `ddotz-hud` 폴더로 이동하여 의존성을 설치하고 빌드합니다.
```bash
npm install && npm run build
```

### 5. API 인증 정보 설정 (Rate Limits용)
- 먼저 사용자에게 키 추출 방법을 안내합니다:
```text
💡 Rate Limits 기능을 사용하려면 Claude AI 웹사이트에서 설정값을 가져와야 합니다.
1. https://claude.ai 에 접속하여 로그인합니다.
2. 개발자 도구(F12)를 열고 Application(응용 프로그램) 탭 -> 좌측 Cookies 메뉴로 이동합니다.
3. `sessionKey` 항목의 Value (sk-ant-...) 를 복사합니다. 이게 Session Key입니다.
4. 똑같이 로그인 된 상태에서 브라우저 주소창에 `https://claude.ai/api/organizations` 를 입력하고 엔터를 칩니다.
5. 화면에 표시되는 텍스트(JSON) 중 `"uuid":"..."` 에 적힌 값(예: 3e85ef21-...)을 복사합니다. 이게 Organization ID 입니다.
```
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
- 사용자의 `.claude` 설정 폴더(Windows: `%USERPROFILE%\.claude`) 내 `settings.json`을 `hud/.backup` 폴더에 타임스탬프와 함께 복사합니다.

### 7. settings.json 업데이트
- 설정 파일(`settings.json`)을 읽어 JSON으로 파싱합니다.
- `statusLine` 키를 다음으로 설정합니다:
  - `command` 경로는 사용자의 OS에 맞는 절대경로로 기입합니다. (예: `node C:\Users\Username\.claude\hud\ddotz-hud\dist\index.js` 또는 `node /Users/name/.claude/hud/ddotz-hud/dist/index.js`)
```json
{
  "statusLine": {
    "type": "command",
    "command": "node {OS에_맞는_절대경로}/ddotz-hud/dist/index.js",
    "padding": 0
  }
}
```
- 파일 저장

### 8. 완료 메시지
```text
✅ HUD 설정 완료!

설치 위치: {HUD_경로}
설정 파일: {SETTINGS_경로}
(선택 사항인 API 키가 입력된 경우 `ddotz-hud-config.json`에 저장됨)

⚠️ Claude Code를 재시작하면 새 statusline이 적용됩니다.
```

## Update Procedure

`/dtz:hud update` 실행 시:

### 1. 설치 확인
- `ddotz-hud/package.json` 파일 존재 여부를 확인합니다.
- 없으면: "HUD가 설치되지 않았습니다. `/dtz:hud setup`을 먼저 실행하세요."

### 2. 업데이트 및 재빌드
- 해당 경로로 이동하여 업데이트를 실행합니다.
```bash
git pull && npm install && npm run build
```

### 3. 버전 확인
- `package.json`에서 `version` 필드를 추출합니다.

### 4. 완료 메시지
```text
✅ HUD 업데이트 완료!

버전: {version}

⚠️ Claude Code를 재시작하면 업데이트가 적용됩니다.
```

## Status Procedure

`/dtz:hud status` 실행 시:

### 1. 연결 정보 확인
- `ddotz-hud/package.json` 파일의 존재 여부로 설치 상태 파악
- 설치되어 있다면 파일에서 `{version}` 추출
- `settings.json` 에서 `statusLine.command` 추출

### 2. 상태 출력
```text
📊 HUD Status
─────────────────────────────────────
Installation: ✅ Installed (또는 ❌ Not Installed)
Version: {version}
Location: {HUD_경로}

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
- `settings.json`을 읽고 `statusLine` 키를 삭제 후 저장합니다.

### 3. 파일 삭제 (선택한 경우)
- 선택에 따라 `ddotz-hud` 폴더 전체를 재귀적으로 삭제합니다.

### 4. 완료 메시지
```text
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
