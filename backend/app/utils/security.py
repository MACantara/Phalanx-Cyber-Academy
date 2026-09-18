import time
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory sliding-window rate limiter.

    General API limit is ``max_requests`` per ``window_seconds``.
    ``strict_paths`` maps path prefixes to tighter (limit, window) pairs.
    """

    def __init__(
        self,
        app,
        max_requests: int = 100,
        window_seconds: int = 60,
        strict_paths: Optional[Dict[str, Tuple[int, int]]] = None,
    ):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.strict_paths = strict_paths or {}
        self._requests: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        limit, window = self.max_requests, self.window_seconds
        matched_prefix: Optional[str] = None
        for prefix, (l, w) in self.strict_paths.items():
            if path.startswith(prefix):
                limit, window = l, w
                matched_prefix = prefix
                break

        if limit <= 0:
            return await call_next(request)

        now = time.time()
        client = request.client.host if request.client else "unknown"
        key = f"{client}:{matched_prefix or path}"
        timestamps = self._requests[key]
        timestamps[:] = [t for t in timestamps if now - t < window]

        if len(timestamps) >= limit:
            return JSONResponse(
                {"detail": "Rate limit exceeded"},
                status_code=429,
                headers={"Retry-After": str(window)},
            )

        timestamps.append(now)
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add baseline HTTP security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "connect-src 'self';"
        )
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
