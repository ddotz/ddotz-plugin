# DTZ Plugin Instructions

DTZ (ddotz) 플러그인은 세션 관리 및 Claude Code 환경 설정을 위한 플러그인입니다.

## Session Start Protocol

매 세션 시작 시 자동으로 `.dtz/handoffs/latest.md` 파일을 확인합니다.
파일이 있으면 이전 세션 정보를 요약하여 표시합니다.

> 💡 자동 로드를 끄려면: `/dtz:handoff autoload off`

## Available Skills

### /dtz:handoff
세션 컨텍스트 저장 및 복원.

| Command | Description |
|---------|-------------|
| `/dtz:handoff` | 현재 상태 저장 |
| `/dtz:handoff load` | 최신 handoff 로드 |
| `/dtz:handoff list` | 목록 보기 |
| `/dtz:handoff clear` | 기록 정리 |
| `/dtz:handoff autoload` | autoload 상태 확인 |
| `/dtz:handoff autoload on` | 자동 로드 활성화 |
| `/dtz:handoff autoload off` | 자동 로드 비활성화 |

### /dtz:hud
Claude Code statusline 설정 (ddotz-hud).

| Command | Description |
|---------|-------------|
| `/dtz:hud` | HUD 설치 및 설정 |
| `/dtz:hud setup` | HUD 설치 및 설정 |
| `/dtz:hud update` | 최신 버전으로 업데이트 |
| `/dtz:hud status` | 현재 설정 상태 확인 |
| `/dtz:hud reset` | HUD 설정 제거 |

### /dtz:fsd (Magic Word: `fsd`)
**bkit PDCA 방법론** 기반 자동화 개발 워크플로우. Plan → Design → Do → Check → Iterate → Report 전체 사이클을 자동으로 진행합니다.

| Command | Description |
|---------|-------------|
| `fsd: {설명}` | FSD 워크플로우 시작 (기존 문서 자동 감지) |
| `fsd status` | 현재 진행 상태 확인 |
| `fsd resume` | 중단된 워크플로우 재개 |
| `fsd cancel` | 진행 중인 워크플로우 취소 |
| `fsd config` | FSD 설정 확인/변경 |
| `fsd doctor` | 연동 상태 진단 및 검증 |
| `fsd detect {feature}` | 특정 feature 문서 감지 테스트 |

> ⚠️ **중요**: FSD는 **bkit의 PDCA 스킬**(`/pdca`)을 호출합니다. OMC 에이전트를 직접 사용하지 않습니다.
> 💡 bkit 플러그인이 필요합니다. `fsd doctor`로 연동 상태를 확인하세요.
> 💡 **Auto-detect**: 기존 PDCA 문서가 있으면 자동 감지하여 다음 단계부터 진행합니다.

### /dtz:web-fetch
스마트 웹 콘텐츠 fetch. Jina Reader를 기본으로 사용하고, 동적 페이지는 Playwriter/Playwright로 자동 fallback합니다.

| Command | Description |
|---------|-------------|
| `/dtz:web-fetch {url}` | URL에서 콘텐츠 가져오기 (자동 전략) |
| `/dtz:web-fetch {url} --jina` | Jina Reader 강제 사용 |
| `/dtz:web-fetch {url} --playwriter` | Playwriter 강제 사용 |
| `/dtz:web-fetch {url} --playwright` | Playwright 강제 사용 |
| `/dtz:web-fetch detect {url}` | 페이지 타입 감지 (dry-run) |

**전략 우선순위:**
```
1. Jina Reader (정적 페이지, 빠름, 마크다운 변환)
   ↓ 실패 또는 동적 페이지
2. Playwriter (MCP, JavaScript 렌더링)
   ↓ 실패 또는 미설치
3. Playwright (로컬 브라우저)
```

> 💡 정적 페이지(블로그, 문서)는 Jina로 빠르게, 동적 페이지(SPA, 대시보드)는 Playwriter로 자동 처리됩니다.

## Auto Rules (자동 적용 규칙)

### 웹 콘텐츠 가져오기 규칙

**웹에서 정보를 가져와야 할 때 항상 다음 전략을 자동으로 적용합니다:**

1. **Jina Reader 우선 사용** (기본)
   - URL: `https://r.jina.ai/{encoded_url}`
   - WebFetch 도구로 호출
   - 정적 페이지에 최적 (블로그, 문서, 뉴스, 위키)

2. **동적 페이지 감지 시 Playwriter 사용**
   - SPA, 대시보드, 소셜 미디어 피드
   - JavaScript 렌더링이 필요한 경우
   - `mcp__playwriter__execute` 도구 사용

3. **Playwriter 실패 시 Playwright fallback**
   - 로컬 Playwright 설치 확인 후 사용

**자동 감지 도메인:**
| Type | Domains |
|------|---------|
| Static | medium.com, dev.to, docs.*, wikipedia.org, stackoverflow.com |
| Dynamic | twitter.com, x.com, app.*, dashboard.*, console.* |

**적용 시점:**
- 사용자가 URL에서 정보를 요청할 때
- "이 페이지 읽어줘", "URL 내용 가져와" 등의 요청
- WebFetch 도구 사용 전 자동으로 전략 결정

> ⚠️ **중요**: 일반 `fetch` 대신 항상 위 전략을 따릅니다. Jina Reader가 실패하면 자동으로 Playwriter → Playwright 순으로 fallback합니다.

## Best Practices

1. **긴 작업 전**: `/dtz:handoff`로 현재 상태 저장
2. **작업 중단 시**: `/dtz:handoff`로 진행 상황 저장
3. **새 세션 시작**: 자동 감지된 handoff 확인
4. **HUD 설정**: `/dtz:hud`로 향상된 statusline 설정

---
*DTZ Plugin v2.3.1*
