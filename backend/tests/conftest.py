from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from src.dependencies import get_cart_service, get_product_service
from src.main import app


class FakeProductRepository:
    def __init__(self):
        self.products = {
            1: {"id": 1, "name": "Camiseta", "category": "roupas", "price": Decimal("49.90"), "stock": 5, "image_url": None},
            2: {"id": 2, "name": "Tênis", "category": "calçados", "price": Decimal("299.90"), "stock": 0, "image_url": None},
        }

    def list_products(self, category=None):
        products = list(self.products.values())
        if category:
            products = [product for product in products if product["category"] == category]
        return products

    def get_by_id(self, product_id):
        return self.products.get(product_id)


class FakeCartRepository:
    def __init__(self, product_repository):
        self.product_repository = product_repository
        self.items = []
        self.next_id = 1
        self.coupons = {
            "DESCONTO10": {"id": 1, "code": "DESCONTO10", "discount_type": "percentage", "discount_value": Decimal("10.00"), "active": True, "expires_at": __import__('datetime').datetime(2099,1,1)},
            "VALE15": {"id": 2, "code": "VALE15", "discount_type": "fixed", "discount_value": Decimal("15.00"), "active": True, "expires_at": __import__('datetime').datetime(2099,1,1)},
            "EXPIRADO20": {"id": 3, "code": "EXPIRADO20", "discount_type": "percentage", "discount_value": Decimal("20.00"), "active": True, "expires_at": __import__('datetime').datetime(2020,1,1)},
        }

    def list_items(self):
        result = []
        for item in self.items:
            product = self.product_repository.get_by_id(item["product_id"])
            result.append({**item, "name": product["name"], "unit_price": product["price"], "stock": product["stock"]})
        return result

    def get_item(self, item_id):
        for item in self.list_items():
            if item["id"] == item_id:
                return item
        return None

    def get_item_by_product(self, product_id):
        return next((item for item in self.items if item["product_id"] == product_id), None)

    def add_item(self, product_id, quantity):
        item = {"id": self.next_id, "product_id": product_id, "quantity": quantity}
        self.items.append(item)
        self.next_id += 1
        return item

    def update_item(self, item_id, quantity):
        for item in self.items:
            if item["id"] == item_id:
                item["quantity"] = quantity
                return item
        return None

    def delete_item(self, item_id):
        original_len = len(self.items)
        self.items = [item for item in self.items if item["id"] != item_id]
        return original_len - len(self.items)

    def get_coupon(self, code):
        return self.coupons.get(code.upper())


class FakeCartSessionRepository:
    def __init__(self):
        self.code = None

    def set_coupon(self, code):
        self.code = code

    def get_coupon_code(self):
        return self.code

    def clear_coupon(self):
        self.code = None


@pytest.fixture()
def client():
    from src.services.cart_service import CartService
    from src.services.product_service import ProductService

    product_repository = FakeProductRepository()
    cart_repository = FakeCartRepository(product_repository)
    cart_session = FakeCartSessionRepository()

    app.dependency_overrides[get_product_service] = lambda: ProductService(product_repository)
    app.dependency_overrides[get_cart_service] = lambda: CartService(cart_repository, product_repository, cart_session)

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
