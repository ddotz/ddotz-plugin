# Design: DTZ Handoff Feature

## 1. Overview

| 항목 | 내용 |
|------|------|
| **Feature** | Session Handoff |
| **Plan 문서** | `docs/01-plan/handoff-feature.md` |
| **Version** | 1.0.0 |
| **Date** | 2025-01-30 |

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     DTZ Plugin                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Session    │    │   Handoff    │    │   Handoff    │  │
│  │ Start Hook   │───▶│    Skill     │◀───│   Storage    │  │
│  │ (Auto-Load)  │    │              │    │  (.dtz/)     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CLAUDE.md (Plugin Instructions)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[세션 종료 시]
User Request ──▶ /dtz:handoff ──▶ Collect Context ──▶ Write .dtz/handoffs/{id}.md
                                        │
                                        ├── TaskList (TODO 수집)
                                        ├── 대화 분석 (결정사항)
                                        └── 파일 목록 정리

[새 세션 시작 시]
Session Start ──▶ Check .dtz/handoffs/latest.md ──▶ Exists? ──▶ Auto-Load
                                                         │
                                                         ▼
                                                  Display Summary
                                                         │
                                                         ▼
                                                  Restore TODOs
```

## 3. File Structure

### 3.1 Plugin Structure (신규 추가)
```
~/.claude/plugins/ddotz-plugin/
├── .claude-plugin/
│   └── plugin.json          # 기존
├── agents/                   # 기존 (10개 agent)
├── skills/
│   ├── eco/                  # 기존
│   ├── turbo/                # 기존
│   └── handoff/              # 신규
│       └── skill.md
├── hooks/                    # 신규
│   └── session-start.md
├── docs/
│   ├── 01-plan/
│   └── 02-design/
└── CLAUDE.md                 # 신규: 플러그인 전역 지침
```

### 3.2 Runtime Storage
```
{project-root}/
└── .dtz/
    ├── handoffs/
    │   ├── 2025-01-30_abc123.md    # 개별 handoff
    │   ├── 2025-01-30_def456.md
    │   └── latest.md               # 최신 handoff (복사본)
    └── config.json                  # 설정
```

## 4. Detailed Specifications

### 4.1 Handoff Document Schema

```markdown
# Session Handoff

## Meta
| Key | Value |
|-----|-------|
| Session ID | `{uuid-short}` |
| Created | `{ISO-8601 timestamp}` |
| Project | `{directory name}` |
| Previous Session | `{parent handoff id or "none"}` |

## Context Summary
{2-3문장으로 현재 작업 컨텍스트 요약}

## Completed Tasks
- [x] {완료된 작업 1}
- [x] {완료된 작업 2}

## Pending Tasks
- [ ] {미완료 작업 1} <!-- priority: high -->
- [ ] {미완료 작업 2} <!-- priority: medium -->

## Key Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| {결정 내용} | {이유} | {날짜} |

## Important Files
| File | Description |
|------|-------------|
| `{path}` | {역할 설명} |

## Current State
- **Branch**: `{git branch if available}`
- **Last Command**: `{마지막 실행 명령}`
- **Blockers**: {있으면 기술, 없으면 "None"}

## Next Steps
1. {다음 단계 1}
2. {다음 단계 2}

## Notes
{추가 참고사항 - 없으면 생략}

