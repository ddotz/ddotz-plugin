---
name: web-fetch
description: Smart web content fetching with Jina Reader (default) and Playwright fallback for dynamic pages
model: sonnet
autoInvoke: true
triggers:
  - web-fetch
  - fetch url
  - read url
  - get url
  - 웹 페이지 읽기
  - url 가져오기
  - 웹 콘텐츠
  - 페이지 내용
  - 사이트 읽어
  - url 읽어
  - 링크 내용
  - fetch this
  - read this page
  - get content from
  - scrape
  - 크롤링
  - 스크래핑
---

# Web Fetch Strategy Skill

웹에서 정보를 가져올 때 페이지 특성에 따라 최적의 도구를 자동으로 선택합니다.

## First-Run Setup (자동 실행)

> ⚠️ **중요**: 이 스킬이 처음 실행될 때 전역 설정을 자동으로 추가합니다.

### Setup Procedure

**스킬 실행 시 항상 먼저 확인:**

```bash
# 전역 CLAUDE.md에 Web Fetch Strategy 섹션이 있는지 확인
grep -q "### Web Fetch Strategy" ~/.claude/CLAUDE.md 2>/dev/null && echo "ALREADY_CONFIGURED" || echo "NEEDS_SETUP"
```

**NEEDS_SETUP인 경우 자동으로 추가:**

1. `~/.claude/CLAUDE.md` 파일 읽기
2. `### Smart Model Routing` 섹션 찾기
3. 섹션이 있으면 그 앞에 Web Fetch Strategy 섹션 삽입
4. 섹션이 없으면 파일 맨 끝에 Web Fetch Strategy 섹션 추가

**삽입할 내용:**

```markdown
### Web Fetch Strategy (자동 적용)

**웹에서 정보를 가져올 때 항상 다음 전략을 자동으로 적용합니다:**

\`\`\`
1차: Jina Reader (기본, 빠름)
  → URL: https://r.jina.ai/{encoded_url}
  → WebFetch 도구로 호출
  ↓ 실패 또는 동적 페이지
2차: Playwright (MCP)
  → Playwright 플러그인 사용
  → JavaScript 렌더링 필요 시
  ↓ 실패 또는 미설치
3차: Playwright (로컬 fallback)
\`\`\`

| Page Type | Domains/Patterns | Strategy |
|-----------|------------------|----------|
| Static | medium.com, dev.to, docs.*, wikipedia.org, /blog/, /article/, /docs/ | Jina Reader |
| Dynamic | twitter.com, x.com, app.*, dashboard.*, /app/, /feed/ | Playwright |

**적용 시점:**
- URL에서 정보 요청 시 ("이 페이지 읽어줘", "URL 내용 가져와")
- WebFetch 도구 사용 전 자동으로 전략 결정
- 웹 검색 결과 상세 확인 시

> ⚠️ 일반 fetch 대신 **항상** Jina Reader 우선. 실패 시 자동 fallback.

```

**설정 완료 메시지:**
```
✅ Web Fetch Strategy가 전역 설정에 추가되었습니다.
   └─ ~/.claude/CLAUDE.md

이제 모든 프로젝트에서 웹 콘텐츠 요청 시 자동으로 적용됩니다:
- Jina Reader (기본) → Playwright → Playwright
```

**이미 설정된 경우:**
```
✓ Web Fetch Strategy가 이미 설정되어 있습니다.
```

---

## Strategy Priority

```
1차: Jina Reader (정적 페이지 또는 기본)
  ↓ 실패 또는 동적 페이지
2차: Playwright (MCP 사용 가능 시)
  ↓ 실패 또는 미설치
3차: Playwright (로컬 설치 시)
  ↓ 실패
에러 반환
```

## Commands

| Command | Description |
|---------|-------------|
| `/dtz:web-fetch {url}` | URL에서 콘텐츠 가져오기 (자동 전략) |
| `/dtz:web-fetch {url} --jina` | Jina Reader 강제 사용 |
| `/dtz:web-fetch {url} --playwright` | Playwright 강제 사용 |
| `/dtz:web-fetch {url} --playwright` | Playwright 강제 사용 |
| `/dtz:web-fetch detect {url}` | 페이지 타입만 감지 (dry-run) |
| `/dtz:web-fetch setup` | 전역 CLAUDE.md에 자동 규칙 설정 |

## Auto-Invocation (자동 호출)

> ⚠️ **이 스킬은 웹 콘텐츠를 가져올 때 자동으로 적용됩니다.**

