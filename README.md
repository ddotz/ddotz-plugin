# DTZ Plugin

Session handoff for seamless continuation in Claude Code.

## Features

### /dtz:handoff

Save and restore session context for seamless continuation between sessions.

| Command | Description |
|---------|-------------|
| `/dtz:handoff` | Save current session state |
| `/dtz:handoff save [name]` | Save with custom name |
| `/dtz:handoff load [id]` | Load specific handoff |
| `/dtz:handoff list` | List saved handoffs |
| `/dtz:handoff clear` | Clear handoff history |

## Installation

Add `ddotz` marketplace in Claude Code:

```bash
/plugin:marketplace add ddotz https://github.com/ddotz/ddotz-plugin
/plugin:install dtz@ddotz
```

## Auto-Load on Session Start

New sessions automatically detect `.dtz/handoffs/latest.md` and display summary.

Use `/dtz:handoff load` to restore context and tasks.

## Handoff Document

Saved handoffs include:
- Context Summary
- Completed/Pending Tasks
- Key Decisions
- Important Files
- Next Steps

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

| Option | Default | Description |
|--------|---------|-------------|
| `maxHistory` | 10 | Max handoffs to keep |
| `autoLoad` | true | Auto-detect on session start |

## Version

2.0.0

## Changelog

### v2.0.0
- Removed max/eco modes
- Focus on handoff functionality only
- Added SessionStart hook for auto-detection
- Simplified plugin structure

### v1.0.1
- Initial marketplace release

## License

Private
