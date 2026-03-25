def test_list_products(client):
    response = client.get("/products")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filter_products_by_category(client):
    response = client.get("/products?category=roupas")
    data = response.json()
    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["category"] == "roupas"


def test_get_product_not_found(client):
    response = client.get("/products/999")
    assert response.status_code == 404
    assert response.json()["message"] == "Produto não encontrado."


def test_add_to_cart_and_get_totals(client):
    add_response = client.post("/cart/items", json={"product_id": 1, "quantity": 2})
    data = add_response.json()
    assert add_response.status_code == 201
    assert data["subtotal_amount"] == 99.8
    assert data["total"] == 99.8
    assert data["items"][0]["subtotal"] == 99.8


def test_add_to_cart_stock_conflict(client):
    response = client.post("/cart/items", json={"product_id": 1, "quantity": 10})
    assert response.status_code == 409


def test_update_cart_item_to_zero_removes_item(client):
    client.post("/cart/items", json={"product_id": 1, "quantity": 1})
    response = client.patch("/cart/items/1", json={"quantity": 0})
    assert response.status_code == 200
    assert response.json()["items"] == []


def test_delete_missing_item(client):
    response = client.delete("/cart/items/55")
    assert response.status_code == 404


def test_apply_percentage_coupon(client):
    client.post("/cart/items", json={"product_id": 1, "quantity": 2})
    response = client.post("/cart/coupon", json={"code": "DESCONTO10"})
    data = response.json()
    assert response.status_code == 200
    assert data["discount"] == 9.98
    assert data["total"] == 89.82
    assert data["coupon"]["code"] == "DESCONTO10"


def test_apply_expired_coupon(client):
    client.post("/cart/items", json={"product_id": 1, "quantity": 1})
    response = client.post("/cart/coupon", json={"code": "EXPIRADO20"})
    assert response.status_code == 409
    assert response.json()["message"] == "Cupom expirado."


def test_apply_coupon_requires_non_empty_cart(client):
    response = client.post("/cart/coupon", json={"code": "VALE15"})
    assert response.status_code == 400
    assert response.json()["message"] == "Não é possível aplicar cupom em um carrinho vazio."


def test_validation_error_on_invalid_payload(client):
    response = client.post("/cart/items", json={"product_id": 1, "quantity": 0})
    assert response.status_code == 400
    assert response.json()["details"][0]["field"] == "quantity"