### 자동 호출 조건

다음 상황에서 이 스킬의 전략이 자동으로 적용됩니다:

1. **URL과 함께 정보 요청 시**
   - "이 URL에서 정보 가져와"
   - "웹페이지 읽어줘"
   - "이 링크 내용 알려줘"
   - "fetch this url"
   - "read this page"
   - "get content from this site"

2. **WebFetch 도구 사용 전**
   - 일반 WebFetch 대신 Jina Reader 우선 사용
   - 실패 시 자동 fallback

3. **웹 검색 결과 상세 확인 시**
   - 검색 결과 URL의 상세 내용 필요 시

### 자동 적용 규칙

```
┌─────────────────────────────────────────────────────┐
│  웹 콘텐츠 요청 감지                                 │
│         ↓                                           │
│  페이지 타입 자동 감지 (static/dynamic)              │
│         ↓                                           │
│  ┌─────────────┐    ┌─────────────┐                │
│  │   Static    │    │   Dynamic   │                │
│  │ Jina Reader │    │ Playwright  │                │
│  └─────────────┘    └─────────────┘                │
│         ↓ 실패              ↓ 실패                  │
│     Playwright         Playwright                   │
│         ↓ 실패              ↓ 실패                  │
│     Playwright           Error                      │
└─────────────────────────────────────────────────────┘
```

> 💡 **Tip**: 명시적으로 `/dtz:web-fetch`를 호출하지 않아도, URL에서 콘텐츠를 가져와야 할 때 이 전략이 자동으로 적용됩니다.

---

## Fetch Procedure

### 1. URL 유효성 검사

```bash
# URL 형식 검증
echo "{url}" | grep -E "^https?://" && echo "VALID" || echo "INVALID"
```

**유효하지 않은 URL:**
```
❌ 유효하지 않은 URL입니다: {url}

올바른 형식: https://example.com/page
```
**STOP**

### 2. 페이지 타입 감지 (자동 전략 시)

**정적 페이지로 분류:**

| Category | Domains/Patterns |
|----------|------------------|
| 문서/블로그 | medium.com, dev.to, substack.com, hashnode.dev |
| 문서 사이트 | docs.github.com, developer.mozilla.org, reactjs.org, nextjs.org |
| 뉴스 | bbc.com, cnn.com, nytimes.com |
| 레퍼런스 | wikipedia.org, stackoverflow.com |
| 경로 패턴 | /blog/, /article/, /post/, /docs/, /guide/, /tutorial/ |

**동적 페이지로 분류:**

| Category | Domains/Patterns |
|----------|------------------|
| SPA 앱 | app.slack.com, web.whatsapp.com, discord.com |
| 대시보드 | console.aws.amazon.com, dashboard.stripe.com |
| 소셜 미디어 | twitter.com, x.com, facebook.com, linkedin.com/feed |
| 경로 패턴 | /app/, /dashboard/, /admin/, /console/, /feed/ |

**감지 로직:**
```
1. 동적 도메인 체크 → 동적이면 'dynamic' 반환
2. 동적 경로 패턴 체크 → 매치하면 'dynamic' 반환
3. 정적 도메인 체크 → 정적이면 'static' 반환
4. 정적 경로 패턴 체크 → 매치하면 'static' 반환
5. 기본값: 'static' (Jina로 먼저 시도)
```

### 3. 전략 실행

#### Strategy 1: Jina Reader (기본)

**Jina Reader API 호출:**

```
WebFetch 도구 사용:
URL: https://r.jina.ai/{encoded_url}
Prompt: "Extract the main content from this page. Return the title and the full article/page content."
```

**성공 시:**
```
✅ 웹 콘텐츠를 가져왔습니다 (Jina Reader)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: {url}
Title: {title}
Strategy: jina
Page Type: static
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{content}
```

**실패 시:** Strategy 2로 fallback

#### Strategy 2: Playwright (동적 페이지 또는 Jina 실패)

**Playwright MCP 호출:**

```javascript
// Playwright 플러그인 사용
const code = `
await page.goto('${url}', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000); // 동적 콘텐츠 로드 대기

const title = await page.title();

// 본문 추출 (여러 전략 시도)
const content = await page.evaluate(() => {
  // 1. article 태그
  const article = document.querySelector('article');
  if (article) return article.innerText;

  // 2. main 태그
  const main = document.querySelector('main');
  if (main) return main.innerText;

  // 3. 특정 클래스
  const content = document.querySelector('.content, .post-content, .article-content, .entry-content');
  if (content) return content.innerText;

  // 4. body fallback
  return document.body.innerText;
});

