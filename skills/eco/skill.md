---
name: eco
description: Token-efficient parallel execution using Haiku and Sonnet agents
triggers:
  - eco
---

# Eco Mode

Token-efficient parallel execution for cost-conscious development.

## When Activated

1. **Parallel Execution**: Multiple agents simultaneously
2. **Token-Conscious Routing**: Prefer Haiku, avoid Opus
3. **Background Operations**: `run_in_background: true` for long ops
4. **Cost Optimization**: Minimize tokens while maintaining quality

## Routing Rules (CRITICAL)

| Decision | Rule |
|----------|------|
| DEFAULT | Use LOW tier (Haiku) |
| UPGRADE | MEDIUM (Sonnet) only when needed |
| AVOID | HIGH tier (Opus) |

## Agent Routing

| Domain | PREFERRED (Haiku) | FALLBACK (Sonnet) | AVOID (Opus) |
|--------|-------------------|-------------------|--------------|
| **Analysis** | `architect-low` | `architect-medium` | ~~architect~~ |
| **Execution** | `executor-low` | `executor` | ~~executor-high~~ |
| **Search** | `explore` | `explore-medium` | - |
| **Frontend** | `designer-low` | `designer` | - |

## Examples

```
// DEFAULT: Use LOW
Task(subagent_type="dtz:executor-low", model="haiku", prompt="...")

// ESCALATE only if LOW fails
Task(subagent_type="dtz:executor", model="sonnet", prompt="...")

// File lookup: ALWAYS LOW
Task(subagent_type="dtz:explore", model="haiku", prompt="...")
```

## Token Savings Tips

1. Batch similar tasks to one agent
2. Use `explore` (haiku) for file discovery
3. Prefer `executor-low` first - upgrade if fails
4. Avoid opus unless genuinely needed

## Verification

Before stopping:
- [ ] TODO LIST: Zero pending tasks
- [ ] FUNCTIONALITY: Features work
- [ ] TESTS: All pass
- [ ] ERRORS: Zero unaddressed

**If ANY unchecked, CONTINUE WORKING.**
