"""Regression checks for the API JWT signing-secret startup gate.

The AST slice executes only the secret configuration statements. This verifies
fail-closed behavior without importing the LiveKit service or using real keys.
"""
import ast
import os
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAIN = ROOT / ("server/main.py" if (ROOT / "server/main.py").exists() else "main.py")


def check_secret(value):
    source = ast.parse(MAIN.read_text(encoding="utf-8"))
    idx = next(
        i for i, node in enumerate(source.body)
        if isinstance(node, ast.Assign)
        and any(isinstance(target, ast.Name) and target.id == "SECRET_KEY" for target in node.targets)
    )
    nodes = source.body[idx:idx + 2]
    assert len(nodes) == 2 and isinstance(nodes[1], ast.If), "Expected explicit JWT_SECRET guard"
    program = compile(ast.Module(body=nodes, type_ignores=[]), str(MAIN), "exec")
    environ = {} if value is None else {"JWT_SECRET": value}
    namespace = {"os": type("Environment", (), {"getenv": staticmethod(environ.get)})}
    exec(program, namespace)
    return namespace["SECRET_KEY"]


class JwtSecretGateTests(unittest.TestCase):
    def test_missing_secret_fails_closed(self):
        with self.assertRaises(RuntimeError):
            check_secret(None)

    def test_blank_secret_fails_closed(self):
        with self.assertRaises(RuntimeError):
            check_secret("  ")

    def test_known_insecure_legacy_secret_is_rejected(self):
        with self.assertRaises(RuntimeError):
            check_secret("super-secret-ias-auth-key")

    def test_explicit_secret_is_preserved(self):
        value = "a-new-unique-secret-generated-outside-source"
        self.assertEqual(check_secret(value), value)


if __name__ == "__main__":
    unittest.main()
