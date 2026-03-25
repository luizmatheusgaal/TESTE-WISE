from src.exceptions import NotFoundError


class ProductService:
    def __init__(self, product_repository):
        self.product_repository = product_repository

    def list_products(self, category: str | None = None):
        """
        List all products and filter by category.
        :param category str: Category to filter products.
        """
        normalized_category = category.strip().lower() if category else None
        return self.product_repository.list_products(normalized_category)

    def get_product(self, product_id: int):
        """
        Get specific product.
        :param product_id int: Product id to search.
        """
        if product := self.product_repository.get_by_id(product_id):
            return product

        raise NotFoundError("Produto não encontrado.")
