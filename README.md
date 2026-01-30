# DTZ Plugin

Model routing and parallel execution for Claude Code.

## Features

### Skills

- **`/dtz:max`** - Maximum performance mode with parallel agent orchestration
- **`/dtz:eco`** - Token-efficient parallel execution using Haiku/Sonnet agents
- **`/dtz:handoff`** - Save and restore session context for seamless continuation

### Agents (10 tiered)

| Tier | Model | Agents |
|------|-------|--------|
| LOW | Haiku | architect-low, executor-low, designer-low, explore |
| MEDIUM | Sonnet | architect-medium, executor, designer, explore-medium |
| HIGH | Opus | executor-high |

## Installation

```bash
# Clone to Claude plugins directory
git clone <repo-url> ~/.claude/plugins/ddotz-plugin
```

## Usage

### Max Mode
```
/dtz:max
```
or just say "max로 실행해줘"

### Eco Mode
```
/dtz:eco
```
or just say "eco 모드로"

### Handoff
```
# Save session
/dtz:handoff

# Load session
/dtz:handoff load

# List handoffs
/dtz:handoff list
```

## Auto-Load on Session Start

New sessions automatically detect and load previous handoff.

## Configuration

Create `.dtz/config.json` in your project:

```json
{
  "handoff": {
    "maxHistory": 10,
    "autoLoad": true
  }
}
```

## Version

1.0.0

## License

Private
