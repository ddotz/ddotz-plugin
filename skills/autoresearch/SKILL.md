---
name: autoresearch
description: Scaffold and launch autonomous MLX research experiments on Apple Silicon. Auto-detects or creates project structure, sets up environment, and runs the keep/discard training loop. Works from any directory.
license: MIT
user_invocable: true
triggers:
  - autoresearch
  - 자율연구
  - mlx research
  - training loop
---

# autoresearch-mlx

Apple Silicon (MLX) autonomous research loop — Karpathy's autoresearch ported to MLX.
Fixed 5-minute training budget, keep-or-revert via git.

## Skill Directory

Templates are bundled at: `~/.claude/plugins/cache/ddotz/dtz/*/skills/autoresearch/templates/`

Find the exact path with: `ls ~/.claude/plugins/cache/ddotz/dtz/*/skills/autoresearch/templates/`

Templates included:
- `program.md` — experiment protocol (read-only at runtime)
- `train.py` — baseline training script (the only editable file)
- `prepare.py` — data prep, tokenizer, evaluation (read-only at runtime)
- `pyproject.toml` — Python dependencies

## Phase 1: Project Detection

Check if the current working directory has autoresearch structure:

```
ls program.md train.py prepare.py pyproject.toml 2>/dev/null
```

- **All 4 files exist** → Skip to Phase 3 (Environment Setup)
- **Some or none exist** → Proceed to Phase 2 (Scaffolding)

## Phase 2: Scaffolding (if structure missing)

1. **Confirm with user**: "현재 디렉토리에 autoresearch 프로젝트를 생성합니다. 진행할까요?"
2. **Locate templates**: Find the templates directory (see Skill Directory above)
3. **Copy all template files** to the current directory:
   - Read each template file and Write it to `./` (current directory)
   - `program.md`, `train.py`, `prepare.py`, `pyproject.toml`
4. **Create README.md** with a brief project description
5. **Initialize git** if not already a git repo: `git init`
6. **Report**: "프로젝트 구조 생성 완료. 환경 설정을 시작합니다."

## Phase 3: Environment Setup

Verify the environment is ready:

```
1. Check uv installed:    uv --version
2. Sync dependencies:     uv sync
3. Check data prepared:   ls ~/.cache/autoresearch/data ~/.cache/autoresearch/tokenizer
```

If data is missing, run: `uv run prepare.py`

> Data preparation downloads ~1GB from HuggingFace and trains a BPE tokenizer.
> This is a one-time setup shared across all autoresearch projects via `~/.cache/autoresearch/`.

**Report any missing items to the user before proceeding.**

## Phase 4: Start Experiment Run

Once setup is verified:

1. Read `program.md` — this is the canonical experiment protocol
2. Read `train.py` and `prepare.py` for current state
3. Read `results.tsv` for experiment history (if exists)
4. Follow the Setup and Experimentation sections in `program.md`

## Key Rules (from program.md)

- **Only edit** `train.py` — everything else is read-only
- **Fixed 5-min** training budget (wall clock)
- **Metric**: `val_bpb` (lower is better)
- **Loop**: edit -> commit -> `uv run train.py > run.log 2>&1` -> check results -> keep or revert
- **Never stop**: run autonomously until manually interrupted
- **Git discipline**: stage only project-relative paths, never `git add -A`
- **Dependencies**: only what's in `pyproject.toml`, no new packages
- **Simplicity**: simpler code at equal val_bpb is a win

## Quick Reference

| Command | Purpose |
|---------|---------|
| `uv run train.py` | Run one 5-min experiment |
| `uv run prepare.py` | One-time data + tokenizer prep |
| `grep "^val_bpb:" run.log` | Read result metric |
| `grep "^peak_vram_mb:" run.log` | Read memory usage |
