# DDotZ Plugin v2.0 - Handoff Only Plan

## Overview

| Item | Value |
|------|-------|
| **Feature** | Handoff Only (max, eco 제거) |
| **Version** | 2.0.0 |
| **Priority** | P0 (Critical) |
| **Created** | 2026-01-31 |

---

## 1. 목표

### 1.1 핵심 목표
- max, eco 모드 완전 제거
- handoff 기능만 유지 (세션 컨텍스트 저장/복원)
- Claude Plugin Marketplace 표준 준수
- SessionStart hook으로 자동 로드 기능 구현

### 1.2 제거 대상
- `skills/max/` 디렉토리 전체
- `skills/eco/` 디렉토리 전체
- `agents/` 디렉토리 전체 (handoff에 불필요)
- 관련 CLAUDE.md 내용

### 1.3 유지/개선 대상
- `skills/handoff/` - skill.md 유지
- `hooks/` - hooks.json + session-start.js 신규 구현
- `.claude-plugin/plugin.json` - 구조 수정

---

## 2. Claude Plugin Marketplace 표준 분석

### 2.1 필수 파일 구조
```
ddotz-plugin/
├── .claude-plugin/
│   ├── plugin.json         # 플러그인 메타데이터
│   └── marketplace.json    # 마켓플레이스 등록 정보
├── skills/
│   └── handoff/
│       └── skill.md        # Handoff skill 정의
├── hooks/
│   ├── hooks.json          # Hook 이벤트 정의 (필수!)
│   └── session-start.js    # SessionStart 스크립트
├── CLAUDE.md               # 플러그인 지침
└── README.md               # 사용자 문서
```

### 2.2 hooks.json 표준 형식 (bkit 참고)
```json
{
  "$schema": "https://json.schemastore.org/claude-code-hooks.json",
  "description": "DTZ Handoff Plugin",
  "hooks": {
    "SessionStart": [
      {
        "once": true,
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.js",
            "timeout": 5000
          }
        ]
      }
    ]
  }
}
```

### 2.3 plugin.json 표준 형식
```json
{
  "name": "dtz",
  "version": "2.0.0",
  "description": "Session handoff for seamless continuation",
  "skills": "./skills/",
  "hooks": "./hooks/"
}
```

---

## 3. 구현 계획

### Phase 1: 정리 (제거)
1. `skills/max/` 디렉토리 삭제
2. `skills/eco/` 디렉토리 삭제
3. `agents/` 디렉토리 삭제
4. `hooks/session-start.md` 삭제 (마크다운은 작동 안함)

### Phase 2: hooks 구현
1. `hooks/hooks.json` 생성 (표준 형식)
2. `hooks/session-start.js` 생성 (Node.js 스크립트)
   - `.dtz/handoffs/latest.md` 파일 존재 확인
   - 존재 시 파일 내용 파싱
   - 컨텍스트 정보 반환

### Phase 3: skill 정리
1. `skills/handoff/skill.md` 단순화
   - max/eco 모드 참조 제거
   - 핵심 기능만 유지

### Phase 4: 설정 파일 수정
1. `.claude-plugin/plugin.json` 업데이트
2. `.claude-plugin/marketplace.json` 업데이트
3. `CLAUDE.md` 단순화

### Phase 5: 테스트 및 배포
1. 로컬 테스트 (`--plugin-dir` 옵션)
2. Git commit/push
3. 마켓플레이스 업데이트

---

## 4. session-start.js 설계

### 4.1 기능 요구사항
```
1. .dtz/handoffs/latest.md 파일 존재 확인
2. 파일이 있으면:
   - Meta 섹션에서 Session ID, Created 추출
   - Context Summary 추출
   - Pending Tasks 추출
   - 요약 정보 출력
3. 파일이 없으면:
   - 아무것도 출력하지 않음 (정상 세션 시작)
```

### 4.2 출력 형식
```
📋 이전 세션 Handoff 발견

Session: {session-id}
생성: {created-date}

{context-summary}

📌 미완료 작업: {count}개
- {task-1}
- {task-2}

💡 `/dtz:handoff load`로 작업을 복원할 수 있습니다.
```

### 4.3 에러 처리
- 파일 없음: 무시 (정상)
- 파일 파싱 오류: 경고 메시지 출력
- 권한 오류: 경고 메시지 출력

---

## 5. QA 체크리스트

### 5.1 구현 전 검증
- [ ] omc hooks.json 형식 분석 완료
- [ ] bkit hooks.json 형식 분석 완료
- [ ] Node.js 스크립트 출력 형식 확인

### 5.2 구현 중 검증
- [ ] hooks.json JSON 유효성 검사
- [ ] session-start.js 문법 오류 검사
- [ ] plugin.json JSON 유효성 검사

### 5.3 구현 후 검증
- [ ] `--plugin-dir` 옵션으로 로드 테스트
- [ ] 새 세션 시작 시 hook 실행 확인
- [ ] handoff 파일 있을 때 출력 확인
- [ ] handoff 파일 없을 때 정상 시작 확인
- [ ] `/dtz:handoff` skill 작동 확인

---

## 6. Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| hooks.json 형식 오류 | 플러그인 로드 실패 | bkit 형식 그대로 참고 |
| Node.js 스크립트 오류 | hook 실행 실패 | 최소한의 코드, 에러 핸들링 |
| 파일 경로 오류 | handoff 찾기 실패 | 절대 경로 사용, process.cwd() |

---

## 7. 성공 기준

| Metric | Target |
|--------|--------|
| 플러그인 로드 | 오류 없이 로드 |
| SessionStart hook | 정상 실행 |
| Handoff 파일 감지 | 정확한 감지 |
| Skill 작동 | /dtz:handoff 정상 작동 |

---

## 8. 파일 변경 요약

### 삭제
- `skills/max/skill.md`
- `skills/eco/skill.md`
- `agents/*` (전체)
- `hooks/session-start.md`

### 생성
- `hooks/hooks.json`
- `hooks/session-start.js`

### 수정
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `skills/handoff/skill.md`
- `CLAUDE.md`
- `README.md`

---

## 9. 버전 관리

```
v1.0.1 → v2.0.0

Breaking Changes:
- max mode 제거
- eco mode 제거
- agents 제거
- hooks 구조 변경 (md → json + js)
```

---

*Plan Created: 2026-01-31*
*Plan Version: 1.0*
