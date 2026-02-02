---
name: fsd
description: Full-cycle Structured Development - PDCA 기반 자동화 개발 워크플로우
model: sonnet
triggers:
  - fsd
  - fsd:
  - full-cycle
  - pdca auto
  - 풀사이클
  - 전체개발
---

# FSD (Full-cycle Structured Development)

bkit PDCA 방법론을 기반으로 Plan → Design → Do → Check → Iterate → Report 전체 사이클을 자동으로 진행합니다.

## Commands

| Command | Description |
|---------|-------------|
| `fsd: {description}` | 새 FSD 워크플로우 시작 |
| `fsd status` | 현재 진행 상태 확인 |
| `fsd resume` | 중단된 워크플로우 재개 |
| `fsd cancel` | 진행 중인 워크플로우 취소 |
| `fsd config [key] [value]` | FSD 설정 확인/변경 |
| `fsd doctor` | 연동 상태 진단 및 검증 |
| `fsd detect {feature}` | 특정 feature의 문서 감지 테스트 (dry-run) |

## Start Procedure (fsd: {description})

### 1. 사전 조건 확인

```bash
# bkit 플러그인 설치 확인
ls ~/.claude/plugins/cache/bkit-marketplace/bkit/ 2>/dev/null && echo "BKIT_INSTALLED" || echo "BKIT_NOT_FOUND"
```

**bkit 미설치 시:**
```
⚠️ bkit 플러그인이 필요합니다.

FSD는 bkit의 PDCA 방법론을 활용합니다.
설치 방법: Claude Code에서 bkit 플러그인을 설치해주세요.
```
**STOP** - 더 이상 진행하지 않음

### 2. Feature 이름 추출

사용자 입력에서 feature name 생성:
- 예: "fsd: 사용자 인증 기능" → `user-auth`
- 예: "fsd: API 에러 핸들링 개선" → `api-error-handling`
- 규칙: kebab-case, 영문, 간결하게

### 2.5 기존 PDCA 문서 감지 (Auto-detect)

**Step 1: bkit-memory.json에서 현재 작업 중인 feature 확인**

```bash
# bkit의 currentFeature 확인 (가장 신뢰할 수 있는 소스)
cat .bkit-memory.json 2>/dev/null | grep -o '"currentFeature"[[:space:]]*:[[:space:]]*"[^"]*"'
```

**bkit-memory.json 구조:**
```json
{
  "currentFeature": "credit-approval-report",  // 현재 작업 중인 feature
  "phase": "check",                             // 현재 PDCA 단계
  "matchRate": 85,                              // 현재 품질 점수
  "activePdca": { ... },                        // 또는 이 필드 사용
  "pdcaHistory": [ ... ]                        // 완료된 feature 목록
}
```

**Step 2: Feature 이름 결정 로직**

| 조건 | Feature 이름 | 설명 |
|------|-------------|------|
| 사용자가 명시적으로 지정 | 사용자 입력 사용 | `fsd: user-auth` |
| bkit에 currentFeature 있음 | bkit 값 사용 | 진행 중인 작업 이어서 |
| 둘 다 있고 다름 | **사용자 확인** | 어떤 feature로 진행할지 |
| 아무것도 없음 | 사용자 입력에서 생성 | 새 feature 시작 |

**Step 3: 해당 feature의 문서 존재 확인**

```bash
# 각 단계별 문서 존재 확인
PLAN_EXISTS=$(ls docs/01-plan/features/{feature-name}.plan.md 2>/dev/null && echo "yes" || echo "no")
DESIGN_EXISTS=$(ls docs/02-design/features/{feature-name}.design.md 2>/dev/null && echo "yes" || echo "no")
ANALYSIS_EXISTS=$(ls docs/03-analysis/{feature-name}.analysis.md 2>/dev/null && echo "yes" || echo "no")
```

**Step 4: 이전 완료 기록 확인**

```bash
# 1. FSD history에서 완료된 feature인지 확인
# .dtz/state/fsd-state.json의 history 배열 검색

# 2. bkit memory에서 완료된 feature인지 확인
# .bkit-memory.json의 pdcaHistory 배열 검색
```

