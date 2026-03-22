---
name: taste-ko
description: 한국형 Taste Skill 확장팩. 최신 Taste Skill 위에 적용하는 오버레이로, 한국어 타이포그래피·콘텐츠·컨버전 최적화, Standalone HTML 아키텍처, Iconify Solar 아이콘, 랜딩 페이지 포뮬러를 추가한다. Taste Skill과 함께 사용해야 한다.
metadata:
  filePattern: "*.html,*.htm,*.tsx,*.jsx"
  bashPattern: ""
---

# Taste-KO: 한국형 Taste Skill 확장팩

> **사용법:** 이 스킬은 `taste-skill`(또는 `taste-soft`, `taste-redesign`, `taste-output`)과 **함께** 활성화한다.
> 충돌 시 이 파일의 규칙이 원본 Taste를 **오버라이드**한다.
>
> **버전 추적:** 이 확장팩은 Taste Skill의 업스트림 업데이트와 독립적으로 관리된다.
> Taste가 업데이트되면 이 파일만 재적용하면 한국형 특화가 유지된다.

---

## 0. 추가 다이얼

원본 Taste의 3개 다이얼(DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY)에 더해:

* **LANDING_PURPOSE:** conversion (conversion | brand | portfolio | saas | ecommerce)

이 값은 섹션 구성, CTA 강도, 소셜 프루프 밀도에 영향을 준다. 사용자가 명시하지 않으면 `conversion`을 기본값으로 쓴다.

---

## 1. 아키텍처 오버라이드 — Standalone HTML

원본 Taste의 React/Next.js 기본값을 다음으로 **대체**한다:

### 출력 형식
* **단일 HTML 파일.** 브라우저에서 바로 열어 동작해야 한다. 빌드 도구, 번들러, 프레임워크 없음.
* React/Next.js 관련 규칙(RSC, `use client`, `useState`, Framer Motion 등)은 이 스킬 활성 시 **비활성화**된다.

### 스타일링
* Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
* `tailwind.config` 스크립트 블록으로 커스텀 테마 확장 (색상, 폰트, 간격).

### 애니메이션
* `MOTION_INTENSITY > 5`일 때: Motion One (`<script src="https://unpkg.com/motion@latest/dist/motion.js"></script>`)
* 그 외: 순수 CSS `@keyframes` + Tailwind `animate-` 유틸리티.
* Framer Motion 관련 규칙(useMotionValue, AnimatePresence 등)은 **비활성화** → 동등한 CSS/Motion One 패턴으로 대체.

### 스크롤 애니메이션
* `IntersectionObserver`로 뷰포트 진입 감지. `window.addEventListener('scroll')` **금지**.
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

### CDN 제한
* 외부 CDN 스크립트 최대 5개: Tailwind CDN + Pretendard 폰트 + Iconify + (선택) Motion One + (선택) 영문 디스플레이 폰트.

---

## 2. 아이콘 오버라이드 — Iconify Solar

원본 Taste의 `@phosphor-icons/react` / `@radix-ui/react-icons`를 **대체**한다:

* **Iconify Solar 아이콘셋 전용.**
* CDN: `<script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>`
* 사용법: `<iconify-icon icon="solar:arrow-right-linear"></iconify-icon>`
* 스타일 변형: `linear` (기본), `bold`, `outline`, `broken` — 프로젝트 내에서 하나로 통일.
* 장점: 일관된 스트로크 굵기, CDN 기반으로 별도 설치 불필요, 5000+ 아이콘.

---

## 3. 한국어 타이포그래피 오버라이드

### 폰트 스택
원본 Taste의 폰트 규칙에 **추가/대체**:

* **한국어 본문 필수 폰트:** `Pretendard` — **비협상 사항**.
  * CDN: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css">`
  * `font-family: 'Pretendard', 'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;`
* **영문 디스플레이 폰트:** 원본 Taste의 추천(Geist, Outfit, Cabinet Grotesk, Satoshi) 그대로 유지. 한국어와 페어링할 때 Pretendard가 본문, 영문 폰트가 헤드라인.
* **추가 금지 폰트:** `Noto Sans KR` (Pretendard가 상위 호환), `Malgun Gothic` (시스템 폰트 느낌).

