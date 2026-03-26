from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class APIModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    @field_serializer(
        "price",
        "unit_price",
        "subtotal",
        "subtotal_amount",
        "discount",
        "total",
        "discount_value",
        check_fields=False,
    )
    def serialize_decimal(self, value: Decimal) -> float:
        return float(value)


class ErrorResponse(BaseModel):
    message: str
    details: list[dict[str, str]] | None = None


class ProductResponse(APIModel):
    id: int
    name: str
    category: str
    price: Decimal
    stock: int
    image_url: str | None = None


class CartItemPayload(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1, le=999)


class CartItemUpdatePayload(BaseModel):
    quantity: int = Field(ge=0, le=999)


class CouponPayload(BaseModel):
    code: str = Field(min_length=1, max_length=50)


class CartItemResponse(APIModel):
    id: int
    product_id: int
    name: str
    quantity: int
    stock: int
    unit_price: Decimal
    subtotal: Decimal


class CouponResponse(APIModel):
    code: str
    discount_type: Literal["percentage", "fixed"]
    discount_value: Decimal
    expires_at: datetime


class CartResponse(APIModel):
    items: list[CartItemResponse]
    subtotal_amount: Decimal
    discount: Decimal
    total: Decimal
    coupon: CouponResponse | None = None