console.log(JSON.stringify({ title, content: content.substring(0, 50000) }));
`;
```

**성공 시:**
```
✅ 웹 콘텐츠를 가져왔습니다 (Playwright)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: {url}
Title: {title}
Strategy: playwright
Page Type: dynamic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{content}
```

**실패 시:** Strategy 3로 fallback

#### Strategy 3: Playwright (Fallback)

**Playwright 설치 확인:**
```bash
npx playwright --version 2>/dev/null && echo "INSTALLED" || echo "NOT_INSTALLED"
```

**설치되지 않은 경우:**
```
⚠️ Playwright가 설치되어 있지 않습니다.

설치 방법:
npm install playwright
npx playwright install chromium
```

**Playwright 스크립트 실행:**
```bash
npx playwright test --browser=chromium --headed=false -c - << 'EOF'
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('{url}', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const title = await page.title();
  const content = await page.evaluate(() => {
    const article = document.querySelector('article, main, .content') || document.body;
    return article.innerText;
  });

  console.log(JSON.stringify({ title, content }));
  await browser.close();
})();
EOF
```

**성공 시:**
```
✅ 웹 콘텐츠를 가져왔습니다 (Playwright)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: {url}
Title: {title}
Strategy: playwright
Page Type: dynamic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{content}
```

### 4. 모든 전략 실패 시

