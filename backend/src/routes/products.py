from typing import Annotated

from fastapi import APIRouter, Depends, Query

from src.dependencies import get_product_service
from src.models import ProductResponse
from src.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])


@router.get(
    "",
    response_model=list[ProductResponse],
    summary="Retrieve a list of available products.",
    description="This endpoint returns all products, optionally filtered by category."
)
def list_products(
    service: Annotated[ProductService, Depends(get_product_service)],
    category: str | None = Query(default=None),
):
    return service.list_products(category)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Retrieve details of a specific product.",
    description="This endpoint returns detailed information about a single product\
                identified by its ID."
)
def get_product(product_id: int, service: Annotated[ProductService, Depends(get_product_service)]):
    return service.get_product(product_id)
