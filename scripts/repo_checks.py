#!/usr/bin/env python3
"""Small deterministic repository gates; no network, writes or clinical inference.

Formatting means LF, final newline and no trailing spaces, not a full code
formatter. Secret detection covers common literal patterns, not every secret.
"""
import argparse
import ast
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
TEXT = {'.mjs', '.js', '.py', '.sh', '.md', '.json', '.yml', '.yaml', '.css', '.html', '.txt'}
PRESERVED = ('data/', 'qa/', 'licenses/')
CONSTITUTION = 'docs/governance/AGENTIC-CONSTITUTION-v1.0.md'
REQUIRED = ['AGENTS.md', 'CONTRIBUTING.md', 'SECURITY.md', '.gitignore', '.editorconfig',
            '.github/CODEOWNERS', '.github/workflows/quality.yml', '_ctx/policy/roles.yaml',
            CONSTITUTION, 'docs/governance/ADOPTION.md', 'dist/index.html']
SECRET_PATTERNS = [r'gh[pousr]_[A-Za-z0-9]{36,}', r'github_pat_[A-Za-z0-9_]{60,}',
                   r'AKIA[A-Z0-9]{16}', r'sk-proj-[A-Za-z0-9_-]{32,}',
                   r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----']


def unsafe_path(path):
    """Reject sensitive/local paths even if someone forces them into Git."""
    p = PurePosixPath(path)
    parts = set(p.parts)
    return (p.name != '.env.example' and (p.name == '.env' or p.name.startswith('.env.'))
            or p.name in {'id_rsa', 'id_ed25519', 'credentials.json'}
            or p.suffix in {'.pem', '.key', '.p12', '.pfx', '.pyc'}
            or bool(parts & {'.worktrees', 'worktrees', '.superpowers', '__pycache__', 'node_modules', '.venv'})
            or path.startswith(('data/private/', 'data/raw/')))


def format_errors(path, data):
    if path.startswith(PRESERVED) or path == CONSTITUTION:
        return []  # Source material remains byte-identical; never autofix it.
    if PurePosixPath(path).suffix not in TEXT and PurePosixPath(path).name not in {
        '.editorconfig', '.gitignore', '.gitattributes', 'CODEOWNERS', 'pre-push', '.nvmrc', '.python-version'
    }:
        return []
    text = data.decode('utf-8')
    issues = []
    if '\r' in text:
        issues.append(f'{path}: use LF line endings')
    if text and not text.endswith('\n'):
        issues.append(f'{path}: missing final newline')
    if any(line.endswith((' ', '\t')) for line in text.splitlines()):
        issues.append(f'{path}: trailing whitespace')
    return issues


def secret_errors(path, text):
    # Never put the matching value or surrounding source into logs.
    return [f'{path}: possible secret (pattern {i + 1}); review locally'
            for i, pattern in enumerate(SECRET_PATTERNS) if re.search(pattern, text)]


def pr_errors(event):
    try:
        pr = event['pull_request']
        base, head = pr['base'], pr['head']
        repo = 'fegome90-cmd/traza'
        if base['repo']['full_name'] != repo or base['ref'] not in {'develop', 'main'}:
            return ['PR: unexpected target repository or branch']
        if base['ref'] == 'main' and (head['ref'] != 'develop' or head['repo']['full_name'] != repo):
            return ['PR: main accepts promotion only from this repository develop branch']
        return []
    except (KeyError, TypeError):
        return ['PR: incomplete metadata; fail closed']


def build_errors(root):
    """Compare committed working-copy output without overwriting it first."""
    expected = root / 'dist/index.html'
    if not expected.is_file():
        return ['build: missing dist/index.html; run npm run build']
    with tempfile.TemporaryDirectory(prefix='traza-build-') as tmp:
        output = Path(tmp) / 'index.html'
        result = subprocess.run([sys.executable, str(root / 'scripts/build.py'), '--output', str(output)],
                                cwd=root, capture_output=True, text=True, timeout=60)
        if result.returncode or not output.is_file():
            return ['build: generation failed; run npm run build locally for diagnostics']
        if expected.read_bytes() != output.read_bytes():
            return ['build: dist/index.html is stale; regenerate and commit it']
    return []


def files(root):
    result = subprocess.run(['git', 'ls-files', '-z'], cwd=root, check=True, capture_output=True)
    return [x for x in result.stdout.decode('utf-8').split('\0') if x]


def check(root, mode):
    if mode == 'build':
        return build_errors(root)
    if mode == 'pr':
        if os.environ.get('GITHUB_EVENT_NAME') != 'pull_request':
            return []
        return pr_errors(json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text('utf-8')))
    paths = files(root)
    errors = []
    if mode == 'lint':
        errors += [f'missing required file: {p}' for p in REQUIRED if p not in paths]
    for path in paths:
        p = root / path
        if p.is_symlink():
            errors.append(f'{path}: symlinks are not allowed in this repository')
            continue
        if mode == 'lint':
            if unsafe_path(path):
                errors.append(f'{path}: sensitive/local file must not be tracked')
            if p.is_file():
                try:
                    errors.extend(secret_errors(path, p.read_text('utf-8')))
                except UnicodeDecodeError:
                    pass
        elif mode == 'format':
            errors.extend(format_errors(path, p.read_bytes()))
        elif mode == 'syntax':
            if p.suffix in {'.mjs', '.js'}:
                proc = subprocess.run(['node', '--check', str(p)], capture_output=True, text=True)
                if proc.returncode:
                    errors.append(f'{path}: JavaScript syntax error')
            elif p.suffix == '.py':
                try:
                    ast.parse(p.read_text('utf-8'), filename=path)
                except SyntaxError:
                    errors.append(f'{path}: Python syntax error')
            elif p.suffix == '.json':
                try:
                    json.loads(p.read_text('utf-8'))
                except ValueError:
                    errors.append(f'{path}: invalid JSON')
            elif p.suffix == '.sh' or path == '.githooks/pre-push':
                proc = subprocess.run(['sh', '-n', str(p)], capture_output=True)
                if proc.returncode:
                    errors.append(f'{path}: shell syntax error')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['lint', 'format', 'syntax', 'build', 'pr'])
    args = parser.parse_args()
    try:
        errors = check(ROOT, args.mode)
    except (OSError, ValueError, UnicodeError, subprocess.SubprocessError) as exc:
        print(f'FAIL {args.mode}: {type(exc).__name__}; inspect the local configuration', file=sys.stderr)
        return 1
    for error in errors:
        print(error, file=sys.stderr)
    print(f'{"FAIL" if errors else "PASS"} {args.mode}: {len(errors)} findings')
    return int(bool(errors))


if __name__ == '__main__':
    raise SystemExit(main())
