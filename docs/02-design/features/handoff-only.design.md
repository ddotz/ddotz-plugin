# DDotZ Plugin v2.0 - Handoff Only Design

## Overview

| Item | Value |
|------|-------|
| **Feature** | Handoff Only |
| **Version** | 2.0.0 |
| **Plan Reference** | `docs/01-plan/features/handoff-only.plan.md` |
| **Created** | 2026-01-31 |

---

## 1. 아키텍처

### 1.1 최종 파일 구조
```
ddotz-plugin/
├── .claude-plugin/
│   ├── plugin.json              # 플러그인 메타데이터
│   └── marketplace.json         # 마켓플레이스 등록
├── skills/
│   └── handoff/
│       └── skill.md             # Handoff skill 정의
├── hooks/
│   ├── hooks.json               # Hook 이벤트 정의
│   └── session-start.js         # SessionStart 스크립트
├── CLAUDE.md                    # 플러그인 지침
└── README.md                    # 사용자 문서
```

### 1.2 데이터 흐름
```
[새 세션 시작]
      ↓
[hooks/hooks.json 로드]
      ↓
[SessionStart hook 실행]
      ↓
[session-start.js 실행]
      ↓
[.dtz/handoffs/latest.md 확인]
      ↓
  ┌───┴───┐
  │       │
[있음]  [없음]
  ↓       ↓
[파싱]  [종료]
  ↓
[요약 출력]
  ↓
[세션 시작]
```

---

## 2. 상세 설계

### 2.1 hooks/hooks.json

```json
{
  "$schema": "https://json.schemastore.org/claude-code-hooks.json",
  "description": "DTZ Handoff Plugin v2.0.0",
  "hooks": {
    "SessionStart": [
      {
        "once": true,
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.js",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

**필드 설명**:
- `$schema`: Claude Code hooks JSON 스키마
- `once`: 세션당 1회만 실행
- `timeout`: 5초 타임아웃 (5000ms)
- `${CLAUDE_PLUGIN_ROOT}`: 플러그인 루트 경로 환경 변수

### 2.2 hooks/session-start.js

```javascript
#!/usr/bin/env node
/**
 * DTZ Handoff - SessionStart Hook
 * 새 세션 시작 시 이전 handoff 파일 감지 및 안내
 */

const fs = require('fs');
const path = require('path');

