#!/bin/bash
# PostToolUse: after Claude edits a page, sitemap.xml or llms.txt, run the site checks.
# A failure is fed back to Claude (exit 2) so it fixes the problem before moving on.
file="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))' 2>/dev/null)"
case "$file" in
  *.html|*/sitemap.xml|*/llms.txt) ;;
  *) exit 0 ;;
esac
out="$(python3 "$CLAUDE_PROJECT_DIR/scripts/check-site.py" 2>&1)" && exit 0
echo "$out" >&2
exit 2
