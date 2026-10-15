"""Regression tests for the repository gates, not clinical validation."""
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('repo_checks', ROOT / 'scripts/repo_checks.py')
CHECKS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECKS)


class RepositoryChecks(unittest.TestCase):
    def test_clean_format(self):
        self.assertEqual(CHECKS.format_errors('src/a.mjs', b'const n = 1;\n'), [])

    def test_crlf_is_rejected(self):
        self.assertTrue(CHECKS.format_errors('src/a.mjs', b'x\r\n'))

    def test_missing_newline_is_rejected(self):
        self.assertTrue(CHECKS.format_errors('AGENTS.md', b'x'))

    def test_trailing_whitespace_is_rejected(self):
        self.assertTrue(CHECKS.format_errors('a.py', b'x  \n'))

    def test_data_and_constitution_are_not_reformatted(self):
        for path in ['data/a.md', 'docs/governance/AGENTIC-CONSTITUTION-v1.0.md']:
            self.assertEqual(CHECKS.format_errors(path, b'x \r\n'), [])

    def test_sensitive_paths(self):
        for path in ['.env', 'x/.env.local', 'id_rsa', 'x/private.key', 'data/private/a.json', 'x/__pycache__/a.pyc']:
            with self.subTest(path=path):
                self.assertTrue(CHECKS.unsafe_path(path))

    def test_safe_fixture_and_example(self):
        for path in ['data/ACI-consulta-y-nota.json', '.env.example', 'dist/index.html']:
            self.assertFalse(CHECKS.unsafe_path(path))

    def test_secret_detector_does_not_echo_secret(self):
        fake = 'ghp_' + 'X' * 36
        errors = CHECKS.secret_errors('x.txt', fake)
        self.assertTrue(errors)
        self.assertNotIn(fake, str(errors))

    def test_private_key_detector(self):
        self.assertTrue(CHECKS.secret_errors('x.txt', '-----BEGIN ' + 'RSA PRIVATE KEY-----'))

    def event(self, base='develop', head='chore/example', owner='fegome90-cmd/traza'):
        return {'pull_request': {'base': {'ref': base, 'repo': {'full_name': 'fegome90-cmd/traza'}}, 'head': {'ref': head, 'repo': {'full_name': owner}}}}

    def test_feature_to_develop(self):
        self.assertEqual(CHECKS.pr_errors(self.event()), [])

    def test_only_develop_promotes_to_main(self):
        self.assertEqual(CHECKS.pr_errors(self.event('main', 'develop')), [])
        self.assertTrue(CHECKS.pr_errors(self.event('main', 'chore/example')))

    def test_fork_named_develop_is_not_internal_promotion(self):
        self.assertTrue(CHECKS.pr_errors(self.event('main', 'develop', 'outsider/traza')))

    def test_invalid_or_missing_pr_metadata_fails_closed(self):
        self.assertTrue(CHECKS.pr_errors({}))
        self.assertTrue(CHECKS.pr_errors(self.event('unknown')))

    def test_build_verification_is_read_only_and_rejects_stale_output(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'scripts').mkdir()
            (root / 'dist').mkdir()
            (root / 'scripts/build.py').write_text("import sys\nfrom pathlib import Path\nPath(sys.argv[2]).write_bytes(b'expected\\n')\n")
            target = root / 'dist/index.html'
            target.write_bytes(b'stale\n')
            self.assertTrue(CHECKS.build_errors(root))
            self.assertEqual(target.read_bytes(), b'stale\n')
            target.write_bytes(b'expected\n')
            self.assertEqual(CHECKS.build_errors(root), [])

    def test_gitignore_covers_private_files_but_not_samples(self):
        paths = '.env\n.worktrees/task/a\n.superpowers/state\ndata/private/a.json\n'
        result = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], cwd=ROOT, input=paths, text=True, capture_output=True)
        self.assertEqual(result.stdout.splitlines(), paths.splitlines())
        result = subprocess.run(['git', 'check-ignore', '--no-index', 'data/ACI-consulta-y-nota.json', 'dist/index.html'], cwd=ROOT, capture_output=True)
        self.assertEqual(result.returncode, 1)

    def test_pre_push_blocks_protected_refs_and_allows_feature(self):
        for branch, expected in [('main', 1), ('develop', 1), ('chore/example', 0)]:
            line = f'refs/heads/chore/example {"a" * 40} refs/heads/{branch} {"b" * 40}\n'
            result = subprocess.run(['sh', '.githooks/pre-push'], cwd=ROOT, input=line, capture_output=True, text=True)
            self.assertEqual(result.returncode, expected, result.stderr)

    def test_required_check_is_bound_to_github_actions(self):
        rules = json.loads((ROOT / 'docs/governance/branch-ruleset.json').read_text())
        self.assertEqual(rules['bypass_actors'], [])
        self.assertEqual(set(rules['conditions']['ref_name']['include']), {'refs/heads/main', 'refs/heads/develop'})
        check = next(r for r in rules['rules'] if r['type'] == 'required_status_checks')
        self.assertEqual(check['parameters']['required_status_checks'], [{'context': 'quality', 'integration_id': 15368}])

    def test_development_server_is_loopback_only(self):
        config = json.loads((ROOT / 'package.json').read_text())
        self.assertIn('--bind 127.0.0.1', config['scripts']['serve'])


if __name__ == '__main__':
    unittest.main()
