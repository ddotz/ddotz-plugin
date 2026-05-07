---
name: hud-setup
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
| `/dtz:hud-setup` | HUD 설치 및 설정 (setup과 동일) |
| `/dtz:hud-setup setup` | HUD 설치 및 설정 |
| `/dtz:hud-setup auth` | 인증만 다시 설정 (자동 추출 + 수동 폴백) |
| `/dtz:hud-setup update` | 최신 버전으로 업데이트 |
| `/dtz:hud-setup status` | 현재 설정 상태 확인 |
| `/dtz:hud-setup reset` | HUD 설정 제거 |

## Setup Procedure

`/dtz:hud-setup` 또는 `/dtz:hud-setup setup` 실행 시:

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

### 5. API 인증 정보 설정 (자동 추출 → 수동 폴백)

빌드 완료 후, ddotz-hud 자체의 인증 설정 CLI를 실행합니다. 이 CLI가 자동 추출과 수동 입력 가이드를 모두 책임지므로, 스킬에서는 별도의 TextInput을 띄우지 않고 사용자가 터미널에서 명령을 직접 실행하도록 안내합니다.

**먼저 사용자에게 절차를 명확히 설명합니다:**

```text
🔐 Rate Limits(5시간/주간 사용량) 표시를 위해 Claude.ai 인증이 필요합니다.

이제 다음 명령을 실행하면 자동/수동 두 단계로 인증이 진행됩니다:

  node ~/.claude/hud/ddotz-hud/dist/index.js setup
  (Windows: node %USERPROFILE%\.claude\hud\ddotz-hud\dist\index.js setup)

CLI가 처리하는 흐름:

  ① 브라우저 쿠키 자동 추출
     - Chrome / Brave / Edge / Arc / Firefox 가운데
       claude.ai 에 로그인된 세션을 자동 검색합니다.
     - macOS Chrome 계열은 키체인에서 "Chrome Safe Storage"
       비밀번호를 받아 sessionKey 를 복호화합니다.
       (이때 macOS 가 1회 keychain 접근 권한을 요청할 수 있습니다.
        "허용" 또는 "항상 허용" 을 선택하세요.)
     - 자동 추출에 성공하면 claude.ai/api/organizations 를
       호출해 Organization ID 도 자동 조회합니다.

  ② 자동 추출 실패 시 수동 입력 (단계별 가이드 출력)
     STEP 1) https://claude.ai 에서 로그인 상태인지 확인
     STEP 2) F12 → Application → Cookies → https://claude.ai
             → sessionKey 행의 Value (sk-ant-...) 복사 → 붙여넣기
             ※ document.cookie 헤더 통째로 붙여넣어도 자동 추출됩니다.
     STEP 3) Organization ID — 입력한 sessionKey 로 자동 조회를
             다시 시도합니다. 그래도 실패하면 주소창에
             https://claude.ai/api/organizations 입력 후 엔터,
             표시된 JSON 의 "uuid":"..." 값을 복사 → 붙여넣기.
             ※ JSON 전체를 통째로 붙여넣어도 자동 추출됩니다.

  ③ /api/organizations/{orgId}/usage 호출로 즉시 검증
  ④ ~/.claude/ddotz-hud-config.json 에 0600 권한으로 저장
```

**그런 다음 사용자에게 묻습니다:**

- AskUserQuestion: "지금 인증 설정을 진행하시겠습니까? (자동 추출 + 수동 폴백을 한 번에 처리합니다.)"
  - Options: "네 (지금 실행)", "건너뛰기 (나중에 직접 실행)"
  - "네" 선택 시: 위 명령을 Bash 도구로 실행합니다.
    ```bash
    node "$HOME/.claude/hud/ddotz-hud/dist/index.js" setup
    ```
    (CLI 자체가 readline 기반 인터랙티브 입력을 받으므로 Claude Code 가
    터미널 입력을 그대로 전달해야 합니다.)
  - "건너뛰기" 선택 시: 다음 단계로 진행하고, 완료 메시지에서 재실행 방법을 안내합니다.

**저장 형식 (CLI 가 자동 작성):**
```json
{
  "sessionKey": "sk-ant-...",
  "orgId": "00000000-0000-0000-0000-000000000000"
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
인증 파일: ~/.claude/ddotz-hud-config.json (선택)

🔁 인증을 나중에 (재)설정하려면:
   node {HUD_경로}/dist/index.js setup
   (강제 재설정: ... setup --force / 자동 추출 건너뛰기: ... setup --manual)

📊 현재 인증 상태 확인:
   node {HUD_경로}/dist/index.js status

⚠️ Claude Code를 재시작하면 새 statusline이 적용됩니다.
```

## Auth Procedure

`/dtz:hud-setup auth` 실행 시 (HUD 가 이미 설치된 상태에서 인증만 다시 설정):

### 1. 설치 확인
- `ddotz-hud/dist/index.js` 존재 여부 확인
- 없으면: "HUD가 설치되지 않았습니다. `/dtz:hud-setup setup`을 먼저 실행하세요."

### 2. 인증 CLI 호출
- Bash 도구로 실행:
```bash
node "$HOME/.claude/hud/ddotz-hud/dist/index.js" setup --force
```
- CLI 가 자동 추출(브라우저 쿠키) → 수동 폴백(단계별 가이드) → API 검증 → 저장 순으로 처리합니다.
- 사용자가 자동 추출을 건너뛰고 싶다면 `--manual` 플래그도 안내:
```bash
node "$HOME/.claude/hud/ddotz-hud/dist/index.js" setup --manual
```

## Update Procedure

`/dtz:hud-setup update` 실행 시:

### 1. 설치 확인
- `ddotz-hud/package.json` 파일 존재 여부를 확인합니다.
- 없으면: "HUD가 설치되지 않았습니다. `/dtz:hud-setup setup`을 먼저 실행하세요."

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

`/dtz:hud-setup status` 실행 시:

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

`/dtz:hud-setup reset` 실행 시:

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
*DTZ HUD Skill v1.2.0*