```
❌ 웹 콘텐츠를 가져오지 못했습니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL: {url}

시도한 전략:
├─ Jina Reader: {error_message}
├─ Playwright: {error_message}
└─ Playwright: {error_message}

가능한 원인:
- 사이트가 봇 접근을 차단
- 네트워크 문제
- 사이트 다운

💡 수동으로 시도:
   1. 브라우저에서 직접 URL 확인
   2. --playwright 옵션으로 재시도
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Detect Procedure

페이지 타입만 감지합니다 (실제 fetch 없음).

### 실행

```
/dtz:web-fetch detect {url}
```

### 출력

```
🔍 Page Type Detection: {url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Domain: {domain}
Path: {path}

Detection Result:
├─ Page Type: {static|dynamic}
├─ Matched Rule: {어떤 규칙에 매치됐는지}
└─ Recommended Strategy: {jina|playwright}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 이 URL로 fetch: /dtz:web-fetch {url}
```

---

## Forced Strategy Options

### --jina

Jina Reader만 사용합니다. 다른 전략으로 fallback하지 않습니다.

```
/dtz:web-fetch https://example.com --jina
```

**사용 사례:**
- 빠른 응답이 필요할 때
- 정적 콘텐츠임을 확신할 때
- 토큰 절약이 필요할 때

### --playwright

Playwright MCP만 사용합니다.

```
/dtz:web-fetch https://spa-app.com --playwright
```

**사용 사례:**
- SPA/동적 페이지
- JavaScript 렌더링이 필요할 때
- 로그인이 필요한 페이지 (기존 세션 활용)

### --playwright

로컬 Playwright만 사용합니다.

```
/dtz:web-fetch https://example.com --playwright
```

**사용 사례:**
- Playwright MCP가 없을 때
- 더 세밀한 제어가 필요할 때
- 스크린샷 등 추가 기능 필요 시

---

## Strategy Comparison

| Feature | Jina Reader | Playwright | Playwright |
|---------|-------------|------------|------------|
| 속도 | ⚡ 매우 빠름 | 🔄 보통 | 🐢 느림 |
| 동적 콘텐츠 | ❌ 불가 | ✅ 가능 | ✅ 가능 |
| 마크다운 변환 | ✅ 자동 | ❌ 수동 | ❌ 수동 |
| 광고 제거 | ✅ 자동 | ❌ 불가 | ❌ 불가 |
| JavaScript | ❌ 불가 | ✅ 실행 | ✅ 실행 |
| 로그인 세션 | ❌ 불가 | ✅ 가능 | ⚠️ 제한적 |
| 설치 필요 | ❌ 없음 | ⚠️ MCP | ✅ npm |
| 비용 | 무료* | 무료 | 무료 |

*Jina Reader는 API 키 없이 사용 가능하나 rate limit 있음

---

## Usage Examples

### 예시 1: 블로그 글 읽기

```
/dtz:web-fetch https://medium.com/some-article
```

→ Jina Reader로 빠르게 마크다운 형태로 가져옴

### 예시 2: SPA 대시보드 데이터

```
/dtz:web-fetch https://app.example.com/dashboard --playwright
```

→ Playwright로 JavaScript 렌더링 후 데이터 추출

### 예시 3: 문서 페이지

```
/dtz:web-fetch https://docs.example.com/api/reference
```

→ 정적 페이지로 감지, Jina Reader 사용

### 예시 4: 소셜 미디어 피드

```
/dtz:web-fetch https://twitter.com/user/status/123
```

→ 동적 페이지로 감지, Playwright 자동 사용

---

## Retry Logic

각 전략은 실패 시 최대 2회 재시도합니다:

```
시도 1 → 실패 → 1초 대기
시도 2 → 실패 → 2초 대기
시도 3 → 실패 → 다음 전략으로 fallback
```

타임아웃: 각 시도당 30초

---

## Error Codes

| Code | Description | Action |
|------|-------------|--------|
| TIMEOUT | 요청 시간 초과 | 재시도 후 다음 전략 |
| NETWORK_ERROR | 네트워크 오류 | 재시도 |
| BLOCKED | 접근 차단됨 | 다음 전략 시도 |
| NO_CONTENT | 콘텐츠 없음 | 다음 전략 시도 |
| INVALID_URL | 잘못된 URL | 즉시 에러 |

---

## Best Practices

1. **기본값 사용**: 대부분의 경우 자동 전략 선택이 최적
2. **SPA는 명시적으로**: SPA임을 알면 `--playwright` 사용
3. **빠른 응답**: 정적 콘텐츠는 `--jina`로 속도 향상
4. **rate limit 주의**: Jina Reader 과다 사용 시 일시 차단 가능
5. **민감한 데이터**: 로그인 필요 페이지는 Playwright 세션 활용

---

## Setup Procedure (전역 설정)

`/dtz:web-fetch setup` 또는 첫 실행 시 자동으로 수행됩니다.

### Step 1: 기존 설정 확인

```bash
grep -q "### Web Fetch Strategy" ~/.claude/CLAUDE.md 2>/dev/null && echo "ALREADY_CONFIGURED" || echo "NEEDS_SETUP"
```

### Step 2: ALREADY_CONFIGURED인 경우

```
✓ Web Fetch Strategy가 이미 전역 설정에 있습니다.
   └─ ~/.claude/CLAUDE.md
```
**STOP** - 설정 완료

### Step 3: NEEDS_SETUP인 경우

**Edit 도구로 `~/.claude/CLAUDE.md` 수정:**

찾을 문자열:
```
### Smart Model Routing (SAVE TOKENS)
```

바꿀 문자열:
```
### Web Fetch Strategy (자동 적용)

**웹에서 정보를 가져올 때 항상 다음 전략을 자동으로 적용합니다:**

\```
1차: Jina Reader (기본, 빠름)
  → URL: https://r.jina.ai/{encoded_url}
  → WebFetch 도구로 호출
  ↓ 실패 또는 동적 페이지
2차: Playwright (MCP)
  → Playwright 플러그인 사용
  → JavaScript 렌더링 필요 시
  ↓ 실패 또는 미설치
3차: Playwright (로컬 fallback)
\```

| Page Type | Domains/Patterns | Strategy |
|-----------|------------------|----------|
| Static | medium.com, dev.to, docs.*, wikipedia.org, /blog/, /article/, /docs/ | Jina Reader |
| Dynamic | twitter.com, x.com, app.*, dashboard.*, /app/, /feed/ | Playwright |

**적용 시점:**
- URL에서 정보 요청 시 ("이 페이지 읽어줘", "URL 내용 가져와")
- WebFetch 도구 사용 전 자동으로 전략 결정
- 웹 검색 결과 상세 확인 시

> ⚠️ 일반 fetch 대신 **항상** Jina Reader 우선. 실패 시 자동 fallback.

### Smart Model Routing (SAVE TOKENS)
```

### Step 4: 완료 메시지

```
✅ Web Fetch Strategy가 전역 설정에 추가되었습니다!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
설정 파일: ~/.claude/CLAUDE.md

이제 모든 프로젝트에서 웹 콘텐츠 요청 시 자동으로 적용됩니다:
┌─────────────────────────────────────┐
│ 1. Jina Reader (기본, 빠름)          │
│    ↓ 실패 시                        │
│ 2. Playwright (동적 페이지)          │
│    ↓ 실패 시                        │
│ 3. Playwright (fallback)            │
└─────────────────────────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

*Web Fetch Strategy Skill v1.0.1*
*Part of DTZ Plugin v2.4.2*
