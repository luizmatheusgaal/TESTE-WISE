from psycopg2.extras import RealDictCursor

from src.db import get_connection


class CartRepository:
    def list_items(self):
        """
        List cart items.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price AS unit_price, p.stock
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                ORDER BY ci.id
                """
            )
            return cursor.fetchall()

    def get_item(self, item_id: int):
        """
        Get specific cart item.
        :param item_id int: Item id to search.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price AS unit_price, p.stock
                FROM cart_items ci
                JOIN products p ON p.id = ci.product_id
                WHERE ci.id = %s
                """,
                (item_id,),
            )
            return cursor.fetchone()

    def get_item_by_product(self, product_id: int):
        """
        Get cart item by product.
        :param product_id int: Product Id related to cart item.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT id, product_id, quantity FROM cart_items WHERE product_id = %s",
                (product_id,),
            )
            return cursor.fetchone()

    def add_item(self, product_id: int, quantity: int):
        """
        Register item in cart.
        :param product_id int: Product Id related to cart item.
        :param quantity int: Quantity of item to ad dto cart.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                INSERT INTO cart_items (product_id, quantity) 
                VALUES (%s, %s) 
                RETURNING id, product_id, quantity
                """,
                (product_id, quantity),
            )
            return cursor.fetchone()

    def update_item(self, item_id: int, quantity: int):
        """
        Update quantity of item in cart.
        :param item_id int: Item Id to be updated.
        :param quantity int: quantity to update item in cart.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                UPDATE cart_items 
                SET quantity = %s 
                WHERE id = %s 
                RETURNING id, product_id, quantity
                """,
                (quantity, item_id),
            )
            return cursor.fetchone()

    def delete_item(self, item_id: int):
        """
        Delete item from cart.
        :param item_id int: Item Id to be removed from cart.
        """
        with get_connection() as conn, conn.cursor() as cursor:
            cursor.execute("DELETE FROM cart_items WHERE id = %s", (item_id,))
            return cursor.rowcount

    def get_coupon(self, code: str):
        """
        Get coupon of discount.
        :param code str: Coupon code.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT id, code, discount_type, discount_value, active, expires_at
                FROM coupons
                WHERE UPPER(code) = UPPER(%s)
                """,
                (code,),
            )
            return cursor.fetchone()


class CartSessionRepository:
    def __init__(self):
        self.coupon_code: str | None = None

    def set_coupon(self, code: str):
        """
        Set coupon code.
        :param code str: Coupon code.
        """
        self.coupon_code = code

    def get_coupon_code(self):
        """
        Get coupon code.
        """
        return self.coupon_code

    def clear_coupon(self):
        """
        Remove coupon code.
        """
        self.coupon_code = None


cart_session = CartSessionRepository()
