#!/bin/bash
# Lighthouse mobile on the live site and on the PR branch (served on :8080). Summary per page into report.txt.
set +e
npm i -s lighthouse@12.2.1 >/dev/null 2>&1
CH=$(node -e "console.log(require('playwright').chromium.executablePath())")
run(){ # name url
  for k in 1 2; do
    npx lighthouse "$2" --quiet --form-factor=mobile --only-categories=performance --output=json --output-path="lh/$1-$k.json" \
      --chrome-flags="--headless=new --no-sandbox" --chrome-path="$CH" >/dev/null 2>&1
  done
  node lhsum.cjs "$1" lh/$1-1.json lh/$1-2.json
}
mkdir -p lh
for p in "home /" "dental /dental/" "ar-home /ar/"; do set -- $p
  run "live-$1" "https://www.hayakkom.com$2"
  [ -n "$BRANCH" ] && run "branch-$1" "http://localhost:8080$2"
done
