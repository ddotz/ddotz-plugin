# DTZ Plugin

HUD configuration and web content tools for Claude Code.

## Features

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

### /dtz:web-fetch - Smart Web Content Fetching

Fetch web content with automatic strategy selection. Uses Jina Reader for static pages (fast, markdown) and Playwriter/Playwright for dynamic pages (JavaScript rendering).

> First run automatically adds Web Fetch Strategy to global `~/.claude/CLAUDE.md`.

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

### /dtz:karpathy-guidelines - Coding Behavior Rules

Apply Karpathy-style coding guardrails for predictable LLM coding behavior.

| Command | Description |
|---------|-------------|
| `/dtz:karpathy-guidelines` | Apply guidelines and initialize global rules |
| `/dtz:karpathy-guidelines setup` | Force setup rules in `~/.claude/CLAUDE.md` |

> First run automatically adds Karpathy Coding Guidelines to global `~/.claude/CLAUDE.md`.

## Installation

Add `ddotz` marketplace in Claude Code:

```bash
/plugin:marketplace add ddotz https://github.com/ddotz/ddotz-plugin
/plugin:install dtz@ddotz
```

## Configuration

Create `.dtz/config.json` in your project:

```json
{
  "webFetch": {
    "defaultStrategy": "auto"
  }
}
```

| Option | Default | Description |
|--------|---------|-------------|
| `webFetch.defaultStrategy` | `auto` | Default strategy for `/dtz:web-fetch` |

## Version

2.4.2

## Changelog

### v2.3.1
- Add Web Fetch Strategy skill (`/dtz:web-fetch`)
- Smart page type detection (static vs dynamic)
- Jina Reader as default for static pages
- Playwriter/Playwright fallback for dynamic pages
- Auto strategy selection with manual override options

### v2.4.2
- Deprecate and remove `/dtz:handoff` feature
- Deprecate and remove `fsd` workflow feature
- Remove SessionStart hook integration
- Add first-run global auto-setup for `/dtz:web-fetch`
- Add first-run global auto-setup for `/dtz:karpathy-guidelines`

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
