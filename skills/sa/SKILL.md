---
name: sa
version: 2.1.0
description: 현재 활성화된 스킬 중 상황에 맞는 최적의 스킬을 추천합니다
model: haiku
allowed-tools: []
tags: [advisor, skill, recommendation]
category: utility
---

# Skill Advisor

사용자 입력: **$ARGUMENTS**

인자가 없으면 "어떤 상황인지 간단히 말씀해주세요" 하고 먼저 물어보세요.

## 실행 절차

### Step 1: 활성화된 스킬 목록 수집

현재 대화의 system-reminder 중 **"The following skills are available for use with the Skill tool:"** 블록을 찾아서, 거기에 나열된 모든 스킬의 **이름**과 **description**을 파악하세요.

이 목록이 곧 추천 대상의 전체 범위입니다. 외부 fetch 없이 이 목록만 사용합니다.

### Step 2: 상황 매칭

`$ARGUMENTS`의 의도를 파악한 뒤, Step 1에서 수집한 스킬들의 description을 하나씩 대조하여 가장 적합한 스킬을 선택하세요.

매칭 우선순위:
1. description이 사용자 상황과 직접적으로 일치하는 스킬
2. 스킬 이름(name)이 상황 키워드와 관련 있는 스킬
3. 여러 스킬을 조합하면 시너지가 나는 경우 함께 제시

### Step 3: 추천 출력

아래 형식으로 답변하세요.

---

**상황**: [한 줄 요약]

**추천**: `[명령어]`
[이유 2줄 이내]

**대안**: `[명령어]` (있다면)

**조합**: [시너지 있는 스킬 조합이 있다면]
