# DTZ Plugin Instructions

DTZ (ddotz) 플러그인은 모델 라우팅과 병렬 실행을 위한 경량 플러그인입니다.

## Session Start Protocol

**매 세션 시작 시 반드시 다음을 수행하세요:**

### 1. Config 및 Handoff 파일 확인

```bash
# 프로젝트 루트에서 확인
.dtz/config.json      # 설정 파일 (선택)
.dtz/handoffs/latest.md  # 최신 handoff
```

Config 파일이 있으면 `handoff.autoLoad` 값 확인. `false`면 자동 로드 건너뜀.

### 2. 파일이 존재하면 Auto-Load 실행

파일이 존재할 경우:

1. **파일 읽기**
   - `Read` 도구로 `.dtz/handoffs/latest.md` 내용 확인

2. **사용자에게 안내**
   ```
   📋 이전 세션 Handoff 발견

   Session: {Meta에서 Session ID 추출}
   생성: {Meta에서 Created 추출}

   {Context Summary 섹션 내용}

   📌 미완료 작업: {Pending Tasks 개수}개

   이어서 작업하시겠습니까?
   ```

3. **AskUserQuestion으로 확인**
   - "예, 이어서 작업" 선택 시: Load Procedure 실행
   - "아니오, 새로 시작" 선택 시: 일반 세션 시작

### 3. Load Procedure

사용자가 이어서 작업을 선택하면:

1. **TODO 복원**
   - `Pending Tasks` 섹션의 각 항목을 `TaskCreate`로 생성

2. **컨텍스트 요약 출력**
   ```
   ✅ Handoff 로드 완료

   📁 Important Files:
   {Important Files 섹션 내용}

   🚀 Next Steps:
   {Next Steps 섹션 내용}

   이어서 작업을 시작하세요!
   ```

### 4. 파일이 없으면

- 안내 없이 일반 세션 시작
- 사용자가 `/dtz:handoff` 관련 명령 시에만 handoff 기능 안내

---

## Available Skills

### /dtz:handoff
세션 컨텍스트 저장 및 복원. 자세한 사용법은 `skills/handoff/skill.md` 참조.

| Command | Description |
|---------|-------------|
| `/dtz:handoff` | 현재 상태 저장 |
| `/dtz:handoff load` | 최신 handoff 로드 |
| `/dtz:handoff list` | 목록 보기 |

### /dtz:max
최대 성능 병렬 실행 모드. Sonnet/Opus 에이전트 활용.

### /dtz:eco
토큰 효율적 실행 모드. Haiku/Sonnet 에이전트 활용.

---

## Agent Tiers

DTZ 플러그인의 에이전트 티어:

| Tier | Model | Agents |
|------|-------|--------|
| LOW | Haiku | architect-low, executor-low, designer-low, explore |
| MEDIUM | Sonnet | architect-medium, executor, designer, explore-medium |
| HIGH | Opus | architect, executor-high, explore-high, designer-high |

---

## Handoff Integration

- 세션 종료 전 중요한 작업이 있으면 `/dtz:handoff` 저장 권장
- handoff는 max/eco 모드와 독립적으로 동작 (모드 상태는 기록됨)
- 저장된 handoff는 `.dtz/handoffs/` 디렉토리에 보관
- `maxHistory` 설정에 따라 오래된 handoff 자동 정리

---

## Configuration

`.dtz/config.json` 파일로 동작 커스터마이징:

```json
{
  "handoff": {
    "maxHistory": 10,
    "autoLoad": true
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `maxHistory` | 10 | 보관할 최대 handoff 수 |
| `autoLoad` | true | 세션 시작 시 자동 로드 |

---

## Best Practices

1. **긴 작업 전**: `/dtz:handoff` 로 현재 상태 저장
2. **작업 중단 시**: `/dtz:handoff` 로 진행 상황 저장
3. **새 세션 시작**: 자동 감지된 handoff 확인 후 이어서 작업

---

*DTZ Plugin v1.0.0*
