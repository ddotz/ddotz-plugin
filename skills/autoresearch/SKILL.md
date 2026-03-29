---
name: autoresearch
description: Launch autonomous MLX research experiments on Apple Silicon. Sets up environment, reads program.md protocol, creates branch, and runs the keep/discard training loop.
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

## Project Location

`~/autoresearch-mlx`

> If the directory doesn't exist, tell the user to clone the repo first.

## First-Run Setup

On first invocation, verify the environment is ready:

```
1. Check project exists:  ls ~/autoresearch-mlx/train.py
2. Check uv installed:    uv --version
3. Check deps synced:     cd ~/autoresearch-mlx && uv sync
4. Check data prepared:   ls ~/.cache/autoresearch/data ~/.cache/autoresearch/tokenizer
```

If data is missing, run: `cd ~/autoresearch-mlx && uv run prepare.py`

**Report any missing items to the user before proceeding.**

## Starting an Experiment Run

Once setup is verified:

1. `cd ~/autoresearch-mlx`
2. Read `program.md` — this is the canonical experiment protocol
3. Read `train.py` and `prepare.py` for current state
4. Read `results.tsv` for experiment history
5. Follow the Setup and Experimentation sections in `program.md`

## Key Rules (from program.md)

- **Only edit** `train.py` — everything else is read-only
- **Fixed 5-min** training budget (wall clock)
- **Metric**: `val_bpb` (lower is better)
- **Loop**: edit -> commit -> `uv run train.py > run.log 2>&1` -> check results -> keep or revert
- **Never stop**: run autonomously until manually interrupted
- **Git discipline**: `git add autoresearch-mlx/train.py` only, never `git add -A`
- **Dependencies**: only what's in `pyproject.toml`, no new packages
- **Simplicity**: simpler code at equal val_bpb is a win

## Quick Reference

| Command | Purpose |
|---------|---------|
| `uv run train.py` | Run one 5-min experiment |
| `uv run prepare.py` | One-time data + tokenizer prep |
| `grep "^val_bpb:" run.log` | Read result metric |
| `grep "^peak_vram_mb:" run.log` | Read memory usage |
