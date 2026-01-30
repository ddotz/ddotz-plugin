# PDCA Plan: DTZ Handoff Feature

## 1. Overview

| 항목 | 내용 |
|------|------|
| **Feature** | Session Handoff (세션 인계) |
| **Version** | 1.0.0 |
| **Author** | Claude |
| **Date** | 2025-01-30 |
| **Status** | Plan |

## 2. Background

### 2.1 문제 정의
Claude Code 세션은 context 한계에 도달하거나 작업 중단 시 현재 상태를 잃어버림. 새 세션에서 작업을 이어가려면 수동으로 컨텍스트를 재구성해야 함.

### 2.2 참고: OMC Note 시스템
OMC 플러그인의 note 명령어는 다음 기능 제공:
- **Notepad System** (`.omc/notepad.md`): 3-tier 메모리
  - Priority Context: 항상 로드 (500자 제한)
  - Working Memory: 7일 자동 삭제
  - MANUAL: 영구 저장
- **Wisdom System** (`.omc/notepads/{plan}/`): Plan별 학습/결정/이슈 관리

### 2.3 Handoff vs Note 차이점
| 특성 | Note | Handoff |
|------|------|---------|
| **목적** | 정보 저장 | 세션 전환 |
| **구조** | 단순 텍스트 | 구조화된 포맷 |
| **사용 시점** | 수시로 | 세션 종료/전환 시 |
| **포함 정보** | 사용자 메모 | 진행 상황, TODO, 결정사항 |

## 3. Goals

### 3.1 Must Have (P0)
- [ ] 현재 세션 상태를 구조화된 형식으로 저장
- [ ] 새 세션에서 handoff 문서 로드 기능
- [ ] **세션 시작 시 handoff 파일 자동 감지 및 로드**
- [ ] TODO 항목 자동 추출 및 포함
- [ ] 주요 결정사항/컨텍스트 캡처

### 3.2 Should Have (P1)
- [ ] 자동 handoff 트리거 (context limit 근접 시)
- [ ] Handoff 히스토리 관리
- [ ] 특정 handoff로 복원 기능

### 3.3 Nice to Have (P2)
- [ ] 다른 사용자/에이전트에게 handoff
- [ ] Handoff 요약 자동 생성
- [ ] Git 연동 (브랜치별 handoff)

## 4. Technical Design

### 4.1 파일 구조
```
.dtz/
├── handoffs/
│   ├── {session-id}.md          # 개별 handoff
│   └── latest.md                # 최신 handoff 심링크
└── config.json                  # handoff 설정
```

### 4.2 Handoff 문서 포맷
```markdown
# Session Handoff

## Meta
- **Session ID**: {uuid}
- **Created**: {timestamp}
- **Project**: {project-name}

## Context Summary
[현재 작업 컨텍스트 요약]

## Completed Tasks
- [x] 완료된 작업 1
- [x] 완료된 작업 2

## Pending Tasks
- [ ] 미완료 작업 1
- [ ] 미완료 작업 2

## Key Decisions
| 결정 | 이유 | 날짜 |
|------|------|------|
| ... | ... | ... |

## Important Files
- `path/to/file1.ts` - 설명
- `path/to/file2.ts` - 설명

## Next Steps
1. 다음 단계 1
2. 다음 단계 2

## Notes
[추가 참고사항]
```

### 4.3 Skill 정의
```yaml
# skills/handoff/skill.md
name: handoff
description: Save session context for seamless continuation
commands:
  - /dtz:handoff                    # 현재 상태 저장
  - /dtz:handoff --save <name>      # 이름 지정 저장
  - /dtz:handoff --load <id>        # 특정 handoff 로드
  - /dtz:handoff --list             # handoff 목록
  - /dtz:handoff --auto             # 자동 모드 토글
```

### 4.4 구현 컴포넌트

#### A. Skill 파일
- `skills/handoff/skill.md`: 스킬 정의 및 사용법

#### B. 핵심 로직 (SKILL.md 내 인라인)
DTZ 플러그인은 TypeScript 코드 없이 마크다운 기반으로 동작하므로,
skill.md 내에서 Claude가 수행할 절차를 명시:

1. **저장 시**:
   - TaskList 도구로 현재 TODO 수집
   - 대화 컨텍스트에서 결정사항 추출
   - 포맷에 맞게 handoff 문서 생성
   - `.dtz/handoffs/` 에 저장

2. **로드 시**:
   - 지정된 handoff 파일 읽기
   - 컨텍스트 복원을 위한 요약 출력
   - TODO 항목을 TaskCreate로 복원

## 5. Implementation Plan

### Phase 1: Core Structure (Day 1)
1. `.dtz/` 디렉토리 구조 생성
2. `skills/handoff/skill.md` 작성
3. 기본 저장/로드 기능 구현

### Phase 2: Auto Features (Day 2)
1. Context limit 감지 로직 추가
2. 자동 handoff 트리거 구현
3. Session start hook에서 latest handoff 감지

### Phase 3: Enhanced Features (Day 3)
1. Handoff 히스토리 관리
2. 검색/필터 기능
3. 문서화 및 테스트

## 6. Dependencies

| 의존성 | 용도 | 상태 |
|--------|------|------|
| TaskList/TaskCreate | TODO 수집/복원 | 사용 가능 |
| Read/Write | 파일 IO | 사용 가능 |
| Bash | 디렉토리 생성 | 사용 가능 |

## 7. Risks & Mitigations

| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| Context 자동 추출 부정확 | 중요 정보 누락 | 사용자 확인 프롬프트 |
| 파일 충돌 | 데이터 손실 | 타임스탬프 기반 고유 ID |
| 대용량 handoff | 성능 저하 | 요약 모드 제공 |

## 8. Success Metrics

- [ ] Handoff 저장 후 새 세션에서 90% 이상 컨텍스트 복원
- [ ] 저장/로드 명령어 5초 이내 완료
- [ ] 사용자 만족도 조사 긍정 응답 80% 이상

## 9. Open Questions

1. **OMC와의 통합**: OMC 플러그인이 함께 활성화된 경우 충돌 방지?
2. **Handoff 공유**: 팀 간 handoff 공유 필요?
3. **보안**: 민감 정보 필터링 필요?

---

## Next Steps

1. 이 Plan 승인 후 `/pdca design handoff` 실행하여 상세 설계 진행
2. Design 문서에서 skill.md 전체 내용 확정
3. 구현 및 테스트
