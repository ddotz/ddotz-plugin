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

### Step 3: 이미지/차트 페이지 식별

추출된 JSON에서 이미지/차트가 포함된 페이지를 식별한다.

```bash
# JSON에서 Image 타입 요소가 있는 페이지 번호 추출
python3 -c "
import json, sys, glob
for f in glob.glob('/tmp/opendataloader-output/*.json'):
    data = json.load(open(f))
    pages = set()
    def find_images(node):
        if isinstance(node, dict):
            if node.get('type') in ('Image', 'Figure', 'Chart'):
                pages.add(node.get('page', 0))
            for v in node.values():
                find_images(v)
        elif isinstance(node, list):
            for item in node:
                find_images(item)
    find_images(data)
    if pages:
        print(f'이미지/차트 포함 페이지: {sorted(pages)}')
    else:
        print('이미지/차트 없음')
"
```

### Step 4: 복합 분석 (텍스트 + 시각)

**핵심 전략: OpenDataLoader로 텍스트/테이블, Claude Read로 이미지/차트**

1. **텍스트/테이블**: Step 2에서 추출한 JSON/Markdown 파일을 Read 도구로 읽는다 (토큰 효율적).
2. **이미지/차트**: Step 3에서 식별한 페이지만 Claude Code Read 도구로 직접 읽는다:

```
Read(file_path="INPUT_FILE.pdf", pages="3,7,12")
```

이렇게 하면:
- 텍스트/테이블 → OpenDataLoader 추출본 사용 (토큰 절약, 구조 보존)
- 이미지/차트 → 해당 페이지만 멀티모달로 직접 확인 (시각적 해석)
- 전체 PDF를 Read로 로드하는 것 대비 **토큰 소비 최소화**

### Step 5: 결과 종합

추출된 텍스트/테이블 데이터와 이미지/차트 시각 분석을 종합하여 사용자에게 전달한다.

```bash
ls -la /tmp/opendataloader-output/
```

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
