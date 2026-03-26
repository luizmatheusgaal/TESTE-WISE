from typing import Annotated

from fastapi import APIRouter, Depends, status

from src.dependencies import get_cart_service
from src.models import (
    CartItemPayload,
    CartItemUpdatePayload,
    CartResponse,
    CouponPayload,
)
from src.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get(
    "",
    response_model=CartResponse,
    summary="Get current user's cart.",
    description="Returns all items informations in the authenticated user's cart.",
)
def get_cart(service: Annotated[CartService, Depends(get_cart_service)]):
    return service.get_cart()


@router.post(
    "/items",
    response_model=CartResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new item to the current user's cart.",
    description="This endpoint adds a product to the cart or updates its quantity\
                if the item already exists.",
)
def add_cart_item(payload: CartItemPayload, service: Annotated[CartService, Depends(get_cart_service)]):
    return service.add_item(payload.product_id, payload.quantity)


@router.patch(
    "/items/{item_id}",
    response_model=CartResponse,
    summary="Update the quantity of an existing cart item",
    description="This endpoint modifies the quantity of a specific item already\
                present in the cart.",
)
def update_cart_item(item_id: int, payload: CartItemUpdatePayload, service: Annotated[CartService, Depends(get_cart_service)]):
    return service.update_item(item_id, payload.quantity)


@router.delete(
    "/items/{item_id}",
    response_model=CartResponse,
    summary="Remove an item from the current user's cart.",
    description="This endpoint deletes a specific item from the cart.",
)
def delete_cart_item(item_id: int, service: Annotated[CartService, Depends(get_cart_service)]):
    return service.delete_item(item_id)


@router.post(
    "/coupon",
    response_model=CartResponse,
    summary="Apply a discount coupon to the current user's cart.",
    description="This endpoint validates and applies a coupon code,\
                updating the cart totals accordingly.",
)
def apply_coupon(payload: CouponPayload, service: Annotated[CartService, Depends(get_cart_service)]):
    return service.apply_coupon(payload.code)