---
*Generated by DTZ Handoff v1.0.0*
```

### 4.2 Config Schema (`.dtz/config.json`)

```json
{
  "handoff": {
    "maxHistory": 10,
    "autoLoad": true
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxHistory` | number | 10 | 보관할 최대 handoff 개수 |
| `autoLoad` | boolean | true | 세션 시작 시 자동 로드 여부 |

> Note: `autoSave`, `includeGitInfo`, `includeFileList`는 v1.1.0에서 추가 예정

## 5. Skill Definition

### 5.1 `skills/handoff/skill.md`

```markdown
---
name: handoff
description: Save and restore session context for seamless continuation
triggers:
  - handoff
  - 핸드오프
  - 인계
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

handoff 저장 시 다음 절차를 수행합니다:

### Step 1: Collect Information
1. `TaskList` 도구로 현재 TODO 항목 수집
2. 대화 내역에서 주요 결정사항 추출
3. 최근 작업한 파일 목록 정리
4. Git 정보 수집 (가능한 경우)

### Step 2: Generate Document
1. 위 정보를 handoff 템플릿에 맞게 구성
2. Session ID 생성 (날짜_랜덤6자)
3. Context Summary 작성 (2-3문장)

### Step 3: Save
1. `.dtz/handoffs/` 디렉토리 확인/생성
2. `{session-id}.md` 파일 저장
3. `latest.md`에 동일 내용 복사
4. 저장 완료 메시지 출력

## Load Procedure

handoff 로드 시 다음 절차를 수행합니다:

### Step 1: Read Document
1. 지정된 handoff 파일 또는 `latest.md` 읽기
2. 파일이 없으면 안내 메시지 출력

### Step 2: Display Summary
1. Context Summary 출력
2. Pending Tasks 강조 표시
3. Key Decisions 요약

### Step 3: Restore State
1. Pending Tasks를 `TaskCreate`로 복원
2. Important Files 목록 제공
3. Next Steps 안내

## Auto-Load on Session Start

새 세션 시작 시 자동으로 실행:

1. `.dtz/handoffs/latest.md` 존재 확인
2. 존재하면:
   - "📋 이전 세션 handoff를 발견했습니다" 메시지
   - Context Summary 출력
   - Pending Tasks 개수 표시
   - "이어서 작업하시겠습니까?" 확인
3. 사용자 확인 시 Load Procedure 실행

## Example Output

### Save 완료 시
```
✅ Handoff 저장 완료

📄 Session ID: 2025-01-30_a1b2c3
📁 Location: .dtz/handoffs/2025-01-30_a1b2c3.md

📊 Summary:
- Completed: 3 tasks
- Pending: 2 tasks
- Key Decisions: 1

다음 세션에서 `/dtz:handoff load` 또는 자동 로드됩니다.
```

### Auto-Load 시
```
📋 이전 세션 Handoff 발견

Session: 2025-01-30_a1b2c3
Context: DTZ 플러그인에 handoff 기능 구현 중

📌 Pending Tasks (2):
  1. handoff skill 구현
  2. 테스트 및 문서화

이어서 작업을 시작하시겠습니까?
```
```

## 6. Session Start Hook

### 6.1 `hooks/session-start.md`

```markdown
# DTZ Session Start Hook

새 세션 시작 시 자동 실행되는 지침입니다.

## Auto-Load Handoff

세션 시작 시 다음을 수행합니다:

1. **Handoff 파일 확인**
   ```
   .dtz/handoffs/latest.md 파일 존재 여부 확인
   ```

2. **파일이 존재하면**
   - 파일 내용 읽기
   - Meta 섹션에서 Session ID, Created 날짜 추출
   - Context Summary 출력
   - Pending Tasks 개수 파악

3. **사용자에게 안내**
   ```
   📋 이전 세션 Handoff 발견

   Session: {session-id}
   생성: {created-date}

   {context-summary}

   📌 미완료 작업: {pending-count}개

   이어서 작업하시겠습니까? (Y/n)
   ```

4. **사용자 확인 시**
   - Pending Tasks를 TaskCreate로 복원
   - Next Steps 안내
   - 작업 시작

5. **사용자 거부 시**
   - "새로운 작업을 시작합니다" 메시지
   - 기존 handoff 유지 (삭제하지 않음)
```

### 6.2 CLAUDE.md (플러그인 전역 지침)

```markdown
# DTZ Plugin Instructions

## Session Start Protocol

매 세션 시작 시 다음을 확인하세요:

1. `.dtz/handoffs/latest.md` 파일이 존재하는지 확인
2. 존재하면 내용을 읽고 사용자에게 이전 세션 컨텍스트를 안내
3. 사용자가 이어서 작업하기를 원하면 TODO 복원

## Handoff Integration

- `/dtz:handoff` 명령 시 handoff skill 실행
- 세션 종료 전 중요한 작업이 있으면 handoff 저장 권장
- turbo/eco 모드와 독립적으로 동작
```

## 7. Integration Points

### 7.1 With Existing Skills

| Skill | Integration |
|-------|-------------|
| `turbo` | handoff 저장 시 turbo 상태 포함 |
| `eco` | handoff 저장 시 eco 상태 포함 |

### 7.2 With Task System

```
TaskList → Handoff Save (TODO 수집)
Handoff Load → TaskCreate (TODO 복원)
```

### 7.3 With Agents

| Agent | Role |
|-------|------|
| `explore` | Important Files 수집 시 활용 가능 |
| `architect` | Key Decisions 정리 시 활용 가능 |

## 8. Error Handling

| Scenario | Handling |
|----------|----------|
| `.dtz/` 없음 | 자동 생성 |
| handoff 파일 손상 | 경고 후 새로 시작 |
| TODO 복원 실패 | 수동 확인 안내 |
| 권한 오류 | 명확한 에러 메시지 |

## 9. Implementation Checklist

### Phase 1: Core (P0)
- [ ] `.dtz/` 디렉토리 구조 생성 로직
- [ ] `skills/handoff/skill.md` 작성
- [ ] Handoff 문서 생성 로직
- [ ] Save/Load 기본 기능

### Phase 2: Auto-Load (P0)
- [ ] `hooks/session-start.md` 작성
- [ ] `CLAUDE.md` 작성
- [ ] Auto-load 감지 및 실행 로직
- [ ] 사용자 확인 프롬프트

### Phase 3: Polish (P1)
- [ ] Handoff 목록 관리
- [ ] 히스토리 정리 (maxHistory)
- [ ] 에러 핸들링 완성

## 10. Test Scenarios

### TC-01: Basic Save
1. 작업 중 `/dtz:handoff` 실행
2. `.dtz/handoffs/` 에 파일 생성 확인
3. `latest.md` 업데이트 확인

### TC-02: Basic Load
1. handoff 저장 후 새 세션 시작
2. `/dtz:handoff load` 실행
3. TODO 복원 확인

### TC-03: Auto-Load
1. handoff 저장 후 세션 종료
2. 새 세션 시작
3. 자동 감지 메시지 확인
4. 확인 후 TODO 복원 확인

### TC-04: No Handoff
1. `.dtz/handoffs/` 비어있는 상태에서 세션 시작
2. 자동 감지 메시지 없음 확인
3. `/dtz:handoff load` 시 안내 메시지 확인

---

## Next Steps

1. Design 승인 후 구현 시작
2. `skills/handoff/skill.md` 파일 작성
3. `CLAUDE.md` 작성
4. 테스트 및 검증
