#!/bin/bash
# Reinstalls the AI tooling used in this repo's Claude Code cloud sessions.
# The site itself is static HTML, so there are no project dependencies to install.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# OmniRoute (AI router CLI)
if ! command -v omniroute >/dev/null 2>&1; then
  npm install -g omniroute --no-fund --no-audit --loglevel=error >&2
fi

# Graphify (official PyPI package is "graphifyy") + its Claude Code skill
if ! command -v graphify >/dev/null 2>&1; then
  uv tool install --quiet graphifyy >&2
fi
export PATH="$HOME/.local/bin:$PATH"
if [ ! -f "$HOME/.claude/skills/graphify/SKILL.md" ]; then
  graphify install >/dev/null
fi

# Plugins are also declared in .claude/settings.json; installing them here
# makes sure they are present even if the settings-based install is skipped.
if ! claude plugin marketplace list 2>/dev/null | grep -q '> ecc$'; then
  claude plugin marketplace add https://github.com/affaan-m/everything-claude-code >/dev/null
fi
installed="$(claude plugin list 2>/dev/null || true)"
for plugin in claude-code-setup@anthropic-plugin-directory ecc@ecc; do
  if ! grep -qF "> $plugin" <<<"$installed"; then
    claude plugin install "$plugin" >/dev/null
  fi
done
