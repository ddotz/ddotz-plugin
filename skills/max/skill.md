---
name: max
description: Maximum performance mode with parallel agent orchestration
triggers:
  - max
---

# Max Mode

Activates maximum performance mode with parallel agent orchestration.

## When Activated

1. **Parallel Execution**: Running multiple agents simultaneously
2. **Aggressive Delegation**: Routing tasks to specialist agents immediately
3. **Background Operations**: Using `run_in_background: true` for long operations
4. **Smart Model Routing**: Using tiered agents (haiku/sonnet/opus)

## Model Routing (CRITICAL)

**Choose tier based on complexity: LOW (haiku) → MEDIUM (sonnet) → HIGH (opus)**

### Available Agents

| Domain | LOW (Haiku) | MEDIUM (Sonnet) | HIGH (Opus) |
|--------|-------------|-----------------|-------------|
| **Analysis** | `architect-low` | `architect-medium` | `architect` |
| **Execution** | `executor-low` | `executor` | `executor-high` |
| **Search** | `explore` | `explore-medium` | `explore-high` |
| **Frontend** | `designer-low` | `designer` | `designer-high` |

### Tier Selection

| Complexity | Tier | Examples |
|------------|------|----------|
| Simple | LOW | "Find where X is defined" |
| Standard | MEDIUM | "Add error handling", "Implement feature" |
| Complex | HIGH | "Debug race condition", "Refactor across files" |

### Examples

**Always pass `model` parameter explicitly!**

```
// Simple → LOW
Task(subagent_type="dtz:architect-low", model="haiku", prompt="...")

// Standard → MEDIUM
Task(subagent_type="dtz:executor", model="sonnet", prompt="...")

// Complex → HIGH
Task(subagent_type="dtz:executor-high", model="opus", prompt="...")
```

## Background Execution

**Run in Background**: npm install, build, test suites
**Run Blocking**: git status, file reads, simple commands

## Verification

Before stopping:
- [ ] TODO LIST: Zero pending tasks
- [ ] FUNCTIONALITY: Features work
- [ ] TESTS: All pass
- [ ] ERRORS: Zero unaddressed

**If ANY unchecked, CONTINUE WORKING.**
