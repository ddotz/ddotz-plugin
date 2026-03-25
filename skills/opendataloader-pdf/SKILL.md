---
name: opendataloader-pdf
description: |
  PDF 파싱 및 AI-ready 데이터 추출 도구. hybrid 모드로 높은 정확도(0.90)의 테이블/OCR/수식 추출 지원.
  PDF를 JSON, Markdown, HTML, text로 변환. 한국어 OCR 포함 80개+ 언어 지원.
  Use when asked to "parse PDF", "extract PDF", "PDF to JSON", "PDF to markdown",
  "PDF 변환", "PDF 추출", "PDF 파싱", or working with PDF data extraction.
allowed-tools:
  - Bash
  - Read
  - Write
metadata:
  filePattern:
    - "*.pdf"
  bashPattern:
    - "opendataloader-pdf"
  priority: 50
---

# OpenDataLoader PDF — Hybrid Mode Skill

PDF에서 구조화된 데이터를 추출하는 도구. 시스템에 설치 완료됨.

## 환경 정보

- **패키지**: `opendataloader-pdf[hybrid]` 2.0.2
- **Java**: OpenJDK 21 (`/opt/homebrew/opt/openjdk@21`)
- **Python**: 시스템 Python 3.14 (--break-system-packages로 설치됨)
- **CLI**: `opendataloader-pdf`, `opendataloader-pdf-hybrid`

## 실행 절차 (항상 이 순서를 따른다)

### Step 1: hybrid 백엔드 서버 자동 시작

PDF 추출 전에 **반드시** hybrid 서버가 실행 중인지 확인하고, 없으면 자동으로 띄운다.

```bash
# 서버가 이미 실행 중인지 확인
curl -s -o /dev/null -w "%{http_code}" http://localhost:5002/health 2>/dev/null || echo "DOWN"
```

- 응답이 `200`이면 → 서버 실행 중. Step 2로 진행.
- `DOWN`이거나 다른 응답이면 → 서버를 백그라운드로 시작:

```bash
nohup opendataloader-pdf-hybrid --port 5002 > /tmp/opendataloader-hybrid.log 2>&1 &
echo $! > /tmp/opendataloader-hybrid.pid
```

서버 시작 후 ready 상태까지 대기:

```bash
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5002/health 2>/dev/null | grep -q "200"; then
    echo "Hybrid server ready"
    break
  fi
  sleep 2
done
```

> 첫 실행 시 AI 모델 다운로드로 1-2분 소요될 수 있다. 로그 확인: `tail -f /tmp/opendataloader-hybrid.log`

### Step 2: PDF 추출 (hybrid 모드)

서버가 준비되면 hybrid 모드로 추출한다. 출력 디렉토리는 `/tmp/opendataloader-output/`을 기본으로 사용.

```bash
opendataloader-pdf --hybrid docling-fast INPUT_FILE -o /tmp/opendataloader-output/ -f json,markdown
```

한국어 OCR이 필요한 스캔 문서의 경우, 서버를 OCR 모드로 재시작:

```bash
# 기존 서버 종료
kill $(cat /tmp/opendataloader-hybrid.pid 2>/dev/null) 2>/dev/null
# OCR 모드로 재시작
nohup opendataloader-pdf-hybrid --port 5002 --force-ocr --ocr-lang "ko,en" > /tmp/opendataloader-hybrid.log 2>&1 &
echo $! > /tmp/opendataloader-hybrid.pid
```

### Step 3: 이미지/차트 위치 맵 추출

추출된 JSON에서 이미지/차트 요소의 **위치(페이지, 바운딩 박스)와 주변 컨텍스트**를 맵으로 저장한다.

```bash
python3 -c "
import json, glob

for f in glob.glob('/tmp/opendataloader-output/*.json'):
    data = json.load(open(f))
    visuals = []
    def find_visuals(node, parent_text=''):
        if isinstance(node, dict):
            if node.get('type') in ('Image', 'Figure', 'Chart'):
                visuals.append({
                    'type': node.get('type'),
                    'page': node.get('page'),
                    'bbox': {k: node.get(k) for k in ('left','bottom','right','top') if k in node},
                    'context': parent_text[:200]
                })
            text = node.get('text', parent_text)
            for v in node.values():
                find_visuals(v, text)
        elif isinstance(node, list):
            for item in node:
                find_visuals(item, parent_text)
    find_visuals(data)

    if visuals:
        # 위치 맵을 파일로 저장
        out = f.replace('.json', '.visuals.json')
        with open(out, 'w') as vf:
            json.dump(visuals, vf, ensure_ascii=False, indent=2)
        print(f'시각 요소 {len(visuals)}개 발견 → {out}')
        for v in visuals:
            print(f'  p.{v[\"page\"]} [{v[\"type\"]}] bbox={v[\"bbox\"]} context: {v[\"context\"][:80]}...')
    else:
        print('이미지/차트 없음 → OpenDataLoader 추출본만으로 충분')
"
```

### Step 4: 복합 분석 (OpenDataLoader + Claude Read 결합)

**전략: 전체는 OpenDataLoader, 시각 요소만 Read로 보완**

1. **텍스트/테이블**: Step 2의 Markdown/JSON을 Read로 읽는다. 이것이 분석의 기본 데이터.
2. **시각 요소 확인**: Step 3에서 visuals.json이 생성된 경우에만, 해당 페이지를 Claude Read로 읽는다:

