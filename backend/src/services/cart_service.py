from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal
from typing import Any

from src.exceptions import ConflictError, NotFoundError, ValidationError
from src.services.product_service import ProductService

MONEY_PRECISION = Decimal("0.01")
ZERO = Decimal("0.00")


class CartService:
    def __init__(self, cart_repository, product_repository, cart_session_repository):
        self.cart_repository = cart_repository
        self.product_repository = product_repository
        self.cart_session_repository = cart_session_repository

    def get_cart(self) -> dict[str, Any]:
        """
        Get cart informations.
        """
        items = self.cart_repository.list_items()
        cart_items: list[dict[str, Any]] = []
        subtotal = ZERO

        for item in items:
            item_subtotal = self._to_money(item["unit_price"] * item["quantity"])
            subtotal += item_subtotal
            cart_items.append({**item, "subtotal": item_subtotal})

        subtotal = self._to_money(subtotal)
        coupon = self._resolve_coupon_for_cart(subtotal)
        discount = self._calculate_discount(subtotal, coupon) if coupon else ZERO
        total = self._to_money(max(subtotal - discount, ZERO))

        return {
            "items": cart_items,
            "subtotal_amount": subtotal,
            "discount": discount,
            "total": total,
            "coupon": coupon,
        }

    def add_item(self, product_id: int, quantity: int) -> dict[str, Any]:
        """
        Add item in cart.
        :param product_id int: Product id to be add in cart.
        :param quantity int: Product quantity to be add in cart.
        """
        product = ProductService(self.product_repository).get_product(product_id)
        self._ensure_stock(
            quantity,
            product["stock"],
            "Estoque insuficiente para a quantidade solicitada."
        )

        existing_item = self.cart_repository.get_item_by_product(product_id)
        if existing_item:
            new_quantity = existing_item["quantity"] + quantity
            self._ensure_stock(
                new_quantity,
                product["stock"],
                "Quantidade total excede o estoque disponível."
            )
            self.cart_repository.update_item(existing_item["id"], new_quantity)

        else:
            self.cart_repository.add_item(product_id, quantity)

        return self.get_cart()

    def update_item(self, item_id: int, quantity: int) -> dict[str, Any]:
        """
        Update cart item quantity.
        :param item_id int: Item id to be updated in cart.
        :param quantity int: Item quantity to be updated in cart.
        """
        item = self.cart_repository.get_item(item_id)
        if not item:
            raise NotFoundError("Item do carrinho não encontrado.")

        if quantity == 0:
            self.cart_repository.delete_item(item_id)
            return self.get_cart()

        self._ensure_stock(
            quantity,
            item["stock"],
            "Estoque insuficiente para atualizar a quantidade."
        )
        self.cart_repository.update_item(item_id, quantity)
        return self.get_cart()

    def delete_item(self, item_id: int) -> dict[str, Any]:
        """
        Delete cart item.
        :param item_id int: Item id to be deleted from cart.
        """
        deleted = self.cart_repository.delete_item(item_id)
        if not deleted:
            raise NotFoundError("Item do carrinho não encontrado.")
        return self.get_cart()

    def apply_coupon(self, code: str) -> dict[str, Any]:
        """
        Apply coupon in cart if it is valid.
        :param code str: Cupon code to be applied in cart.
        """
        normalized_code = code.strip().upper()
        if not normalized_code:
            raise ValidationError("Informe um código de cupom válido.")

        if not self.cart_repository.list_items():
            raise ValidationError("Não é possível aplicar cupom em um carrinho vazio.")

        coupon = self._get_valid_coupon(normalized_code)
        self.cart_session_repository.set_coupon(coupon["code"])
        return self.get_cart()

    def clear_coupon(self) -> dict[str, Any]:
        """
        Clear cart cupon.
        """
        self.cart_session_repository.clear_coupon()
        return self.get_cart()

    def _resolve_coupon_for_cart(self, subtotal: Decimal) -> dict[str, Any] | None:
        """
        Verify if applied cupon is gonna make cart subtotal be less then zero.
        :param subtotal decimal: Cart subtotal. 
        """
        coupon_code = self.cart_session_repository.get_coupon_code()
        if not coupon_code or subtotal < ZERO:
            if subtotal < ZERO:
                self.cart_session_repository.clear_coupon()

            return None

        try:
            return self._get_valid_coupon(coupon_code)

        except (NotFoundError, ConflictError):
            self.cart_session_repository.clear_coupon()
            return None

    def _get_valid_coupon(self, code: str) -> dict[str, Any]:
        """
        Validate Coupon code.
        :param code str: Coupon code to be validated.
        """
        coupon = self.cart_repository.get_coupon(code)
        if not coupon:
            raise NotFoundError("Cupom não encontrado.")

        if not coupon["active"]:
            raise ConflictError("Cupom inativo.")

        expires_at = coupon["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at <= datetime.now(timezone.utc):
            raise ConflictError("Cupom expirado.")

        return coupon

    @staticmethod
    def _ensure_stock(quantity: int, stock: int, message: str) -> None:
        """
        Verify if cart item quantity is avalaible in stock.
        :param quantity int: Cart item quantity.
        :param stock int: Stock item quantity.
        :param message str: Message to return.
        """
        if quantity > stock:
            raise ConflictError(message)

    @staticmethod
    def _to_money(value: Decimal) -> Decimal:
        """
        Converts a decimal value to the application's standard monetary format.
        :param value Decimal: Valur to be converted.
        """
        return value.quantize(MONEY_PRECISION, rounding=ROUND_HALF_UP)

    def _calculate_discount(self, subtotal: Decimal, coupon: dict[str, Any]) -> Decimal:
        """
        Calculates cupon discount.
        :param subtotal Decimal: Cart subtotal.
        :param coupon dict: Coupon informations.
        """
        if coupon["discount_type"] == "percentage":
            discount = subtotal * (coupon["discount_value"] / Decimal("100"))

        else:
            discount = coupon["discount_value"]

        return self._to_money(min(discount, subtotal))
