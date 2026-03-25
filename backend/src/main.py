from fastapi import APIRouter, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.exceptions import AppError
from src.routes.cart import router as cart_router
from src.routes.products import router as products_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Wise Sales Mini E-commerce",
        version="1.0.0",
        description="API de catálogo, carrinho e cupons para o teste técnico da Wise Sales.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_router = APIRouter()
    api_router.include_router(products_router)
    api_router.include_router(cart_router)
    app.include_router(api_router)

    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"message": exc.message, "details": exc.details},
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError):
        details = []
        for error in exc.errors():
            location = ".".join(str(item) for item in error.get("loc", []) if item != "body") or "request"
            details.append({"field": location, "message": error.get("msg", "Dados inválidos.")})

        message = details[0]["message"] if details else "Dados inválidos."
        return JSONResponse(status_code=400, content={"message": message, "details": details})

    @app.get("/health")
    def healthcheck():
        return {"status": "ok"}

    return app


app = create_app()