**bkit currentFeature와 다른 feature 요청 시:**
```
🔍 현재 bkit에서 진행 중인 feature가 있습니다!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재 작업 중: credit-approval-report (Check 단계, 85%)
요청한 feature: user-auth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? 어떻게 진행할까요?
  ● 현재 feature 이어서 (credit-approval-report)
  ○ 새 feature 시작 (user-auth)
```

**완료 기록 있는 경우 추가 경고:**
```
⚠️ 이 feature는 이전에 완료된 기록이 있습니다!
   └─ 완료일: 2026-01-30
   └─ 최종 Match Rate: 95%

기존 문서를 덮어쓰게 됩니다. 계속하시겠습니까?
```

**감지 결과에 따른 시작 단계 결정:**

| Plan | Design | Analysis | History | 시작 단계 | 설명 |
|:----:|:------:|:--------:|:-------:|:---------:|------|
| ❌ | ❌ | ❌ | - | plan | 처음부터 시작 |
| ✅ | ❌ | ❌ | ❌ | design | Plan 완료, Design부터 |
| ✅ | ✅ | ❌ | ❌ | do | Design 완료, Do부터 |
| ✅ | ✅ | ✅ | ❌ | check | Analysis 있음, 재검증 |
| ✅ | ✅ | ✅ | ✅ | **확인 필요** | 이전 완료된 feature, 덮어쓰기 경고 |

**bkit phase와 동기화:**

bkit-memory.json의 `phase` 값도 참고하여 더 정확한 시작점 결정:

| bkit phase | FSD 시작 단계 |
|------------|--------------|
| plan | plan (또는 이미 완료면 design) |
| design | design (또는 이미 완료면 do) |
| do | do |
| check | check |
| act | iterate |
| report | report |
| completed | **확인 필요** (재시작?) |

**감지 시 안내 및 사용자 확인:**

```
🔍 기존 PDCA 문서 감지됨!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Plan:     ✅ docs/01-plan/features/{feature}.plan.md
├─ Design:   ✅ docs/02-design/features/{feature}.design.md
└─ Analysis: ❌ 없음
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**AskUserQuestion으로 확인:**
```
질문: 기존 문서를 활용하여 Do 단계부터 진행할까요?
옵션:
- "예, 이어서 진행" → 감지된 다음 단계부터 시작
- "아니오, 처음부터" → 기존 문서 무시하고 Plan부터 시작
- "문서 내용 확인" → Plan/Design 문서 요약 표시 후 재선택
```

**"문서 내용 확인" 선택 시:**
```
📄 기존 문서 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Plan] docs/01-plan/features/{feature}.plan.md
- Purpose: {Plan 문서의 Overview/Purpose 섹션 요약}
- Created: {파일 생성일 또는 문서 내 날짜}

[Design] docs/02-design/features/{feature}.design.md
- Goals: {Design Goals 요약}
- Components: {주요 컴포넌트 목록}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
그 후 다시 "이어서 진행" / "처음부터" 선택

**상태 초기화 시 감지된 문서 반영:**
- 감지된 문서의 phase는 `status: "completed"` 로 설정
- `documents` 객체에 경로 기록
- `phase`를 감지된 다음 단계로 설정

### 3. 상태 초기화

```bash
# 상태 디렉토리 확인
mkdir -p .dtz/state
```

`.dtz/state/fsd-state.json` 생성/업데이트:

**처음부터 시작하는 경우:**
```json
{
  "$schema": "fsd-state-schema-v1",
  "version": "1.0.0",
  "active": {
    "feature": "{feature-name}",
    "description": "{사용자 설명}",
    "startedAt": "{ISO timestamp}",
    "phase": "plan",
    "iteration": 0,
    "maxIterations": 5,
    "matchRate": null,
    "phases": {
      "plan": { "status": "pending" },
      "design": { "status": "pending" },
      "do": { "status": "pending" },
      "check": { "status": "pending" },
      "iterate": { "status": "pending" },
      "report": { "status": "pending" }
    },
    "documents": {
      "plan": null,
      "design": null,
      "analysis": null,
      "report": null
    },
    "errors": []
  },
  "history": []
}
```

