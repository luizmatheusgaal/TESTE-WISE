from psycopg2.extras import RealDictCursor

from src.db import get_connection


class ProductRepository:
    def list_products(self, category: str | None = None):
        """
        List all products, filter by category and order by product id..
        :param category str: category to filter product.
        """
        query = "SELECT id, name, category, price, stock, image_url FROM products"
        params = []
        if category:
            query += " WHERE category = %s"
            params.append(category)

        query += " ORDER BY id"

        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()

    def get_by_id(self, product_id: int):
        """
        Get specific product.
        :param product_id int: Product id to search.
        """
        with get_connection() as conn, conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT id, name, category, price, stock, image_url FROM products WHERE id = %s",
                (product_id,),
            )
            return cursor.fetchone()