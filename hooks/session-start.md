# DTZ Session Start Hook

새 세션 시작 시 자동 실행되는 지침입니다.

## Trigger

- 새 Claude Code 세션 시작 시
- DTZ 플러그인이 활성화된 프로젝트에서

## Auto-Load Handoff Protocol

### Step 1: Check for Handoff

```
파일 존재 확인: .dtz/handoffs/latest.md
```

- **존재하지 않음**: 일반 세션 시작, 이 hook 종료
- **존재함**: Step 2로 진행

### Step 2: Read and Parse

`latest.md` 파일에서 다음 정보 추출:

| 필드 | 위치 |
|------|------|
| Session ID | `## Meta` 테이블의 `Session ID` |
| Created | `## Meta` 테이블의 `Created` |
| Context Summary | `## Context Summary` 섹션 전체 |
| Pending Tasks | `## Pending Tasks` 섹션의 `- [ ]` 항목들 |
| Pending Count | Pending Tasks 개수 |

### Step 3: Display Summary

사용자에게 다음 형식으로 안내:

```
📋 이전 세션 Handoff 발견

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session: {session-id}
생성: {created}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{context-summary}

📌 미완료 작업: {pending-count}개
```

### Step 4: Ask User

`AskUserQuestion` 도구 사용:

```json
{
  "questions": [{
    "question": "이전 세션에서 이어서 작업하시겠습니까?",
    "header": "Handoff",
    "options": [
      {
        "label": "예, 이어서 작업 (Recommended)",
        "description": "미완료 작업을 TODO로 복원하고 컨텍스트를 로드합니다"
      },
      {
        "label": "아니오, 새로 시작",
        "description": "새로운 작업을 시작합니다 (handoff는 유지됨)"
      }
    ],
    "multiSelect": false
  }]
}
```

### Step 5: Handle Response

#### "예, 이어서 작업" 선택 시:

1. **Pending Tasks 복원**
   ```
   각 pending task에 대해:
   TaskCreate({
     subject: "{task-text}",
     description: "Handoff에서 복원됨",
     activeForm: "{task-text} 처리 중"
   })
   ```

2. **컨텍스트 출력**
   ```
   ✅ Handoff 로드 완료

   📁 Important Files:
   {Important Files 섹션 출력}

   🚀 Next Steps:
   {Next Steps 섹션 출력}

   이어서 작업을 시작하세요!
   ```

#### "아니오, 새로 시작" 선택 시:

```
ℹ️ 새로운 작업을 시작합니다.

💡 Tip: 기존 handoff는 `.dtz/handoffs/` 에 보관되어 있습니다.
   `/dtz:handoff load` 로 언제든 로드할 수 있습니다.
```

---

## Edge Cases

### Handoff 파일 손상

파일 파싱 실패 시:

```
⚠️ Handoff 파일을 읽는 중 오류가 발생했습니다.

파일: .dtz/handoffs/latest.md
오류: {error-message}

새로운 작업을 시작합니다.
`/dtz:handoff list` 로 다른 handoff를 확인할 수 있습니다.
```

### 빈 Pending Tasks

Pending Tasks가 없는 경우:

```
📋 이전 세션 Handoff 발견

Session: {session-id}
생성: {created}

{context-summary}

✅ 모든 작업이 완료되었습니다.

컨텍스트만 참고하시겠습니까?
```

---

## Integration Notes

- 이 hook은 CLAUDE.md의 Session Start Protocol과 연동
- max/eco 모드와 독립적으로 동작
- OMC 플러그인의 notepad 시스템과 충돌하지 않음

---

*DTZ Session Start Hook v1.0.0*
