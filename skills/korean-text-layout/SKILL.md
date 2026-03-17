---
name: korean-text-layout
version: 1.0.0
description: Use when building UI components that display Korean text — prevents character-level line breaks, parenthetical splitting, and text clipping in narrow containers. Triggers on wordBreak, keep-all, 한글 줄바꿈, overflow, clamp, letter-spacing issues.
model: haiku
allowed-tools: []
tags: [css, korean, layout, typography, responsive, mobile]
category: frontend
---

# Korean Text Layout

한글 UI 텍스트의 줄바꿈, 괄호 처리, 텍스트 잘림 방지를 위한 CSS 전략.

## Quick Reference

| 문제 | CSS 해결책 | 적용 대상 |
|------|-----------|----------|
| 한글 글자 단위 줄바꿈 | `wordBreak: "keep-all"` | 모든 한글 텍스트 블록 |
| 괄호/수치 쪼개짐 | `whiteSpace: "nowrap"` + ellipsis | select 값, 짧은 라벨 |
| 모바일 폰트 넘침 | `fontSize: "clamp(min, vw, max)"` | 제목, 부제목 |
| flex 자식 오버플로우 | `minWidth: 0` + `overflow: hidden` | flex 레이아웃 아이템 |
| 컨테이너 탈출 | `max-w-[85vw]` 등 너비 제한 | 드로어, 모달 |

## 핵심 원칙

### 1. 의미론적 줄바꿈: `word-break: keep-all`

한글은 기본 CSS에서 글자 단위로 끊긴다. `keep-all`을 적용하면 어절(띄어쓰기) 단위로만 줄바꿈된다.

```tsx
// BAD - "학습" → "학\n습"
<p style={{ fontSize: "0.8rem" }}>{koreanText}</p>

// GOOD - 어절 단위 줄바꿈
<p style={{ fontSize: "0.8rem", wordBreak: "keep-all" }}>{koreanText}</p>
```

**모든** 한글 텍스트 블록(paragraph, card, list item, label, select option)에 기본 적용한다.

### 2. 괄호/보조 정보 한 줄 유지: `white-space: nowrap`

"(과정 0.52 · 결과 0.28 · 책임 0.20)" 같은 괄호 내용이 두 줄로 쪼개지면 시각적 단위가 깨진다.

```tsx
<span style={{
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  flex: 1,
}}>
  {value}
</span>
```

### 3. 글자 자르지 말고 레이아웃으로 해결

텍스트가 컨테이너를 벗어나면 `overflow: hidden`으로 자르지 말고:

**a) 반응형 폰트 크기**
```tsx
fontSize: "clamp(1.4rem, 4vw, 2.6rem)"
```

**b) 자간 조절**
```tsx
letterSpacing: "0.06em"
```

**c) flex 오버플로우 방지**
```tsx
<div style={{ flex: 1, minWidth: 0 }}>
  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
</div>
```

**d) 컨테이너 너비 제한**
```tsx
className="w-[280px] max-w-[85vw]"
```

## 체크리스트

한글 UI 컴포넌트 작성 시 반드시 확인:

- [ ] 본문/설명 텍스트에 `wordBreak: "keep-all"` 적용했는가?
- [ ] 괄호가 포함된 짧은 텍스트가 한 줄로 유지되는가?
- [ ] 모바일(320px~)에서 텍스트가 잘리지 않는가?
- [ ] 고정 `fontSize` 대신 `clamp()`를 사용했는가? (반응형 필요 시)
- [ ] flex 레이아웃에서 `minWidth: 0`으로 오버플로우를 방지했는가?
