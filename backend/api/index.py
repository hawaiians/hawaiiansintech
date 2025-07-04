from fastapi import FastAPI
from backend.api import filters, members
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI(
    docs_url="/docs",
    openapi_url="/api/v1/openapi.json",
    prefix="/api/v1",
)
app.include_router(members.router)
app.include_router(filters.router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation Error",
            "errors": [
                {"loc": error["loc"], "msg": error["msg"], "type": error["type"]}
                for error in exc.errors()
            ],
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(ValidationError)
async def pydantic_validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Data Validation Error", "errors": exc.errors()},
    )


# @app.get("/helloFastApi")
# def hello_fast_api():
#     return {"message": "Hello from FastAPI"}
