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

### /dtz:web-fetch - Smart Web Content Fetching

Fetch web content with automatic strategy selection. Uses Jina Reader for static pages (fast, markdown) and Playwriter/Playwright for dynamic pages (JavaScript rendering).

| Command | Description |
|---------|-------------|
| `/dtz:web-fetch {url}` | Fetch content (auto strategy) |
| `/dtz:web-fetch {url} --jina` | Force Jina Reader |
| `/dtz:web-fetch {url} --playwriter` | Force Playwriter |
| `/dtz:web-fetch {url} --playwright` | Force Playwright |
| `/dtz:web-fetch detect {url}` | Detect page type (dry-run) |

**Strategy Priority**:
```
1. Jina Reader (static pages, fast, markdown output)
   ↓ failure or dynamic page
2. Playwriter (MCP, JavaScript rendering)
   ↓ failure or not installed
3. Playwright (local browser automation)
```

**Page Type Detection**:
- **Static**: Blogs (Medium, Dev.to), docs sites (MDN, GitHub), news, Wikipedia
- **Dynamic**: SPAs, dashboards, social media feeds, admin panels

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

2.3.1

## Changelog

### v2.3.1
- Add Web Fetch Strategy skill (`/dtz:web-fetch`)
- Smart page type detection (static vs dynamic)
- Jina Reader as default for static pages
- Playwriter/Playwright fallback for dynamic pages
- Auto strategy selection with manual override options

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
