# DDotZ Plugin 기능 정상 동작 Plan

## Overview

| Item | Value |
|------|-------|
| **Feature** | max, eco, handoff 기능 정상 동작 보장 |
| **Priority** | P0 (Critical) |
| **Status** | Planning |
| **Created** | 2026-01-31 |

---

## 1. 현재 상태 분석

### Gap Analysis 결과
- **Overall Match Rate**: 96%
- **Critical Issues**: 없음
- **Minor Gaps**: 4개 (P2: 2개, P3: 2개)

### 구현 상태

| Feature | Status | Notes |
|---------|--------|-------|
| Max Mode | 완료 | 95% 일치 |
| Eco Mode | 완료 | 95% 일치 |
| Handoff | 완료 | 92% 일치 |
| Session Start Hook | 완료 | 100% 일치 |
| CLAUDE.md | 완료 | 95% 일치 |

---

## 2. 기능 동작 확인 체크리스트

### 2.1 Max Mode (`/dtz:max`)

#### 동작 테스트
- [ ] `/dtz:max` 명령 실행 시 skill.md 로드 확인
- [ ] Agent 라우팅 테이블 참조 확인
- [ ] LOW/MEDIUM/HIGH tier 선택 가이드라인 확인
- [ ] Verification Checklist 동작 확인

#### 예상 동작
```
User: /dtz:max
System: Max Mode 활성화
- Parallel Execution enabled
- Model Routing: haiku → sonnet → opus
- Background Operations: supported
```

### 2.2 Eco Mode (`/dtz:eco`)

#### 동작 테스트
- [ ] `/dtz:eco` 명령 실행 시 skill.md 로드 확인
- [ ] Haiku 우선 라우팅 적용 확인
- [ ] Opus 회피 규칙 적용 확인
- [ ] Escalation Pattern 동작 확인

#### 예상 동작
```
User: /dtz:eco
System: Eco Mode 활성화
- Token-Conscious Routing
- DEFAULT: Haiku, UPGRADE: Sonnet (필요시)
- AVOID: Opus
```

### 2.3 Handoff (`/dtz:handoff`)

#### Save 테스트
- [ ] `/dtz:handoff` 실행 시 Save Procedure 동작
- [ ] `.dtz/handoffs/` 디렉토리 자동 생성
- [ ] Session ID 생성 (`{YYYY-MM-DD}_{6chars}`)
- [ ] handoff 문서 생성 (9개 섹션)
- [ ] `latest.md` 업데이트
- [ ] maxHistory 적용 (기본 10개)

#### Load 테스트
- [ ] `/dtz:handoff load` 실행 시 latest.md 로드
- [ ] `/dtz:handoff load {id}` 실행 시 특정 파일 로드
- [ ] Pending Tasks → TaskCreate 복원
- [ ] 파일 없을 때 안내 메시지

#### List 테스트
- [ ] `/dtz:handoff list` 실행 시 목록 출력
- [ ] Session ID, Created, Summary 테이블 형식

#### Clear 테스트
- [ ] `/dtz:handoff clear` 실행 시 확인 프롬프트
- [ ] 확인 후 전체 삭제

### 2.4 Session Start Hook

#### Auto-Load 테스트
- [ ] 새 세션 시작 시 hook 실행
- [ ] `.dtz/handoffs/latest.md` 존재 확인
- [ ] 존재 시 사용자에게 안내
- [ ] AskUserQuestion으로 선택 제공
- [ ] "예" 선택 시 Load Procedure 실행
- [ ] "아니오" 선택 시 일반 세션 시작

#### Config 적용 테스트
- [ ] `.dtz/config.json` 읽기
- [ ] `autoLoad: false` 시 자동 로드 건너뜀
- [ ] `maxHistory` 값 적용

---

## 3. 수정 필요 사항

### 3.1 P3 - Agent Table 완성 (선택)

**현재**:
```markdown
| HIGH | Opus | executor-high |
```

**수정 후**:
```markdown
| HIGH | Opus | architect, executor-high |
```

**적용 파일**:
- `skills/max/skill.md` (line 27-30)
- `skills/eco/skill.md` (line 29-34)
- `CLAUDE.md` (line 94-98)

### 3.2 P2 - Priority Comments 추가 (v1.1.0)

**현재**:
```markdown
## Pending Tasks
- [ ] 미완료 항목 1
```

**수정 후**:
```markdown
## Pending Tasks
- [ ] 미완료 항목 1 <!-- priority: high -->
```

**적용 파일**:
- `skills/handoff/skill.md` (line 78-81)

---

## 4. 실행 계획

### Phase 1: 동작 검증 (즉시)

1. **Plugin 로드 확인**
   ```bash
   # Claude Code에서 ddotz-plugin 인식 확인
   # /dtz:max, /dtz:eco, /dtz:handoff 명령 가용성 확인
   ```

2. **Skills 동작 테스트**
   - 각 skill 트리거 테스트
   - Agent 라우팅 동작 확인

3. **Handoff 전체 플로우 테스트**
   - Save → List → Load → Clear

### Phase 2: 선택적 개선 (v1.1.0)

1. Agent Table 업데이트 (P3)
2. Priority Comments 추가 (P2)
3. Agent-Assisted Extraction (P2)

---

## 5. 성공 기준

| Metric | Target | Current |
|--------|--------|---------|
| Match Rate | 95%+ | 96% |
| Critical Bugs | 0 | 0 |
| Core Features | 100% 동작 | 100% |
| Documentation | 완료 | 완료 |

---

## 6. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Plugin 로드 실패 | High | plugin.json 검증 |
| Hook 미작동 | Medium | hooks/session-start.md 검증 |
| Config 파싱 오류 | Low | 기본값 폴백 구현됨 |

---

## 7. 다음 단계

### 즉시 실행
1. 현재 구현된 기능의 동작 테스트
2. 필요시 P3 수정 사항 적용

### v1.1.0 예정
1. Priority Comments 기능 추가
2. Agent-Assisted Extraction 구현
3. Auto-save on Context Limit

---

## Appendix: 파일 구조

```
ddotz-plugin/
├── .claude-plugin/
│   └── plugin.json           # v1.0.0
├── agents/
│   ├── architect.md          # Opus - 복잡 분석
│   ├── architect-low.md      # Haiku - 간단 분석
│   ├── architect-medium.md   # Sonnet - 중간 분석
│   ├── executor.md           # Sonnet - 표준 실행
│   ├── executor-low.md       # Haiku - 간단 실행
│   ├── executor-high.md      # Opus - 복잡 실행
│   ├── designer.md           # Sonnet - UI/UX
│   ├── designer-low.md       # Haiku - 간단 스타일
│   ├── explore.md            # Haiku - 기본 검색
│   └── explore-medium.md     # Sonnet - 중간 검색
├── skills/
│   ├── max/skill.md          # 최대 성능 모드
│   ├── eco/skill.md          # 토큰 효율 모드
│   └── handoff/skill.md      # 세션 인계
├── hooks/
│   └── session-start.md      # 세션 시작 hook
├── docs/
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-analysis/
│   └── 04-report/
├── CLAUDE.md                 # 플러그인 지침
└── README.md                 # 사용자 문서
```

---

*Created: 2026-01-31*
*Plan Version: 1.0*
