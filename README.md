# DTZ Plugin

Session management and development workflow tools for Claude Code.

## Features

### /dtz:handoff - Session Handoff

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

**Auto-Load on Session Start**: New sessions automatically detect `.dtz/handoffs/latest.md` and display summary.

### /dtz:hud - Statusline Configuration

Configure Claude Code statusline with ddotz-hud for enhanced status display.

| Command | Description |
|---------|-------------|
| `/dtz:hud` | Install and setup HUD |
| `/dtz:hud setup` | Install and setup HUD |
| `/dtz:hud update` | Update to latest version |
| `/dtz:hud status` | Check current configuration |
| `/dtz:hud reset` | Remove HUD settings |

**HUD Layout**:
```
Opus 4.5 | ⎇ main v1.2.0 | ~/project
  default | 5h:45% wk:23% | 58.4% | $2.34 | 1hr 26m | agents:2 | bg:1/5
```

### /dtz:fsd - Full-cycle Structured Development

PDCA-based automated development workflow. Integrates with bkit plugin to automatically run Plan → Design → Do → Check → Iterate → Report cycle.

| Command | Description |
|---------|-------------|
| `fsd: {description}` | Start FSD workflow (auto-detects existing docs) |
| `fsd status` | Check current progress |
| `fsd resume` | Resume interrupted workflow |
| `fsd cancel` | Cancel active workflow |
| `fsd config` | Check/change FSD settings |
| `fsd doctor` | Diagnose integration status |
| `fsd detect {feature}` | Test document detection for specific feature |

**Key Features**:
- Auto-detects existing PDCA documents and continues from next phase
- Automatic iteration until 90% match rate achieved
- Comprehensive progress tracking with visual indicators
- Integration with bkit PDCA methodology

> Requires bkit plugin. Run `fsd doctor` to check integration status.

## Installation

Add `ddotz` marketplace in Claude Code:

```bash
/plugin:marketplace add ddotz https://github.com/ddotz/ddotz-plugin
/plugin:install dtz@ddotz
```

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
  },
  "fsd": {
    "maxIterations": 5,
    "targetMatchRate": 90,
    "autoReport": true
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `handoff.autoload` | `true` | Auto-load handoff on session start |
| `handoff.maxHistory` | `10` | Max handoffs to keep |
| `fsd.maxIterations` | `5` | Max iteration cycles |
| `fsd.targetMatchRate` | `90` | Target match rate percentage |

## Version

2.3.0

## Changelog

### v2.3.0
- Add FSD (Full-cycle Structured Development) skill
- PDCA-based automated development workflow
- Auto-detection of existing PDCA documents
- Integration with bkit plugin

### v2.2.1
- Use haiku model for handoff skill (token efficiency)

### v2.2.0
- Add handoff autoload toggle feature
- New commands: `/dtz:handoff autoload on|off|status`
- Configuration via `.dtz/config.json`

### v2.1.0
- Add HUD skill for statusline configuration
- ddotz-hud integration

### v2.0.0
- Removed max/eco modes
- Focus on handoff functionality only
- Added SessionStart hook for auto-detection
- Simplified plugin structure

### v1.0.1
- Initial marketplace release

## License

Private
