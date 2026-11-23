"""Focused regression checks for guest token rate limits and route enforcement."""
import ast
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER = ROOT / "server" if (ROOT / "server").exists() else ROOT
MAIN = SERVER / "main.py"
POLICY = SERVER / "src/core/token_policy.py"

spec = importlib.util.spec_from_file_location("token_policy", POLICY)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
TokenRateLimiter = module.TokenRateLimiter


class TokenSecurityTests(unittest.TestCase):
    def test_bounded_requests_and_window_recovery(self):
        gate = TokenRateLimiter(max_requests=2, window_seconds=60)
        self.assertTrue(gate.allow("127.0.0.1", now=1))
        self.assertTrue(gate.allow("127.0.0.1", now=2))
        self.assertFalse(gate.allow("127.0.0.1", now=3))
        self.assertTrue(gate.allow("127.0.0.1", now=62))

    def test_peer_isolation_and_capacity(self):
        gate = TokenRateLimiter(max_requests=1, window_seconds=60, max_clients=2)
        self.assertTrue(gate.allow("a", now=1))
        self.assertTrue(gate.allow("b", now=1))
        self.assertFalse(gate.allow("c", now=2))
        self.assertTrue(gate.allow("c", now=62))

    def test_endpoint_is_bound_to_rate_limiter(self):
        source = MAIN.read_text(encoding="utf8")
        tree = ast.parse(source)
        route = next(n for n in tree.body if isinstance(n, ast.AsyncFunctionDef) and n.name == "generate_token")
        self.assertIn("Request", source)
        self.assertIn("token_rate_limiter.allow(", ast.get_source_segment(source, route))
        self.assertIn("status_code=429", ast.get_source_segment(source, route))
        self.assertIn("http_request.client.host", ast.get_source_segment(source, route))


if __name__ == "__main__":
    unittest.main()