**기존 문서 감지된 경우 (예: Plan, Design 완료):**
```json
{
  "$schema": "fsd-state-schema-v1",
  "version": "1.0.0",
  "active": {
    "feature": "{feature-name}",
    "description": "{사용자 설명}",
    "startedAt": "{ISO timestamp}",
    "phase": "do",
    "autoDetected": true,
    "detectedAt": "{ISO timestamp}",
    "iteration": 0,
    "maxIterations": 5,
    "matchRate": null,
    "phases": {
      "plan": { "status": "completed", "autoDetected": true },
      "design": { "status": "completed", "autoDetected": true },
      "do": { "status": "pending" },
      "check": { "status": "pending" },
      "iterate": { "status": "pending" },
      "report": { "status": "pending" }
    },
    "documents": {
      "plan": "docs/01-plan/features/{feature-name}.plan.md",
      "design": "docs/02-design/features/{feature-name}.design.md",
      "analysis": null,
      "report": null
    },
    "errors": []
  },
  "history": []
}
```

### 4. 시작 안내

```
🚀 FSD 워크플로우를 시작합니다: {feature-name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Plan] ⏳ → [Design] ⏳ → [Do] ⏳ → [Check] ⏳ → [Report] ⏳

진행률: ░░░░░░░░░░░░░░░░░░░░ 0%

설명: {description}
목표 Match Rate: 90%
최대 Iterations: 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Progress Bar 계산

| Phase | Progress |
|-------|----------|
| plan 완료 | 20% |
| design 완료 | 40% |
| do 완료 | 60% |
| check 완료 (첫 번째) | 80% |
| report 완료 | 100% |

**Progress Bar 생성:**
```
progress_percent = {위 표에서 계산}
filled = progress_percent / 5  # 20칸 기준
bar = "█" * filled + "░" * (20 - filled)
output = f"진행률: {bar} {progress_percent}%"
```

### 5. PDCA 사이클 실행

**자동으로 순서대로 진행:**

1. Plan Phase 호출
2. Design Phase 호출
3. Do Phase 호출
4. Check Phase 호출
5. (필요시) Iterate Phase 반복
6. Report Phase 호출

## Plan Phase Procedure

### 1. 단계 안내

```
📋 [1/5] Plan 단계 시작...
```

### 2. 상태 업데이트

`.dtz/state/fsd-state.json`에서:
- `phases.plan.status` = "in_progress"

### 3. bkit PDCA 호출

**Skill 도구로 bkit pdca plan 호출:**
```
Skill: bkit:pdca
Args: plan {feature-name}
```

### 4. 완료 확인

Plan 문서 생성 확인:
```bash
ls docs/01-plan/features/{feature-name}.plan.md 2>/dev/null && echo "PLAN_EXISTS" || echo "PLAN_NOT_FOUND"
```

### 5. 상태 업데이트

- `phases.plan.status` = "completed"
- `phases.plan.completedAt` = "{ISO timestamp}"
- `documents.plan` = "docs/01-plan/features/{feature-name}.plan.md"
- `phase` = "design"

### 6. 전환 안내

```
✅ Plan 단계 완료!
   └─ docs/01-plan/features/{feature-name}.plan.md 생성됨

🎨 [2/5] Design 단계로 진행합니다...
```

**→ Design Phase로 자동 진행**

## Design Phase Procedure

### 1. 단계 안내

```
🎨 [2/5] Design 단계 시작...
```

### 2. 상태 업데이트

- `phases.design.status` = "in_progress"

### 3. bkit PDCA 호출

**Skill 도구로 bkit pdca design 호출:**
```
Skill: bkit:pdca
Args: design {feature-name}
```

### 4. 완료 확인

Design 문서 생성 확인:
```bash
ls docs/02-design/features/{feature-name}.design.md 2>/dev/null && echo "DESIGN_EXISTS" || echo "DESIGN_NOT_FOUND"
```

### 5. 상태 업데이트

- `phases.design.status` = "completed"
- `phases.design.completedAt` = "{ISO timestamp}"
- `documents.design` = "docs/02-design/features/{feature-name}.design.md"
- `phase` = "do"

### 6. 전환 안내

```
✅ Design 단계 완료!
   └─ docs/02-design/features/{feature-name}.design.md 생성됨

