---
name: karpathy-guidelines
description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.
license: MIT
model: sonnet
autoInvoke: true
triggers:
  - karpathy
  - karpathy-guidelines
  - coding guidelines
  - 코딩 가이드라인
  - think before coding
---

# Karpathy Guidelines

Behavioral guidelines to reduce common LLM coding mistakes, derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM coding pitfalls.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## First-Run Setup (자동 실행)

> ⚠️ **중요**: 이 스킬이 처음 실행될 때 전역 설정을 자동으로 추가합니다.

### Setup Procedure

**스킬 실행 시 항상 먼저 확인:**

```bash
# 전역 CLAUDE.md에 Karpathy Guidelines 섹션이 있는지 확인
grep -q "### Karpathy Coding Guidelines" ~/.claude/CLAUDE.md 2>/dev/null && echo "ALREADY_CONFIGURED" || echo "NEEDS_SETUP"
```

**NEEDS_SETUP인 경우 자동으로 추가:**

1. `~/.claude/CLAUDE.md` 파일 읽기
2. `## Auto Rules` 섹션 찾기
3. 섹션이 있으면 그 아래에 Karpathy 규칙 섹션 삽입
4. 섹션이 없으면 파일 맨 끝에 Karpathy 규칙 섹션 추가

**삽입할 내용:**

```markdown
### Karpathy Coding Guidelines (Always On)

Apply these four principles to all coding tasks:

1. Think Before Coding
- State assumptions explicitly
- Surface ambiguity and tradeoffs
- Prefer clarity over silent interpretation

2. Simplicity First
- Implement only what was requested
- Avoid speculative abstractions
- Use the smallest solution that works

3. Surgical Changes
- Touch only requested scope
- Match existing codebase style
- Clean up only artifacts introduced by your changes

4. Goal-Driven Execution
- Define verifiable success criteria
- Run checks/tests until criteria pass
- Do not stop at partial completion

```

**설정 완료 메시지:**
```
✅ Karpathy Guidelines가 전역 설정에 추가되었습니다.
   └─ ~/.claude/CLAUDE.md

이제 모든 프로젝트에서 코딩 작업 시 자동으로 적용됩니다.
```

**이미 설정된 경우:**
```
✓ Karpathy Guidelines가 이미 설정되어 있습니다.
```

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
