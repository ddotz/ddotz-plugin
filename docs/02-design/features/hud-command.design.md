# Design: HUD Command Feature

## Meta
| Key | Value |
|-----|-------|
| Feature ID | `hud-command` |
| Plan Reference | `docs/01-plan/features/hud-command.plan.md` |
| Created | 2026-01-31 |
| Status | Design |

## Overview

`/dtz:hud` 명령어를 통해 ddotz-hud statusline을 자동으로 설치하고 구성하는 skill을 설계합니다.

## File Structure

```
ddotz-plugin/
├── skills/
│   ├── handoff/
│   │   └── skill.md          # 기존 handoff skill
│   └── hud/
│       └── skill.md          # 신규 HUD skill ⭐
├── .claude-plugin/
│   └── plugin.json           # skills 경로 정의 (변경 불필요)
└── CLAUDE.md                 # 업데이트 필요
```

## Skill Definition

### skills/hud/skill.md

```markdown
---
name: hud
description: Configure Claude Code statusline with ddotz-hud
triggers:
  - hud
  - statusline
  - 상태표시줄
---
```

## Commands Specification

### 1. `/dtz:hud` or `/dtz:hud setup`

**Purpose**: ddotz-hud 설치 및 설정

**Procedure**:

```
1. 환경 확인
   - Bash: which node npm git
   - 모두 존재해야 진행

2. 디렉토리 준비
   - Bash: mkdir -p ~/.claude/hud

3. 저장소 클론 또는 업데이트
   - IF ~/.claude/hud/ddotz-hud 존재:
     - Bash: cd ~/.claude/hud/ddotz-hud && git pull
   - ELSE:
     - Bash: git clone https://github.com/ddotz/ddotz-hud.git ~/.claude/hud/ddotz-hud

4. 빌드
   - Bash: cd ~/.claude/hud/ddotz-hud && npm install && npm run build

5. 설정 파일 업데이트
   - Read: ~/.claude/settings.json
   - 기존 statusLine 백업 (있으면)
   - Edit: statusLine 설정 추가/업데이트

6. 완료 메시지
   - "HUD 설정 완료. Claude Code를 재시작하세요."
```

**Settings.json 수정 내용**:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/hud/ddotz-hud/dist/index.js",
    "padding": 0
  }
}
```

### 2. `/dtz:hud update`

**Purpose**: ddotz-hud 최신 버전으로 업데이트

**Procedure**:

```
1. 설치 확인
   - IF NOT exists ~/.claude/hud/ddotz-hud:
     - "HUD가 설치되지 않았습니다. /dtz:hud setup을 먼저 실행하세요."
     - STOP

2. 업데이트
   - Bash: cd ~/.claude/hud/ddotz-hud && git pull

3. 재빌드
   - Bash: cd ~/.claude/hud/ddotz-hud && npm install && npm run build

4. 버전 확인
   - Read: ~/.claude/hud/ddotz-hud/package.json → version

5. 완료 메시지
   - "HUD v{version}으로 업데이트 완료. Claude Code를 재시작하세요."
```

### 3. `/dtz:hud status`

**Purpose**: 현재 HUD 설정 상태 확인

**Procedure**:

```
1. 설치 상태 확인
   - Bash: ls -la ~/.claude/hud/ddotz-hud 2>/dev/null

2. 버전 확인 (설치된 경우)
   - Read: ~/.claude/hud/ddotz-hud/package.json → version

3. 설정 상태 확인
   - Read: ~/.claude/settings.json → statusLine

4. 상태 출력
```

**Output Format**:
```
📊 HUD Status
─────────────────────────────────────
Installation: ✅ Installed
Version: 1.1.0
Location: ~/.claude/hud/ddotz-hud

Settings: ✅ Configured
Command: node ~/.claude/hud/ddotz-hud/dist/index.js
─────────────────────────────────────
```

### 4. `/dtz:hud reset`

**Purpose**: HUD 설정 제거 및 기본값 복원

**Procedure**:

```
1. 확인 (선택적)
   - AskUserQuestion: "HUD 설정을 제거하시겠습니까?"

2. 설정 제거
   - Read: ~/.claude/settings.json
   - Edit: statusLine 키 제거

3. 디렉토리 정리 (선택적)
   - AskUserQuestion: "설치 파일도 삭제하시겠습니까?"
   - IF yes: Bash: rm -rf ~/.claude/hud/ddotz-hud

4. 완료 메시지
   - "HUD 설정이 제거되었습니다. Claude Code를 재시작하세요."
```

## Error Handling

| Error | Detection | Response |
|-------|-----------|----------|
| Node.js 미설치 | `which node` 실패 | "Node.js가 필요합니다. https://nodejs.org 에서 설치하세요." |
| Git 미설치 | `which git` 실패 | "Git이 필요합니다." |
| 클론 실패 | git clone exit code != 0 | "저장소 클론 실패. 네트워크를 확인하세요." |
| 빌드 실패 | npm run build exit code != 0 | "빌드 실패. 에러 메시지를 확인하세요." |
| 설정 파일 없음 | settings.json 없음 | 새로 생성 |
| 설정 파일 파싱 오류 | JSON.parse 실패 | "settings.json 형식 오류. 수동 확인 필요." |

## Backup Strategy

설정 변경 전 자동 백업:

```
~/.claude/hud/.backup/
  settings.json.{timestamp}
```

**Backup Procedure**:
```bash
mkdir -p ~/.claude/hud/.backup
cp ~/.claude/settings.json ~/.claude/hud/.backup/settings.json.$(date +%Y%m%d_%H%M%S)
```

## Implementation Checklist

- [ ] `skills/hud/skill.md` 파일 생성
- [ ] setup 프로시저 구현
- [ ] update 프로시저 구현
- [ ] status 프로시저 구현
- [ ] reset 프로시저 구현
- [ ] CLAUDE.md 업데이트 (새 skill 문서화)
- [ ] 전체 플로우 테스트

## Test Cases

### TC1: Fresh Install
1. `~/.claude/hud/ddotz-hud` 없는 상태에서
2. `/dtz:hud setup` 실행
3. Expected: 클론 → 빌드 → 설정 완료

### TC2: Update Existing
1. 이미 설치된 상태에서
2. `/dtz:hud update` 실행
3. Expected: pull → 재빌드 → 버전 표시

### TC3: Status Check
1. `/dtz:hud status` 실행
2. Expected: 설치 상태, 버전, 설정 정보 표시

### TC4: Reset
1. `/dtz:hud reset` 실행
2. Expected: settings.json에서 statusLine 제거

### TC5: Error - Not Installed
1. 설치 안된 상태에서
2. `/dtz:hud update` 실행
3. Expected: 에러 메시지 + setup 안내

## Security Considerations

- GitHub HTTPS 클론 사용 (SSH 키 불필요)
- 설정 파일 수정 전 항상 백업
- 외부 스크립트 실행 최소화

## Dependencies

| Dependency | Required | Check Command |
|------------|----------|---------------|
| Node.js | Yes | `which node` |
| npm | Yes | `which npm` |
| Git | Yes | `which git` |

---
*Generated by PDCA Design Phase*
