---
name: autoresearch
description: Domain-agnostic autonomous experiment loop. Keep-or-revert via git with structured logging, confidence scoring, and context recovery. MLX preset included.
license: MIT
user_invocable: true
triggers:
  - autoresearch
  - 자율연구
  - mlx research
  - training loop
  - experiment loop
  - optimization loop
---

# autoresearch

Domain-agnostic autonomous experiment loop.
Edit code, benchmark, keep improvements, revert regressions, repeat forever.

## Entry Flow

On invocation, determine the mode:

### MLX Mode (Auto-detect)

If `~/autoresearch-mlx/train.py` exists:

1. `cd ~/autoresearch-mlx`
2. Verify environment:
   - `uv --version` (uv installed)
   - `uv sync` (deps synced)
   - `ls ~/.cache/autoresearch/data ~/.cache/autoresearch/tokenizer` (data ready)
   - If data missing: `uv run prepare.py`
3. If `.autoresearch/config.json` exists, resume (→ Context Recovery)
4. If not, create `.autoresearch/` with MLX preset:

**MLX Preset config.json:**
```json
{
  "name": "mlx-training",
  "metric": {"name": "val_bpb", "direction": "lower", "unit": "bits/byte"},
  "budget_minutes": 5,
  "edit_scope": ["train.py"],
  "benchmark_cmd": "uv run train.py > run.log 2>&1 && grep '^METRIC\\|^val_bpb:\\|^peak_vram_mb:' run.log | sed 's/^val_bpb:/METRIC val_bpb=/' | sed 's/^peak_vram_mb:/METRIC peak_vram_mb=/'",
  "checks_cmd": null,
  "preset": "mlx"
}
```

5. Read `program.md`, `train.py`, last 10 lines of `experiments.jsonl`
6. → Start Experiment Loop

### Generic Mode (Interactive Init)

If MLX not detected:

**Step 0: Project Analysis & Recommendation**

Before asking questions, analyze the project to generate smart defaults:

| Signal | Recommendation |
|--------|---------------|
| `package.json` + bundler config (webpack, vite, esbuild) | **번들 크기 최적화** — metric: `bundle_kb`, direction: lower, benchmark: `npm run build && stat -f%z dist/index.js` |
| `package.json` + test config (jest, vitest, pytest) | **테스트 속도 최적화** — metric: `test_duration_s`, direction: lower, benchmark: `time npm test` |
| `train.py` or `*.ipynb` + ML deps (torch, tensorflow, jax) | **훈련 loss 최적화** — metric: `val_loss`, direction: lower, benchmark: `python train.py` |
| `Dockerfile` or `docker-compose.yml` | **빌드 시간 최적화** — metric: `build_duration_s`, direction: lower, benchmark: `time docker build .` |
| `lighthouse` config or `next.config.*` | **Core Web Vitals 최적화** — metric: `lcp_ms`, direction: lower, benchmark: `npx lighthouse --output=json` |
| `*.rs` + `Cargo.toml` | **컴파일 시간 최적화** — metric: `compile_duration_s`, direction: lower, benchmark: `time cargo build --release` |
| `go.mod` + benchmarks | **벤치마크 성능** — metric: `ns_per_op`, direction: lower, benchmark: `go test -bench=. -count=3` |

Present the recommendation to the user:

> "프로젝트를 분석했습니다. `package.json`과 vitest 설정을 감지했어요.
> **추천: 테스트 속도 최적화**
> - 메트릭: `test_duration_s` (lower is better)
> - 벤치마크: `time npx vitest run`
> - 편집 범위: `src/**/*.ts`
> - 정합성 검사: `npx tsc --noEmit`
>
> 이대로 진행할까요? 아니면 다른 목표가 있으시면 말씀해주세요."

If user accepts → fill defaults and proceed to Step 1 (confirm/adjust each).
If user declines → proceed to Step 1 with blank defaults.

**Step 1: Interactive Questions (with smart defaults)**

Ask one at a time. Show the recommended default in parentheses when available:

1. **What are you optimizing?** (추천: `<recommendation>`)
2. **What is the primary metric?** Name, unit, direction (추천: `<metric>`, `<direction>`)
3. **What command runs the benchmark?** Must output `METRIC name=value` to stdout (추천: `<command>`)
4. **Which files can be edited?** Glob patterns (추천: `<scope>`)
5. **Time budget per experiment?** Minutes, default: 5
6. **Correctness checks?** Optional — tests, types, lint (추천: `<checks>`)

User can accept defaults by pressing enter or override with their own value.

**Step 2:** Create `.autoresearch/` directory with all files (→ Init File Generation)
**Step 3:** Run baseline experiment
**Step 4:** → Start Experiment Loop

## Init File Generation

After collecting user answers, create these files:

### .autoresearch/config.json

```json
{
  "name": "<user-provided name>",
  "metric": {"name": "<metric>", "direction": "<lower|higher>", "unit": "<unit>"},
  "budget_minutes": <number>,
  "edit_scope": ["<glob1>", "<glob2>"],
  "benchmark_cmd": "bash .autoresearch/benchmark.sh",
  "checks_cmd": <"bash .autoresearch/checks.sh" or null>,
  "preset": null
}
```

### .autoresearch/benchmark.sh

Generate based on user's benchmark command. Must output `METRIC name=value` lines:

```bash
#!/bin/bash
set -euo pipefail

# Run the actual benchmark
<user-provided command>

# Output must include at minimum:
# METRIC <primary_metric_name>=<value>
```

If the user's command doesn't natively output METRIC lines, wrap it to parse the output.

### .autoresearch/checks.sh (if user provided checks)

```bash
#!/bin/bash
set -euo pipefail
<user-provided checks command>
```

### .autoresearch/session.md

