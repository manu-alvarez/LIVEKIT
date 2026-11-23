"""Bounded in-process rate limiter for anonymous LiveKit guest tokens.

This limits accidental and automated token issuance per direct peer IP.
For multiple worker processes or reverse-proxy deployments, use a shared
edge/WAF rate limiter as well; do not trust unverified forwarded headers.
"""
from collections import deque
from threading import Lock
from time import monotonic


class TokenRateLimiter:
    def __init__(self, max_requests: int = 30, window_seconds: int = 300, max_clients: int = 4096):
        if min(max_requests, window_seconds, max_clients) < 1:
            raise ValueError("Rate-limit bounds must be positive")
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_clients = max_clients
        self._requests: dict[str, deque[float]] = {}
        self._lock = Lock()

    def allow(self, client_ip: str, now: float | None = None) -> bool:
        timestamp = monotonic() if now is None else now
        key = client_ip or "unknown"
        with self._lock:
            if key not in self._requests and len(self._requests) >= self.max_clients:
                for ip, times in list(self._requests.items()):
                    while times and timestamp - times[0] >= self.window_seconds:
                        times.popleft()
                    if not times:
                        del self._requests[ip]
                if len(self._requests) >= self.max_clients:
                    return False
            times = self._requests.setdefault(key, deque())
            while times and timestamp - times[0] >= self.window_seconds:
                times.popleft()
            if len(times) >= self.max_requests:
                return False
            times.append(timestamp)
            return True
