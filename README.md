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
| `/dtz:handoff autoload` | Check autoload status |
| `/dtz:handoff autoload on` | Enable autoload |
| `/dtz:handoff autoload off` | Disable autoload |

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
    "autoload": true,
    "maxHistory": 10
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `autoload` | `true` | Auto-load handoff on session start |
| `maxHistory` | `10` | Max handoffs to keep |

> 💡 To disable auto-load: `/dtz:handoff autoload off`

## Version

2.2.1

## Changelog

### v2.2.1
- Use haiku model for handoff skill (token efficiency)

### v2.2.0
- Add handoff autoload toggle feature
- New commands: `/dtz:handoff autoload on|off|status`
- Configuration via `.dtz/config.json`

### v2.0.0
- Removed max/eco modes
- Focus on handoff functionality only
- Added SessionStart hook for auto-detection
- Simplified plugin structure

### v1.0.1
- Initial marketplace release

## License

Private