### 한국어 전용 타이포그래피 규칙
원본 Taste의 Rule 1에 **추가**:

* **한국어 헤드라인:** `text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight font-bold`
  * **[중요]** 한국어는 `leading-none` **금지**. 한글은 라틴 문자보다 수직 여백이 더 필요하다. `leading-tight` ~ `leading-snug` 사용.
* **줄바꿈 제어:** 모든 한국어 텍스트 블록에 `word-break: keep-all` (Tailwind: `break-keep-all`) 필수. 한글 음절 중간에서 줄이 바뀌는 것을 방지.
* **고아 단어 방지:** 헤드라인에 `text-wrap: balance` 적용.
* **영문 디스플레이:** 영문 헤드라인은 원본 Taste대로 `tracking-tighter leading-none` 허용.

---

## 4. 한국어 콘텐츠 가이드라인

### 언어 기본값
* 모든 플레이스홀더 텍스트, 헤딩, 설명, CTA는 **자연스러운 한국어**로 작성. 번역투 금지.
* `<html lang="ko">` 필수.
* Lorem Ipsum, 영문 플레이스홀더 텍스트 **금지**.

### 존댓말 규칙
* **합니다/하세요체** 일관 사용. 반말과 존댓말을 절대 혼용하지 않는다.
* "지금 시작하세요" ✅ / "시작을 하세요 지금" ❌ (번역투)

### CTA 카피 패턴
* 직접적, 행동 지향적:
  * "무료로 시작하기"
  * "3분만에 만들어보기"
  * "지금 바로 체험하기"
  * "바로 만들어보기"
* 느낌표 남용 금지. 자신감 있게, 소리치지 않게.

### 한국어 AI 클리셰 금지 목록
원본 Taste의 영문 금지어에 **추가**:

| 금지 표현 | 대체 방향 |
|-----------|-----------|
| "혁신적인" | 구체적 기능 설명 |
| "획기적인" | 수치/결과 기반 표현 |
| "차세대" | 실제 기술적 차별점 |
| "원활한" | 구체적 사용자 경험 |
| "게임 체인저" | 비교 기반 설명 |
| "한 차원 높은" | 정량적 개선 수치 |
| "~의 세계로" | 직접적 가치 제안 |

### 한국형 리얼리스틱 데이터

원본 Taste의 "Jane Doe Effect" 규칙에 **추가** — 한국어 콘텐츠에서는 반드시 이 수준의 리얼리즘 적용:

**이름 (금지: 김철수, 이영희, 홍길동):**
> 하윤서, 박도현, 이서진, 김하늘, 정민준, 오예린, 최시우, 한지원, 윤채원, 강태민

**회사명 (금지: 넥서스, 스마트플로우, 테크솔루션):**
> 스텔라랩스, 베리파이, 루미너스, 플로우캔버스, 넥스트비전, 브릿지웍스, 모멘텀AI, 래디언트

**직함:**
> 프로덕트 디자이너, 스타트업 대표, 마케팅 리드, 프론트엔드 개발자, 브랜드 디렉터, CTO, 그로스 매니저

**지표 (금지: 50,000+, 99.9%, 5.0/5.0):**
> 47,200+, 4.87/5.0, 2.3초, 98.7%, 12,847개, 3,291팀

---

## 5. 한국 시장 UI/UX 특화

### 다크 모드 기본값
* 랜딩 페이지는 **다크 모드 기본**. 다크 배경이 더 프리미엄하게 느껴진다.
* `bg-zinc-950`, `bg-slate-950`, `#0a0a0a` 계열 사용.
* 콘텐츠가 라이트를 명확히 요구하는 경우에만 라이트 모드.

### 모바일 퍼스트
* **한국 웹 트래픽의 70%+ 가 모바일.** 모바일 레이아웃을 먼저 설계하고 데스크탑으로 확장.
* 모바일 CTA 탭 타겟: 최소 48px 높이 (`py-4` 이상).
* 모바일에서 수평 스크롤 절대 발생 금지.