```
Read(file_path="INPUT_FILE.pdf", pages="3,7")
```

3. **결합**: 시각 요소의 바운딩 박스 위치를 기준으로, OpenDataLoader가 추출한 주변 텍스트와 Read로 확인한 시각 정보를 매칭한다.

예시:
```
[OpenDataLoader] p.3: "그림 2. 2024년 매출 추이" (텍스트)
[OpenDataLoader] p.3: bbox=(100,200,500,450) → Image 타입 (내용 해석 불가)
[Claude Read]    p.3: 막대 차트, 1월~12월 매출 상승 추세, 6월 피크
→ 결합: "그림 2. 2024년 매출 추이 — 막대 차트로 1월~12월 상승 추세, 6월 피크"
```

**핵심**: OpenDataLoader가 "여기에 이미지가 있다"는 위치와 캡션을 알려주고, Claude Read가 "이미지 안에 뭐가 있는지"를 해석한다. 두 정보를 바운딩 박스 기준으로 결합하면 완전한 문서 이해가 가능하다.

### Step 5: 결과 전달

```bash
ls -la /tmp/opendataloader-output/
```

분석 결과를 사용자에게 전달할 때:
- 시각 요소가 없으면 → OpenDataLoader Markdown만 사용 (토큰 최소)
- 시각 요소가 있으면 → Markdown + 시각 해석 결합본 전달
- visuals.json의 bbox/context로 "p.3 상단의 차트는 ~" 형태로 위치 기반 설명

## 로컬 모드 (fallback)

hybrid 서버가 시작되지 않거나 실패하면 로컬 모드로 fallback:

```bash
opendataloader-pdf INPUT_FILE -o /tmp/opendataloader-output/ -f json,markdown --hybrid-fallback
```

## Python API

```python
import opendataloader_pdf

opendataloader_pdf.convert(
    input_path="document.pdf",
    output_dir="output/",
    format="json,markdown",
    pages="1,3,5-7",
    table_method="cluster",      # AI 테이블 감지
    reading_order="xycut",       # 다단 레이아웃 읽기 순서
    hybrid="docling-fast",       # hybrid 모드 활성화
    sanitize=True,               # PII 마스킹 (선택)
)
```

## 주요 옵션

| 옵션 | 값 | 설명 |
|------|-----|------|
| `-f, --format` | `json,markdown,html,pdf,text` | 출력 형식 (복수 가능) |
| `--pages` | `"1,3,5-7"` | 추출할 페이지 |
| `--hybrid` | `docling-fast` | AI 백엔드 사용 |
| `--hybrid-url` | `http://localhost:5002` | 백엔드 서버 URL |
| `--hybrid-timeout` | `30000` | 백엔드 타임아웃 (ms) |
| `--hybrid-fallback` | flag | 백엔드 실패 시 Java 폴백 |
| `--table-method` | `default` / `cluster` | 테이블 감지 방식 |
| `--reading-order` | `xycut` / `off` | 읽기 순서 알고리즘 |
| `--sanitize` | flag | PII 자동 마스킹 |
| `--force-ocr` | flag | OCR 강제 (hybrid 서버 옵션) |
| `--ocr-lang` | `"ko,en,ja"` | OCR 언어 |
| `--image-output` | `embed` / `dir` | 이미지 추출 방식 |

## 로컬 vs Hybrid 비교

| | 로컬 모드 | Hybrid 모드 |
|---|---|---|
| 정확도 | 0.72 | **0.90** |
| 테이블 정확도 | ~0.70 | **0.93** |
| 속도 | 0.05초/페이지 | 0.43초/문서 |
| 리소스 | 가벼움 | 2-4GB RAM |
| OCR | 불가 | 80개+ 언어 |
| 수식 | 불가 | LaTeX 추출 |

## JSON 출력 구조

```
Root
├── metadata (filename, pages, author, title)
└── kids[] (페이지 요소)
   ├── Heading (level 1-6)
   ├── Paragraph
   ├── Table → rows[] → cells[] (row/col span)
   ├── List → list_items[]
   ├── Image (base64)
   └── Header/Footer
```

모든 요소에 `bounding box (left, bottom, right, top)`, `page`, `type` 포함.

## LangChain RAG 연동

```bash
pip3 install -U langchain-opendataloader-pdf --break-system-packages
```

```python
from langchain_opendataloader_pdf import OpenDataLoaderPDFLoader

loader = OpenDataLoaderPDFLoader(file_path=["file.pdf"], format="text")
documents = loader.load()
```

## 안전 필터

기본 활성화된 렌더링 불일치 필터:
- `hidden-text` — 투명/저대비 텍스트 차단
- `off-page` — 페이지 밖 텍스트 제거
- `tiny` — 1pt 이하 폰트 필터
- `hidden-ocg` — 숨겨진 레이어 제거

비활성화: `--content-safety-off hidden-text,off-page,tiny,hidden-ocg`

## 트러블슈팅

- **Java not found**: `java -version` 확인. 없으면 `brew install openjdk@21`
- **hybrid 서버 연결 실패**: `opendataloader-pdf-hybrid --port 5002` 가 실행 중인지 확인
- **첫 hybrid 실행이 느림**: 모델 다운로드 중. 이후엔 캐시됨
- **OCR 품질 낮음**: `--ocr-lang` 에 정확한 언어 코드 지정
