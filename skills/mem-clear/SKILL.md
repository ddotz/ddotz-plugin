---
name: mem-clear
version: 0.1.0
description: |
  현재 작업 디렉토리의 claude-mem 메모리를 삭제합니다.
  Only invoke when explicitly called via /mem-clear.
allowed-tools:
  - Bash
  - AskUserQuestion
---

# /mem-clear — 현재 프로젝트의 claude-mem 메모리 삭제

현재 작업 디렉토리(또는 지정 프로젝트)의 claude-mem 관찰, 세션, 요약 데이터를 삭제합니다.

## 실행 절차

### 1. 프로젝트명 결정

인자가 있으면 그 값을, 없으면 현재 디렉토리의 basename을 사용:

```bash
PROJECT="${ARGS:-$(basename "$PWD")}"
echo "대상 프로젝트: $PROJECT"
```

### 2. 현재 상태 조회

```bash
DB="$HOME/.claude-mem/claude-mem.db"
sqlite3 "$DB" "SELECT 'observations: ' || COUNT(*) FROM observations WHERE project = '$PROJECT';
SELECT 'sessions: ' || COUNT(*) FROM sdk_sessions WHERE project = '$PROJECT';
SELECT 'summaries: ' || COUNT(*) FROM session_summaries WHERE project = '$PROJECT';"
```

데이터가 없으면 사용자에게 "저장된 메모리가 없습니다"라고 알리고 종료.

### 3. 사용자 확인

AskUserQuestion으로 확인:
- "프로젝트 '$PROJECT'의 위 데이터를 모두 삭제하시겠습니까?"
- 선택지: ["삭제", "취소"]

"취소"를 선택하면 종료.

### 4. 삭제 실행

```bash
DB="$HOME/.claude-mem/claude-mem.db"
sqlite3 "$DB" <<SQL
PRAGMA foreign_keys = ON;
BEGIN;
DELETE FROM session_summaries WHERE project = '$PROJECT';
DELETE FROM observations WHERE project = '$PROJECT';
DELETE FROM user_prompts WHERE content_session_id IN (
  SELECT content_session_id FROM sdk_sessions WHERE project = '$PROJECT'
);
DELETE FROM sdk_sessions WHERE project = '$PROJECT';
COMMIT;
SQL
echo "프로젝트 '$PROJECT' 메모리 삭제 완료"
```

### 5. 결과 보고

삭제된 항목 수를 사용자에게 알린다. Chroma 벡터 임베딩은 별도 정리가 필요함을 안내:
- "벡터 임베딩(Chroma)은 자동 정리되지 않습니다. 전체 재구축이 필요하면: `rm -rf ~/.claude-mem/chroma/`"