```markdown
# Autoresearch Session: <name>

## Objective
<user-provided optimization goal>

## Primary Metric
- **Name:** <metric>
- **Direction:** <lower|higher> is better
- **Baseline:** (set after first run)

## Edit Scope
<list of editable file patterns>

## Experiment History
(Updated automatically after each experiment)

## Current Best
(Updated automatically)
```

### .autoresearch/experiments.jsonl

Create empty file.

### .autoresearch/ideas.md

```markdown
# Experiment Ideas

Ideas for future experiments. Add freely, cross off when tried.

- (Claude adds initial ideas based on codebase analysis)
```

### .autoresearch/analyze.py

Copy from the plugin's `skills/autoresearch/analyze.py`.

### .gitignore entry

Append to project `.gitignore` if not already present:

```
# autoresearch
.autoresearch/experiments.jsonl
```

Config, session.md, benchmark.sh, checks.sh, ideas.md, and analyze.py ARE tracked in git.

## Experiment Loop

Run this loop until the user manually interrupts. Never ask "should I continue?" — just keep going.

### Step 1: Plan the Change

- Read `.autoresearch/session.md` for context
- Read `.autoresearch/ideas.md` for candidates
- Choose one idea or formulate a new hypothesis
- Announce: "Experiment N: <one-line description>"

### Step 2: Edit Code

- Only modify files matching `config.edit_scope`
- Make focused, minimal changes (one idea per experiment)
- If multiple ideas, pick the most promising and save others to `ideas.md`

### Step 3: Commit

```bash
git add <only files in edit_scope that changed>
git commit -m "experiment: <description>"
```

Never `git add -A`. Only stage files in edit_scope.

### Step 4: Run Benchmark

```bash
bash .autoresearch/benchmark.sh
```

Parse stdout for `METRIC name=value` lines:
- The line matching `config.metric.name` is the primary metric
- All other METRIC lines are secondary metrics
- If benchmark exits non-zero → status = `crash`

### Step 5: Run Checks (if configured)

Only if `config.checks_cmd` is not null:

```bash
bash .autoresearch/checks.sh
```

If exit non-zero → status = `checks_failed`

### Step 6: Judge Result

Compare primary metric to previous best:

- **keep**: metric improved (or first run = baseline)
- **discard**: metric worse or equal to previous best
- **crash**: benchmark exited non-zero
- **checks_failed**: benchmark passed but checks failed

For `discard`, `crash`, `checks_failed`:

```bash
git revert HEAD --no-edit
```

### Step 7: Log to JSONL

Append one JSON line to `.autoresearch/experiments.jsonl`:

```json
{
  "iteration": <N>,
  "timestamp": "<ISO 8601>",
  "status": "<keep|discard|crash|checks_failed>",
  "metric": {"name": "<name>", "value": <number or null>, "direction": "<lower|higher>"},
  "secondary_metrics": {"<name>": <value>},
  "commit": "<git short hash>",
  "description": "<one-line description of what was tried>",
  "asi": {"<key>": "<value>"},
  "duration_s": <seconds>
}
```

**ASI (Actionable Side Information):** Record learnings that survive reverts. Examples:
- `{"note": "batch_size=64 causes OOM on 8GB"}`
- `{"note": "parallelism>4 hits diminishing returns"}`
- `{"note": "this approach conflicts with X, don't retry"}`

Always include at least one ASI entry for `discard`, `crash`, and `checks_failed`.

### Step 8: Update Session Doc

Update `.autoresearch/session.md`:
- Add experiment to history section
- Update current best if improved
- Note any learnings

### Step 9: Confidence Check (every 3 experiments)

Every 3 experiments, run:

```bash
python3 .autoresearch/analyze.py
```

Review the output. Confidence scoring is advisory — never auto-discard based on it.
If confidence is `within noise` for 5+ consecutive keeps, note this in session.md.

### Step 10: Continue

Go back to Step 1. Do not ask the user for permission.

## METRIC Protocol

Benchmark scripts output metrics to stdout in this format:

```
METRIC val_bpb=1.42
METRIC train_loss=1.38
METRIC peak_vram_mb=8192
```

Rules:
- One metric per line, format: `METRIC <name>=<value>`
- Value must be numeric (int or float)
- The metric matching `config.metric.name` is primary
- All others are secondary (recorded but not used for keep/discard)
- Lines not matching `METRIC` pattern are ignored

## Context Recovery

When resuming a session (new conversation, context reset, or explicit `/dtz:autoresearch`):

1. Read `.autoresearch/config.json` — settings
2. Read `.autoresearch/session.md` — objective, current state, history
3. Read last 10 entries of `.autoresearch/experiments.jsonl` — recent experiments
4. Read `.autoresearch/ideas.md` — remaining ideas
5. Run `python3 .autoresearch/analyze.py` — overall statistics
6. Resume the experiment loop from where it left off

This is enough for a fresh agent to continue without any prior context.

## Key Rules

- **Never stop**: run autonomously until manually interrupted
- **One idea per experiment**: don't combine multiple changes
- **Edit scope only**: never modify files outside `config.edit_scope`
- **Git discipline**: only stage files in edit_scope, never `git add -A`
- **ASI always**: record learnings on every discard/crash/checks_failed
- **Simpler is better**: at equal metric, prefer simpler code
- **Ideas survive**: save deferred ideas to `ideas.md`, not just memory

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/dtz:autoresearch` | Start or resume experiment loop |
| `/dtz:autoresearch init` | Force interactive init (skip MLX auto-detect) |
| `python3 .autoresearch/analyze.py` | Run confidence analysis |
| `cat .autoresearch/experiments.jsonl \| tail -5` | Last 5 experiments |
| `cat .autoresearch/session.md` | Current session state |
| `cat .autoresearch/ideas.md` | Pending ideas |
