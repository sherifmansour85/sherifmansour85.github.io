#!/bin/bash
# Lighthouse mobile (3 runs each, median shown): live site vs the PR branch served with gzip on :8080.
set +e
npm i -s lighthouse@12.2.1 serve@14.2.4 >/dev/null 2>&1
(npx serve -l 8080 -n site >/dev/null 2>&1 &) ; sleep 3
CH=$(node -e "console.log(require('playwright').chromium.executablePath())")
run(){ for k in 1 2 3; do npx lighthouse "$2" --quiet --form-factor=mobile --only-categories=performance --output=json --output-path="lh/$1-$k.json" --chrome-flags="--headless=new --no-sandbox" --chrome-path="$CH" >/dev/null 2>&1; done
  node lhsum.cjs "$1" lh/$1-1.json lh/$1-2.json lh/$1-3.json; }
mkdir -p lh
for p in ${PAGES:-"home:/" "dental:/dental/" "ar-home:/ar/"}; do n=${p%%:*}; u=${p#*:}
  run "live-$n" "https://www.hayakkom.com$u"; run "branch-$n" "http://localhost:8080$u"; done
