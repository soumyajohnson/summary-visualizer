from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.core.config import settings
except (ImportError, ModuleNotFoundError):
    # Fallback for local development if config file is missing or path issues
    class MockSettings:
        CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    settings = MockSettings()

from app.api.routes import router as api_router

app = FastAPI(
    title="Summary Visualizer API",
    description="API for converting text summaries into diagrams.",
    version="1.0.0"
)

# --- Middleware ---

# Placeholder for request size limit middleware.
# Note: For a production app, consider a more robust solution like a reverse proxy (e.g., Nginx) to handle this.
# from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseCall
# from starlette.requests import Request
# from starlette.responses import Response
# class LimitRequestSizeMiddleware(BaseHTTPMiddleware):
#     def __init__(self, app: object, max_size: int) -> None:
#         super().__init__(app)
#         self.max_size = max_size
#
#     async def dispatch(self, request: Request, call_next: RequestResponseCall) -> Response:
#         content_length = request.headers.get('content-length')
#         if content_length and int(content_length) > self.max_size:
#             return Response("Request body is too large", status_code=413)
#         return await call_next(request)
#
# app.add_middleware(LimitRequestSizeMiddleware, max_size=1_048_576) # 1MB limit


# Placeholder for rate limit middleware
# from slowapi import Limiter, _rate_limit_exceeded_handler
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded
#
# limiter = Limiter(key_func=get_remote_address, default_limits=["100 per minute"])
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CORS Middleware: Allows the frontend to communicate with this backend.
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# --- Routers ---

app.include_router(api_router)

# --- Root & Health Check ---

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """Simple health check endpoint to confirm the API is running."""
    return {"status": "ok"}

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "API is running. See /docs for details."}
