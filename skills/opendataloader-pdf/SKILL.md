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

## 기본 사용법 (CLI)

```bash
# 단순 변환 (로컬 모드, 빠름)
opendataloader-pdf input.pdf -o output/ -f json,markdown

# 특정 페이지만
opendataloader-pdf input.pdf -o output/ -f json --pages 1,3,5-7
```

## Hybrid 모드 (고정확도, 권장)

hybrid 모드는 AI 백엔드(Docling)를 사용하여 정확도 0.90 달성.

### 방법 1: 백엔드 서버 별도 실행

```bash
# 터미널 1: 백엔드 서버 시작 (첫 실행 시 모델 다운로드로 시간 소요)
opendataloader-pdf-hybrid --port 5002

# 터미널 2: hybrid 모드로 PDF 처리
opendataloader-pdf --hybrid docling-fast input.pdf -o output/ -f json,markdown
```

### 방법 2: 한국어 OCR 포함 (스캔 문서)

```bash
# 백엔드에 OCR 활성화
opendataloader-pdf-hybrid --port 5002 --force-ocr --ocr-lang "ko,en"

# 변환
opendataloader-pdf --hybrid docling-fast scanned.pdf -o output/ -f json,markdown
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
