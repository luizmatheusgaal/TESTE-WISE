## Sobre a Wise Sales

A Wise Sales trabalha com vendas inteligentes. A stack do dia a dia é Python serverless no backend e React no frontend. Este teste simula um cenário próximo dessa rotina, cobrindo backend e frontend em partes iguais.

Júnior e pleno fazem o mesmo teste. A diferença está na entrega: esperamos que pleno entregue mais funcionalidades, código melhor organizado, tratamento de erros mais completo e alguns diferenciais. Júnior deve focar em entregar o que é obrigatório, com clareza e código funcional.

### Sobre o uso de IA

O uso de ferramentas de IA (Copilot, ChatGPT, Claude, etc.) é permitido. Porém, na entrevista técnica, o time da Wise Sales vai perguntar sobre o que você fez e por que fez de determinada forma. Saber explicar cada decisão é parte da avaliação. Usar IA sem entender o resultado é pior do que não usar.

---

## Setup inicial

### Pré-requisitos

- Docker e Docker Compose
- Python 3.11+
- Node.js 18+

### Subindo o banco de dados

```bash
cp .env.example .env
docker compose up -d
```

O PostgreSQL sobe na porta 5432 com os dados de seed já carregados. O script `seed.sql` cria as tabelas (`products`, `coupons`, `cart_items`) e insere os dados iniciais automaticamente.

### Verificando se o seed funcionou

```bash
docker compose exec db psql -U wisesales -c "SELECT name, stock FROM products ORDER BY id;"
```

Você deve ver 6 produtos. Se não ver, verifique os logs com `docker compose logs db`.

### Acessando o site e a API

O site estará disponível em `http://localhost:5173`.

A API estará disponível em `http://localhost:8000`.

### Variáveis de ambiente

O `.env.example` tem as credenciais do banco:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wisesales
DB_USER=wisesales
DB_PASSWORD=wisesales123
```

### O que já vem pronto

| Arquivo | O que faz |
|---------|-----------|
| `docker-compose.yml` | Sobe PostgreSQL 16 com seed automático |
| `seed.sql` | Cria tabelas e insere produtos + cupons |
| `.env.example` | Credenciais do banco |

### O que você precisa criar

Todo o código backend e frontend. A estrutura é livre, mas sugerimos:

```
/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── src/
│   │   ├── repositories/
│   │   │   ├── cart_repository.py
│   │   │   └── product_repository.py
│   │   ├── routes/
│   │   │   ├── cart.py
│   │   │   └── product.py
│   │   ├── services/
│   │   │   ├── cart_service.py
│   │   │   └── product_service.py
│   │   ├── db.py
│   │   ├── dependencies.py
│   │   ├── exceptions.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── settings.py
│   ├── tests/
│   │   └── conftest.py
│   │   └── test_api.py
│   ├── alembic.ini
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── product-placeholder.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── CartSummary.jsx
│   │   │   ├── FeedbackBanner.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── context/
│   │   │   ├── CartContext.jsx
│   │   │   └── useCart.js
│   │   ├── hooks/
│   │   │   └── useProducts.js
│   │   ├── pages/
│   │   │   ├── CartPage.jsx
│   │   │   └── CatalogPage.jsx
│   │   ├── router/
│   │   │   └── AppRouter.jsx
│   │   ├── test/
│   │   │   ├── api/
│   │   │   │   └── client.test.js
│   │   │   ├── test_components/
│   │   │   │   ├── CartSummary.test.js
│   │   │   │   ├── FeedbackBanner.test.js
│   │   │   │   └── ProductCard.test.js
│   │   │   ├── test_context/
│   │   │   │   └── CartContext.test.jsx
│   │   │   ├── test_pages/
│   │   │   │   ├── CartPage.test.jsx
│   │   │   │   └── CatalogPage.test.jsx
│   │   │   └── setup.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── LICENSE
├── README.md
└── seed.sql
```

---

#### 1. API de Produtos

- `GET /products` — Lista produtos. Aceita query param `?category=` para filtrar por categoria
- `GET /products/:id` — Retorna um produto específico com dados completos (incluindo estoque)

#### 2. API de Carrinho

- `GET /cart` — Retorna o carrinho atual com itens, quantidades, preço unitário, subtotal por item e total geral. Se houver cupom aplicado, mostra o desconto e o total final
- `POST /cart/items` — Adiciona produto ao carrinho. Body: `{ "product_id": int, "quantity": int }`
  - Regra: validar que o produto existe e que há estoque suficiente. Se o produto já estiver no carrinho, somar a quantidade (respeitando o estoque)
- `PATCH /cart/items/:id` — Atualiza a quantidade de um item do carrinho. Body: `{ "quantity": int }`
  - Regra: validar estoque. Se `quantity` = 0, remover o item
- `DELETE /cart/items/:id` — Remove um item do carrinho

#### 3. Cupom de desconto

- `POST /cart/coupon` — Aplica um cupom ao carrinho. Body: `{ "code": string }`
  - Regra: validar que o cupom existe, está ativo e não expirou
  - Cupons podem ser percentuais (ex: 10% de desconto) ou de valor fixo (ex: R$15 de desconto)
  - O desconto nunca pode resultar em total negativo (mínimo R$0)

#### Regras gerais do backend

- Validação de dados na entrada de cada endpoint
- Mensagens de erro claras e status HTTP corretos (400 para validação, 404 para não encontrado, 409 para conflitos)
- Separação em camadas: routes → services → repositories
- Connection pooling com psycopg2


#### 1. Página de Catálogo

- Listagem de produtos com nome, preço e imagem placeholder
- Filtro por categoria (dropdown ou botões)
- Indicação visual de "fora de estoque" para produtos com estoque 0
- Botão "Adicionar ao carrinho" (desabilitado se estoque 0)

#### 2. Página de Carrinho

- Lista de itens no carrinho com nome, preço unitário, quantidade e subtotal
- Controle de quantidade (+ / -) com validação de estoque
- Botão de remover item
- Campo para digitar código de cupom e botão para aplicar
- Exibição do subtotal, desconto (se houver) e total final
- Mensagem quando o carrinho está vazio

#### 3. Estado global

- Context API para gerenciar o estado do carrinho
- O estado do carrinho deve persistir entre navegações (não precisa persistir no refresh)

#### Regras gerais do frontend

- Feedback visual nas ações (loading ao adicionar item, mensagem de erro/sucesso)
- Layout que funcione em desktop e mobile
- Navegação entre catálogo e carrinho (React Router ou equivalente)

### Requisitos técnicos

- **Backend**: Python 3.11, psycopg2 (raw queries, sem ORM), arquitetura N-layered
- **Migrações**: Alembic
- **Frontend**: React + Vite, JavaScript, Tailwind CSS, Context API
- **Testes backend**: pytest com cobertura mínima de 80%
- **Testes frontend**: Vitest
- **Linting**: Ruff (backend), ESLint + Prettier (frontend)
- **Git**: commits atômicos com mensagens descritivas
