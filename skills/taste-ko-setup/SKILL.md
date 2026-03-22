---
name: taste-ko-setup
description: 한국형 Taste Skill 셋업. taste-skill(원본)을 설치하고, 한국어 타이포그래피·콘텐츠·컨버전 최적화 오버레이(taste-ko)와 자동 주입 hook을 함께 설정한다. 한 번 실행하면 이후 HTML/TSX/JSX 작업 시 taste-skill + taste-ko가 자동 적용된다.
---

# Taste-KO Setup

한국형 Taste Skill 원클릭 셋업. 실행하면 다음을 자동으로 수행한다:

1. **taste-skill** (원본) 설치 — `npx skills add https://github.com/Leonxlnx/taste-skill`
2. **taste-ko** 오버레이 복사 — `~/.claude/skills/taste-ko/SKILL.md`
3. **자동 주입 hook** 등록 — `.html/.htm/.tsx/.jsx` 파일 작업 시 taste-ko 자동 활성화

## 실행 절차

### Step 1: taste-skill 설치

```bash
npx skills add https://github.com/Leonxlnx/taste-skill
```

이미 설치되어 있으면 최신 버전으로 업데이트된다.

### Step 2: taste-ko 오버레이 복사

플러그인의 `taste-ko-overlay/SKILL.md`를 사용자 스킬 디렉토리로 복사한다:

```bash
mkdir -p ~/.claude/skills/taste-ko
cp "${CLAUDE_PLUGIN_ROOT}/skills/taste-ko-setup/taste-ko-overlay/SKILL.md" ~/.claude/skills/taste-ko/SKILL.md
```

### Step 3: 자동 주입 hook 등록

hook 스크립트를 복사한다:

```bash
mkdir -p ~/.claude/hooks
cp "${CLAUDE_PLUGIN_ROOT}/hooks/taste-ko-inject.sh" ~/.claude/hooks/taste-ko-inject.sh
chmod +x ~/.claude/hooks/taste-ko-inject.sh
```

그리고 `~/.claude/settings.json`의 `hooks` 섹션에 다음을 추가한다:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/taste-ko-inject.sh"
          }
        ]
      }
    ]
  }
}
```

> 이미 `PreToolUse` 배열이 있으면 기존 항목 뒤에 추가한다. 기존 hook을 덮어쓰지 않는다.

### Step 4: 설치 확인

```bash
# taste-skill 확인
ls ~/.claude/skills/taste-skill/SKILL.md

# taste-ko 확인
ls ~/.claude/skills/taste-ko/SKILL.md

# hook 확인
ls ~/.claude/hooks/taste-ko-inject.sh

# hook 테스트
echo '{"tool_name":"Read","tool_input":{"file_path":"/tmp/test.html"},"session_id":"test"}' | bash ~/.claude/hooks/taste-ko-inject.sh | head -3
```

성공 시 `[taste-ko] 한국형 Taste 확장팩이 자동 활성화되었습니다.` 출력.

## 설치 후 동작

- `.html`, `.htm`, `.tsx`, `.jsx` 파일을 Read/Edit/Write하면:
  - **taste-skill**: 원본 Taste 규칙 적용 (filePattern 매칭)
  - **taste-ko**: 한국형 오버레이 자동 주입 (hook)
- 세션당 1회만 주입 (dedup)
- taste-skill이 업데이트돼도 taste-ko는 독립적으로 유지

## 업데이트

- **taste-skill 업데이트:** `npx skills add https://github.com/Leonxlnx/taste-skill`
- **taste-ko 업데이트:** `/dtz:taste-ko-setup` 재실행 (오버레이 + hook 재복사)

## 제거

```bash
rm -rf ~/.claude/skills/taste-ko
rm ~/.claude/hooks/taste-ko-inject.sh
# settings.json에서 taste-ko-inject.sh PreToolUse hook 항목 수동 제거
```