🔨 [3/5] Do 단계로 진행합니다...
```

**→ Do Phase로 자동 진행**

## Do Phase Procedure

### 1. 단계 안내

```
🔨 [3/5] Do 단계 시작 (구현)...
```

### 2. 상태 업데이트

- `phases.do.status` = "in_progress"

### 3. Design 문서 분석

Design 문서를 읽고 구현해야 할 항목 파악:
- Implementation Guide 섹션
- 파일 구조
- API 스펙
- 컴포넌트 목록

### 4. 구현 실행

**executor 에이전트에 위임:**
```
Task(subagent_type="oh-my-claudecode:executor",
     model="sonnet",
     prompt="Design 문서 기반으로 구현해주세요:

     Design 문서: docs/02-design/features/{feature-name}.design.md

     구현 우선순위:
     1. 핵심 데이터 모델/타입
     2. 비즈니스 로직
     3. API/인터페이스
     4. UI 컴포넌트 (해당 시)

     각 파일 생성 후 빌드 오류 없이 컴파일되는지 확인하세요.")
```

### 5. 구현 검증

```bash
# TypeScript 프로젝트의 경우
npm run build 2>&1 || echo "BUILD_CHECK"

# 또는 tsc로 직접 확인
npx tsc --noEmit 2>&1 || echo "TYPE_CHECK"
```

### 6. 상태 업데이트

- `phases.do.status` = "completed"
- `phases.do.completedAt` = "{ISO timestamp}"
- `phase` = "check"

### 7. 전환 안내

```
✅ Do 단계 완료!
   └─ 구현 파일 생성됨

🔍 [4/5] Check 단계로 진행합니다...
```

**→ Check Phase로 자동 진행**

## Check Phase Procedure

### 1. 단계 안내

```
🔍 [4/5] Check 단계 시작 (품질 검증)...
```

### 2. 상태 업데이트

- `phases.check.status` = "in_progress"
- `phases.check.attempts` = (기존값 + 1) 또는 1

### 3. bkit PDCA 분석 호출

**Skill 도구로 bkit pdca analyze 호출:**
```
Skill: bkit:pdca
Args: analyze {feature-name}
```

### 4. 결과 파싱

분석 결과에서 Match Rate 추출:
- `docs/03-analysis/{feature-name}.analysis.md` 읽기
- Match Rate 값 파싱

### 5. 상태 업데이트

- `matchRate` = {파싱된 값}
- `phases.check.status` = "completed"
- `documents.analysis` = "docs/03-analysis/{feature-name}.analysis.md"

### 6. 분기 결정

**IF matchRate >= 90%:**
```
✅ Check 단계 완료!
   └─ Match Rate: {matchRate}% (목표 달성!)

📊 [5/5] Report 단계로 진행합니다...
```
- `phase` = "report"
- **→ Report Phase로 자동 진행**

**ELSE IF iteration < maxIterations:**
```
⚠️ Check 단계 완료
   └─ Match Rate: {matchRate}% (목표: 90%)
   └─ Gap 항목 발견

🔄 Iterate 단계로 진행합니다... (#{iteration + 1}/{maxIterations})
```
- `phase` = "iterate"
- **→ Iterate Phase로 자동 진행**

**ELSE (iteration >= maxIterations):**
```
⚠️ 최대 반복 횟수 도달
   └─ Match Rate: {matchRate}% (목표: 90%)
   └─ {maxIterations}회 반복 완료

📊 Report 단계로 진행합니다 (일부 Gap 미해결)...
```
- `phase` = "report"
- **→ Report Phase로 자동 진행**

## Iterate Phase Procedure

### 1. 단계 안내

```
🔄 [4.{iteration}/5] Iterate 단계 (개선 #{iteration})...
   ├─ 현재 Match Rate: {matchRate}%
   ├─ 이전 Match Rate: {previousMatchRate}% ({delta:+n}%)
   └─ 목표: 90%

진행률: ████████████████░░░░ 80%
```

**Delta 계산:**
- 첫 iteration: delta 표시 없음
- 이후: `delta = currentMatchRate - previousMatchRate`
- 양수면 `+{delta}%`, 음수면 `{delta}%`

### 2. 상태 업데이트

- `phases.iterate.status` = "in_progress"
- `iteration` += 1

### 3. bkit PDCA iterate 호출

**Skill 도구로 bkit pdca iterate 호출:**
```
Skill: bkit:pdca
Args: iterate {feature-name}
```

### 4. 상태 업데이트

- `phases.iterate.lastIteratedAt` = "{ISO timestamp}"

### 5. 전환 안내

```
✅ Iterate #{iteration} 완료!
   └─ 코드 개선 적용됨

🔍 재검증을 위해 Check 단계로 돌아갑니다...
```

- `phase` = "check"
- **→ Check Phase로 자동 진행 (재검증)**

## Report Phase Procedure

### 1. 단계 안내

```
📊 [5/5] Report 단계 시작...
```

### 2. 상태 업데이트

- `phases.report.status` = "in_progress"

### 3. bkit PDCA report 호출

**Skill 도구로 bkit pdca report 호출:**
```
Skill: bkit:pdca
Args: report {feature-name}
```

### 4. 상태 업데이트

- `phases.report.status` = "completed"
- `phases.report.completedAt` = "{ISO timestamp}"
- `documents.report` = "docs/04-report/features/{feature-name}.report.md"
- `active.phase` = "completed"

### 5. 히스토리 저장

`active`를 `history` 배열로 이동:
```json
{
  "feature": "{feature-name}",
  "description": "{description}",
  "status": "completed",
  "completedAt": "{ISO timestamp}",
  "finalMatchRate": {matchRate},
  "totalIterations": {iteration}
}
```

`active`를 `null`로 설정

### 6. 완료 안내

```
✅ FSD 워크플로우 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Plan] ✅ → [Design] ✅ → [Do] ✅ → [Check] ✅ → [Report] ✅

Feature: {feature-name}
설명: {description}
최종 Match Rate: {matchRate}%
총 Iterations: {iteration}회
소요 시간: {duration 계산}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 생성된 문서:
├─ Plan: docs/01-plan/features/{feature-name}.plan.md
├─ Design: docs/02-design/features/{feature-name}.design.md
├─ Analysis: docs/03-analysis/{feature-name}.analysis.md
└─ Report: docs/04-report/features/{feature-name}.report.md

🎉 개발 사이클이 성공적으로 완료되었습니다!
```

## Status Procedure

### 1. 상태 파일 읽기

`.dtz/state/fsd-state.json` 읽기

### 2. 활성 워크플로우 없는 경우

```
📊 FSD Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
활성 워크플로우: 없음

최근 완료된 워크플로우:
{history가 있으면}
- {feature} ({completedAt}) - Match Rate: {finalMatchRate}%
{없으면}
- 기록 없음

💡 새 워크플로우 시작: fsd: {설명}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. 활성 워크플로우 있는 경우

```
📊 FSD Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature: {feature}
설명: {description}
현재 단계: {phase}
Match Rate: {matchRate || '--'}%
Iteration: {iteration}/{maxIterations}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Plan] {상태} → [Design] {상태} → [Do] {상태} → [Check] {상태} → [Report] {상태}

{상태: ✅=completed, 🔄=in_progress, ⏳=pending}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 재개하려면: fsd resume
💡 취소하려면: fsd cancel
```

## Resume Procedure

### 1. 상태 파일 읽기

`.dtz/state/fsd-state.json` 읽기

### 2. 활성 워크플로우 없는 경우

```
⚠️ 재개할 워크플로우가 없습니다.

새 워크플로우를 시작하세요: fsd: {설명}
```
**STOP**

### 3. 활성 워크플로우 있는 경우

```
🔄 FSD 워크플로우 재개: {feature}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재 단계: {phase}
Match Rate: {matchRate || '--'}%
Iteration: {iteration}/{maxIterations}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{phase} 단계부터 재개합니다...
```

**현재 phase에 해당하는 Procedure로 점프:**
- "plan" → Plan Phase Procedure
- "design" → Design Phase Procedure
- "do" → Do Phase Procedure
- "check" → Check Phase Procedure
- "iterate" → Iterate Phase Procedure
- "report" → Report Phase Procedure

## Cancel Procedure

### 1. 상태 파일 읽기

`.dtz/state/fsd-state.json` 읽기

### 2. 활성 워크플로우 없는 경우

```
⚠️ 취소할 워크플로우가 없습니다.
```
**STOP**

### 3. 사용자 확인

**AskUserQuestion 사용:**
```
질문: '{feature}' FSD 워크플로우를 취소하시겠습니까?
옵션:
- "예, 취소합니다" - 워크플로우 취소
- "아니오, 계속 진행" - 취소 취소
```

### 4. 취소 확인 시

`active`를 `history`로 이동:
```json
{
  "feature": "{feature}",
  "status": "cancelled",
  "cancelledAt": "{ISO timestamp}",
  "phase": "{current phase}",
  "matchRate": {matchRate || null}
}
```

`active`를 `null`로 설정

```
❌ FSD 워크플로우가 취소되었습니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature: {feature}
취소 시점: {phase} 단계
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Config Procedure

### config (설정 확인)

`.dtz/config.json`에서 fsd 섹션 읽기:

```
⚙️ FSD 설정
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
maxIterations: {값} (기본: 5)
targetMatchRate: {값} (기본: 90)
autoReport: {값} (기본: true)
verboseOutput: {값} (기본: true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

변경: fsd config {key} {value}
예: fsd config maxIterations 3
```

### config {key} {value} (설정 변경)

`.dtz/config.json` 업데이트:
```json
{
  "handoff": { ... },
  "fsd": {
    "{key}": {value}
  }
}
```

```
✅ FSD 설정이 변경되었습니다.
   {key}: {old_value} → {new_value}
```

## Doctor Procedure

FSD 연동 상태를 진단하고 문제를 확인합니다.

### 1. 검사 항목

```bash
# 1. bkit 플러그인 설치 확인
ls ~/.claude/plugins/cache/bkit-marketplace/bkit/ 2>/dev/null

# 2. bkit-memory.json 존재 및 유효성
cat .bkit-memory.json 2>/dev/null | head -5

# 3. FSD 상태 파일 확인
cat .dtz/state/fsd-state.json 2>/dev/null | head -5

# 4. PDCA 문서 디렉토리 구조
ls -la docs/01-plan/features/ 2>/dev/null | head -5
ls -la docs/02-design/features/ 2>/dev/null | head -5

# 5. config 파일 확인
cat .dtz/config.json 2>/dev/null
```

### 2. 출력 형식

```
🩺 FSD Doctor - 연동 상태 진단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[bkit 플러그인]
├─ 설치 상태: ✅ 설치됨 (v1.4.7)
└─ 경로: ~/.claude/plugins/cache/bkit-marketplace/bkit/

[bkit-memory.json]
├─ 파일 존재: ✅
├─ JSON 유효성: ✅
├─ currentFeature: credit-approval-report
└─ phase: check (matchRate: 85%)

[FSD 상태 파일]
├─ 파일 존재: ✅ .dtz/state/fsd-state.json
├─ active: null (진행 중인 워크플로우 없음)
└─ history: 2개 완료된 워크플로우

[PDCA 문서 구조]
├─ docs/01-plan/features/: ✅ (8개 파일)
├─ docs/02-design/features/: ✅ (3개 파일)
├─ docs/03-analysis/: ✅ (3개 파일)
└─ docs/04-report/: ✅ (1개 파일)

[설정 파일]
├─ .dtz/config.json: ✅
├─ maxIterations: 5
└─ targetMatchRate: 90

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 모든 검사 통과! FSD 사용 준비 완료.
```

### 3. 문제 발견 시

```
🩺 FSD Doctor - 연동 상태 진단
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[bkit 플러그인]
├─ 설치 상태: ❌ 미설치
└─ 해결: Claude Code에서 bkit 플러그인 설치 필요

[bkit-memory.json]
├─ 파일 존재: ❌
└─ 해결: /pdca status 실행하여 초기화

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 2개 문제 발견. 위 해결 방법을 따라주세요.
```

## Detect Procedure

특정 feature의 문서 감지를 테스트합니다 (dry-run, 실제 실행 없음).

### 사용법

```
fsd detect {feature-name}
```

### 1. 감지 실행

```bash
# 해당 feature의 모든 문서 확인
PLAN=$(ls docs/01-plan/features/{feature}.plan.md 2>/dev/null)
DESIGN=$(ls docs/02-design/features/{feature}.design.md 2>/dev/null)
ANALYSIS=$(ls docs/03-analysis/{feature}.analysis.md 2>/dev/null)
REPORT=$(ls docs/04-report/features/{feature}.report.md 2>/dev/null)

# bkit-memory에서 해당 feature 정보
BKIT_CURRENT=$(cat .bkit-memory.json 2>/dev/null | grep currentFeature)
BKIT_HISTORY=$(cat .bkit-memory.json 2>/dev/null | grep -A5 pdcaHistory)

# FSD history에서 해당 feature
FSD_HISTORY=$(cat .dtz/state/fsd-state.json 2>/dev/null | grep -A5 '"history"')
```

### 2. 출력 형식

```
🔍 FSD Detect: credit-approval-report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[문서 감지 결과]
├─ Plan:     ✅ docs/01-plan/features/credit-approval-report.plan.md
│            └─ 크기: 28.7KB, 수정일: 2026-01-28
├─ Design:   ✅ docs/02-design/features/credit-approval-report.design.md
│            └─ 크기: 51KB, 수정일: 2026-01-29
├─ Analysis: ✅ docs/03-analysis/credit-approval-report.analysis.md
│            └─ Match Rate: 95%
└─ Report:   ✅ docs/04-report/credit-approval-report.report.md
             └─ 완료일: 2026-01-30

[bkit 상태]
├─ currentFeature: non-listed-audit (다른 feature 진행 중)
└─ pdcaHistory: ✅ 완료 기록 있음 (2026-01-30, 97%)

[FSD 상태]
└─ history: ✅ 완료 기록 있음

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 감지 결과 요약:
├─ 상태: COMPLETED (이전에 완료된 feature)
├─ 모든 문서 존재
└─ 다시 시작하면 기존 문서 덮어쓰기 경고 표시

💡 이 feature로 FSD 시작: fsd: credit-approval-report
   (확인 질문이 표시됩니다)
```

### 3. 문서 없는 경우

```
🔍 FSD Detect: new-feature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[문서 감지 결과]
├─ Plan:     ❌ 없음
├─ Design:   ❌ 없음
├─ Analysis: ❌ 없음
└─ Report:   ❌ 없음

[bkit 상태]
└─ 해당 feature 기록 없음

[FSD 상태]
└─ 해당 feature 기록 없음

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 감지 결과 요약:
├─ 상태: NEW (새 feature)
└─ Plan 단계부터 시작됩니다

💡 이 feature로 FSD 시작: fsd: new-feature
```

### 4. 부분 진행된 경우

```
🔍 FSD Detect: user-auth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[문서 감지 결과]
├─ Plan:     ✅ docs/01-plan/features/user-auth.plan.md
├─ Design:   ✅ docs/02-design/features/user-auth.design.md
├─ Analysis: ❌ 없음
└─ Report:   ❌ 없음

[bkit 상태]
├─ currentFeature: user-auth ← 현재 진행 중!
└─ phase: design (완료)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 감지 결과 요약:
├─ 상태: IN_PROGRESS (진행 중)
├─ Plan, Design 완료
└─ Do 단계부터 시작됩니다

💡 이 feature로 FSD 시작: fsd: user-auth
   (Do 단계부터 자동 진행)
```

## Error Handling

### bkit 스킬 호출 실패 (3회 재시도)

**재시도 로직:**
```
retry_count = 0
max_retries = 3

WHILE retry_count < max_retries:
  TRY:
    CALL bkit PDCA skill
    IF success: BREAK
  CATCH error:
    retry_count += 1
    WAIT 2초
    IF retry_count < max_retries:
      LOG "재시도 {retry_count}/{max_retries}..."

IF retry_count >= max_retries:
  SHOW error message
  ADD to errors array
```

**재시도 중 안내:**
```
⚠️ bkit PDCA 스킬 호출 실패, 재시도 중... ({retry_count}/3)
```

**최종 실패 시:**
```
❌ bkit PDCA 스킬 호출 실패 (3회 재시도 후)

오류: {error message}

다음을 시도해보세요:
1. bkit 플러그인이 정상 설치되었는지 확인
2. /pdca status로 bkit 상태 확인
3. 수동으로 /pdca {phase} {feature} 실행

재시도하려면: fsd resume
```

상태 파일에 에러 기록:
```json
{
  "active": {
    "errors": [
      {
        "phase": "{phase}",
        "error": "{message}",
        "timestamp": "{ISO}",
        "retryCount": 3
      }
    ]
  }
}
```

### 파일 생성 실패

해당 phase를 "failed"로 마킹하고 사용자에게 수동 개입 요청

### Match Rate 파싱 실패

기본값 0으로 설정하고 사용자에게 수동 입력 요청

---

*FSD Skill v1.0.0*
*Part of DTZ Plugin v2.3.0*