### 컨버전 최적화 (LANDING_PURPOSE: conversion일 때)
원본 Taste의 Rule 5 "Interactive UI States"에 **추가**:

* **CTA 버튼:** `px-8 py-4 text-lg` 최소 크기. hover(`scale-[1.02]`), active(`scale-[0.98]`), focus 상태 필수.
* **소셜 프루프:** 자연스러운 수치 사용 (`47,200+`, `4.87/5.0`). 한국어 이름과 실제 느낌의 회사명.
* **신뢰 시그널:** 최소 1개 필수 — 클라이언트 로고, 추천 인용, 지표 바, 언론 보도.
* **긴급성 요소 (선택):** 미묘한 카운트다운, "현재 N명 보는 중", 잔여 수량 표시.

### 이미지 소스
* Unsplash URL **금지** (자주 깨짐).
* 풍경/제품: `https://picsum.photos/seed/{descriptive_name}/{width}/{height}`
* 아바타: `https://i.pravatar.cc/150?u={unique_name}`

---

## 6. 랜딩 페이지 포뮬러

### A. HTML 문서 설정
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <meta name="description" content="페이지 설명">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css">
  <script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Pretendard', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
</head>
```

### B. 필수 섹션 순서 (최소 7섹션)
1. **내비게이션** — 플로팅 글래스 필 nav 또는 미니멀 탑 바
2. **히어로** — 폴드 위 가장 임팩트 있는 섹션
3. **소셜 프루프** — 로고 클라우드 또는 지표 바 (즉각적 신뢰 구축)
4. **기능 소개** — 벤토 그리드 또는 지그재그 레이아웃으로 3~5개 핵심 기능
5. **추천/사례** — 실제 느낌의 한국어 추천사 (이름, 직함 포함)
6. **CTA** — 풀블리드 컨버전 섹션
7. **푸터** — 미니멀, 필수 링크만

### C. 섹션 라이브러리

**히어로 패턴:**
* **스플릿 히어로:** 60/40 텍스트-비주얼 분할. 왼쪽 텍스트, 오른쪽 제품 스크린샷.
* **풀블리드 미디어:** 전체 화면 이미지 + 어두운 그라데이션 오버레이 + 하단 CTA.
* **미니멀 스테이트먼트:** 초대형 타이포그래피(text-7xl+) + 극단적 여백 + 플로팅 CTA 필.
* **인터랙티브 히어로:** 타이프라이터 효과 — "AI로 __ 만들기"에서 단어 순환.

**기능 소개 패턴:**
* **벤토 그리드:** 비대칭 그리드 (2fr 1fr 1fr). 카드마다 아이콘 + 제목 + 짧은 설명.
* **지그재그:** 이미지-왼/텍스트-오 → 텍스트-왼/이미지-오 교차. 3열 균등 카드 **금지**.
* **비교 테이블:** "Before vs After" 또는 "기존 방식 vs 우리" 극적 시각 차이.

**소셜 프루프 패턴:**
* **로고 클라우드:** 자동 스크롤 마퀴. 그레이스케일 → 호버 시 컬러.
* **추천 메이슨리:** 다양한 카드 높이. 한국어 이름, 회사명, 사진 아바타.
* **지표 바:** 카운팅 애니메이션. "47,200+ 페이지 생성", "4.9/5.0 만족도".

**CTA 패턴:**
* **풀블리드 CTA:** 다크 배경 + 대형 텍스트 + 글로우 액센트 버튼 + 하단 신뢰 배지.
* **스티키 바텀 CTA:** 히어로 스크롤 후 나타나는 고정 하단 바.

**푸터:**
* **미니멀 푸터:** 로고, 핵심 링크, 소셜 아이콘, 저작권. 4열 링크 팜 금지.

### D. 디자인 철학
* **프리미엄 기본값:** 모든 픽셀이 의도적. 템플릿처럼 보이면 실패.
* **Korean-Native:** 한국인이 한국인을 위해 디자인한 느낌. 번역물이 아닌 원본.
* **컨버전 퍼널:** 모든 섹션이 CTA로 시선을 유도. 시각적 위계 = 컨버전 퍼널.

---

## 7. Redesign 오버라이드

`taste-redesign`과 함께 사용 시 추가되는 한국형 감사 항목:

### 한국어 콘텐츠 품질 감사
- [ ] 번역투 한국어 → 자연스러운 한국어로 재작성
- [ ] 존댓말 레벨 혼용 → 합니다/하세요체로 통일
- [ ] 한국어 AI 클리셰("혁신적인", "차세대" 등) → 구체적 언어로 교체
- [ ] "김철수", "이영희" → 리얼리스틱 한국어 이름으로 교체
- [ ] 둥근 지표(50,000+) → 유기적 수치(47,200+)로 교체
- [ ] 영문 플레이스홀더 → 한국어 실제 카피로 교체

### 한국어 타이포그래피 감사
- [ ] Inter, Noto Sans KR → Pretendard 교체
- [ ] 한국어 텍스트에 `word-break: keep-all` 적용 여부
- [ ] 한국어 헤드라인 `leading-tight`~`leading-snug` 확인 (`leading-none` 금지)
- [ ] `<html lang="ko">` 설정 여부

### 수정 우선순위 (원본 Taste 우선순위 오버라이드)
1. **Pretendard 폰트 교체** — 한국어 콘텐츠 즉각 프리미엄화
2. **색상 팔레트 정리** — AI 퍼플 제거, 채도 낮추기
3. **한국어 콘텐츠 재작성** — 자연스러운 카피, 실제 이름, 유기적 수치
4. **호버/액티브 상태** — 인터페이스에 생동감
5. **레이아웃 다양화** — 동일 섹션 반복 탈피
6. **섹션 애니메이션** — 스태거드 리빌, 스크롤 트리거
7. **간격·타이포그래피 폴리싱** — 프리미엄 마무리

---

## 8. Output 오버라이드

`taste-output`과 함께 사용 시 추가되는 한국형 완성도 기준:

### 완성된 한국어 랜딩 페이지 필수 요소
- `<!DOCTYPE html>` + `<html lang="ko">`
- `<head>`: meta 태그, Tailwind CDN, Pretendard 폰트, Iconify, tailwind.config
- 내비게이션 (플로팅 글래스 또는 미니멀 바)
- 히어로 섹션 (폴드 위)
- 소셜 프루프 요소 최소 1개
- 기능 소개 (3~5개 최소)
- 추천사 또는 사례 연구
- 주요 CTA 섹션
- 푸터
- 스크롤 애니메이션 JS (`IntersectionObserver`)
- `</html>` 닫기

### 완성도 품질 기준
- 모든 섹션에 실제 한국어 콘텐츠 (플레이스홀더 불가)
- 모든 섹션에 반응형 클래스 (`sm:`, `md:`, `lg:`)
- 모든 인터랙티브 요소에 호버/액티브 상태
- 모든 이미지에 `loading="lazy"`, 한국어 `alt`, 유효한 `src`
- 모든 아이콘에 `<iconify-icon icon="solar:..."></iconify-icon>`

---

## 9. 프리플라이트 체크 (한국형 추가)

원본 Taste의 프리플라이트에 **추가**:

- [ ] 단일 standalone HTML 파일로 브라우저에서 동작하는가?
- [ ] Pretendard가 로드되고 기본 폰트로 설정되었는가?
- [ ] 모든 아이콘이 Iconify Solar 셋을 사용하는가?
- [ ] 모든 보이는 텍스트가 자연스러운 한국어인가?
- [ ] 한국어 텍스트 블록에 `word-break: keep-all`이 있는가?
- [ ] 한국어 헤드라인이 `leading-tight`~`leading-snug`인가 (`leading-none` 아님)?
- [ ] `<html lang="ko">`가 설정되어 있는가?
- [ ] 모바일 CTA가 48px 이상 탭 타겟인가?
- [ ] 인접 섹션이 서로 다른 레이아웃 패턴을 사용하는가?
- [ ] 한국어 AI 클리셰가 없는가?
- [ ] 한국어 이름/회사명이 리얼리스틱한가?
- [ ] 페이지가 "한국 프리미엄 에이전시" 느낌인가?
