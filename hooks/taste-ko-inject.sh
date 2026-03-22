#!/bin/bash
# taste-ko auto-inject hook
# taste-skill이 트리거될 수 있는 파일 작업 시 taste-ko를 자동 주입한다.
# 세션당 1회만 주입 (dedup).

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')

# Read/Edit/Write만 대상
case "$TOOL_NAME" in
  Read|Edit|Write) ;;
  *) exit 0 ;;
esac

# 파일 경로 추출
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[[ -z "$FILE_PATH" ]] && exit 0

# 파일 확장자 매칭 (taste-skill과 동일한 패턴)
case "$FILE_PATH" in
  *.html|*.htm|*.tsx|*.jsx) ;;
  *) exit 0 ;;
esac

# 세션 dedup — 세션당 1회만 주입
DEDUP_DIR="/tmp/taste-ko-dedup"
mkdir -p "$DEDUP_DIR"
DEDUP_KEY=$(echo -n "${SESSION_ID:-unknown}" | shasum -a 256 | cut -d' ' -f1)
DEDUP_FILE="$DEDUP_DIR/$DEDUP_KEY"

if [[ -f "$DEDUP_FILE" ]]; then
  exit 0
fi
touch "$DEDUP_FILE"

# taste-ko SKILL.md 주입
SKILL_FILE="$HOME/.claude/skills/taste-ko/SKILL.md"
if [[ -f "$SKILL_FILE" ]]; then
  echo "[taste-ko] 한국형 Taste 확장팩이 자동 활성화되었습니다."
  echo ""
  cat "$SKILL_FILE"
fi
