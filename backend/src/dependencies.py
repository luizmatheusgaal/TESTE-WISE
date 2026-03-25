from functools import lru_cache

from src.repositories.cart_repository import CartRepository, cart_session
from src.repositories.product_repository import ProductRepository
from src.services.cart_service import CartService
from src.services.product_service import ProductService


@lru_cache
def get_product_service():
    """
    Get products services.
    """
    return ProductService(ProductRepository())


@lru_cache
def get_cart_service():
    """
    Get cart services.
    """
    return CartService(CartRepository(), ProductRepository(), cart_session)
