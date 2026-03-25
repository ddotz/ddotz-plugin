---
name: opendataloader-pdf-setup
description: |
  OpenDataLoader PDF 환경 원클릭 셋업. Java 21 + opendataloader-pdf[hybrid] 설치.
  Use when asked to "setup opendataloader", "install opendataloader", "PDF 추출 환경 설정",
  "opendataloader 설치", or "PDF 파서 설치".
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# OpenDataLoader PDF — 환경 셋업 스킬

Java 21 + opendataloader-pdf[hybrid] 파이썬 패키지를 시스템에 설치합니다.

## 실행 절차

### 1. 현재 상태 확인

```bash
echo "=== Java ===" && (java -version 2>&1 || echo "NOT INSTALLED") && echo "=== opendataloader-pdf ===" && (opendataloader-pdf --help 2>&1 | head -3 || echo "NOT INSTALLED") && echo "=== Python ===" && python3 --version 2>&1
```

### 2. Java 설치 (없을 때만)

Java가 설치되어 있지 않으면:

```bash
brew install openjdk@21
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

Java가 이미 있으면 이 단계를 건너뛴다.

### 3. opendataloader-pdf 설치 (없을 때만)

opendataloader-pdf가 설치되어 있지 않으면:

```bash
pip3 install -U "opendataloader-pdf[hybrid]" --break-system-packages
```

이미 설치되어 있으면 이 단계를 건너뛴다.

### 4. 설치 검증

```bash
echo "=== Java ===" && java -version 2>&1 && echo "=== opendataloader-pdf ===" && opendataloader-pdf --help 2>&1 | head -3 && echo "=== hybrid server ===" && which opendataloader-pdf-hybrid && echo "=== SETUP COMPLETE ==="
```

모든 항목이 정상 출력되면 완료.

### 5. 결과 보고

사용자에게 다음을 알려준다:

```
설치 완료:
- Java: OpenJDK 21
- opendataloader-pdf[hybrid]: 설치됨
- CLI: opendataloader-pdf, opendataloader-pdf-hybrid

사용법:
  opendataloader-pdf input.pdf -o output/ -f json,markdown          # 로컬 모드
  opendataloader-pdf-hybrid --port 5002                              # hybrid 서버
  opendataloader-pdf --hybrid docling-fast input.pdf -o output/ -f json  # hybrid 모드
```