// stdin에서 JSON 읽기 (Claude Code 표준)
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Handoff 파일 파싱
function parseHandoff(content) {
  const result = {
    sessionId: null,
    created: null,
    contextSummary: null,
    pendingTasks: []
  };

  // Session ID 추출
  const sessionMatch = content.match(/Session ID\s*\|\s*`([^`]+)`/);
  if (sessionMatch) result.sessionId = sessionMatch[1];

  // Created 추출
  const createdMatch = content.match(/Created\s*\|\s*`([^`]+)`/);
  if (createdMatch) result.created = createdMatch[1];

  // Context Summary 추출
  const contextMatch = content.match(/## Context Summary\n([\s\S]*?)(?=\n##|$)/);
  if (contextMatch) result.contextSummary = contextMatch[1].trim();

  // Pending Tasks 추출
  const pendingMatch = content.match(/## Pending Tasks\n([\s\S]*?)(?=\n##|$)/);
  if (pendingMatch) {
    const tasks = pendingMatch[1].match(/- \[ \] .+/g);
    if (tasks) result.pendingTasks = tasks.map(t => t.replace('- [ ] ', ''));
  }

  return result;
}

async function main() {
  try {
    // stdin에서 세션 정보 읽기
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch {}

    const directory = data.directory || process.cwd();
    const handoffPath = path.join(directory, '.dtz', 'handoffs', 'latest.md');

    // Handoff 파일 확인
    if (!fs.existsSync(handoffPath)) {
      // 파일 없음 - 정상 세션 시작, 아무것도 출력하지 않음
      return;
    }

    // 파일 읽기 및 파싱
    const content = fs.readFileSync(handoffPath, 'utf-8');
    const handoff = parseHandoff(content);

    // 유효성 검사
    if (!handoff.sessionId) {
      console.log(`<system-reminder>
[DTZ Handoff] 파일 파싱 오류: ${handoffPath}
</system-reminder>`);
      return;
    }

    // 요약 출력
    let output = `<system-reminder>
[DTZ Handoff] 이전 세션 발견

Session: ${handoff.sessionId}
생성: ${handoff.created || 'Unknown'}

${handoff.contextSummary || '(요약 없음)'}

`;

    if (handoff.pendingTasks.length > 0) {
      output += `📌 미완료 작업: ${handoff.pendingTasks.length}개\n`;
      handoff.pendingTasks.slice(0, 5).forEach((task, i) => {
        output += `  ${i + 1}. ${task}\n`;
      });
      if (handoff.pendingTasks.length > 5) {
        output += `  ... 외 ${handoff.pendingTasks.length - 5}개\n`;
      }
    }

    output += `
💡 \`/dtz:handoff load\`로 작업을 복원할 수 있습니다.
</system-reminder>`;

    console.log(output);

  } catch (error) {
    // 에러 발생 시 무시 (세션 시작 방해하지 않음)
    console.error(`[DTZ Handoff] Error: ${error.message}`);
  }
}

main();
```

### 2.3 .claude-plugin/plugin.json

```json
{
  "name": "dtz",
  "version": "2.0.0",
  "description": "Session handoff for seamless continuation",
  "skills": "./skills/",
  "hooks": "./hooks/"
}
```

### 2.4 .claude-plugin/marketplace.json

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "ddotz",
  "description": "Session handoff for seamless continuation",
  "owner": {
    "name": "ddotz"
  },
  "plugins": [
    {
      "name": "dtz",
      "description": "Session handoff for seamless continuation - save and restore session context",
      "version": "2.0.0",
      "author": {
        "name": "ddotz"
      },
      "source": "./",
      "category": "productivity",
      "homepage": "https://github.com/ddotz/ddotz-plugin",
      "tags": ["handoff", "session-management", "context-persistence"]
    }
  ]
}
```

### 2.5 skills/handoff/skill.md

```markdown
---
name: handoff
description: Save and restore session context for seamless continuation
triggers:
  - handoff
  - 핸드오프
  - 인계
  - session save
  - 세션 저장
---

# DTZ Handoff Skill

세션 컨텍스트를 저장하고 복원하여 작업 연속성을 보장합니다.

## Commands

| Command | Description |
|---------|-------------|
| `/dtz:handoff` | 현재 세션 상태 저장 |
| `/dtz:handoff save [name]` | 이름 지정하여 저장 |
| `/dtz:handoff load [id]` | 특정 handoff 로드 |
| `/dtz:handoff list` | 저장된 handoff 목록 |
| `/dtz:handoff clear` | handoff 기록 정리 |

## Save Procedure

1. **정보 수집**
   - TaskList로 현재 TODO 수집
   - 대화에서 주요 결정사항 추출
   - 최근 작업 파일 목록 정리

2. **문서 생성**
   - Session ID: `{YYYY-MM-DD}_{random-6-chars}`
   - 표준 템플릿으로 구성

3. **저장**
   - `.dtz/handoffs/{session-id}.md` 저장
   - `.dtz/handoffs/latest.md` 업데이트

## Load Procedure

1. **파일 읽기**
   - ID 지정 시: `.dtz/handoffs/{id}.md`
   - ID 없으면: `.dtz/handoffs/latest.md`

2. **요약 출력**
   - Session ID, 생성 날짜
   - Context 요약
   - Pending Tasks

3. **TODO 복원**
   - Pending Tasks를 TaskCreate로 생성

## Handoff Document Template

```markdown
# Session Handoff

## Meta
| Key | Value |
|-----|-------|
| Session ID | `{session-id}` |
| Created | `{timestamp}` |
| Project | `{directory name}` |

## Context Summary
{2-3문장 작업 요약}

## Completed Tasks
- [x] 완료 항목

## Pending Tasks
- [ ] 미완료 항목

## Key Decisions
| Decision | Rationale | Date |

## Important Files
| File | Description |

## Next Steps
1. 다음 할 일

---
*Generated by DTZ Handoff v2.0.0*
```

## Auto-Load on Session Start

새 세션 시작 시 자동으로 `.dtz/handoffs/latest.md` 감지.
존재하면 요약 정보를 표시하고 `/dtz:handoff load` 안내.
```

### 2.6 CLAUDE.md

```markdown
# DTZ Plugin Instructions

DTZ (ddotz) 플러그인은 세션 컨텍스트 저장 및 복원을 위한 플러그인입니다.

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

## Best Practices

1. **긴 작업 전**: `/dtz:handoff`로 현재 상태 저장
2. **작업 중단 시**: `/dtz:handoff`로 진행 상황 저장
3. **새 세션 시작**: 자동 감지된 handoff 확인

---
*DTZ Plugin v2.0.0*
```

---

## 3. 삭제 대상 파일

### 3.1 Skills (삭제)
- `skills/max/skill.md`
- `skills/eco/skill.md`

### 3.2 Agents (삭제)
- `agents/architect.md`
- `agents/architect-low.md`
- `agents/architect-medium.md`
- `agents/executor.md`
- `agents/executor-low.md`
- `agents/executor-high.md`
- `agents/designer.md`
- `agents/designer-low.md`
- `agents/designer-high.md`
- `agents/explore.md`
- `agents/explore-medium.md`
- `agents/explore-high.md`

### 3.3 Hooks (삭제)
- `hooks/session-start.md` (마크다운 → js로 교체)

---

## 4. 구현 순서

| Step | 파일 | 작업 |
|------|------|------|
| 1 | `skills/max/`, `skills/eco/` | 디렉토리 삭제 |
| 2 | `agents/` | 디렉토리 삭제 |
| 3 | `hooks/session-start.md` | 파일 삭제 |
| 4 | `hooks/hooks.json` | 신규 생성 |
| 5 | `hooks/session-start.js` | 신규 생성 |
| 6 | `skills/handoff/skill.md` | 수정 (간소화) |
| 7 | `.claude-plugin/plugin.json` | 수정 |
| 8 | `.claude-plugin/marketplace.json` | 수정 |
| 9 | `CLAUDE.md` | 수정 (간소화) |
| 10 | `README.md` | 수정 |

---

## 5. 테스트 시나리오

### TC-01: 플러그인 로드
```
Given: 플러그인이 설치됨
When: Claude Code 새 세션 시작
Then: 오류 없이 플러그인 로드
```

### TC-02: Handoff 파일 없음
```
Given: .dtz/handoffs/latest.md 없음
When: 새 세션 시작
Then: 아무 메시지 없이 정상 시작
```

### TC-03: Handoff 파일 있음
```
Given: .dtz/handoffs/latest.md 존재
When: 새 세션 시작
Then: 이전 세션 정보 요약 표시
```

### TC-04: Handoff Save
```
Given: 작업 중인 세션
When: /dtz:handoff 실행
Then: .dtz/handoffs/{id}.md 생성, latest.md 업데이트
```

### TC-05: Handoff Load
```
Given: handoff 파일 존재
When: /dtz:handoff load 실행
Then: 컨텍스트 복원, TODO 생성
```

---

## 6. 에러 처리

| 상황 | 처리 |
|------|------|
| `.dtz/` 없음 | 자동 생성 |
| handoff 파일 파싱 오류 | 경고 출력, 정상 세션 시작 |
| Node.js 스크립트 에러 | stderr 로그, 세션 시작 계속 |
| 타임아웃 (5초 초과) | hook 종료, 세션 시작 계속 |

---

## 7. 검증 체크리스트

### 구현 전
- [x] bkit hooks.json 형식 분석
- [x] omc session-start.mjs 분석
- [x] Claude Code hook 표준 확인

### 구현 중
- [ ] hooks.json JSON 유효성
- [ ] session-start.js 문법 검사
- [ ] plugin.json JSON 유효성

### 구현 후
- [ ] `--plugin-dir` 로드 테스트
- [ ] SessionStart hook 실행 확인
- [ ] handoff 감지 테스트
- [ ] `/dtz:handoff` skill 테스트

---

*Design Created: 2026-01-31*
*Design Version: 1.0*
