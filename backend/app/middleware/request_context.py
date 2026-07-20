from time import perf_counter
from uuid import uuid4
from fastapi import Request


async def add_request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    started_at = perf_counter()
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time-MS"] = str(
        round((perf_counter() - started_at) * 1000, 2)
    )
    return response
