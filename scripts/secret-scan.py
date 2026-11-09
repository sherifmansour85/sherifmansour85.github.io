#!/usr/bin/env python3
"""Secret scan for hayakkom.com (no dependencies).

Everything in this repository is published by GitHub Pages, so no credential may ever be committed:
no API keys, access tokens, private keys, passwords or database connection strings.

Run from anywhere:  python3 scripts/secret-scan.py             (files in the current commit)
                    python3 scripts/secret-scan.py --history   (every version of every file, all branches)
Exits 1 and lists every match. Public identifiers that are meant to be in the browser (Google Ads
conversion ID, Jotform form and agent IDs, the IndexNow key in /<key>.txt) do not match these patterns.
"""
import re
import subprocess
import sys

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True,
                      cwd=sys.path[0] or '.').stdout.strip()
PATTERNS = {
    'private key': r'-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY-----',
    'AWS access key': r'\b(?:AKIA|ASIA)[0-9A-Z]{16}\b',
    'Google API key': r'\bAIza[0-9A-Za-z_\-]{35}\b',
    'Google OAuth secret': r'\bGOCSPX-[0-9A-Za-z_\-]{20,}',
    'GitHub token': r'\b(?:gh[pousr]_[0-9A-Za-z]{30,}|github_pat_[0-9A-Za-z_]{40,})\b',
    'Slack token': r'\bxox[abprs]-[0-9A-Za-z\-]{10,}',
    'Stripe key': r'\b(?:sk|rk)_(?:live|test)_[0-9A-Za-z]{16,}',
    'OpenAI key': r'\bsk-(?:proj-)?[A-Za-z0-9_\-]{32,}',
    'Anthropic key': r'\bsk-ant-[A-Za-z0-9_\-]{20,}',
    'SendGrid key': r'\bSG\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}',
    'Twilio key': r'\b(?:AC|SK)[0-9a-f]{32}\b',
    'Mailgun key': r'\bkey-[0-9a-f]{32}\b',
    'Telegram bot token': r'\b\d{8,10}:AA[0-9A-Za-z_\-]{33}\b',
    'JWT': r'\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}',
    'connection string': r'\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|mariadb|redis|rediss|amqp|mssql)://[^\s"\'<>]+',
    'credentials in URL': r'https?://[^/\s:@"\'<>]{1,64}:[^/\s@"\'<>]{1,64}@[^\s"\'<>]+',
    'Bearer token': r'\bBearer\s+[A-Za-z0-9_\-.=]{20,}',
    'New Relic key': r'\b(?:NRJS-[0-9a-f]{19}|NRAK-[0-9A-Z]{27}|[0-9a-f]{36}NRAL)\b',
    'secret assignment': (r'(?i)\b(?:api[_-]?key|apikey|secret|client[_-]?secret|access[_-]?token|auth[_-]?token|'
                          r'refresh[_-]?token|password|passwd|private[_-]?key|license[_-]?key|app[_-]?key)\b["\']?'
                          r'\s*[:=]\s*["\'][^"\'\s]{8,}["\']'),
    '.env line': r'(?m)^\s*[A-Z][A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|PASS)\s*=\s*\S{6,}',
}
RX = {name: re.compile(p) for name, p in PATTERNS.items()}
BINARY = re.compile(r'\.(png|jpe?g|webp|gif|ico|mp4|mp3|woff2?|ttf|pdf|zip|pyc)$', re.I)
SELF = 'scripts/secret-scan.py'  # the patterns above would match themselves


def git(*args, data=None):
    return subprocess.run(['git', '-C', ROOT, *args], input=data, capture_output=True, check=True).stdout


def blobs(history):
    """(object id, path) pairs to scan: the current commit, or every object on every branch."""
    if not history:
        for line in git('ls-files', '-s').decode().splitlines():
            meta, path = line.split('\t', 1)
            yield meta.split()[1], path
        return
    seen = {}
    for line in git('rev-list', '--all', '--objects').decode('utf-8', 'replace').splitlines():
        oid, _, path = line.partition(' ')
        if path and oid not in seen:
            seen[oid] = path
    kinds = git('cat-file', '--batch-check=%(objectname) %(objecttype)', data='\n'.join(seen).encode()).decode()
    for line in kinds.splitlines():
        oid, kind = line.split()
        if kind == 'blob':
            yield oid, seen[oid]


def main():
    history = '--history' in sys.argv
    found, scanned = [], 0
    for oid, path in blobs(history):
        if BINARY.search(path) or path == SELF:
            continue
        text = git('cat-file', '-p', oid).decode('utf-8', 'replace')
        scanned += 1
        for name, rx in RX.items():
            for m in rx.finditer(text):
                found.append(f'{path}: {name}: {m.group(0)[:80]}')
    where = 'all branches and history' if history else 'the current commit'
    if found:
        print(f'secret-scan: {len(found)} possible secret(s) in {where}:')
        print('\n'.join('  ' + f for f in sorted(set(found))))
        print('Remove the value, move it to a server-side service, and revoke it if it was ever pushed.')
        sys.exit(1)
    print(f'secret-scan: OK ({scanned} files, {where})')


if __name__ == '__main__':
    main()
